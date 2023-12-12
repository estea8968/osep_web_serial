export const w_content ={
    'en': 'Contented micro:bit',
    'zh-tw': '連線到micro:bit', 
}
export const ledDisplayTextAry = {
    'en': 'led display bmp [TEXT]',
    'zh-tw': 'led顯示圖像[TEXT]',
};

export const analogRead ={
    'en': 'analog pin [PIN] valume',
    'zh-tw': '類比腳位[PIN]值',
};

export const digitalRead ={
    'en': 'digital pin [PIN] valume',
    'zh-tw': '數位腳位[PIN]值',
};

export const analogWrite ={
    'en': 'PWM pin [PIN] output [VALUE]',
    'zh-tw': 'PWM腳位[PIN]輸出[VALUE]',
};

export const digitalWrite ={
    'en': 'digital pin [PIN] output [VALUE]',
    'zh-tw': '數位腳位[PIN]輸出[VALUE]',
};

export const lightRead = {
    'en': 'v2_temperature valume',
    'zh-tw': 'v2_光線值',
};

export const radioRead = {
    'en': 'v2_radio valume',
    'zh-tw': 'v2_收到廣播值',
};

export const radioSend = {
    'en': 'v2_radio send [TEXT]',
    'zh-tw': 'v2_廣播送出[TEXT]',
};

export const isG248 ={
    'en': 'v2_accelerometer [GXXX]',
    'zh-tw': 'v2_加速度[GXXX]',
};

export const servoValue = {
    'en': 'v2_servo at [PIN] angle[VALUE]',
    'zh-tw': 'v2_[PIN]腳位伺服馬達角度[VALUE]',
};

export const FormTone = {
    'en': 'v2_Tone [FREQ] Hz [DURATION] ms',
    'zh-tw': 'v2_音調頻率為[FREQ]時間為[DURATION]毫秒',
};
export const tempRead = {
    'en': 'v2_ ',
    'zh-tw': 'v2_溫度',
};
export const mma8653Read={
    'en': 'mma8653 [XYZ] valume',
    'zh-tw': '三軸[XYZ]值',
};
export const mag3110Read={
    'en': 'mag3110 [XYZ] valume',
    'zh-tw': '磁感[XYZ]值',
};

export const tilt_direction_menu_ary={
    'en': ['front','back','left','right','any'],
    'zh-tw': ['向前','向後','向左','向右','任何']
};

export const ledDisplayLine ={
    'en': 'LED line on x:[BX] y:[BY] ,to x:[EX] y:[EY]',
    'zh-tw': 'x:[BX] y:[BY],到點x:[EX] y:[EY]亮燈'
};
export const ledDisplayOne ={
    'en': 'LED  x:[X] y:[Y] on or off[OF]',
    'zh-tw': 'x:[X] y:[Y],亮息:[OF]'
}
export const displaydrawPixel = {
    'en': 'x:[X] y:[Y] LED [ONOFF]',
    'zh-tw': 'x:[X] y:[Y]亮熄[ONOFF]'
};

export const mag3110direct ={
    'en': 'direction',
    'zh-tw': '方向'
};

export const directEWSN ={
    'en': ['east', 'northeast', 'north','northwest','west','southwest','south','southeast'],
    'zh-tw': ['東', '東北', '北','西北','西','西南','南','東南']
};

export const clearDisplay = {
    'en': 'Clear display',
    'zh-tw': '清除led顯示'
};

export const FirmwareVersion ={
    'en': "firmware version",
    'zh-tw':"韌體版本",
};

export const dht11_read = {
    'en': "Get pin [PIN] dht11 data",
    'zh-tw':"取得DHT11在腳位[PIN]資料",
};

export const FormDht11Read ={
    'en': 'DHT11 [TH]',
    'zh-tw': 'DHT11的[TH]',
};

export const Dht11data ={
    'en': ['temperature', 'humidity'],
    'zh-tw': ['溫度', '溼度'],
};

export const FormOledShow ={
    'en': 'OLED at x:[ROWX] y:[ROWY] show text [VALUE]',
    'zh-tw': 'OLED x:[ROWX],y:[ROWY],顯示文字[VALUE]',
};

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

export const FormWs2812SetClear = {
    'en': "clear WS2812",
    'zh-tw': "清除LED設定",
};
export const FormWs2812Write = {
    'en': 'WS2812 pin [PIN] light #[NUM] red[RED] green[GREEN] blue[BLUE]',
    'zh-tw': 'LED陣列，腳位[PIN]，亮第[NUM]顆，紅[RED] 綠[GREEN] 藍[BLUE]',
};
export const FormLcdShow = {
    'en': 'LCD show text [VALUE] at [ROW] row',
    'zh-tw': 'LCD顯示文字[VALUE]在第[ROW]列',
};