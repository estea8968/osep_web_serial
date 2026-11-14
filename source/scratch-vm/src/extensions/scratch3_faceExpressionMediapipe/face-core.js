/**
 * MediaPipe 臉部表情辨識：與 Scratch 無關的純計算（可在 Node 測試）
 *
 * - MediaPipe Face Landmarker 會輸出 52 個 blendshape（表情係數，0～1，ARKit 命名）
 *   與 478 個臉部特徵點（x、y 為 0～1 的畫面比例）。
 * - 表情是用下面 RULES 的規則從 blendshape 算出來的（不是另外訓練的模型），
 *   每條規則都看得懂，可以直接調整門檻。
 *
 * 重要：不可使用 async/await（見專案的 regeneratorRuntime 調查）。
 */

const EMOTIONS = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];

/** 把 x 從 [lo, hi] 線性對應到 [0, 1]，超出範圍就截斷 */
const ramp = (x, lo, hi) => {
    if (!(x > lo)) return 0;
    if (x >= hi) return 1;
    return (x - lo) / (hi - lo);
};

const clamp01 = x => Math.max(0, Math.min(1, x));

/** 取 blendshape 值，沒有就是 0 */
const g = (bs, name) => (typeof bs[name] === 'number' ? bs[name] : 0);
/** 左右平均 */
const lr = (bs, base) => (g(bs, `${base}Left`) + g(bs, `${base}Right`)) / 2;

/** 從 blendshape 整理出規則會用到的特徵（0～1） */
const features = bs => ({
    smile: lr(bs, 'mouthSmile'),
    cheekSquint: lr(bs, 'cheekSquint'),
    frown: lr(bs, 'mouthFrown'),
    browDown: lr(bs, 'browDown'),
    browInnerUp: g(bs, 'browInnerUp'),
    browOuterUp: lr(bs, 'browOuterUp'),
    eyeWide: lr(bs, 'eyeWide'),
    eyeSquint: lr(bs, 'eyeSquint'),
    jawOpen: g(bs, 'jawOpen'),
    sneer: lr(bs, 'noseSneer'),
    upperUp: lr(bs, 'mouthUpperUp'),
    stretch: lr(bs, 'mouthStretch'),
    press: lr(bs, 'mouthPress'),
    shrugLower: g(bs, 'mouthShrugLower')
});

/**
 * 表情規則（參考 FACS 臉部動作編碼的常見組合）
 * ramp(特徵, 開始算的值, 算滿分的值)
 */
const RULES = {
    // 嘴角上揚 + 臉頰上推
    happy: f => clamp01(ramp(f.smile, 0.15, 0.6) * 0.85 + ramp(f.cheekSquint, 0.1, 0.5) * 0.15),
    // 眉毛上揚 + 張嘴（或眼睛睜大）
    surprised: f => clamp01(
        ramp((f.browInnerUp + f.browOuterUp) / 2, 0.15, 0.55) * 0.5 +
        ramp(f.jawOpen, 0.1, 0.5) * 0.35 +
        ramp(f.eyeWide, 0.1, 0.4) * 0.15
    ),
    // 眼睛睜大 + 嘴角往兩側拉 + 眉頭上揚
    fearful: f => clamp01(
        ramp(f.eyeWide, 0.1, 0.4) * 0.4 +
        ramp(f.stretch, 0.1, 0.4) * 0.4 +
        ramp(f.browInnerUp, 0.15, 0.5) * 0.2
    ),
    // 嘴角下垂 + 眉頭上揚（嘴巴張開時比較不像難過）
    sad: f => clamp01(
        (ramp(f.frown, 0.05, 0.3) * 0.55 +
         ramp(f.browInnerUp, 0.15, 0.5) * 0.3 +
         ramp(f.shrugLower, 0.1, 0.4) * 0.15) *
        (1 - ramp(f.jawOpen, 0.15, 0.5))
    ),
    // 皺眉（眉毛往下）+ 抿嘴 + 瞇眼
    angry: f => clamp01(
        ramp(f.browDown, 0.1, 0.45) * 0.7 +
        ramp(f.press, 0.1, 0.4) * 0.15 +
        ramp(f.eyeSquint, 0.2, 0.6) * 0.15
    ),
    // 皺鼻子 + 上唇上揚
    disgusted: f => clamp01(ramp(f.sneer, 0.05, 0.35) * 0.7 + ramp(f.upperUp, 0.05, 0.35) * 0.3)
};

/** 其他表情的最高分低於這個值時，判定為「平靜」 */
const NEUTRAL_THRESHOLD = 0.35;

/**
 * 從 blendshape 算出 7 種表情的分數（0～1）與最可能的表情
 * @param {object} bs blendshape 名稱 → 值
 * @returns {{scores: object, emotion: string, confidence: number}}
 */
const computeEmotions = bs => {
    const f = features(bs || {});
    const scores = {};
    let maxOther = 0;
    Object.keys(RULES).forEach(key => {
        let s = RULES[key](f);
        // 笑的時候，其他負面/驚訝的表情分數打折（笑容常伴隨瞇眼、張嘴）
        if (key !== 'happy') s *= (1 - 0.8 * ramp(f.smile, 0.15, 0.6));
        scores[key] = s;
        if (s > maxOther) maxOther = s;
    });
    // 平靜：其他表情越弱分數越高；在最高分剛好等於門檻時，平靜分數也等於門檻
    scores.neutral = clamp01((1 - maxOther) * NEUTRAL_THRESHOLD / (1 - NEUTRAL_THRESHOLD));

    let emotion = 'neutral';
    EMOTIONS.forEach(key => {
        if (scores[key] > scores[emotion]) emotion = key;
    });
    return {scores, emotion, confidence: scores[emotion]};
};

