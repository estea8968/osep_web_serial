/**
 * OSEP Scratch「Claude AI」插件的中繼程式（Google Apps Script）
 *
 * 作用：把 Anthropic API 金鑰藏在這裡，網頁上的插件只把問題送過來，
 *       由這支程式加上金鑰轉送給 Claude，再把回答傳回去。
 *
 * 設定（專案設定 ⚙ → 指令碼屬性）：
 *   ANTHROPIC_API_KEY  必填，sk-ant-... 金鑰
 *   ACCESS_CODE        選填，設定後學生要用「設定使用密碼」積木輸入相同密碼
 *   DAILY_LIMIT        選填，全部使用者每天合計最多幾次（預設 300）
 *   WORKSPACE_ID       選填，金鑰沒有綁定 workspace 時才需要
 *
 * 部署：部署 → 新增部署作業 → 類型「網頁應用程式」
 *       執行身分：我　／　誰可以存取：任何人
 * 修改程式後要「管理部署作業 → 編輯 → 版本：新版本」，網址才會用到新程式。
 */

var CONFIG = {
  MODELS: ['claude-haiku-5-5', 'claude-sonnet-5-5'],
  MAX_TOKENS: 2048,          // 每次回答最長（超過會自動降到這個值）
  MAX_MESSAGES: 21,          // 對話記憶最多 10 輪 + 本次問題
  MAX_SYSTEM_CHARS: 4000,
  MAX_BODY_CHARS: 3000000,   // 約 2 MB 的舞台截圖
  DEFAULT_DAILY_LIMIT: 300,
  TIMEZONE: 'Asia/Taipei',
  API_URL: 'https://api.anthropic.com/v1/messages',
  API_VERSION: '2023-06-01'
};

/** 插件送來的請求 */
function doPost(e) {
  try {
    return json_(handle_(e));
  } catch (err) {
    return json_(fail_(500, 'proxy_error', String(err && err.message || err)));
  }
}

/** 用瀏覽器打開網址時看到的訊息，用來確認部署成功（不會呼叫 Claude、不會花錢） */
function doGet() {
  var props = PropertiesService.getScriptProperties();
  return json_({
    ok: true,
    service: 'osep-claude-proxy',
    keyConfigured: !!props.getProperty('ANTHROPIC_API_KEY'),
    accessCodeRequired: !!props.getProperty('ACCESS_CODE'),
    usedToday: usedToday_(),
    dailyLimit: dailyLimit_(props)
  });
}

function handle_(e) {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('ANTHROPIC_API_KEY');
  if (!key) return fail_(500, 'proxy_not_configured', 'ANTHROPIC_API_KEY is not set in Script Properties');

  var raw = (e && e.postData && e.postData.contents) || '';
  if (raw.length > CONFIG.MAX_BODY_CHARS) return fail_(413, 'too_large', 'request too large');

  var payload;
  try {
    payload = JSON.parse(raw);
  } catch (x) {
    return fail_(400, 'invalid_request', 'body is not JSON');
  }

  var code = props.getProperty('ACCESS_CODE');
  if (code && String(payload.accessCode || '') !== code) {
    return fail_(403, 'access_denied', 'wrong access code');
  }

  var checked = sanitize_(payload.request);
  if (checked.error) return fail_(400, checked.type || 'invalid_request', checked.error);

  if (!takeQuota_(dailyLimit_(props))) return fail_(429, 'daily_limit', 'daily limit reached');

  var headers = {'x-api-key': key, 'anthropic-version': CONFIG.API_VERSION};
  var ws = props.getProperty('WORKSPACE_ID');
  if (ws) headers['anthropic-workspace-id'] = ws;

  var res = UrlFetchApp.fetch(CONFIG.API_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: headers,
    payload: JSON.stringify(checked.body),
    muteHttpExceptions: true
  });
  var status = res.getResponseCode();
  var text = res.getContentText();
  var data = null;
  try {
    data = JSON.parse(text);
  } catch (x) {
    data = null;
  }
  if (status >= 200 && status < 300 && data) return {ok: true, status: status, data: data};
  return {
    ok: false,
    status: status,
    error: (data && data.error) || {type: 'upstream_error', message: String(text).slice(0, 300)}
  };
}

