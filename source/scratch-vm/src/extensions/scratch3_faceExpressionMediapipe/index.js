/**
 * 臉部表情辨識（MediaPipe 版）
 *
 * - 使用 MediaPipe Face Landmarker（執行期從 CDN 載入，見 mp-config.js）
 * - 表情由 52 個 blendshape 依規則計算（見 face-core.js 的 RULES）
 * - 使用 Scratch 本身的視訊（會套用選擇的攝影機與翻轉設定），不另外開攝影機
 *
 * 重要：不可使用 async/await（專案 babel 會產生需要 regeneratorRuntime 的程式，
 * GUI 沒有載入它）。全部用 Promise，也不需要 require('ml5')。
 */
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const msg = require('./translation');
const core = require('./face-core');
const {createFaceLandmarker} = require('./mp-loader');

// 原創圖示：笑臉 + 特徵點
const iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
    '<circle cx="20" cy="20" r="17" fill="#1E9E8F"/>' +
    '<circle cx="14" cy="16" r="2.4" fill="#FFFFFF"/>' +
    '<circle cx="26" cy="16" r="2.4" fill="#FFFFFF"/>' +
    '<path d="M12 24 Q20 31 28 24" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
    '<g fill="#BFF3EC"><circle cx="20" cy="6" r="1.3"/><circle cx="7" cy="14" r="1.3"/>' +
    '<circle cx="33" cy="14" r="1.3"/><circle cx="9" cy="28" r="1.3"/><circle cx="31" cy="28" r="1.3"/>' +
    '<circle cx="20" cy="34" r="1.3"/></g>' +
    '</svg>';
