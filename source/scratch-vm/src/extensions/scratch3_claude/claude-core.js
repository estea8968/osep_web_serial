/**
 * Claude Messages API 用戶端（不依賴 Scratch，可在 Node 測試）
 *
 * 注意：本專案的 babel 設定會把 async/await 轉成需要 regeneratorRuntime 的程式，
 * 而 GUI 沒有載入它，所以這裡全部使用 Promise 寫法，不要改成 async/await。
 * 也避免物件展開 {...a} 與 ?. 語法（webpack 4 / 舊 babel 不支援）。
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

const MODELS = ['claude-haiku-5-5', 'claude-sonnet-5-5'];
const DEFAULT_MODEL = MODELS[0];

const DEFAULT_MAX_TOKENS = 1024;
const MAX_TOKENS_LIMIT = 16000;
const MAX_HISTORY_MESSAGES = 20; // 記憶模式最多保留 10 輪
const TIMEOUT_MS = 90000;

/** 建立帶 code 的錯誤，讓介面層翻譯成學生看得懂的訊息 */
const makeError = (code, detail) => {
    const e = new Error(detail || code);
    e.code = code;
    e.detail = detail || '';
    return e;
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const parseJson = raw => {
    try {
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
};

// 積木預設值，使用者沒改就點下去時當作沒輸入
const KEY_PLACEHOLDER = 'sk-ant-...';

/** 'data:image/png;base64,xxxx' → {mediaType, data} */
const parseDataUrl = url => {
    const m = /^data:(image\/(?:png|jpeg|gif|webp));base64,(.+)$/.exec(String(url || ''));
    return m ? {mediaType: m[1], data: m[2]} : null;
};

/** 把 API 錯誤狀態碼轉成 code */
const httpCode = status => {
    if (status === 400) return 'BAD_REQUEST';
    if (status === 401) return 'BAD_KEY';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'BAD_MODEL';
    if (status === 413) return 'TOO_LARGE';
    if (status === 429) return 'RATE_LIMIT';
    if (status === 529 || status === 503) return 'OVERLOADED';
    if (status >= 500) return 'SERVER';
    return 'HTTP';
};

class ClaudeClient {
    constructor (options) {
        options = options || {};
        // 不能直接存 fetch 參考再以 this._fetch() 呼叫，瀏覽器會丟 Illegal invocation
        this._fetch = options.fetch || function (url, init) {
            return fetch(url, init); // eslint-disable-line no-undef
        };
        this._timeoutMs = options.timeoutMs || TIMEOUT_MS;

        this.apiKey = '';
        this.proxyUrl = '';
        this.accessCode = '';
        this.model = DEFAULT_MODEL;
        this.system = '';
        this.maxTokens = DEFAULT_MAX_TOKENS;
        this.temperature = null; // null = 不送出，使用模型預設值
        this.memory = false;
        this.history = [];

        this.lastAnswer = '';
        this.lastError = null; // Error（含 code）或 null
        this.lastStopReason = '';
        this.pending = 0;
        this.usage = {input: 0, output: 0};
    }

    /** 自己的金鑰（直接呼叫 API）。留空就改回使用中繼。 */
    setApiKey (key) {
        const k = String(key || '').trim();
        this.apiKey = k === KEY_PLACEHOLDER ? '' : k;
    }

    /** GAS 中繼網址（https://script.google.com/macros/s/.../exec） */
    setProxyUrl (url) {
        this.proxyUrl = String(url || '').trim();
    }

    /** 中繼的使用密碼（GAS 有設 ACCESS_CODE 時才需要） */
    setAccessCode (code) {
        this.accessCode = String(code === null || typeof code === 'undefined' ? '' : code).trim();
    }

    /** 'direct' | 'proxy' | 'none' */
    get mode () {
        if (this.apiKey) return 'direct';
        if (this.proxyUrl) return 'proxy';
        return 'none';
    }

    setModel (model) {
        const m = String(model || '').trim();
        this.model = m || DEFAULT_MODEL;
    }

    setSystem (text) {
        this.system = String(text || '').trim();
    }

    setMaxTokens (n) {
        const v = parseInt(n, 10);
        this.maxTokens = isNaN(v) ? DEFAULT_MAX_TOKENS : clamp(v, 1, MAX_TOKENS_LIMIT);
    }

    setTemperature (t) {
        const s = String(t === null || typeof t === 'undefined' ? '' : t).trim();
        if (s === '') {
            this.temperature = null;
            return;
        }
        const v = parseFloat(s);
        this.temperature = isNaN(v) ? null : clamp(v, 0, 1);
    }

    setMemory (on) {
        this.memory = !!on;
        if (!this.memory) this.history = [];
    }

    clearHistory () {
        this.history = [];
    }

    /** 組出要送給 API 的 body（獨立出來方便測試） */
    buildRequest (question, imageDataUrl) {
        const text = String(question || '').trim();
        const image = parseDataUrl(imageDataUrl);
        let content;
        if (image) {
            content = [
                {type: 'image', source: {type: 'base64', media_type: image.mediaType, data: image.data}},
                {type: 'text', text: text}
            ];
        } else {
            content = text;
        }
        const messages = (this.memory ? this.history.slice() : []).concat([{role: 'user', content: content}]);
        const body = {
            model: this.model,
            max_tokens: this.maxTokens,
            messages: messages
        };
        if (this.system) body.system = this.system;
        if (this.temperature !== null) body.temperature = this.temperature;
        return body;
    }

    /**
     * 發問。回傳 Promise<string>（Claude 的回答）。失敗時 reject 帶 code 的 Error，
     * 同時會設定 lastError / lastAnswer。
     */
    ask (question, imageDataUrl) {
        const text = String(question === null || typeof question === 'undefined' ? '' : question).trim();
        if (this.mode === 'none') return this._fail(makeError('NO_KEY'));
        if (this.mode === 'proxy' && !/^https:\/\//.test(this.proxyUrl)) return this._fail(makeError('PROXY_SETUP', 'proxy url must start with https://'));
        if (!text) return this._fail(makeError('EMPTY_QUESTION'));
        if (typeof imageDataUrl !== 'undefined' && imageDataUrl !== null && !parseDataUrl(imageDataUrl)) {
            return this._fail(makeError('NO_IMAGE'));
        }

        const body = this.buildRequest(text, imageDataUrl);
        const historyNote = imageDataUrl ? `[附上舞台畫面] ${text}` : text;

        let controller = null;
        let timer = null;
        if (typeof AbortController !== 'undefined') {
            controller = new AbortController(); // eslint-disable-line no-undef
            timer = setTimeout(() => controller.abort(), this._timeoutMs);
        }

        this.pending++;
        this.lastError = null;
        const signal = controller ? controller.signal : undefined;
        const send = this.apiKey ? this._sendDirect(body, signal) : this._sendProxy(body, signal);

        return send
            .then(data => {
                const answer = data.content
                    .filter(b => b && b.type === 'text')
                    .map(b => b.text)
                    .join('')
                    .trim();
                this.lastStopReason = data.stop_reason || '';
                if (data.usage) {
                    this.usage.input += data.usage.input_tokens || 0;
                    this.usage.output += data.usage.output_tokens || 0;
                }
                if (!answer && data.stop_reason === 'refusal') throw makeError('REFUSAL');
                if (this.memory) {
                    this.history.push({role: 'user', content: historyNote});
                    this.history.push({role: 'assistant', content: answer || '(沒有回應)'});
                    while (this.history.length > MAX_HISTORY_MESSAGES) this.history.splice(0, 2);
                }
                this.lastAnswer = answer;
                return answer;
            })
            .then(answer => {
                this._done(timer);
                return answer;
            }, err => {
                this._done(timer);
                return this._fail(err);
            });
    }

    /** 直接呼叫 Anthropic API（使用者自己輸入金鑰時） */
    _sendDirect (body, signal) {
        return Promise.resolve()
            .then(() => this._fetch(API_URL, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': API_VERSION,
                    // 允許瀏覽器直接呼叫（CORS）。金鑰是使用者自己輸入的，只存在記憶體中。
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify(body),
                signal: signal
            }))
            .catch(err => {
                if (err && err.name === 'AbortError') throw makeError('TIMEOUT');
                throw makeError('NETWORK', err && err.message);
            })
            .then(res => res.text().then(raw => {
                const data = parseJson(raw);
                if (!res.ok) {
                    const detail = data && data.error && data.error.message ? data.error.message : `HTTP ${res.status}`;
                    const e = makeError(httpCode(res.status), detail);
                    e.status = res.status;
                    throw e;
                }
                if (!data || !Array.isArray(data.content)) throw makeError('BAD_RESPONSE', String(raw).slice(0, 200));
                return data;
            }));
    }

    /**
     * 透過 Google Apps Script 中繼呼叫（金鑰存在 GAS，網頁裡沒有金鑰）。
     * 用 text/plain 送出是為了避開 CORS 預檢（GAS 不處理 OPTIONS）。
     * GAS 一律回 HTTP 200，真正的狀態放在 JSON 的 ok / status / error。
     */
    _sendProxy (body, signal) {
        return Promise.resolve()
            .then(() => this._fetch(this.proxyUrl, {
                method: 'POST',
                headers: {'content-type': 'text/plain;charset=utf-8'},
                body: JSON.stringify({accessCode: this.accessCode, request: body}),
                redirect: 'follow',
                signal: signal
            }))
            .catch(err => {
                if (err && err.name === 'AbortError') throw makeError('TIMEOUT');
                // 部署權限不是「任何人」時會被導到 Google 登入頁，瀏覽器會擋成網路錯誤
                throw makeError('PROXY_NETWORK', err && err.message);
            })
            .then(res => res.text().then(raw => {
                const reply = parseJson(raw);
                if (!reply || typeof reply.ok !== 'boolean') {
                    throw makeError('PROXY_SETUP', `HTTP ${res.status} ${String(raw).slice(0, 120)}`);
                }
                if (!reply.ok) {
                    const err = reply.error || {};
                    const type = err.type || '';
                    let code = httpCode(reply.status || 500);
                    if (type === 'daily_limit') code = 'DAILY_LIMIT';
                    else if (type === 'access_denied') code = 'ACCESS_DENIED';
                    else if (type === 'model_not_allowed') code = 'MODEL_NOT_ALLOWED';
                    else if (type === 'proxy_not_configured') code = 'PROXY_SETUP';
                    const e = makeError(code, err.message || `HTTP ${reply.status}`);
                    e.status = reply.status;
                    throw e;
                }
                const data = reply.data;
                if (!data || !Array.isArray(data.content)) throw makeError('BAD_RESPONSE', String(raw).slice(0, 200));
                return data;
            }));
    }

    _done (timer) {
        if (timer) clearTimeout(timer);
        this.pending = Math.max(0, this.pending - 1);
    }

    _fail (err) {
        this.lastError = err;
        this.lastAnswer = '';
        return Promise.reject(err);
    }
}

module.exports = {
    ClaudeClient,
    MODELS,
    DEFAULT_MODEL,
    DEFAULT_MAX_TOKENS,
    MAX_TOKENS_LIMIT,
    MAX_HISTORY_MESSAGES,
    API_URL,
    API_VERSION,
    KEY_PLACEHOLDER,
    parseDataUrl
};
