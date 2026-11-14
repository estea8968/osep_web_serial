export const name = {
    'en': 'Claude',
    'zh-tw': 'Claude AI'
};

export const set_api_key = {
    'en': 'Claude API key [KEY]',
    'zh-tw': 'Claude金鑰 [KEY]'
};
export const set_access_code = {
    'en': 'set class access code [CODE]',
    'zh-tw': '設定使用密碼 [CODE]'
};
export const set_proxy_url = {
    'en': 'set relay (GAS) URL [URL]',
    'zh-tw': '設定中繼(GAS)網址 [URL]'
};
export const set_model = {
    'en': 'configure modle of[MODEL]',
    'zh-tw': '設定AI模型為[MODEL]'
};
export const set_system = {
    'en': 'configure system of[SYSTEM]',
    'zh-tw': '設定AI身份為[SYSTEM]'
};
export const set_max_tokens = {
    'en': 'configure max token of[TOKENS]',
    'zh-tw': '設定最大代幣[TOKENS]'
};
export const set_temperature = {
    'en': 'configure temperature of[TEMP]',
    'zh-tw': '輸出溫度(0真實與1創意)[TEMP]'
};
export const set_memory = {
    'en': 'turn conversation memory [ONOFF]',
    'zh-tw': '對話記憶 [ONOFF]'
};
export const clear_history = {
    'en': 'clear conversation history',
    'zh-tw': '清除對話紀錄'
};
export const ask = {
    'en': 'talk text of [QUESTION]',
    'zh-tw': '聊天內容[QUESTION]'
};
export const ask_stage = {
    'en': 'show stage to Claude and ask [QUESTION] and wait',
    'zh-tw': '讓 Claude 看舞台並問 [QUESTION] 並等待'
};
export const ask_reporter = {
    'en': 'answer from Claude to [QUESTION]',
    'zh-tw': 'Claude 對 [QUESTION] 的回答'
};
export const answer = {
    'en': 'Claude answer',
    'zh-tw': 'Claude 回應訊息'
};
export const status = {
    'en': 'Claude status',
    'zh-tw': 'Claude 狀態'
};
export const is_busy = {
    'en': 'Claude is thinking?',
    'zh-tw': 'Claude 思考中?'
};
export const copy_text = {
    'en': 'copy [TEXT] to clipboard',
    'zh-tw': '複製 [TEXT] 到剪貼簿'
};

export const onoff = {
    'en': ['on', 'off'],
    'zh-tw': ['開啟', '關閉']
};

export const default_question = {
    'en': 'Hello! Introduce yourself in one sentence.',
    'zh-tw': '你好！用一句話介紹你自己。'
};
export const default_stage_question = {
    'en': 'What do you see on the stage?',
    'zh-tw': '舞台上有什麼？'
};
export const default_system = {
    'en': 'You are a friendly assistant. Answer briefly.',
    'zh-tw': '你是親切的助教，請用繁體中文簡短回答。'
};

// 狀態
export const status_idle = {
    'en': 'ready',
    'zh-tw': '待命'
};
export const status_busy = {
    'en': 'thinking…',
    'zh-tw': '思考中…'
};
export const status_done = {
    'en': 'done',
    'zh-tw': '完成'
};
export const status_truncated = {
    'en': 'done (reply cut off: increase max length)',
    'zh-tw': '完成（回應被截斷，可調高最大長度）'
};

// 錯誤（key = ClaudeClient 的錯誤 code）
export const errors = {
    NO_KEY: {
        'en': 'Please set an API key or relay URL first',
        'zh-tw': '請先設定 Claude API 金鑰或中繼網址'
    },
    DAILY_LIMIT: {
        'en': 'Daily usage limit reached, try again tomorrow',
        'zh-tw': '今天的使用次數已達上限，明天再試'
    },
    ACCESS_DENIED: {
        'en': 'Wrong access code',
        'zh-tw': '使用密碼錯誤'
    },
    MODEL_NOT_ALLOWED: {
        'en': 'This model is not allowed by the relay',
        'zh-tw': '中繼不允許使用這個模型'
    },
    PROXY_SETUP: {
        'en': 'Relay is not set up correctly',
        'zh-tw': '中繼設定有誤'
    },
    PROXY_NETWORK: {
        'en': 'Cannot reach the relay (check URL and that access is "Anyone")',
        'zh-tw': '連不到中繼（檢查網址，以及部署的存取權是否為「任何人」）'
    },
    EMPTY_QUESTION: {
        'en': 'The question is empty',
        'zh-tw': '問題不能是空的'
    },
    NO_IMAGE: {
        'en': 'Could not capture the stage',
        'zh-tw': '無法擷取舞台畫面'
    },
    BAD_KEY: {
        'en': 'Invalid API key',
        'zh-tw': 'API 金鑰錯誤或已失效'
    },
    FORBIDDEN: {
        'en': 'This key has no permission for this request',
        'zh-tw': '此金鑰沒有權限'
    },
    BAD_MODEL: {
        'en': 'Model not found, check the model name',
        'zh-tw': '找不到這個模型，請檢查模型名稱'
    },
    BAD_REQUEST: {
        'en': 'Request rejected',
        'zh-tw': '請求內容有誤'
    },
    TOO_LARGE: {
        'en': 'Request too large',
        'zh-tw': '送出的內容太大'
    },
    RATE_LIMIT: {
        'en': 'Too many requests or out of credit, wait and try again',
        'zh-tw': '請求太頻繁或額度不足，請稍後再試'
    },
    OVERLOADED: {
        'en': 'Claude is busy right now, try again later',
        'zh-tw': 'Claude 伺服器忙碌中，請稍後再試'
    },
    SERVER: {
        'en': 'Server error, try again later',
        'zh-tw': '伺服器錯誤，請稍後再試'
    },
    TIMEOUT: {
        'en': 'Timed out',
        'zh-tw': '等待逾時'
    },
    NETWORK: {
        'en': 'Network error',
        'zh-tw': '網路連線錯誤'
    },
    REFUSAL: {
        'en': 'Claude declined to answer this',
        'zh-tw': 'Claude 無法回答這個問題'
    },
    BAD_RESPONSE: {
        'en': 'Unexpected response',
        'zh-tw': '回應格式異常'
    },
    HTTP: {
        'en': 'Request failed',
        'zh-tw': '請求失敗'
    }
};
export const error_prefix = {
    'en': 'Error: ',
    'zh-tw': '錯誤：'
};
