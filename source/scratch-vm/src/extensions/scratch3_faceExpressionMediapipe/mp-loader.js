/**
 * 載入 MediaPipe Face Landmarker（先試 GPU，失敗改用 CPU）
 * 不可使用 async/await。
 */
const config = require('./mp-config');

/** 瀏覽器預設：用動態 import 從 CDN 載入（避開 webpack 4 打包 ES module 的問題） */
const defaultImport = url => {
    const dynamicImport = new Function('url', 'return import(url)'); // eslint-disable-line no-new-func
    return dynamicImport(url);
};

/** 每一個錯誤都帶 stage，讓插件知道是哪一步失敗 */
const stageError = (stage, cause) => {
    const err = new Error(stage);
    err.stage = stage;
    err.cause = cause;
    return err;
};

/**
 * @param {object} [opts]
 * @param {function} [opts.importer] 測試用：取代動態 import
 * @param {object} [opts.config] 取代 mp-config
 * @returns {Promise<{landmarker: object, delegate: string}>}
 */
const createFaceLandmarker = (opts = {}) => {
    const cfg = Object.assign({}, config, opts.config || {});
    const importer = opts.importer || defaultImport;
    let vision;

    const build = (lib, fileset, delegate) => lib.FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {modelAssetPath: cfg.MODEL_URL, delegate},
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false
    });

    return Promise.resolve()
        .then(() => importer(cfg.BUNDLE_URL))
        .catch(e => { throw stageError('library', e); })
        .then(lib => {
            vision = lib;
            return lib.FilesetResolver.forVisionTasks(cfg.WASM_BASE);
        })
        .catch(e => { throw e.stage ? e : stageError('wasm', e); })
        .then(fileset => build(vision, fileset, 'GPU')
            .then(landmarker => ({landmarker, delegate: 'GPU'}))
            .catch(gpuErr => {
                console.warn('MediaPipe GPU 模式失敗，改用 CPU:', gpuErr); // eslint-disable-line no-console
                return build(vision, fileset, 'CPU').then(landmarker => ({landmarker, delegate: 'CPU'}));
            }))
        .catch(e => { throw e.stage ? e : stageError('model', e); });
};

module.exports = {createFaceLandmarker};