const menuIconURI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg)}`;
const blockIconURI = menuIconURI;

const SMOOTHING = 0.5; // blendshape 平滑程度（0～1，越大越即時）

const STATUS = {
    IDLE: 'idle',
    LOADING: 'loading',
    CAMERA: 'camera',
    RUNNING: 'running',
    STOPPED: 'stopped',
    VIDEO_OFF: 'videoOff',
    ERR_CAMERA: 'errCamera',
    ERR_LIBRARY: 'errLibrary',
    ERR_WASM: 'errWasm',
    ERR_MODEL: 'errModel',
    ERR_OTHER: 'errOther'
};
const STAGE_TO_STATUS = {library: STATUS.ERR_LIBRARY, wasm: STATUS.ERR_WASM, model: STATUS.ERR_MODEL};

let theLocale = 'en';

class Scratch3FaceExpressionMediapipe {
    /**
     * @param {Runtime} runtime
     * @param {object} [deps] 測試用：{createFaceLandmarker, raf, now}
     */
    constructor (runtime, deps = {}) {
        this.runtime = runtime;
        this._createFaceLandmarker = deps.createFaceLandmarker || createFaceLandmarker;
        this._raf = deps.raf || (fn => window.requestAnimationFrame(fn));
        this._now = deps.now || (() => performance.now());

        this._landmarker = null;
        this._delegate = '';
        this._initPromise = null;
        this._detecting = false;
        this._videoOpenedByStart = false;
        this._lastVideoTime = -1;
        this._lastTimestamp = 0;

        this._status = STATUS.IDLE;
        this._errorDetail = '';
        this._clearFace();
        theLocale = this._setLocale();
    }

    _setLocale () {
        const locale = formatMessage.setup().locale;
        return locale === 'zh-tw' ? 'zh-tw' : 'en';
    }

    _t (key) {
        const entry = msg[key];
        if (!entry) return key;
        return entry[theLocale] || entry.en;
    }

    getInfo () {
        theLocale = this._setLocale();
        const emotionArg = {type: ArgumentType.STRING, menu: 'emotionMenu', defaultValue: 'happy'};
        return {
            id: 'faceExpressionMediapipe',
            name: this._t('title'),
            color1: '#1E9E8F',
            color2: '#17857A',
            color3: '#126B62',
            menuIconURI,
            blockIconURI,
            blocks: [
                {
                    opcode: 'videoToggle',
                    blockType: BlockType.COMMAND,
                    text: this._t('videoToggle'),
                    arguments: {
                        VIDEO_STATE: {type: ArgumentType.STRING, menu: 'videoMenu', defaultValue: 'on'}
                    }
                },
                {opcode: 'startRecognition', blockType: BlockType.COMMAND, text: this._t('start')},
                {opcode: 'stopRecognition', blockType: BlockType.COMMAND, text: this._t('stop')},
                '---',
                {
                    opcode: 'whenEmotion',
                    blockType: BlockType.HAT,
                    text: this._t('whenEmotion'),
                    isEdgeActivated: true,
                    arguments: {EMOTION: emotionArg}
                },
                {opcode: 'isFaceDetected', blockType: BlockType.BOOLEAN, text: this._t('faceDetected')},
                {
                    opcode: 'isEmotion',
                    blockType: BlockType.BOOLEAN,
                    text: this._t('isEmotion'),
                    arguments: {EMOTION: emotionArg}
                },
                {opcode: 'getEmotion', blockType: BlockType.REPORTER, text: this._t('emotion')},
                {opcode: 'getConfidence', blockType: BlockType.REPORTER, text: this._t('confidence')},
                {
                    opcode: 'getEmotionScore',
                    blockType: BlockType.REPORTER,
                    text: this._t('emotionScore'),
                    arguments: {EMOTION: emotionArg}
                },
                '---',
                {
                    opcode: 'getAction',
                    blockType: BlockType.REPORTER,
                    text: this._t('action'),
                    arguments: {ACTION: {type: ArgumentType.STRING, menu: 'actionMenu', defaultValue: 'smile'}}
                },
                {
                    opcode: 'getFaceProp',
                    blockType: BlockType.REPORTER,
                    text: this._t('face'),
                    arguments: {PROP: {type: ArgumentType.STRING, menu: 'propMenu', defaultValue: 'x'}}
                },
                {
                    opcode: 'getBlendshape',
                    blockType: BlockType.REPORTER,
                    text: this._t('blendshape'),
                    arguments: {NAME: {type: ArgumentType.STRING, defaultValue: 'jawOpen'}}
                },
                '---',
                {opcode: 'getStatus', blockType: BlockType.REPORTER, text: this._t('status')}
            ],
            menus: {
                videoMenu: {
                    acceptReporters: false,
                    items: [
                        {text: this._t('off'), value: 'off'},
                        {text: this._t('on'), value: 'on'},
                        {text: this._t('onFlipped'), value: 'on-flipped'}
                    ]
                },
                emotionMenu: {
                    acceptReporters: true,
                    items: core.EMOTIONS.map(k => ({text: this._t(`emotion_${k}`), value: k}))
                },
                actionMenu: {
                    acceptReporters: true,
                    items: core.ACTION_KEYS.map(k => ({text: this._t(`action_${k}`), value: k}))
                },
                propMenu: {
                    acceptReporters: true,
                    items: ['x', 'y', 'width', 'height', 'yaw', 'pitch', 'roll']
                        .map(k => ({text: this._t(`prop_${k}`), value: k}))
                }
            }
        };
    }

    // ---------- 狀態 ----------

    _setStatus (code, detail) {
        this._status = code;
        this._errorDetail = detail || '';
    }

    _clearFace () {
        this._blendshapes = null;
        this._faceFound = false;
        this._emotionKey = '';
        this._scores = null;
        this._confidence = 0;
        this._geometry = null;
    }

    _handleError (error) {
        const code = (error && (error.statusCode || STAGE_TO_STATUS[error.stage])) || STATUS.ERR_OTHER;
        const cause = (error && error.cause) || error;
        const detail = cause && cause.message ? cause.message : String(cause);
        console.error('MediaPipe 臉部表情辨識錯誤:', error); // eslint-disable-line no-console
        this._detecting = false;
        this._clearFace();
        this._setStatus(code, detail);
        if (this._videoOpenedByStart) {
            this._videoOpenedByStart = false;
            this.runtime.ioDevices.video.disableVideo();
        }
    }

    // ---------- 視訊 ----------

    _video () {
        return this.runtime.ioDevices && this.runtime.ioDevices.video;
    }

    _isVideoEnabled () {
        const v = this._video();
        return Boolean(v && v.provider && v.provider.enabled);
    }

    _getVideoElement () {
        const v = this._video();
        if (!v || !v.provider || !v.videoReady) return null;
        return v.provider.video;
    }

    _isMirrored () {
        const v = this._video();
        // Scratch 預設是鏡像；「翻轉」= 不鏡像
        return !v || v.mirror !== false;
    }

    videoToggle (args) {
        const v = this._video();
        if (!v) return;
        this._videoOpenedByStart = false; // 使用者自己控制視訊
        if (args.VIDEO_STATE === 'off') {
            v.disableVideo();
            return;
        }
        v.mirror = args.VIDEO_STATE === 'on';
        const p = v.enableVideo();
        if (p) return p.then(() => {});
    }

    _openVideo () {
        const v = this._video();
        if (!v || !v.provider) {
            const err = new Error('找不到視訊裝置');
            err.statusCode = STATUS.ERR_CAMERA;
            return Promise.reject(err);
        }
        if (!this._isVideoEnabled()) {
            this._videoOpenedByStart = true;
            v.mirror = true;
        }
        // 使用者拒絕攝影機時 enableVideo 不會 reject，只是 provider.video 是 null
        return Promise.resolve(v.enableVideo()).then(() => {
            if (!v.provider.video) {
                const err = new Error('攝影機無法開啟');
                err.statusCode = STATUS.ERR_CAMERA;
                throw err;
            }
        });
    }

    // ---------- 模型 ----------

    _loadModel () {
        if (this._landmarker) return Promise.resolve();
        if (this._initPromise) return this._initPromise;
        this._setStatus(STATUS.LOADING);
        this._initPromise = this._createFaceLandmarker()
            .then(result => {
                this._landmarker = result.landmarker;
                this._delegate = result.delegate;
                console.log(`MediaPipe Face Landmarker 載入完成（${result.delegate}）`); // eslint-disable-line no-console
            })
            .then(() => {
                this._initPromise = null;
            }, err => {
                this._initPromise = null;
                throw err;
            });
        return this._initPromise;
    }

    // ---------- 開始 / 停止 ----------

    /** 回傳 Promise：積木會等到模型與攝影機準備好（或失敗）才往下執行 */
    startRecognition () {
        if (this._detecting) {
            if (!this._isVideoEnabled()) {
                this._setStatus(STATUS.CAMERA);
                return this._openVideo().catch(err => this._handleError(err));
            }
            return;
        }
        return this._loadModel()
            .then(() => {
                this._setStatus(STATUS.CAMERA);
                return this._openVideo();
            })
            .then(() => {
                if (this._detecting) return;
                this._setStatus(STATUS.RUNNING);
                this._detecting = true;
                this._lastVideoTime = -1;
                this._loop();
            })
            .catch(err => this._handleError(err));
    }

    stopRecognition () {
        this._detecting = false;
        this._clearFace();
        this._setStatus(STATUS.STOPPED);
        if (this._videoOpenedByStart) {
            this._videoOpenedByStart = false;
            this._video().disableVideo();
        }
    }

    _loop () {
        if (!this._detecting) return;
        try {
            this._processFrame();
        } catch (e) {
            console.error('MediaPipe 偵測錯誤:', e); // eslint-disable-line no-console
        }
        this._raf(() => this._loop());
    }

    _processFrame () {
        const videoEl = this._getVideoElement();
        if (!videoEl || videoEl.readyState < 2) {
            if (!this._isVideoEnabled()) {
                this._setStatus(STATUS.VIDEO_OFF);
                this._clearFace();
            }
            return;
        }
        if (this._status !== STATUS.RUNNING) this._setStatus(STATUS.RUNNING);
        // 同一幀不重複辨識
        if (videoEl.currentTime === this._lastVideoTime) return;
        this._lastVideoTime = videoEl.currentTime;

        // VIDEO 模式的時間戳記必須遞增
        let ts = this._now();
        if (ts <= this._lastTimestamp) ts = this._lastTimestamp + 1;
        this._lastTimestamp = ts;

        const result = this._landmarker.detectForVideo(videoEl, ts);
        this._applyResult(result);
    }

    _applyResult (result) {
        const lm = result && result.faceLandmarks && result.faceLandmarks[0];
        const bsList = result && result.faceBlendshapes && result.faceBlendshapes[0];
        if (!lm) {
            this._clearFace();
            return;
        }
        this._faceFound = true;
        this._geometry = core.faceGeometry(lm, this._isMirrored());
        if (bsList) {
            const raw = core.blendshapesToMap(bsList);
            this._blendshapes = core.smoothMap(this._blendshapes, raw, SMOOTHING);
            const r = core.computeEmotions(this._blendshapes);
            this._scores = r.scores;
            this._emotionKey = r.emotion;
            this._confidence = Math.round(r.confidence * 100) / 100;
        }
    }

    // ---------- 回報積木 ----------

    /** 選單可以放變數：接受 'happy' 或「開心」、'Happy' */
    _emotionKeyOf (value) {
        const s = String(value).trim();
        const lower = s.toLowerCase();
        if (core.EMOTIONS.indexOf(lower) >= 0) return lower;
        for (const k of core.EMOTIONS) {
            const e = msg[`emotion_${k}`];
            if (e['zh-tw'] === s || e.en === lower) return k;
        }
        return null;
    }

    _actionKeyOf (value) {
        const s = String(value).trim();
        if (core.ACTION_KEYS.indexOf(s) >= 0) return s;
        for (const k of core.ACTION_KEYS) {
            const e = msg[`action_${k}`];
            if (e['zh-tw'] === s || e.en === s.toLowerCase()) return k;
        }
        return null;
    }

    whenEmotion (args) {
        return this._faceFound && this._emotionKey === this._emotionKeyOf(args.EMOTION);
    }

    isEmotion (args) {
        return this.whenEmotion(args);
    }

    isFaceDetected () {
        return this._faceFound;
    }

    getEmotion () {
        if (!this._detecting) return '';
        if (!this._faceFound) return this._t('emotion_noFace');
        return this._emotionKey ? this._t(`emotion_${this._emotionKey}`) : '';
    }

    getConfidence () {
        return this._faceFound ? this._confidence : 0;
    }

    getEmotionScore (args) {
        const key = this._emotionKeyOf(args.EMOTION);
        if (!key || !this._faceFound || !this._scores) return 0;
        return Math.round(this._scores[key] * 100);
    }

    getAction (args) {
        const key = this._actionKeyOf(args.ACTION);
        if (!key || !this._faceFound) return 0;
        return core.actionValue(this._blendshapes, key);
    }

    getFaceProp (args) {
        if (!this._faceFound || !this._geometry) return 0;
        const v = this._geometry[String(args.PROP)];
        return typeof v === 'number' ? v : 0;
    }

    getBlendshape (args) {
        if (!this._faceFound || !this._blendshapes) return 0;
        const v = this._blendshapes[String(args.NAME).trim()];
        return typeof v === 'number' ? Math.round(v * 1000) / 1000 : 0;
    }

    getStatus () {
        let text = this._t(`status_${this._status}`);
        if (this._status === STATUS.RUNNING && this._delegate) text += `（${this._delegate}）`;
        if (this._errorDetail && this._status.indexOf('err') === 0) text += `（${this._errorDetail}）`;
        return text;
    }
}

module.exports = Scratch3FaceExpressionMediapipe;
