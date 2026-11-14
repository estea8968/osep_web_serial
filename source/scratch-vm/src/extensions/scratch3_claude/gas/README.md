# Claude 插件的 GAS 中繼設定

讓使用者不用自己的 Claude 金鑰就能用插件。金鑰存在 Google Apps Script（GAS）裡，網頁上看不到。

## 一、建立 GAS 專案
1. 打開 https://script.google.com → **新專案**，命名例如「OSEP Claude 中繼」
2. 把 `Code.gs` 的內容整個貼上，取代原本的 `myFunction`，按儲存

## 二、放入金鑰（不要寫在程式碼裡）
1. 左側 ⚙ **專案設定** → 最下面 **指令碼屬性** → **新增指令碼屬性**
2. 加入：

| 屬性 | 值 | 必填 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 你的 `sk-ant-...` 金鑰 | 必填 |
| `DAILY_LIMIT` | 每天全部使用者合計最多幾次，例如 `300` | 選填（預設 300） |
| `ACCESS_CODE` | 上課密碼，例如 `osep2026`。設定後學生要用「設定使用密碼」積木輸入 | 選填 |
| `WORKSPACE_ID` | `wrkspc_...`，只有金鑰沒綁 workspace 時才需要 | 選填 |

## 三、測試金鑰
1. 回到編輯器，上方函式選單選 `testClaude` → **執行**
2. 第一次會要求授權（存取外部服務），按允許
3. 下方「執行記錄」看到 `"ok": true` 和 Claude 的回答就成功了

## 四、部署成網頁應用程式
1. 右上 **部署** → **新增部署作業** → 齒輪選 **網頁應用程式**
2. 執行身分：**我**；誰可以存取：**任何人**（不是「任何擁有 Google 帳戶的使用者」）
3. 按部署，複製「網頁應用程式網址」（`https://script.google.com/macros/s/.../exec`）
4. 用瀏覽器打開這個網址，應該看到 `{"ok":true,"service":"osep-claude-proxy","keyConfigured":true,...}`

## 五、填到插件
打開 `scratch3_claude/claude-config.js`，把網址填進 `PROXY_URL`：

```js
module.exports = {
    PROXY_URL: 'https://script.google.com/macros/s/.../exec'
};
```

重新編譯後，使用者直接用「問 Claude」積木就可以了。

## 修改 GAS 程式之後
**部署 → 管理部署作業 → ✏ 編輯 → 版本選「新版本」→ 部署**。
這樣網址不變，只會換成新程式。如果用「新增部署作業」，會產生新網址。

## 安全說明
- 中繼網址本身是公開的，任何知道的人都能透過它使用 Claude，但**拿不到金鑰**
- 能用掉多少由 `DAILY_LIMIT`、每次最多 2048 tokens、只允許的模型清單限制住
- 想再保險：設 `ACCESS_CODE`，並在 Claude Console 為這把金鑰的 workspace 設花費上限
- 金鑰外流時：到 Console 停用並建立新金鑰，再更新 GAS 的 `ANTHROPIC_API_KEY`（插件不用改）