/** 只轉送允許的欄位，並限制長度與模型，避免中繼被拿去做別的事 */
function sanitize_(req) {
  if (!req || typeof req !== 'object') return {error: 'missing request'};
  if (CONFIG.MODELS.indexOf(req.model) < 0) {
    return {type: 'model_not_allowed', error: 'model not allowed: ' + req.model};
  }
  var messages = req.messages;
  if (!Array.isArray(messages) || messages.length === 0) return {error: 'messages required'};
  if (messages.length > CONFIG.MAX_MESSAGES) return {error: 'too many messages'};
  var cleanMessages = [];
  for (var i = 0; i < messages.length; i++) {
    var m = messages[i] || {};
    if (m.role !== 'user' && m.role !== 'assistant') return {error: 'bad role'};
    var content = cleanContent_(m.content);
    if (content === null) return {error: 'bad content'};
    cleanMessages.push({role: m.role, content: content});
  }
  if (cleanMessages[cleanMessages.length - 1].role !== 'user') return {error: 'last message must be user'};

  var maxTokens = parseInt(req.max_tokens, 10);
  if (!(maxTokens > 0)) maxTokens = 1024;
  var body = {
    model: req.model,
    max_tokens: Math.min(maxTokens, CONFIG.MAX_TOKENS),
    messages: cleanMessages
  };
  if (typeof req.system === 'string' && req.system) body.system = req.system.slice(0, CONFIG.MAX_SYSTEM_CHARS);
  if (typeof req.temperature === 'number' && req.temperature >= 0 && req.temperature <= 1) {
    body.temperature = req.temperature;
  }
  return {body: body};
}

/** 內容只允許文字與圖片 */
function cleanContent_(c) {
  if (typeof c === 'string') return c;
  if (!Array.isArray(c)) return null;
  var out = [];
  for (var i = 0; i < c.length; i++) {
    var b = c[i] || {};
    if (b.type === 'text' && typeof b.text === 'string') {
      out.push({type: 'text', text: b.text});
    } else if (b.type === 'image' && b.source && b.source.type === 'base64' &&
        /^image\/(png|jpeg|gif|webp)$/.test(b.source.media_type) && typeof b.source.data === 'string') {
      out.push({type: 'image', source: {type: 'base64', media_type: b.source.media_type, data: b.source.data}});
    } else {
      return null;
    }
  }
  return out;
}

function dailyLimit_(props) {
  var n = parseInt(props.getProperty('DAILY_LIMIT'), 10);
  return n > 0 ? n : CONFIG.DEFAULT_DAILY_LIMIT;
}

function today_() {
  return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function usedToday_() {
  var q = JSON.parse(PropertiesService.getScriptProperties().getProperty('QUOTA') || '{}');
  return q.date === today_() ? q.count : 0;
}

/** 每日次數（用鎖避免同時多人使用時計數錯誤）。回傳 false 代表已達上限 */
function takeQuota_(limit) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var props = PropertiesService.getScriptProperties();
    var q = JSON.parse(props.getProperty('QUOTA') || '{}');
    var today = today_();
    if (q.date !== today) q = {date: today, count: 0};
    if (q.count >= limit) return false;
    q.count++;
    props.setProperty('QUOTA', JSON.stringify(q));
    return true;
  } finally {
    lock.releaseLock();
  }
}

function fail_(status, type, message) {
  return {ok: false, status: status, error: {type: type, message: message}};
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** 在編輯器裡選這個函式按「執行」，可以測試金鑰是否能用（會花一點點費用） */
function testClaude() {
  var out = handle_({postData: {contents: JSON.stringify({
    accessCode: PropertiesService.getScriptProperties().getProperty('ACCESS_CODE') || '',
    request: {model: CONFIG.MODELS[0], max_tokens: 50, messages: [{role: 'user', content: '用一句話打招呼'}]}
  })}});
  Logger.log(JSON.stringify(out, null, 2));
}
