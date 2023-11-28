/*
This is the Scratch 3 extension to remotely control an
Arduino Uno, ESP-8666, or Raspberry Pi


 Copyright (c) 2019 Alan Yorinks All rights reserved.

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 Version 3 as published by the Free Software Foundation; either
 or (at your option) any later version.
 This library is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 General Public License for more details.

 You should have received a copy of the GNU AFFERO GENERAL PUBLIC LICENSE
 along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

// Boiler plate from the Scratch Team
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');

require('sweetalert');
//wait ...
const Cast = require('../../util/cast.js');

//async await estea
const ml5 = require('ml5');
//require('babel-polyfill');
let esp_port;
// The following are constants used within the extension

// Digital Modes
const DIGITAL_INPUT = 1;
const DIGITAL_OUTPUT = 2;
const PWM = 3;
const SERVO = 4;
//const TONE = 5;
const SONAR = 6;
const ANALOG_INPUT = 7;


// an array to save the current pin mode
// this is common to all board types since it contains enough
// entries for all the boards.
// Modes are listed above - initialize to invalid mode of -1
let pin_modes = new Array(30).fill(-1);

// has an websocket message already been received
let alerted = false;

let connection_pending = false;

// general outgoing websocket message holder
let msg = null;

// the pin assigned to the sonar trigger
// initially set to -1, an illegal value
let sonar_report_pin = -1;

// flag to indicate if the user connected to a board
let connected = false;

// arrays to hold input values
let digital_inputs = new Array(32);
let analog_inputs = new Array(8);

let d_pin_ary = ['D0','D1','D2','D3','D4', 'D5','D6', 'D7', 'D8'];
let g_pin_ary = ['16','5','4','0','2', '14','12', '13', '15'];
// flag to indicate if a websocket connect was
// ever attempted.
let connect_attempt = false;
//wait flag estea
let wait_flag = false;

let the_locale = null;
//s#pin#1,255$2,255$ 30bites
let ws2812_pin = '9';
let send_color_data = '';

//def freq array
let freq_ary=[];
for(var i=24;i<84;i++){
    freq_ary.push(i);
}

//dht11 map
let theDHTSensorMap =
    {0: 'Temperature', 1: 'Humidity'};

const ContentPort = {
    'en': 'Connect to NodeMCU',
    'zh-tw': '連線到NodeMCU',
};
//oled
const FormOledShow ={
    'en': 'OLED output text [VALUE] at [ROW] row',
    'zh-tw': 'OLED顯示文字[VALUE]在第[ROW]列',
};

const FormOledQrcode ={
    'en': 'OLED Qrcode text [VALUE] ',
    'zh-tw': 'OLED顯示Qrcode內容[VALUE]',
};


const FormLcdShow = {
    'en': 'LCD show text [VALUE] at [ROW] row',
    'zh-tw': 'LCD顯示文字[VALUE]在第[ROW]列',
};

const FormLcdClear = {
    'en': 'Clear LCD text',
    'zh-tw': '清除LCD文字',
};
const browser_not_support = {
    'en': 'Browser not support web serial api!',
    'zh-tw': ['瀏覽器不支援web serial api']
};
//dht11
const FormDht11Set = {
    'en': ' DHT11 at Pin [PIN] ',
    'zh-tw': 'DHT11在腳位 [PIN]',
};

const FormDht11Read = {
    'en': 'DHT11 [TH] ',
    'zh-tw': 'DHT11 [TH]的值',
};

//dht11
const MENU_DHT_SENSORS = {
    'en': ['Temperature','Humidity'],
    'zh-tw': ['溫度','溼度'],
};

// common
const FormDigitalWrite = {
    'pt-br': 'Escrever Pino Digital [PIN]como[ON_OFF]',
    'pt': 'Escrever Pino Digital[PIN]como[ON_OFF]',
    'en': 'Write Digital Pin [PIN] [ON_OFF]',
    'fr': 'Mettre la pin numérique[PIN]à[ON_OFF]',
    'zh-tw': '腳位[PIN]數位輸出[ON_OFF]',
    'zh-cn': '引脚[PIN]数字输出[ON_OFF]',
    'pl': 'Ustaw cyfrowy Pin [PIN] na [ON_OFF]',
    'de': 'Setze digitalen Pin [PIN] [ON_OFF]',
    'ja': 'デジタル・ピン [PIN] に [ON_OFF] を出力',
};

const FormPwmWrite = {
    'pt-br': 'Escrever Pino PWM[PIN]com[VALUE]',
    'pt': 'Escrever Pino PWM[PIN]com[VALUE]',
    'en': 'Write PWM Pin [PIN] [VALUE]',
    'fr': 'Mettre la pin PWM[PIN]à[VALUE]',
    'zh-tw': '腳位[PIN]類比輸出[VALUE]',
    'zh-cn': '引脚[PIN]模拟输出[VALUE]',
    'pl': 'Ustaw PWM Pin [PIN] na [VALUE]',
    'de': 'Setze PWM-Pin [PIN] [VALUE]',
    'ja': 'PWM ピン [PIN] に [VALUE] を出力',
};

const FormServo = {
    'pt-br': 'Mover Servo Motor no[PIN]para[ANGLE]°',
    'pt': 'Mover Servo Motor no[PIN]para[ANGLE]°',
    'en': 'Write Servo Pin [PIN] [ANGLE] deg.',
    'fr': 'Mettre le servo[PIN]à[ANGLE] deg.',
    'zh-tw': '伺服馬達腳位[PIN]轉動角度到[ANGLE]度',
    'zh-cn': '伺服电机引脚[PIN]转动角度到[ANGLE]度',
    'pl': 'Ustaw silnik servo na Pinie [PIN] na [ANGLE]°',
    'de': 'Setze Servo-Pin [PIN] [ANGLE]°',
    'ja': 'サーボ・ピン [PIN] に [ANGLE] 度を出力',
};

const FormTone = {
    'pt-br': 'Soar no Pino[PIN]com[FREQ]Hz e[DURATION]ms',
    'pt': 'Soar no Pino[PIN]com[FREQ]Hz  e[DURATION]ms',
    'en': 'Tone Pin [PIN] [FREQ] Hz [DURATION] ms',
    'fr': 'Définir le buzzer sur la pin[PIN]à[FREQ]Hz pendant[DURATION] ms',
    'zh-tw': '音調在腳位[PIN]，頻率為[FREQ]時間為[DURATION]微秒',
    'zh-cn': '音调在脚位[PIN]，频率为[FREQ]时间为[DURATION]微秒',
    'pl': 'Ustaw brzęczyk na Pinie [PIN] na [FREQ] Hz i [DURATION] ms%',
};

const FormAnalogRead = {
    'pt-br': 'Ler Pino Analógico [PIN]',
    'pt': 'Ler Pino Analógico [PIN]',
    'en': 'Read Analog Pin [PIN]',
    'fr': 'Lecture analogique [PIN]',
    'zh-tw': '讀取類比腳位[PIN]',
    'zh-cn': '读取模拟引脚[PIN]',
    'pl': 'Odczytaj analogowy Pin [PIN]',
    'de': 'Lies analogen Pin [PIN]',
    'ja': 'アナログ・ピン [PIN] から入力',
};

const FormDigitalRead = {
    'pt-br': 'Ler Pino Digital [PIN]',
    'pt': 'Ler Pino Digital [PIN]',
    'en': 'Read Digital Pin [PIN]',
    'fr': 'Lecture numérique [PIN]',
    'zh-tw': '讀取數位腳位[PIN]',
    'zh-cn': '读取数字引脚[PIN]',
    'pl': 'Odczytaj cyfrowy Pin [PIN]',
    'de': 'Lies digitalen Pin [PIN]',
    'ja': 'デジタル・ピン [PIN] から入力',
};

const FormSonarRead = {
    'pt-br': 'Ler Distância: Sonar em Trig[TRIGGER_PIN] Echo[ECHO_PIN]',
    'pt': 'Ler Distância: Sonar em Trig[TRIGGER_PIN] Echo[ECHO_PIN]',
    'en': 'Read SONAR  Trig [TRIGGER_PIN]  Echo [ECHO_PIN]',
    'fr': 'Distance de lecture : Sonar TTrig [TRIGGER_PIN] Echo [ECHO_PIN]',
    'zh-tw': 'HCSR超音波感測器，Echo在腳位[ECHO_PIN] Trig在腳位[TRIGGER_PIN]',
    'zh-cn': 'HCSR超声波传感器，Echo在引脚[ECHO_PIN] Trig在引脚[TRIGGER_PIN]',
    'pl': 'Odczytaj odległość: Sonar Trig [TRIGGER_PIN]  Echo [ECHO_PIN]',
    'de': 'Lies Sonar Trig [TRIGGER_PIN]  Echo [ECHO_PIN]',
    'ja': '超音波測距器からトリガ [TRIGGER_PIN] とエコー [ECHO_PIN] で入力',
};

//ws2812
const FormWs2812SetPin = {
    'en': "WS2812 pin [PIN] ",
    'zh-tw': "設定LED陣列在腳位[PIN]",
};
const FormWs2812Show = {
    'en': "WS2812 show",
    'zh-tw': "LED陣列顯示",
};
const FormRGB = {
    'en': ['red','oringe', 'yellow','green', 'blue',  'cyan', 'purple', 'white'],
    'zh-tw': ['紅','橙', '黃','綠', '藍',  '青', '紫', '白'],
};

const FormWs2812SetClear = {
    'en': "clear WS2812",
    'zh-tw': "清除LED設定",
};

const FormWs2812SetNum = {
    'en': 'WS2812 light #[NUM] color [RGB] value [VALUE]',
    'zh-tw': 'LED 陣列，亮第[NUM]顆，顏色:[RGB]，值:[VALUE]',
};

//wifi
const FormContentAP = {
    'en': 'AP SSID:[SSID] Password:[PASSWORD]',
    'zh-tw': '連線AP SSID:[SSID] Password:[PASSWORD]]',
};

const FormWs2812Write ={
    'en': 'LED array Pin[PIN]light[NUM]:red[RED]green[GREEN]blue[BLUE]',
    'zh-tw': 'led陣列，腳位[PIN]，亮第[NUM]顆，紅[RED]綠[GREEN]藍[BLUE]',
};
const Form7219_max ={
    'en': ['max7219  DATA pin:[DATA_PIN] CS pin:[CS_PIN] CLK pin:[CLK_PIN] devices:[DEVICES] show:[TEXT]'],
    'zh-tw': ['max7219 DATA pin:[DATA_PIN] CS pin:[CS_PIN] CLK pin:[CLK_PIN] 有[DEVICES]個 顯示:[TEXT]']
};

const Form7219_set ={
    'en': ['max7219 set DATA pin:[DATA_PIN] CS pin:[CS_PIN] CLK pin:[CLK_PIN] devices:[DEVICES]'],
    'zh-tw': ['max7219 設定 DATA pin:[DATA_PIN] CS pin:[CS_PIN] CLK pin:[CLK_PIN] 有[DEVICES]個']
};

const Form7219_show ={
    'en': ['max7219 devices:[DEVICES] row:[ROW] col:[COL] value:[VALUE] show'],
    'zh-tw': ['max7219 第[DEVICES]個 列:[ROW] 行:[COL] 值:[VALUE] ']
};

const Form7219_row ={
    'en': ['max7219 devices:[DEVICES] row:[ROW] value:[VALUE] show'],
    'zh-tw': ['max7219 亮燈 第[DEVICES]個 列:[ROW] 值:[VALUE] ']
}
const Form7219_clear ={
    'en': ['max7219 leds all off'],
    'zh-tw': ['max7219 led全關閉 ']
}

// Raspbery Pi Specific
const FormIPBlockR = {
    'pt-br': 'Endereço IP do RPi [IP_ADDR]',
    'pt': 'Endereço IP do RPi [IP_ADDR]',
    'en': 'Remote IP Address [IP_ADDR]',
    'fr': 'Adresse IP du RPi [IP_ADDR]',
    'zh-tw': '遠端 IP 位址[IP_ADDR]',
    'zh-cn': '远程 IP 地址[IP_ADDR]',
    'pl': 'Adres IP Rasberry Pi [IP_ADDR]',
    'de': 'IP-Adresse des RPi [IP_ADDR]',
    'ja': 'ラズパイの IP アドレスを [IP_ADDR] に',
};

// General Alert
const FormWSClosed = {
    'pt-br': "A Conexão do WebSocket está Fechada",
    'pt': "A Conexão do WebSocket está Fechada",
    'en': "WebSocket Connection Is Closed.",
    'fr': "La connexion WebSocket est fermée.",
    'zh-tw': "網路連線中斷",
    'zh-cn': "网络连接中断",
    'pl': "Połączenie WebSocket jest zamknięte.",
    'de': "WebSocket-Verbindung geschlossen.",
    'ja': "ウェブソケット接続が切断されています",
};

class Scratch3EspWebSerial {
    constructor(runtime,util) {
        the_locale = this._setLocale();
        this.runtime = runtime;
        this.util = util;
    }

    getInfo() {
        the_locale = this._setLocale();
        this.connect();

        return {
            id: 'webserialEsp',
            color1: '#0C5986',
            color2: '#34B0F7',
            name: 'WebSerial ESP-8266',
            blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAbCAYAAAA+nNxPAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAByAAAAcgBs0i2uAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAnlSURBVFiF1ZhpbFxXFcd/9+3LrLbHM47TxNhOTYKdECchaVVKC6EVFSpLJRaBxCJRhBASIFQQQqKsQkUUiQIiRQio6AcWAaJSBRFtoGlN3KRJHZPacUqDEyexxx57PPubt1w+TDrBpCmBVEj8pZHmnfM/955z7z3nnvfErXfeM3T27PzBVCqRyS8WAeiMVbD0gFpTxzF8ABq+hqUH1Js6tuEjgfpFfcPXMLUABNSbBo7RxAtUdDVCCEnNM3DNJn6ooCoSRUgqnkHMbBJGCiBRlX+WCSKpoKshVc/AMZtIKbhQTAJgWQaKIIjF3C8eOfDA1wGU2dmFg3/87X2Zw48/wM/23QNAh1vjLW/opztRoa87IOXU6IpXedN2jUyiQi7t0x2v0p2o8KbtGp2xGim3yXUdNboTZfaO6nS4NZJOk8FcQDZZ5pZtOimnTtxqMNwHuWSZm0ZMEnadpNNg15Aglyyza7NFwm6Qcuq8fkQlmywz3KcStxooImLgVT2cPPwjpp7+kZbNpL72iXu/kwDQgjDMbNyQBWDP67YAUKi4PPbUDEvlBA2/BtJktW5zcLLGcjVOyq8DFitVh4OTVYo1l5jpUfVUlisuTxyvUKq7WLpPww9ZKqVonihT9Ww0NWJmLiBfStGcKlNvWggBE3/zW7KgjOebBJHC+JTHYimF55fxQ4NIKty0Z5gXcctNW3niyIkUUFIAvnLfwywVVvn4Z74LwIb+rVjp7ZQbNutedROzhU46swPEu3exWnPIbryRFe86TDeH07mDlapL39DNxDOjZNf1M/CaN1Px02Q37EKNbaXimfQOvIF8KUE6uw0tvpWqZ9K/eS/5copYx2ZimZ1UPRO7c5SS30Nn7jUMDt9GtWlx3aZbSOe2A/DwLx/n6MTzTD73dx786aPtoMSG4fdL/g9gWQZhGOH7wRr5ttHBjY88dO8Z7eWMuzocdo60jp0EZCSRAFIiJUgpW7+L+ktykEiefHoWyctOcdXIdCZZ35Pmxu1plpYWmV91+cPjk229BmBqEV6gXGa8dVOCHVvX/9eT/3VqjpXyf22+BqulKt1dcfZ9/3t4jQZvfNvH1ug1gN39Kzwx03nFQYaGhujt7cX3ffL5PAsLC4yOjtJsNomiiLGxMe644w6KxSL1ep1jx44BEEYSEADc9ZbNxFyDIJQ8e2KeEzP5/yiQmGtTqtT45D1foFIpc+y5wuWB/DuYpsmzzz7L8vIyADt27Gg/a1priGq1ytjYGDfffDO6ruP7PkiIQg9LLDJ/TmBbOqqq4lWK6LKML7quOpDz8y3Hv/rt37+k/qoP8OjoKJ7nkc/nef7559m9ezdRFDE9Pc3c3ByxWIxNmzZhGEYrCFq5Evp1YrEiU88V14yXsnUWG1cO5NXZSvv/CwWHZqDQ3ZXgvnvf86/U2U996NZ9GsBgtsKLpUtVJH+a7sLUojXso0ePtncEYP/+/Wiaxu233865c+eIoohSqcSBAwfanEhGgETTNBpegKGr+L6PEED48gsXsy5VJ0W8fGENQ2lrAD9+ckNb+K5d5wF47YZVYF1bPjQ0RL1eZ3l5mXQ6jaZp+L5PqVRCSkmtVmNhYWHNBFEk0a00H/nInXzrwb/w0Q+9jod+NcHbb381j4+dZvn0Mq8EFIVQA3jfnjmOzqYAmJxLXEacnp7GsiwAfN/nzJkzJBIJVFXl+PHjAIyPj19mJy8u5NceOAjAN38wBsC+h5/5t85NnrvkRzO8vKL+M6IIVQMwtIgt60oA5JIez52Pt0npdJqBgQHq9TonTpzg+uuvJxaLsbCwwLlz58jlcmSzWebn52k0GgwODuK6LqdOneJabtqXug6uBFUVvgZrd6En5a0hbd68mUOHDrF7926EEMzOzuJ5Hnv27CGfz9Pb28szz7RWuKenB9/3mZiYuGgtriGUq0ckpdAA0o7P/hPdABw+nV5Dmp6eZu/evczPzyOlxPM8HMehWq2SyWTQNI3R0VHm5ubo7e2lUqmwa9cuJicnuaYt+Q8gwNMAVmo6O/pa5fGGgWW++1h/m9Tf38/4+DjDw8MYhoGUkpGREQ4fPkxvby/5fJ7Tp09zww03IKXkhRdewDAMBgcHX3GHwzBiYXF1jSzTlZgUQixoAKMbVylUdOBSgrZCFRiGgaq2yqZlWezcuZOpqSkSiQSLi4uMjIxQKpXaFW39+vWoqkqxWARx9ef8alBYqfDZL/18jWzb6OBb203jhVWT3x3reUnjI0eOsH79emZmZqhWq5w8eRJFUTAMg2KxyMzMDMlkkomJCaSU5HI5oigin8/zSubIulwnibjJO24boFAoMJtXL28alysGNw6urelCSBwucPZsirNzrbtFABcuLIAQbRcXF5fb/gpgaWkZhEBVVYLwUq91rdB1jUTc4YFv34/neS/dND556goN4yng0NQ1TP/KHa0zc3kUEfHpz32BcqnExMm1uXLFXivTmWRltYKqKLiuxUqxQjLh0mz66LqGoWssLZfoSMeJwujiLggKy2VSSZcgCFEUBU1TWSlWiMdsoigiiiSaplKtNnBdCyEElWqdVNJlqVAi5rZ4UkoMQ6dW99B1lTCIOH1mkS/f/4crL9k37v0wfz/+EHd/8I62wrR0wjAiFrNJJV0URWDbBrlsB6apY9smQghMQ8O0dKIowrEtFEWQzaQxDA3T1HEdE1UR6LqKYeg4jkkqGQMBjmNimjqqohB3bQA6O+L05DqwrBZPEQJVUUjEHQBc1+Lon7/H8ad+QDoVW7sj773rVgA+98l38+BPHiWXXMWNFuhJmbjGAqIhycQsEuIClVWDhOGjBJJM3CYuLrQ+G1khWhDR6drIygViioaKRA9D0o5N2jiPH6pICUYQ0uHYJMR5fBTMuILhz5FN2Jj+AqGn4CoaVtAkbVvEbQ8poSAyvOedt9DZ0brAP/DeN3NgvJXwimubfxs/Mg3AL37zZwAcs8nWfpu45eFaAscISDoNRvptXLOJrkHKjUg5dbYOONiGj6ZIcp0GabfOlj4XUwvQ1JDeLp20W+f6DTF0NcTQQgbWtXh96+JoSoSlB2zZaJFy6/R0WSgiwjZ8tg04JJ0G3SkdXY3QlJBHfn+IIAiJoohfP/IUO966ZR5A3H33PufAM3/5YeBHw1K23rZt0xdxq0m1oWGZvhQIUW0YuFaTRlOTph4gBKJSN4nZHp6vSF2VQlEk5bpJwm7IZqCiKFKoiqRUM2XSaRBEikAKVDWiVDNlwvFEFAmCSGBqoSzVLeK2J2Qk8AJV2oZPuWGKmNVEAoWSK18smaoiVnq7uz7/xP77x+B/1QxdAadOnTILhYL54nO9Xo+azaYEyOVyAMzPz2MYRvvtpa+vD4CpqSlZqVTa1/c/APfiOtGnvgctAAAAAElFTkSuQmCC',
            blocks: [
                {
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: ContentPort[the_locale]
                    
                },
                {
                    opcode: 'digital_write',
                    blockType: BlockType.COMMAND,
                    text: FormDigitalWrite[the_locale],

                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'D2',
                            menu: "digital_pins"
                        },
                        ON_OFF: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0',
                            menu: "on_off"
                        }
                    }
                },
                {
                    opcode: 'pwm_write',
                    blockType: BlockType.COMMAND,
                    text: FormPwmWrite[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'D2',
                            menu: 'pwm_pins'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50',
                        }
                    }
                },
                {
                    opcode: 'tone_on',
                    blockType: BlockType.COMMAND,
                    text: FormTone[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'D2',
                            menu: 'digital_pins'
                        },
                        FREQ: {
                            type: ArgumentType.NOTE,
                            defaultValue: '60',
                            //menu: 'tone_list'
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 200,
                        }
                    }
                },
                {
                    opcode: 'servo',
                    blockType: BlockType.COMMAND,
                    text: FormServo[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'D2',
                            menu: 'digital_pins'
                        },
                        ANGLE: {
                            type: ArgumentType.ANGLE,
                            defaultValue: 90,
                        },

                    }
                },
                {
                    opcode: 'analog_read',
                    blockType: BlockType.REPORTER,
                    text: FormAnalogRead[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'A0'
                        },
                    }
                },
                {
                    opcode: 'digital_read',
                    blockType: BlockType.REPORTER,
                    text: FormDigitalRead[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'D2',
                            menu: 'digital_pins'
                        },
                    }
                },
                {
                    opcode: 'dht11_set',
                    blockType: BlockType.COMMAND,
                    text: FormDht11Set[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'D2',
                            menu: 'digital_pins'
                        }
                    }
                },
                {
                    opcode: 'dht11_read',
                    blockType: BlockType.REPORTER,
                    text: FormDht11Read[the_locale],
                    arguments: {
                        TH: {
                            type: ArgumentType.STRING,
                            defaultValue: MENU_DHT_SENSORS[the_locale][0], //MENU_TH_SENSORS[the_locale][0],
                            menu: 'dht_items'
                        },
                    }
                },
                {
                    opcode: 'sonar_read',
                    blockType: BlockType.REPORTER,
                    text: FormSonarRead[the_locale],
                    arguments: {
                        TRIGGER_PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'D1',
                            menu: 'digital_pins'
                        },
                        ECHO_PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'D2',
                            menu: 'digital_pins'
                        }
                    }
                },
                '---',
                //oled
                {
                    opcode: 'oled_show',
                    blockType: BlockType.COMMAND,
                    text: FormOledShow[the_locale],
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Word!',
                        },
                        ROW:{
                            type: ArgumentType.NUMBER,
                            defaultValue:'0',
                            menu:'oled_row'
                        }
                    }
                },
                {
                    opcode: 'oled_qrcode',
                    blockType: BlockType.COMMAND,
                    text: FormOledQrcode[the_locale],
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Word!',
                        }
                    }
                },
                //lcd 16x2
                {
                    opcode: 'lcd_show',
                    blockType: BlockType.COMMAND,
                    text: FormLcdShow[the_locale],
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Word!',
                        },
                        ROW:{
                            type: ArgumentType.NUMBER,
                            defaultValue:'0',
                            menu:'lcd_row'
                        }
                    }
                },
                {
                    opcode: 'lcd_clear',
                    blockType: BlockType.COMMAND,
                    text: FormLcdClear[the_locale],
                },
                {
                    opcode: 'ws2812_write',
                    blockType: BlockType.COMMAND,
                    text: FormWs2812Write[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'D2',
                            menu: 'digital_pins'
                        },
                        NUM: {
                            type: ArgumentType.STRING,
                            defaultValue: '0',
                        },
                        RED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '5',
                        },
                        GREEN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '5',
                        },
                        BLUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '5',
                        },

                    }
                },
                
                {
                    opcode: 'ws2812_set_clear',
                    blockType: BlockType.COMMAND,
                    text: FormWs2812SetClear[the_locale],
                },
                {
                    opcode: 'ws2812_set_pin',
                    blockType: BlockType.COMMAND,
                    text: FormWs2812SetPin[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'D2',
                            menu: 'digital_pins'
                        }

                    }
                },
                {
                    opcode: 'ws2812_set_num',
                    blockType: BlockType.COMMAND,
                    text: FormWs2812SetNum[the_locale],
                    arguments: {
                        NUM: {
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                            menu: 'lednum'
                        },
                        RGB: {
                            type: ArgumentType.STRING,
                            defaultValue: FormRGB[the_locale][0],
                            menu: 'rgb'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '2',
                        },
                    }
                },

                {
                    opcode: 'ws2812_show',
                    blockType: BlockType.COMMAND,
                    text: FormWs2812Show[the_locale],
                },
                '---',
                {
                    opcode: 'max7219_max',
                    blockType: BlockType.COMMAND,
                    text: Form7219_max[the_locale],
                    arguments:{
                        DATA_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: 'D2',
                            menu:'digital_pins'
                        },
                        CS_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: 'D1',
                            menu:'digital_pins'
                        },
                        CLK_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: 'D0',
                            menu:'digital_pins'
                        },
                        DEVICES:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                        },
                        TEXT:{
                            type: ArgumentType.STRING,
                            defaultValue: 'A',
                        },
                    }
                },
                {
                    opcode: 'max7219_set',
                    blockType: BlockType.COMMAND,
                    text: Form7219_set[the_locale],
                    arguments:{
                        DATA_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: 'D2',
                            menu:'digital_pins'
                        },
                        CS_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: 'D1',
                            menu:'digital_pins'
                        },
                        CLK_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: 'D0',
                            menu:'digital_pins'
                        },
                        DEVICES:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                        },
                    }
                },
                {
                    opcode: 'max7219_show',
                    blockType: BlockType.COMMAND,
                    text: Form7219_show[the_locale],
                    arguments:{
                        DEVICES:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '1'
                        },
                        ROW:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '3'
                        },
                        COL:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '4'
                        },
                        VALUE:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                            menu:'lcd_row'
                        },
                    }
                },
                {
                    opcode: 'max7219_row',
                    blockType: BlockType.COMMAND,
                    text: Form7219_row[the_locale],
                    arguments:{
                        DEVICES:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '1'
                        },
                        ROW:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        VALUE:{
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                        },
                    }
                },
                {
                    opcode: 'max7219_clear',
                    blockType: BlockType.COMMAND,
                    text: Form7219_clear[the_locale],
                },
                '---',
                {
                    opcode: 'content_ap',
                    blockType: BlockType.REPORTER,
                    //text: 'Write Digital Pin [PIN] [ON_OFF]',
                    text: FormContentAP[the_locale],

                    arguments: {
                        SSID: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ap_ssid',
                            //menu: "digital_pins"
                        },
                        PASSWORD:{
                            type: ArgumentType.STRING,
                            defaultValue: 'ap_password',
                        }

                    }
                }
            ],
            menus: {
                digital_pins: {
                    acceptReporters: true,
                    items: d_pin_ary
                },
                pwm_pins: {
                    acceptReporters: true,
                    items: d_pin_ary
                },

                mode: {
                    acceptReporters: true,
                    items: [{text: "Input", value: '1'}, {text: "Output", value: '2'}]
                },
                on_off: {
                    acceptReporters: true,
                    items: ['0', '1']
                },
                dht_items: 'getAllDHTMenuItems',
                tem_hum:{
                    acceptReporters: true,
                    items:['Temperature','Humidity']
                },
                tone_list: {
                    acceptReporters: true,
                    items: ['C3','C#3','D3','D#3','E3','F3','F#3','G3','G#3','A3','A#3','B3','C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5','C#5','D5','D#5','E5','F5','F#5','G5','G#5','A5','A#5','B5']
                },
                lcd_row:{
                    acceptReporters: true,
                    items:['0','1']
                },
                oled_row:{
                    acceptReporters: true,
                    items:['0','1','2']
                },
                rgb: {
                    acceptReporters: true,
                    items: FormRGB[the_locale]
                },
                lednum: {
                    acceptReporters: true,
                    items: ['1', '2', '3', '4', '5', '6', '7', '8']
                }
            }
        };
    }

    // The block handlers

    // command blocks
    d2g(d_pin){
        let i=0;
        for(i=0;i<d_pin_ary.length;i++ ){
            if (d_pin_ary[i] == d_pin){
                return g_pin_ary[i];
            }
        }
    }
    async content_ap(args) {
            const ssid = args['SSID'];
            const password = args['PASSWORD'];
            const sendData = 'w#'+ ssid+'#'+password+'#';
            console.log(sendData);
            this.serialSend(sendData);
            return this.serialRead();
    }

    async ws2812_write(args){
        let input_pin = this.d2g(args['PIN']);
        let num = args['NUM'];
        //num = parseInt(num, 10);
        let red = args['RED'];
        red = parseInt(red, 10);
        let green = args['GREEN'];
        green = parseInt(green, 10);
        let blue = args['BLUE'];
        blue = parseInt(blue, 10);
        const sendData = 'ws#'+input_pin+'#'+red.toString()+','+green.toString()+','+blue.toString()+'#'+num;
        console.log(sendData);
        this.serialSend(sendData);
    }

    async digital_write(args) {
            let input_pin = this.d2g(args['PIN']);
            let value = args['ON_OFF'];
            value = parseInt(value, 10);
            //let sendData;
            const sendData = 'digitalWrite#'+ input_pin +'#'+value.toString();
            console.log(sendData);
            this.serialSend(sendData);
    }

    //pwm
    async pwm_write(args) {
            let pin = this.d2g(args['PIN']);
            //pin = parseInt(input_pin, 10);
            // maximum value for RPi and Arduino
            let the_max = 255;
            let value = args['VALUE'];
            value = parseInt(value, 10);

            // calculate the value based on percentage
            //value = the_max * (value / 100);
            //value = Math.round(value);
            if(value >255){
                value =255;
            }
            let sendData = 'analogWrite#'+pin+'#'+value;
            console.log('sendData:',sendData);
            this.serialSend(sendData);
        
    }

    //tone
    async tone_on(args, util) {
        let pin = this.d2g(args['PIN']);
        let freq = Number(args['FREQ']);
        if(freq <24){
            freq =24;
        }
        if(freq>83){
            freq=83
        }
        console.log('freq = ',freq);
        //freq = parseInt(freq, 10);
        //let duration = args['DURATION'];
        let duration = Math.max(5, Cast.toNumber(args.DURATION));
        let valueFreq = 0;
        const toneArray1 = ['C1','C#1','D1','D#1','E1','F1','F#1','G1','G#1','A1','A#1','B1','C2','C#2','D2','D#2','E2','F2','F#2','G2','G#2','A2','A#2','B2','C3','C#3','D3','D#3','E3','F3','F#3','G3','G#3','A3','A#3','B3','C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5','C#5','D5','D#5','E5','F5','F#5','G5','G#5','A5','A#5','B5'];
        const toneArray2  = [33,35,37,39,41,44,46,49,52,55,58,62,65,69,73,78,82,87,93,98,104,110,117,123,131,139,147,156,165,175,185,196,208,220,233,247,262,277,294,311,330,349,370,392,415,440,466,493,523,554,587,622,659,698,740,784,831,880,932,988];
        //for (let i=0; i<toneArray1.length; i++) {
            for (let i = 0; i < freq_ary.length; i++) {    
                if (freq_ary[i] == freq) {
                   valueFreq = toneArray2[i];
                   console.log('toneArray[i]=',toneArray1[i]);
                }
            }             
        let sendData = 'tonePlay#'+pin+'#'+ valueFreq +'#'+duration.toString();
        console.log('sendData:',sendData);
        this.serialSend(sendData);
        //wait time duration
        await new Promise(resolve => setTimeout(resolve, duration));
        
    }

    // move servo
    async servo(args) {
            let pin = this.d2g(args['PIN']);
            //pin = parseInt(pin, 10);
            let angle = args['ANGLE'];
            angle = parseInt(angle, 10);
            let sendData = 'servoWrite#'+pin+'#'+angle.toString();
            console.log('sendData:',sendData);
            this.serialSend(sendData);
    }

    // reporter blocks
        
    async serialSend(sendData){
        let esp_writer = esp_port.writable.getWriter();
        const encoder = new TextEncoder();
        await esp_writer.write(encoder.encode(sendData));
        esp_writer.releaseLock(); 

    }

    async serialRead(){
        //讀取serial
        //return analog_inputs;
        let esp_reader = esp_port.readable.getReader(); 
        let readValue = await esp_reader.read();
        //console.log('readValue',readValue);
        let uint8array = new TextEncoder().encode();
        let  string = new TextDecoder().decode(readValue.value);
        let astring = string.split('\r\n');
        //let serial_request = astring[0];
        esp_reader.releaseLock();
        return astring[0];
    }

    async analog_read(args) {
        let pin = 0;
        let sendData = 'analogRead#0';//+pin.toString();
        //const serial_request = this.serialSendRead(sendData);
        this.serialSend(sendData);
        console.log(sendData);
        //return this.serialRead();
        let serial_data = (await this.serialRead()).split(':');
        if( serial_data[0] == 'A'+pin ){
           return serial_data[1];
        }
    }

    async digital_read(args) {
            let pin = this.d2g(args['PIN']);
            let sendData = 'digitalRead#'+pin;
            console.log('sendData:',sendData);
            const serial_request = this.serialSend(sendData); 
            let serial_data = (await this.serialRead()).split(':');
            if( serial_data[0] == 'G'+pin ){
                return serial_data[1];
            }
            //return this.serialRead();
    }

    async sonar_read(args) {
        let trigger_pin = this.d2g(args['PIN']);
        //trigger_pin = parseInt(trigger_pin, 10);
        sonar_report_pin = trigger_pin;
        let echo_pin = this.d2g(args['ECHO_PIN']);
        //echo_pin = parseInt(echo_pin, 10);
        let sendData = 'SR04#'+trigger_pin+'#'+echo_pin;
        console.log('sendData:',sendData);
        this.serialSend(sendData);
        //const serial_request = this.serialSendRead(sendData); 
        return this.serialRead();

    }

    //dht11
    getAllDHTMenuItems() {
        return MENU_DHT_SENSORS[the_locale];
    }

    mapDHTSensors(th_data) {
        //['Temperature','Humidity']
        return theDHTSensorMap[th_data];

    }
    // 
    async dht11_set(args){
        let pin = this.d2g(args['PIN']);
        let sendData = 'dht11Set#'+pin;
        console.log('sendData:',sendData);
        this.serialSend(sendData);
    }

    async dht11_read(args){
        let tem_hum_text = args['TH'];
        let th_index = this.getAllDHTMenuItems().indexOf(tem_hum_text);
        let tem_hum = this.mapDHTSensors(th_index);
        //console.log(tem_hum);
        let sendData = 'dht11Read#8#';
        console.log('sendData:',sendData);
        this.serialSend(sendData);
        let dht11_return = await this.serialRead();
        console.log(dht11_return);
        let dht11_array = dht11_return.split(",");
        //let dht11_return = (await this.serialRead()).split(',');
        console.log(dht11_array);
        if (tem_hum == 'Temperature'){
            return dht11_array[0];
         }else{
            return dht11_array[1];
         }
    }

    async oled_show(args){
        let value = args['VALUE'];
        value = value.substring(0,16);
        let row = args['ROW']
        row = parseInt(row,10);
        //send data format o#string#row  max 20 char
        let sendData;
        sendData = 'o#'+value+'#'+row;
        console.log('sendData=',sendData);
        this.serialSend(sendData);
    }
    
    async oled_qrcode(args){
        let value = args['VALUE'];
        value = value.substring(0,32);
        let row = args['ROW']
        row = parseInt(row,10);
        //send data format o#string#row  max 20 char
        let sendData;
        sendData = 'q#'+value+'#';
        console.log('sendData=',sendData);
        this.serialSend(sendData);
    }
    
    async lcd_show(args){
        let value = args['VALUE'];
        value = value.substring(0,16);
        let row = args['ROW']
        row = parseInt(row,10);
        //send data format l#string#row  max 20 char
        let sendData;
        sendData = 'l#'+value+'#'+row;
        console.log('sendData=',sendData);
        this.serialSend(sendData);
    }
    
    async lcd_clear(args){
        let sendData;
        sendData = 'l#clear#';
        console.log('sendData=',sendData);
        this.serialSend(sendData);
    }
    //ws2812
    ws2812_set_clear() {
        send_color_data = '';
    }

    ws2812_set_pin(args) {
        ws2812_pin = this.d2g(args['PIN']);
    }

    ws2812_set_num(args) {
        let led_num = args['NUM'];
        let led_value = args['VALUE'];
        led_value = parseInt(led_value, 10);
        let max_value =85;
        //console.log(led_num,led_value);
        let color_set = args['RGB'];
        let color_set_num;
        for (i = 0; i < FormRGB[the_locale].length; i++) {
            if (FormRGB[the_locale][i] == color_set) {
                color_set_num = i;
                if (color_set_num == 1){
                    max_value = 28;
                }
                break;
            }
        }
        if (led_value > max_value){
            led_value = max_value;
        }
        if(send_color_data == ''){
            send_color_data = send_color_data + led_num + ',' + color_set_num.toString() + ',' + led_value.toString() ;    
        }else{
            send_color_data =  send_color_data + ',' + led_num + ',' + color_set_num.toString() + ',' + led_value.toString() ;
        }
        console.log(send_color_data);
    }

    async ws2812_show() {
        const sendData = 'sh#' + ws2812_pin + '#' + send_color_data;
        console.log(sendData);
        this.serialSend(sendData);
    }
    async max7219_max(args){
        const data_pin = this.d2g(args['DATA_PIN']);
        const cs_pin = this.d2g(args['CS_PIN']);
        const clk_pin = this.d2g(args['CLK_PIN']);
        const devices = args['DEVICES'];
        const txt = args['TEXT'];
        const sendData = 'max#' + data_pin+ ',' + cs_pin+','+clk_pin+','+devices+'#'+txt+'#';
        console.log(sendData);
        this.serialSend(sendData);
        await new Promise(resolve => setTimeout(resolve, 15));
    }
    async max7219_set(args){
        let data_pin = this.d2g(args['DATA_PIN']);
        let cs_pin = this.d2g(args['CS_PIN']);
        let clk_pin = this.d2g(args['CLK_PIN']);
        let devices = args['DEVICES'];
        const sendData = 'maset#' + data_pin+ ',' + cs_pin+','+clk_pin+','+devices+'#';
        console.log(sendData);
        this.serialSend(sendData);
        await new Promise(resolve => setTimeout(resolve, 15));
    }
    async max7219_show(args){
        //let pin = this.d2g(args['PIN']);
        let devices = args['DEVICES'];
        devices = parseInt(devices, 10)-1;
        const row = args['ROW'];
        const col = args['COL'];
        const value = args['VALUE'];
        const sendData = 'mashow#' + devices.toString()+ ',' + row+','+col+','+value+'#';
        console.log(sendData);
        this.serialSend(sendData);
        await new Promise(resolve => setTimeout(resolve, 15));
    }
    async max7219_row(args){
        let devices = args['DEVICES'];
        devices = parseInt(devices, 10)-1;
        const row = args['ROW'];
        let value = args['VALUE'];
        if(value.substr(0,1)=='B'){
            value = value.substr(1);//take str
            let bvalue = 0;
            for(i=0;i<value.length;i++){
                if(value.substr(i,1)=='1'){
                    bvalue = bvalue+Math.pow(2, i);
                }
            }
            console.log(bvalue);
            value = bvalue;
        }else{
            value = parseInt(value,10);
        }
        
        if(value<0){
            value = 0;
        }else if(value >255){
            value =255;
        }
        const sendData = 'marow#'+devices.toString()+'#'+row+'#'+value;
        console.log(sendData);
        this.serialSend(sendData);
        await new Promise(resolve => setTimeout(resolve, 15));   
    }
    async max7219_clear(){
        const sendData = 'maclear# #';
        console.log(sendData);
        this.serialSend(sendData);
        await new Promise(resolve => setTimeout(resolve, 15));   
    }


    _setLocale () {
        let now_locale = '';
        switch (formatMessage.setup().locale){
            case 'pt-br':
            case 'pt':
                now_locale='pt-br';
                break;
            case 'en':
                now_locale='en';
                break;
            case 'fr':
                now_locale='fr';
                break;
            case 'zh-tw':
                now_locale= 'zh-tw';
                break;
            case 'zh-cn':
                now_locale= 'zh-cn';
                break;
            case 'pl':
                now_locale= 'pl';
                break;
            case 'ja':
                now_locale= 'ja';
                break;
            case 'de':
                now_locale= 'de';
                break;
            default:
                now_locale='en';
                break;
        }
        return now_locale;
    }

    // end of block handlers

    // helpers
    async connect() {
        if(!navigator?.serial){
            alert(browser_not_support[the_locale]);
        }
        if(!esp_port){
           //await esp_port.close();
           esp_port = await navigator.serial.requestPort({});
           await esp_port.open({ baudRate: 115200 });
    	   console.log('esp_port:',esp_port);
         }
    }
   
    
}

module.exports = Scratch3EspWebSerial;
