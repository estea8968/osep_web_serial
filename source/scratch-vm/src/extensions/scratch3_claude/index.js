/**
 * Claude AI 插件（Anthropic Messages API）
 *
 * 重要：不可使用 async/await（專案 babel 會產生需要 regeneratorRuntime 的程式，
 * GUI 沒有載入它，插件會在載入時就壞掉）。全部用 Promise。
 * 也因此不需要像舊 openai 插件那樣 require('ml5')。
 */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const msg = require('./translation');
const {ClaudeClient, MODELS, DEFAULT_MODEL, DEFAULT_MAX_TOKENS, KEY_PLACEHOLDER} = require('./claude-core');
const config = require('./claude-config');

// 簡單的對話泡泡 + 星芒圖示（原創，非官方商標）
const iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
    '<rect x="2" y="4" width="36" height="26" rx="8" fill="#D97757"/>' +
    '<path d="M12 30 L10 37 L19 30 Z" fill="#D97757"/>' +
    '<path d="M20 9 L22.2 14.8 L28 17 L22.2 19.2 L20 25 L17.8 19.2 L12 17 L17.8 14.8 Z" fill="#FFFFFF"/>' +
    '</svg>';
const menuIconURI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg)}`;
const blockIconURI = menuIconURI;

const SNAPSHOT_TIMEOUT_MS = 3000;

class Scratch3Claude {
    constructor (runtime) {
        this.runtime = runtime;
        this.client = new ClaudeClient();
        this.client.setProxyUrl(config.PROXY_URL);
        this.answerText = '';
        this.statusText = '';
        this.locale = this._setLocale();
        this.statusText = msg.status_idle[this.locale];
    }

    _setLocale () {
        let locale = 'en';
        try {
            const l = String(formatMessage.setup().locale || '').toLowerCase();
            if (l === 'zh-tw' || l === 'zh-hant' || l === 'zh-hk') locale = 'zh-tw';
        } catch (e) {
            locale = 'en';
        }
        return locale;
    }

    getInfo () {
        this.locale = this._setLocale();
        const L = this.locale;
        return {
            id: 'claude',
            name: msg.name[L],
            color1: '#D97757',
            color2: '#C2603F',
            color3: '#A84E31',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'setApiKey',
                    blockType: BlockType.COMMAND,
                    text: msg.set_api_key[L],
                    arguments: {
                        KEY: {type: ArgumentType.STRING, defaultValue: KEY_PLACEHOLDER}
                    }
                },
                {
                    opcode: 'setAccessCode',
                    blockType: BlockType.COMMAND,
                    text: msg.set_access_code[L],
                    arguments: {
                        CODE: {type: ArgumentType.STRING, defaultValue: ' '}
                    }
                },
                {
                    opcode: 'setProxyUrl',
                    blockType: BlockType.COMMAND,
                    text: msg.set_proxy_url[L],
                    arguments: {
                        URL: {type: ArgumentType.STRING, defaultValue: 'https://script.google.com/macros/s/.../exec'}
                    }
                },
                {
                    opcode: 'setModel',
                    blockType: BlockType.COMMAND,
                    text: msg.set_model[L],
                    arguments: {
                        MODEL: {type: ArgumentType.STRING, menu: 'modelMenu', defaultValue: DEFAULT_MODEL}
                    }
                },
                {
                    opcode: 'setSystem',
                    blockType: BlockType.COMMAND,
                    text: msg.set_system[L],
                    arguments: {
                        SYSTEM: {type: ArgumentType.STRING, defaultValue: msg.default_system[L]}
                    }
                },
                {
                    opcode: 'setMaxTokens',
                    blockType: BlockType.COMMAND,
                    text: msg.set_max_tokens[L],
                    arguments: {
                        TOKENS: {type: ArgumentType.NUMBER, defaultValue: DEFAULT_MAX_TOKENS}
                    }
                },
                {
                    opcode: 'setTemperature',
                    blockType: BlockType.COMMAND,
                    text: msg.set_temperature[L],
                    arguments: {
                        TEMP: {type: ArgumentType.NUMBER, defaultValue: 0.7}
                    }
                },
                {
                    opcode: 'setMemory',
                    blockType: BlockType.COMMAND,
                    text: msg.set_memory[L],
                    arguments: {
                        ONOFF: {type: ArgumentType.STRING, menu: 'onoffMenu', defaultValue: 'on'}
                    }
                },
                {
                    opcode: 'clearHistory',
                    blockType: BlockType.COMMAND,
                    text: msg.clear_history[L]
                },
                '---',
                {
                    opcode: 'ask',
                    blockType: BlockType.COMMAND,
                    text: msg.ask[L],
                    arguments: {
                        QUESTION: {type: ArgumentType.STRING, defaultValue: msg.default_question[L]}
                    }
                },
                {
                    opcode: 'askStage',
                    blockType: BlockType.COMMAND,
                    text: msg.ask_stage[L],
                    arguments: {
                        QUESTION: {type: ArgumentType.STRING, defaultValue: msg.default_stage_question[L]}
                    }
                },
                {
                    opcode: 'askReporter',
                    blockType: BlockType.REPORTER,
                    text: msg.ask_reporter[L],
                    disableMonitor: true,
                    arguments: {
                        QUESTION: {type: ArgumentType.STRING, defaultValue: msg.default_question[L]}
                    }
                },
                '---',
                {
                    opcode: 'getAnswer',
                    blockType: BlockType.REPORTER,
                    text: msg.answer[L]
                },
                {
                    opcode: 'getStatus',
                    blockType: BlockType.REPORTER,
                    text: msg.status[L]
                },
                {
                    opcode: 'isBusy',
                    blockType: BlockType.BOOLEAN,
                    text: msg.is_busy[L]
                },
                {
                    opcode: 'copyText',
                    blockType: BlockType.COMMAND,
                    text: msg.copy_text[L],
                    arguments: {
                        TEXT: {type: ArgumentType.STRING, defaultValue: ' '}
                    }
                }
            ],
            menus: {
                modelMenu: {
                    acceptReporters: true,
                    items: MODELS.slice()
                },
                onoffMenu: {
                    acceptReporters: true,
                    items: [
                        {text: msg.onoff[L][0], value: 'on'},
                        {text: msg.onoff[L][1], value: 'off'}
                    ]
                }
            }
        };
    }

    /* ---------- 設定 ---------- */

    setApiKey (args) {
        this.client.setApiKey(args.KEY);
        // 不要把金鑰印到 console
    }

    setAccessCode (args) {
        this.client.setAccessCode(args.CODE);
    }

    setProxyUrl (args) {
        const url = String(args.URL || '').trim();
        // 沒改預設文字就點下去 → 不要蓋掉 claude-config.js 的網址
        if (url.indexOf('/s/.../') >= 0) return;
        this.client.setProxyUrl(url || config.PROXY_URL);
    }

    setModel (args) {
        this.client.setModel(args.MODEL);
    }

    setSystem (args) {
        this.client.setSystem(args.SYSTEM);
    }

    setMaxTokens (args) {
        this.client.setMaxTokens(args.TOKENS);
    }

    setTemperature (args) {
        this.client.setTemperature(args.TEMP);
    }

    setMemory (args) {
        const v = String(args.ONOFF).trim().toLowerCase();
        const on = v === 'on' || v === 'true' || v === '1' || v === msg.onoff['zh-tw'][0];
        this.client.setMemory(on);
    }

    clearHistory () {
        this.client.clearHistory();
    }

    /* ---------- 發問 ---------- */

    /** 共用：發問並更新回應/狀態。永遠 resolve（錯誤轉成文字），讓積木不會卡住 */
    _ask (question, imageDataUrl) {
        const L = this.locale;
        this.statusText = msg.status_busy[L];
        return this.client.ask(question, imageDataUrl).then(answer => {
            this.answerText = answer;
            this.statusText = this.client.lastStopReason === 'max_tokens' ?
                msg.status_truncated[L] : msg.status_done[L];
            return answer;
        }, err => {
            const text = this._errorText(err);
            this.answerText = text;
            this.statusText = text;
            if (typeof console !== 'undefined') console.warn('[claude]', err && err.code, err && err.detail); // eslint-disable-line no-console
            return text;
        });
    }

    _errorText (err) {
        const L = this.locale;
        const code = err && err.code;
        const entry = msg.errors[code] || msg.errors.HTTP;
        let text = msg.error_prefix[L] + entry[L];
        // 400 與未知錯誤附上 API 的原始訊息，方便老師除錯
        if ((code === 'BAD_REQUEST' || code === 'HTTP' || code === 'BAD_MODEL' || code === 'PROXY_SETUP') && err.detail) {
            text += ` (${err.detail})`;
        }
        return text;
    }

    ask (args) {
        return this._ask(args.QUESTION).then(() => {});
    }

    askReporter (args) {
        return this._ask(args.QUESTION);
    }

    askStage (args) {
        return this._snapshot().then(url => this._ask(args.QUESTION, url || ''))
            .then(() => {});
    }

    /** 取得舞台截圖（data URL）；失敗回傳 '' */
    _snapshot () {
        const renderer = this.runtime && this.runtime.renderer;
        if (!renderer || typeof renderer.requestSnapshot !== 'function') return Promise.resolve('');
        return new Promise(resolve => {
            let finished = false;
            const timer = setTimeout(() => {
                if (!finished) {
                    finished = true;
                    resolve('');
                }
            }, SNAPSHOT_TIMEOUT_MS);
            renderer.requestSnapshot(url => {
                if (finished) return;
                finished = true;
                clearTimeout(timer);
                resolve(url || '');
            });
            // 專案停止時也確保會畫一次
            if (typeof renderer.draw === 'function') renderer.draw();
        });
    }

    /* ---------- 讀取 ---------- */

    getAnswer () {
        return this.answerText;
    }

    getStatus () {
        return this.statusText;
    }

    isBusy () {
        return this.client.pending > 0;
    }

    copyText (args) {
        const text = String(args.TEXT);
        if (typeof navigator === 'undefined' || !navigator.clipboard) return;
        return navigator.clipboard.writeText(text).catch(err => {
            console.warn('[claude] copy failed', err); // eslint-disable-line no-console
        });
    }
}

module.exports = Scratch3Claude;
