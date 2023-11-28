// common
export const FormPwmWrite = {
    'pt-br': 'escrever pino PWM[PIN]com[VALUE]',
    'pt': 'escrever pino PWM[PIN]com[VALUE]',
    'en': 'write PWM pin [PIN] [VALUE]%',
    'fr': 'mettre la pin PWM[PIN]à[VALUE]',
    'zh-tw': '腳位[PIN]類比輸出[VALUE]',
    'zh-cn': '脚位[PIN]类比输出[VALUE]',
    'pl': 'ustaw PWM pin [PIN] na [VALUE]',
};

export const FormTone = {
    'pt-br': 'Soar no pino[PIN]com[FREQ]Hz e[DURATION]ms',
    'pt': 'Soar no pino[PIN]com[FREQ]Hz  e[DURATION]ms',
    'en': 'Tone pin [PIN] [FREQ] Hz [DURATION] ms',
    'fr': 'Définir le buzzer sur la pin[PIN]à[FREQ]Hz pendant[DURATION] ms',
    'zh-tw': '音調在腳位[PIN]，頻率為[FREQ]時間為[DURATION]毫秒',
    'zh-cn': '音调在脚位[PIN]，频率为[FREQ]时间为[DURATION]',
    'pl': 'Ustaw brzęczyk na Pinie [PIN] na [FREQ] Hz i [DURATION] ms%',
};

export const FormServo = {
    'pt-br': 'Mover Servo Motor no[PIN]para[ANGLE]°',
    'pt': 'Mover Servo Motor no[PIN]para[ANGLE]°',
    'en': 'write Servo pin [PIN] [ANGLE] deg',
    'fr': 'Mettre le servo[PIN]à[ANGLE] deg.',
    'zh-tw': '伺服馬達腳位[PIN]轉動角度到[ANGLE]度',
    'zh-cn': '伺服马达脚位[PIN]转动角度到[ANGLE]度',
    'pl': 'Ustaw silnik servo na Pinie [PIN] na [ANGLE]°',
};

export const FormAnalogRead = {
    'pt-br': 'Ler Pino Analógico [PIN]',
    'pt': 'Ler Pino Analógico [PIN]',
    'en': 'read analog pin [PIN]',
    'fr': 'Lecture analogique [PIN]',
    'zh-tw': '讀取類比腳位[PIN]',
    'zh-cn': '读取类比脚位[PIN]',
    'pl': 'Odczytaj analogowy Pin [PIN]',
};

export const ContentPort = {
    'en': 'connect to Arduino',
    'zh-tw': '連線到Arduino',
};

export const FormWs2812Write = {
    'en': 'WS2812 pin [PIN] light #[NUM] red[RED] green[GREEN] blue[BLUE]',
    'zh-tw': 'LED陣列，腳位[PIN]，亮第[NUM]顆，紅[RED] 綠[GREEN] 藍[BLUE]',
};

export const FormLcdShow = {
    'en': 'LCD show text [VALUE] at [ROW] row',
    'zh-tw': 'LCD顯示文字[VALUE]在第[ROW]列',
};

export const FormLcdClear = {
    'en': 'clear LCD text',
    'zh-tw': '清除LCD文字',
};

export const digitalWrite = {
    'pt-br': 'Escrever Pino Digital[PIN]como[ON_OFF]',
    'pt': 'Escrever Pino Digital[PIN]como[ON_OFF]',
    'en': 'write digital pin [PIN] [ON_OFF]',
    'fr': 'Mettre la pin numérique[PIN]à[ON_OFF]',
    'zh-tw': '腳位[PIN]數位輸出[ON_OFF]',
    'zh-cn': '脚位[PIN]数位输出[ON_OFF]',
    'pl': 'Ustaw cyfrowy Pin [PIN] na [ON_OFF]',
};

export const FormDigitalRead = {
    'pt-br': 'Ler Pino Digital [PIN]',
    'pt': 'Ler Pino Digital [PIN]',
    'en': 'read digital pin [PIN]',
    'fr': 'Lecture numérique [PIN]',
    'zh-tw': '讀取數位腳位[PIN]',
    'zh-cn': '读取数位脚位[PIN]',
    'pl': 'Odczytaj cyfrowy Pin [PIN]',
};

//dht11
export const FormDht11Set = {
    'en': ' DHT11 pin [PIN] ',
    'zh-tw': 'DHT11在腳位 [PIN]',
};

export const FormDht11Read = {
    'en': 'DHT11 [TH] ',
    'zh-tw': 'DHT11 [TH]的值',
};

export const MENU_DHT_SENSORS = {
    'en': ['temperature', 'humidity'],
    'zh-tw': ['溫度', '溼度'],
};

export const FormSonarRead = {
    'pt-br': 'Ler Distância: Sonar em Trig[TRIGGER_PIN] Echo[ECHO_PIN]',
    'pt': 'Ler Distância: Sonar em Trig[TRIGGER_PIN] Echo[ECHO_PIN]',
    'en': 'read HC-SR04 Echo [ECHO_PIN] Trig [TRIGGER_PIN] ',
    'fr': 'Distance de lecture : Sonar Trig [TRIGGER_PIN] Echo [ECHO_PIN]',
    'zh-tw': 'HCSR超音波感測器，Echo在腳位[ECHO_PIN]Trig在腳位[TRIGGER_PIN]',
    'zh-cn': 'HCSR超音波感测器，Echo在脚位[ECHO_PIN]Trig在脚位[TRIGGER_PIN]',
    'pl': 'Odczytaj odległość: Sonar Trig [TRIGGER_PIN]  Echo [ECHO_PIN]',
};

