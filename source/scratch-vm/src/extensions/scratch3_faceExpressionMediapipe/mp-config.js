/**
 * MediaPipe 載入設定
 * 要離線使用時，把 wasm 資料夾與 face_landmarker.task 放到網站的 static 底下，
 * 再把下面兩個網址改成例如 './static/mediapipe/wasm'、'./static/mediapipe/face_landmarker.task'。
 */
const MP_VERSION = '1.2.2';

module.exports = {
    MP_VERSION,
    // @mediapipe/tasks-vision（ES module），執行期從 CDN 載入，不必改 package.json
    BUNDLE_URL: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/vision_bundle.mjs`,
    WASM_BASE: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`,
    // Face Landmarker 模型（約 3.6 MB，含臉部偵測、478 特徵點、52 個 blendshape）
    MODEL_URL: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
};