/** MediaPipe 的 faceBlendshapes[0].categories → {名稱: 值} */
const blendshapesToMap = classifications => {
    const map = {};
    if (!classifications || !classifications.categories) return map;
    classifications.categories.forEach(c => {
        map[c.categoryName] = c.score;
    });
    return map;
};

/** 指數平滑，減少每一幀之間的跳動；alpha 越大越即時 */
const smoothMap = (prev, next, alpha) => {
    if (!prev) return Object.assign({}, next);
    const out = {};
    Object.keys(next).forEach(k => {
        const p = typeof prev[k] === 'number' ? prev[k] : next[k];
        out[k] = p + (next[k] - p) * alpha;
    });
    return out;
};

/** 臉部動作（給學生直接用的 0～100 數值）；左右指的是「被拍的人自己的」左右 */
const ACTIONS = {
    smile: bs => lr(bs, 'mouthSmile'),
    mouthOpen: bs => g(bs, 'jawOpen'),
    leftEyeClosed: bs => g(bs, 'eyeBlinkLeft'),
    rightEyeClosed: bs => g(bs, 'eyeBlinkRight'),
    browUp: bs => Math.max(g(bs, 'browInnerUp'), lr(bs, 'browOuterUp')),
    browDown: bs => lr(bs, 'browDown'),
    pucker: bs => g(bs, 'mouthPucker'),
    cheekPuff: bs => g(bs, 'cheekPuff'),
    noseSneer: bs => lr(bs, 'noseSneer'),
    mouthFrown: bs => lr(bs, 'mouthFrown'),
    eyeWide: bs => lr(bs, 'eyeWide')
};

const ACTION_KEYS = Object.keys(ACTIONS);

const actionValue = (bs, key) => {
    const fn = ACTIONS[key];
    if (!fn || !bs) return 0;
    return Math.round(clamp01(fn(bs)) * 100);
};

// 特徵點編號（MediaPipe 478 點臉部網格）
const LM = {
    NOSE_TIP: 1,
    FOREHEAD: 10,
    CHIN: 152,
    RIGHT_CHEEK: 234, // 畫面左側（人的右臉）
    LEFT_CHEEK: 454, // 畫面右側（人的左臉）
    RIGHT_EYE_OUTER: 33,
    LEFT_EYE_OUTER: 263
};

const STAGE_W = 480;
const STAGE_H = 360;
const toDeg = r => (r * 180) / Math.PI;

/**
 * 臉在舞台上的位置與頭部角度
 * @param {Array<{x:number,y:number}>} lm 特徵點（0～1）
 * @param {boolean} mirror 舞台畫面是否鏡像（Scratch 視訊「開啟」= 鏡像）
 * @returns {{x,y,width,height,yaw,pitch,roll}} 舞台座標；角度大約值（度）
 *   yaw：往舞台右邊轉為正；pitch：抬頭為正；roll：頭往舞台右邊歪為正
 */
const faceGeometry = (lm, mirror) => {
    if (!lm || lm.length < 455) return null;
    let minX = 1;
    let maxX = 0;
    let minY = 1;
    let maxY = 0;
    lm.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    });
    const sx = mirror ? -1 : 1; // 鏡像時，畫面左右相反
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const nose = lm[LM.NOSE_TIP];
    const rc = lm[LM.RIGHT_CHEEK];
    const lc = lm[LM.LEFT_CHEEK];
    const fh = lm[LM.FOREHEAD];
    const chin = lm[LM.CHIN];
    const re = lm[LM.RIGHT_EYE_OUTER];
    const le = lm[LM.LEFT_EYE_OUTER];

    // 左右轉：鼻尖偏離兩頰中點的比例（約略換成角度）
    const halfW = Math.abs(lc.x - rc.x) / 2 || 1e-6;
    const yawRatio = Math.max(-1, Math.min(1, (nose.x - (lc.x + rc.x) / 2) / halfW));
    const yaw = toDeg(Math.asin(yawRatio)) * sx;

    // 上下：鼻尖在額頭～下巴之間的位置（正視約 0.55～0.6），抬頭時鼻尖往上
    const faceH = (chin.y - fh.y) || 1e-6;
    const pitchRatio = Math.max(-1, Math.min(1, (0.58 - (nose.y - fh.y) / faceH) / 0.3));
    const pitch = toDeg(Math.asin(pitchRatio));

    // 歪頭：兩眼外角連線的角度（畫面座標 y 向下）
    const dx = (le.x - re.x) * STAGE_W;
    const dy = (le.y - re.y) * STAGE_H;
    let roll = toDeg(Math.atan2(dy, dx));
    if (roll > 90) roll -= 180;
    if (roll < -90) roll += 180;
    roll *= sx;

    const round1 = v => Math.round(v * 10) / 10;
    return {
        x: Math.round((cx - 0.5) * STAGE_W * sx),
        y: Math.round((0.5 - cy) * STAGE_H),
        width: Math.round((maxX - minX) * STAGE_W),
        height: Math.round((maxY - minY) * STAGE_H),
        yaw: round1(yaw),
        pitch: round1(pitch),
        roll: round1(roll)
    };
};

module.exports = {
    EMOTIONS,
    RULES,
    NEUTRAL_THRESHOLD,
    ACTION_KEYS,
    LM,
    ramp,
    features,
    computeEmotions,
    blendshapesToMap,
    smoothMap,
    actionValue,
    faceGeometry
};
