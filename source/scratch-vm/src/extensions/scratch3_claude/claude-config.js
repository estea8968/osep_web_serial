/**
 * Claude 插件設定
 *
 * PROXY_URL：Google Apps Script 中繼的網址（部署成網頁應用程式後取得，
 *            長得像 https://script.google.com/macros/s/xxxxxxxx/exec）。
 *            設定後，使用者不需要自己的 Claude 金鑰就能使用。
 *            這個網址不是金鑰；真正的金鑰存在 GAS 的「指令碼屬性」裡，不會出現在網頁中。
 *            設定方式見 gas/README.md。
 *
 * 不要把 Anthropic API 金鑰（sk-ant-...）寫在這個檔案或任何插件程式裡：
 * 網站是公開的，金鑰會被打包進 lib.min.js，任何人都看得到。
 */
module.exports = {
    PROXY_URL: 'https://script.google.com/macros/s/AKfycby5F02NvF3IWRhA3-yYLmHERDD5WKizp0Alal2cOugT7gpOfKTaGBCX1ekwHOzQd4RA5A/exec'
};
