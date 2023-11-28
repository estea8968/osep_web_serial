export const Message = {
    image_classification_model_url: {
        'ja': '画像分類モデルURL[URL]',
        'ja-Hira': 'がぞうぶんるいモデル[URL]',
        'en': 'image classification model URL [URL]',
        'ko': '이미지 분류 모델 URL [URL]',
        'zh-tw': '影像分類模型網址[URL]'
    },
    sound_classification_model_url: {
        'ja': '音声分類モデルURL[URL]',
        'ja-Hira': 'おんせいぶんるいモデル[URL]',
        'en': 'sound classification model URL [URL]',
        'ko': '소리 분류 모델 URL [URL]',
        'zh-tw': '聲音分類模型網址[URL]'

    },
    classify_image: {
        'ja': '画像を分類する',
        'ja-Hira': 'がぞうをぶんるいする',
        'en': 'classify image',
        'ko': '이미지 분류하기',
        'zh-tw': '影像分類'
    },
    image_label: {
        'ja': '画像ラベル',
        'ja-Hira': 'がぞうラベル',
        'en': 'image label',
        'ko': '이미지 라벨',
        'zh-tw': '影像標籤'
    },
    sound_label: {
        'ja': '音声ラベル',
        'ja-Hira': 'おんせいラベル',
        'en': 'sound label',
        'ko': '소리 라벨',
        'zh-tw': '聲音標籤'
    },
    when_received_block: {
        'ja': '画像ラベル[LABEL]を受け取ったとき',
        'ja-Hira': 'がぞうラベル[LABEL]をうけとったとき',
        'en': 'when received image label:[LABEL]',
        'zh-cn': '接收到类别[LABEL]时',
        'ko': '[LABEL] 이미지 라벨을 받았을 때:',
        'zh-tw': '接收到影像標籤:[LABEL]時'
    },
    is_image_label_detected: {
        'ja': '[LABEL]の画像が見つかった',
        'ja-Hira': '[LABEL]のがぞうがみつかった',
        'en': 'image [LABEL] detected',
        'ko': '[LABEL] 이미지가 감지됨',
        'zh-tw': '影像[LABEL]被偵測？'
    },
    is_sound_label_detected: {
        'ja': '[LABEL]の音声が聞こえた',
        'ja-Hira': '[LABEL]のおんせいがきこえた',
        'en': 'sound [LABEL] detected',
        'ko': '[LABEL] 소리가 감지됨',
        'zh-tw': '聲音[LABEL]被偵測？'
    },
    image_label_confidence: {
        'ja': '画像ラベル[LABEL]の確度',
        'ja-Hira': 'がぞうラベル[LABEL]のかくど',
        'en': 'confidence of image [LABEL]',
        'ko': '[LABEL] 이미지 신뢰도',
        'zh-tw': '影像置信度[LABEL]'
    },
    sound_label_confidence: {
        'ja': '音声ラベル[LABEL]の確度',
        'ja-Hira': 'おんせいラベル[LABEL]のかくど',
        'en': 'confidence of sound [LABEL]',
        'ko': '[LABEL] 소리 신뢰도',
        'zh-tw': '聲音置信度[LABEL]'
    },
    when_received_sound_label_block: {
        'ja': '音声ラベル[LABEL]を受け取ったとき',
        'ja-Hira': '音声ラベル[LABEL]をうけとったとき',
        'en': 'when received sound label:[LABEL]',
        'zh-cn': '接收到声音类别[LABEL]时',
        'ko': '[LABEL] 소리 라벨을 받았을 때:',
        'zh-tw': '接收到聲音標籤[LABEL]時'
    },
    label_block: {
        'ja': 'ラベル',
        'ja-Hira': 'ラベル',
        'en': 'label',
        'zh-cn': '标签',
        'ko': '라벨',
        'zh-tw': '標籤'
    },
    any: {
        'ja': 'のどれか',
        'ja-Hira': 'のどれか',
        'en': 'any',
        'zh-cn': '任何',
        'ko': '어떤',
        'zh-tw': '任何'
    },
    any_without_of: {
        'ja': 'どれか',
        'ja-Hira': 'どれか',
        'en': 'any',
        'zh-cn': '任何',
        'ko': '어떤',
        'zh-tw': '任何'
    },
    all: {
        'ja': 'の全て',
        'ja-Hira': 'のすべて',
        'en': 'all',
        'zh-cn': '所有',
        'ko': '모든',
        'zh-tw': '全部'
    },
    toggle_classification: {
        'ja': 'ラベル付けを[CLASSIFICATION_STATE]にする',
        'ja-Hira': 'ラベルづけを[CLASSIFICATION_STATE]にする',
        'en': 'turn classification [CLASSIFICATION_STATE]',
        'zh-cn': '[CLASSIFICATION_STATE]分类',
        'ko': '라벨 분류 [CLASSIFICATION_STATE]',
        'zh-tw': '[CLASSIFICATION_STATE]分類'
    },
    set_confidence_threshold: {
        'ja': '確度のしきい値を[CONFIDENCE_THRESHOLD]にする',
        'ja-Hira': 'かくどのしきいちを[CONFIDENCE_THRESHOLD]にする',
        'en': 'set confidence threshold [CONFIDENCE_THRESHOLD]',
        'ko': '신뢰도 경계 설정 [CONFIDENCE_THRESHOLD]',
        'zh-tw': '設定置信度閾值[CONFIDENCE_THRESHOLD]'
    },
    get_confidence_threshold: {
        'ja': '確度のしきい値',
        'ja-Hira': 'かくどのしきいち',
        'en': 'confidence threshold',
        'ko': '신뢰도 경계',
        'zh-tw': '置信度閾值'
    },
    set_classification_interval: {
        'ja': 'ラベル付けを[CLASSIFICATION_INTERVAL]秒間に1回行う',
        'ja-Hira': 'ラベルづけを[CLASSIFICATION_INTERVAL]びょうかんに1かいおこなう',
        'en': 'Label once every [CLASSIFICATION_INTERVAL] seconds',
        'zh-cn': '每隔[CLASSIFICATION_INTERVAL]秒标记一次',
        'ko': '매 [CLASSIFICATION_INTERVAL]초마다 라벨 분류하기',
        'zh-tw': '每隔[CLASSIFICATION_INTERVAL]秒標記一次'
    },
    video_toggle: {
        'ja': 'ビデオを[VIDEO_STATE]にする',
        'ja-Hira': 'ビデオを[VIDEO_STATE]にする',
        'en': 'turn video [VIDEO_STATE]',
        'zh-cn': '[VIDEO_STATE]摄像头',
        'ko': '비디오 [VIDEO_STATE]',
        'zh-tw': '視訊設為[VIDEO_STATE]'
    },
    on: {
        'ja': '入',
        'ja-Hira': 'いり',
        'en': 'on',
        'zh-cn': '开启',
        'ko': '시작하기',
        'zh-tw': '開啟'
    },
    off: {
        'ja': '切',
        'ja-Hira': 'きり',
        'en': 'off',
        'zh-cn': '关闭',
        'ko': '그만하기',
        'zh-tw': '關閉'
    },
    video_on_flipped: {
        'ja': '左右反転',
        'ja-Hira': 'さゆうはんてん',
        'en': 'on flipped',
        'zh-cn': '镜像开启',
        'ko': '좌우반전 켜기',
        'zh-tw': '翻轉'
    },
    confidence_level: {
        'en': 'low confidence level',
        'zh-tw': '低於置信度閥值'
    },
};