// General Alert
export const FormWSClosed = {
    'pt-br': "A Conexão do WebSocket está Fechada",
    'pt': "A Conexão do WebSocket está Fechada",
    'en': "Connection is closed.",
    'fr': "La connexion WebSocket est fermée.",
    'zh-tw': "網路連線中斷",
    'zh-cn': "网絡连线中断",
    'pl': "Połączenie WebSocket jest zamknięte.",
};

export const ws2812_show = {
    'en': "WS2812 show",
    'zh-tw': "LED陣列顯示",
};

export const FormConverNum = {
    'en': "convert[VALUE]from ([F_BEGIN],[F_END]) to ([T_BEGIN],[T_END])",
    'zh-tw': "轉換[VALUE]從([F_BEGIN],[F_END])到([T_BEGIN],[T_END])",
};

//shu need
export const FormWs2812SetPin = {
    'en': "WS2812 pin [PIN] ",
    'zh-tw': "設定LED陣列在腳位[PIN]",
};

export const FormWs2812SetNum = {
    'en': 'WS2812 light #[NUM] color [RGB] value [VALUE]',
    'zh-tw': 'LED 陣列，亮第[NUM]顆，顏色:[RGB]，值:[VALUE]',
};

/*export const FormWs2812SetNum1 = {
    'en': 'WS2812 light #[NUM] color red:[colorR] green:[colorG] blue:[colorB]',
    'zh-tw': 'LED 陣列，亮第[NUM]顆，顏色:紅:[colorR]綠:[colorG]藍[colorB]',
};*/

export const FormWs2812Show = {
    'en': "WS2812 show",
    'zh-tw': "LED陣列顯示",
};
export const Flash_Hex = {
    'en': "flash firmware [USB]",
    'zh-tw': "燒錄韌體[USB]",
};

export const FormRGB = {
    'en': ['red','oringe', 'yellow','green', 'blue',  'cyan', 'purple', 'white'],
    'zh-tw': ['紅','橙', '黃','綠', '藍',  '青', '紫', '白'],
};

export const FormDisconnect = {
    'en': 'Arduino dicconnected',
    'zh-tw': 'Arduino已離線',
}

export const FormWs2812SetClear = {
    'en': "clear WS2812",
    'zh-tw': "清除LED設定",
};

export const FormPmsRead ={
    'en': "read PMS5003 TX at pin:2 ",
    'zh-tw': "讀取PMS5003 TX在腳位:2 ",

};

export const FormPmsValue ={
    'en': "PMS5003 [PMS] value",
    'zh-tw': "PMS5003 [PMS]空氣品質",

};

export const pmsItems ={
    'en': ['PM1', 'PM2.5', 'PM10','Temperature','Humidity'],
    'zh-tw': ['PM1', 'PM2.5', 'PM10','溫度','濕度']
}

export const browser_not_support ={
    'en': ['Browser not support web serial api!'],
    'zh-tw': ['瀏覽器不支援web serial api']
};

export const FormMax7219Set = {
    'en': "Max7219 DIN:[DATA_PIN]CS:[CS_PIN]CLK: [CLK_PIN] ",//devices[DEVICES]",
    'zh-tw': "max7219設定  DIN 腳位[DATA_PIN] CS 腳位[CS_PIN] CLK 腳位[CLK_PIN]",//  片數[DEVICES]"
};

/*export const FormMax7219Clear ={
    'en': "Clear led",
    'zh-tw':"清除 led",
};*/

export const Form7219_show ={
    'en': "Max7219 show HEX value:[TEXT]",
    'zh-tw': "max7219顯示HEX值:[TEXT]",
};

export const Max7219_matrix ={
    'en': "show value: [VALUE]",
    'zh-tw':"顯示01值 [VALUE]",
};
export const hx711_set = {
    'en': "hx711 zero-setting, DAT pin:[DAT] SCK pin:[SCK]",
    'zh-tw': "hx711歸零,DAT腳位:[DAT] SCK腳位:[SCK]",
};
export const hx711 = {
    'en': "hx711 value",//, DAT pin:[DAT] SCK pin:[SCK]",
    'zh-tw': "hx711值,",//DAT腳位:[DAT] SCK腳位:[SCK]",
};
export const FormNtcRead = {
    'en': 'NTC temperature pin [PIN] ',
    'zh-tw': 'NTC溫度 在腳位 [PIN]',
};
export const FirmwareVersion ={
    'en': "firmware version",
    'zh-tw':"韌體版本",
};

export const isContent ={
    'en': "is contented",
    'zh-tw':"連線否",
};

export const connectionTrue ={
    'en': "contented",
    'zh-tw':"連線",
};

export const disconnectionFalse ={
    'en': "discontented",
    'zh-tw':"斷線",
};