/* 中英文字（CommonJS，可直接在 Node 測試） */
const t = (en, zh) => ({'en': en, 'zh-tw': zh});

module.exports = {
    title: t('Face Expression (MediaPipe)', '臉部表情辨識 (MediaPipe)'),

    // 積木
    videoToggle: t('set video to [VIDEO_STATE]', '視訊設為 [VIDEO_STATE]'),
    start: t('start face expression recognition', '開始臉部表情辨識'),
    stop: t('stop face expression recognition', '停止臉部表情辨識'),
    whenEmotion: t('when facial emotion becomes [EMOTION]', '當臉部情緒變成 [EMOTION]'),
    faceDetected: t('face detected?', '偵測到臉部?'),
    isEmotion: t('facial emotion is [EMOTION]?', '臉部情緒是 [EMOTION]?'),
    emotion: t('facial emotion', '臉部情緒'),
    confidence: t('facial expression confidence', '臉部表情置信度'),
    emotionScore: t('score of [EMOTION]', '[EMOTION] 的分數'),
    action: t('[ACTION] amount', '[ACTION] 的程度'),
    face: t('face [PROP]', '臉部 [PROP]'),
    blendshape: t('blendshape [NAME] value', '表情係數 [NAME] 的值'),
    status: t('recognition status', '辨識狀態'),

    // 選單
    off: t('off', '關閉'),
    on: t('on', '開啟'),
    onFlipped: t('on flipped', '翻轉'),

    emotion_neutral: t('neutral', '平靜'),
    emotion_happy: t('happy', '開心'),
    emotion_sad: t('sad', '難過'),
    emotion_angry: t('angry', '生氣'),
    emotion_fearful: t('fearful', '害怕'),
    emotion_disgusted: t('disgusted', '厭惡'),
    emotion_surprised: t('surprised', '驚訝'),
    emotion_noFace: t('no face detected', '無法偵測到臉部'),

    action_smile: t('smile', '微笑'),
    action_mouthOpen: t('mouth open', '張嘴'),
    action_leftEyeClosed: t('left eye closed', '閉左眼'),
    action_rightEyeClosed: t('right eye closed', '閉右眼'),
    action_browUp: t('eyebrows raised', '挑眉'),
    action_browDown: t('eyebrows lowered', '皺眉'),
    action_pucker: t('pucker lips', '嘟嘴'),
    action_cheekPuff: t('cheek puff', '鼓臉頰'),
    action_noseSneer: t('nose wrinkle', '皺鼻子'),
    action_mouthFrown: t('mouth corners down', '嘴角下垂'),
    action_eyeWide: t('eyes wide open', '眼睛睜大'),

    prop_x: t('x', 'x 座標'),
    prop_y: t('y', 'y 座標'),
    prop_width: t('width', '寬度'),
    prop_height: t('height', '高度'),
    prop_yaw: t('turn left/right (°)', '左右轉角度'),
    prop_pitch: t('look up/down (°)', '上下抬頭角度'),
    prop_roll: t('tilt (°)', '歪頭角度'),

    // 狀態
    status_idle: t('Not started', '尚未開始'),
    status_loading: t('Loading MediaPipe model...', 'MediaPipe 模型載入中…'),
    status_camera: t('Opening camera...', '開啟攝影機中…'),
    status_running: t('Recognizing', '辨識中'),
    status_stopped: t('Stopped', '已停止'),
    status_videoOff: t('Video is off, set video to On', '視訊已關閉，請把視訊設為開啟'),
    status_errCamera: t('Error: cannot open camera, please allow camera access in the browser',
        '錯誤：無法開啟攝影機，請允許瀏覽器使用攝影機'),
    status_errLibrary: t('Error: cannot load MediaPipe library (check the internet connection)',
        '錯誤：無法載入 MediaPipe 程式庫（請確認網路連線）'),
    status_errWasm: t('Error: cannot load MediaPipe WebAssembly files', '錯誤：無法載入 MediaPipe WebAssembly 檔案'),
    status_errModel: t('Error: cannot load the face model', '錯誤：無法載入臉部模型'),
    status_errOther: t('Error', '錯誤')
};
