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
const Cast = require('../../util/cast.js');

require('sweetalert');
//async await estea
const ml5 = require('ml5');
//require('babel-polyfill');
let esp32_port;
let esp_reader;
// The following are constants used within the extension

// Digital Modes
const DIGITAL_INPUT = 1;
const DIGITAL_OUTPUT = 2;
const PWM = 3;
const SERVO = 4;
const TONE = 5;
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

// flag to indicate if a websocket connect was
// ever attempted.
let connect_attempt = false;

// an array to buffer operations until socket is opened
let wait_open = [];
//ws2812
let ws2812_pin = '9';
let send_color_data = '';

//def freq array
let freq_ary=[];
for(var i=24;i<84;i++){
    freq_ary.push(i);
}

let the_locale = null;
//dht11
let theDHTSensorMap =
    //
    {0: 'Temperature', 1: 'Humidity'};

const ContentPort = {
    'en': 'Content to ESP-32',
    'zh-tw': '連線到 ESP-32',
};

const FormOledShow ={
    'en': 'OLED at x:[ROWX] y:[ROWY] show text [VALUE]',
    'zh-tw': 'OLED x:[ROWX],y:[ROWY],顯示文字[VALUE]',
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
const browser_not_support = {
    'en': 'Browser not support web serial api!',
    'zh-tw': ['瀏覽器不支援web serial api']
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
    'pt-br': 'Escrever Pino PWM[PIN]com[VALUE]%',
    'pt': 'Escrever Pino PWM[PIN]com[VALUE]%',
    'en': 'Write PWM Pin [PIN] [VALUE]%',
    'fr': 'Mettre la pin PWM[PIN]à[VALUE]%',
    'zh-tw': '腳位[PIN]類比輸出[VALUE]%',
    'zh-cn': '引脚[PIN]模拟输出[VALUE]%',
    'pl': 'Ustaw PWM Pin [PIN] na [VALUE]%',
    'de': 'Setze PWM-Pin [PIN] [VALUE]%',
    'ja': 'PWM ピン [PIN] に [VALUE]% を出力',
};

const FormServo = {
    'pt-br': 'Mover Servo Motor no[PIN]para[ANGLE]°',
    'pt': 'Mover Servo Motor no[PIN]para[ANGLE]°',
    'en': 'Write Servo Pin [PIN] [ANGLE] Deg.',
    'fr': 'Mettre le servo[PIN]à[ANGLE] Deg.',
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
    'zh-tw': '腳位[PIN]播放音調，頻率為[FREQ]時間為[DURATION]',
    'zh-cn': '脚位[PIN]播放音调，频率为[FREQ]时间为[DURATION]',
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
    'pt-br': 'Ler Distância: Sonar em T[TRIGGER_PIN] E[ECHO_PIN]',
    'pt': 'Ler Distância: Sonar em T[TRIGGER_PIN] E[ECHO_PIN]',
    'en': 'Read SONAR  T [TRIGGER_PIN]  E [ECHO_PIN]',
    'fr': 'Distance de lecture : Sonar T [TRIGGER_PIN] E [ECHO_PIN]',
    'zh-tw': 'HCSR超音波感測器，Echo在腳位[ECHO_PIN] Trig在腳位[TRIGGER_PIN]',
    'zh-cn': 'HCSR超声波传感器，Echo在引脚[ECHO_PIN] Trig在引脚[TRIGGER_PIN]',
    'pl': 'Odczytaj odległość: Sonar T [TRIGGER_PIN]  E [ECHO_PIN]',
    'de': 'Lies Sonar T [TRIGGER_PIN]  E [ECHO_PIN]',
    'ja': '超音波測距器からトリガ [TRIGGER_PIN] とエコー [ECHO_PIN] で入力',
};

// ESP-8266 specific

const FormContentAP = {
    'en': 'Content AP, ssid:[SSID],password:[PASSWORD]',
    'zh-tw': '連線AP，ssid:[SSID]， password:[PASSWORD]]',
};

const FormTouchRead = {
    'en': 'Touch Pin: [PIN] value',
    'zh-tw': '觸控腳位：[PIN] 的值',
};

const FormWs2812Write ={
    'en': 'Led array pin:[PIN],light[NUM],red[RED]green[GREEN]blue[BLUE]',
    'zh-tw': 'led陣列，腳位[PIN]，亮第[NUM]顆，紅[RED]綠[GREEN]藍[BLUE]',
};

//ws2812
const FormWs2812SetNum = {
    'en': 'WS2812 light #[NUM] color [RGB] value [VALUE]',
    'zh-tw': 'LED 陣列，亮第[NUM]顆，顏色:[RGB]，值:[VALUE]',
};

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
    'en': "clear WS2812 set",
    'zh-tw': "清除LED陣列設定",
};

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

class Scratch3Esp32WebSerial {
    constructor(runtime) {
        the_locale = this._setLocale();
        this.runtime = runtime;
    }

    getInfo() {
        the_locale = this._setLocale();
        this.connect();
        //swal(FormAlrt[the_locale]);

        return {
            id: 'webserialEsp32',
            color1: '#0C5986',
            color2: '#34B0F7',
            name: 'WebSerial ESP-32',
            blockIconURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAbCAYAAAA+nNxPAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABlAAAAZQB3gpsbAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAe5SURBVFiF1ZhbbBzVGcd/M3Nmdnb24vWudxMnjsGJ1wgHGmMS11QKTqjVClBIQCgPhTxEvCBV4gEJiUq8IJTHPvICbwW1kVOpAUqFKjUqUi4gqBQLCRFjG2oHJ/F17ztz5taHxVsvC8E2zUP/0khzvvNd55zv+84Z5aWXXvrHyMjII++//z5z3xSQnoYV8SjVdNIJh5WSSVfSoVDTiQgfFAXXUzF1n4qtkU5Ilosm6YRDxRYINUBVoe6oxKM+pbpOZ0yyUjbIdkhWSjpJy0N6Kp6vEDN91io6uQ6HpVKEDstFeipBoGAaPoWqTibhslLWySZdlko66bike2eGoaEhrly58qezZ8/+Rn322Wcfefrpp3nmmWcwrBSD+/dQrhs8+ut+ihWdY4/1U64LhoZ6iVgprESKewd78Ijx0M/7qEnxLY9OfmA3iXQXmpHk0KE+qtJk/Gg/xbrOsUfzlOuCXx7tpyajdHRmyA/spljVOfH4ADVH8Oiv8pTtCJlsF3ft3UWxZnD8sQHWqgYnHh+gWBOceHyAUt3gxRdf5IUXXuDkyZMnAJTz58+Hx48f58033+TPf/kbngcRPaBqC5KWR6EqSMU8qraGofuEoYLrKxgiwJYaCcujWG185bqjIrQQRQHpKZh6QM0RxKMupZpOh+VSrgusiI8fqAQhGGLdlkuxKohFAzxfIQgaflRsjUTUp1wTJGMupapOIurxyiu/Y3R0lLfffrt26tSpmPLEE0+EqVSKtbU1/p8QiUTo6+tjampq9Z133smI5eVlbty48T83pGka2Wy2je44Dr7vY1nWtvSOjY3R19fHwsIC/f39fPHFFwCIxcVFarVam8Dhw4fp6OjYljGAS5cufW8gUkqklNsORNM0Ll++zEcffcSrr77apAvDMMjlcqiq2iJwzz33sHv37m0ZA/j000+3LXs7rKys8MADD5DP55mbm2vShaZpVCoVlpeXWwTGx8fviCPxePwnyU9OTjI5OdlGFwDpdLptqT3P+1GlQggURcF13U07EgQBYRgihGibq9fr2LbdQuvs7NyUXgFQKpW4efNmm5MA8/PzTExMEIvFGB4eZmRkBABd1+nq6sKyLGZmZjYdSK1WQ0pJJpNpm5NSUqlUmmNFUbYWSDweZ8eOHQAsLi4ShmGT4bPPPuPll1+mu7ubc+fONeme5xGG4fcWijuJXbt2sXfv3uZYUZTEk08++XfVtm3m5+cpFApt2ysIAj7//HNSqRSVSgXbtllaWgIa1UNKueVATNP8SXkSjUbJZrPNp6urSwfG1TAMkVI26/tGXLt2jS+//JKFhQVisRhSSi5evAg0VqRWq1EsFrfkiK7rRCKRbQfyQxCxWIyenp5mcm/cVqurqwC89tpr5PN5FhcXm73FMAyy2SxLS0ttCXo79Pb24kqXGzfbm7BlWWiatq1AVIBbt24xOzvL7Oxsy+SePXuAxr7M5/NMTU3R09MDgO/7eJ5Hd3f3lgz+9qjPqcMNZ7PZLA8OP9hMfF3XicfjLc9mITzPI5PJkEqlME2Ta9euNSd7e3sZHR0ll8uRyWSwLIsjR44AjRyJRqM4jrOlQHLaVwgjAcDph+rc1/0vJnfF+f1ft6SmPRApZXMlNlaDdQwNDfHBBx9w4cIFkskkpmkCjRxZXl4mCIJtG7eExPBWiAqjhe55HlJKoFEcNp46HMdpOeAqiuKnUqmrQghBZ2cnmqZhGK0KAQYHB/n4449RVbWl2wsh6O7uxnXdltr/Y/jGG2DVUYCvfpBnYxHJ5XItxeH69etcv359I3vpvffeOygMw0DTNEqlUsvZZR2RSITnn3++jS6lbNmGm8Urf/i6+f7vSpqdPXuZ+3oNuAXA8IMHKayt8eGH/9ySXhGGIbquN1fDsqwtl9Tt4o8frnH+E4dqtdqkJZPJTR2PvgvhOE5Lwvq+39ZP7hS+a3szGBkZYWhoiMnJScbHxzlz5gwAIgiCli+yjjfeeOMnORmJRLZ1DZifm6NQLNyW5+rVq7z77ruMjY01aWLfvn1hEATKli3+CBRleypnZqapVCpt96N1rK6ucuDAAU6fPs309HSTLnRd35bBO4nbNcPp6elmABtvsOpTTz3FxMQEDz/8MCUnTsU2qTgGJZnE9VWKTgrpqZScZGPONik5Saq2oCRTBIFC2U1RcwQFO0HVMak4FiUnRs3RKdgpvECl7HZiS5Wy7KBSF5Rtk5KToOZoVLxOPF+lYHdQlxolJ0bZsag4UcpOAtdXKbtpHFel7KaoOjrPPfccb731FseOHYsAqIcOHcI0TQ4ePMjOnZ1ErBiKFuXu3gyOqzL8sx04rkbvnk50M4puRuntTVOXGgfuz+G4KkP37aBqq/TdnUHTTeLJOF2ZJHVXY/hAjrqjcmB/lroU5Puz+GGESDTGzp0Nx+/fn6UuVe4bzFFzNNLpJMlknEg0RleuA+mq3L+/i7qjsf/eLHWpNZv3vn37NADlzJkzl8bGxn5x9uxZZmbnUJTGfynfV9BFiPRUDNH417S+bYMANC3E81R0EeB6KkIE+L6CqoYQNvJDUUN8X0Fo/9Xjeo1xiEIYgqqEeN/acr/V5wcKEDbyLARVDXG9dR4FIULuvusujh49yoULF869/vrrJ/8D5elO9jqiVy4AAAAASUVORK5CYII=',
            blocks: [
                {
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: ContentPort[the_locale]
                    
                },
                /*
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
                },*/
                {
                    opcode: 'digital_write',
                    blockType: BlockType.COMMAND,
                    text: FormDigitalWrite[the_locale],

                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '16',
                            menu: "digital_out_pins"
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
                            defaultValue: '16',
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
                            defaultValue: '16',
                            menu: 'digital_out_pins'
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
                        ROWX:{
                            type: ArgumentType.NUMBER,
                            defaultValue:'0'
                        },
                        ROWY:{
                            type: ArgumentType.NUMBER,
                            defaultValue:'13'
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
                    opcode: 'servo',
                    blockType: BlockType.COMMAND,
                    text: FormServo[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '16',
                            menu: 'digital_out_pins'
                        },
                        ANGLE: {
                            type: ArgumentType.ANGLE,
                            defaultValue: 90,
                        },

                    }
                },

                {
                    opcode: 'ws2812_write',
                    blockType: BlockType.COMMAND,
                    text: FormWs2812Write[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '16',
                            menu: 'digital_out_pins'
                        },
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                        },
                        RED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '2',
                        },
                        GREEN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '2',
                        },
                        BLUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '2',
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
                            defaultValue: '16',
                            menu: 'digital_out_pins'
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

                {
                    opcode: 'analog_read',
                    blockType: BlockType.REPORTER,
                    text: FormAnalogRead[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '34',
                            menu: 'analog_in_pins'
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
                            defaultValue: '16',
                            menu: 'digital_in_pins'
                        },
                    }
                },
               
                {
                    opcode: 'touch_read',
                    blockType: BlockType.BOOLEAN,
                    //blockType: BlockType.REPORTER,
                    text: FormTouchRead[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            defaultValue: 'T0',
                            menu: 'touch_pins'
                        },
                    }
                },
               
                //'---',
                {
                    opcode: 'dht11_set',
                    blockType: BlockType.COMMAND,
                    text: FormDht11Set[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '16',
                            menu: 'dht11_in_pins'
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
                //'---',
                {
                    opcode: 'sonar_read',
                    blockType: BlockType.REPORTER,
                    text: FormSonarRead[the_locale],

                    arguments: {
                        TRIGGER_PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '17',
                            menu: 'digital_out_pins'
                        },
                        ECHO_PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '16',
                            menu: 'digital_in_pins'
                        }
                    }
                },
                '---',
                {
                    opcode: 'max7219_max',
                    blockType: BlockType.COMMAND,
                    text: Form7219_max[the_locale],
                    arguments:{
                        DATA_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '16',
                            menu:'digital_out_pins'
                        },
                        CS_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '17',
                            menu:'digital_out_pins'
                        },
                        CLK_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '18',
                            menu:'digital_out_pins'
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
                            defaultValue: '16',
                            menu:'digital_out_pins'
                        },
                        CS_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '17',
                            menu:'digital_out_pins'
                        },
                        CLK_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '18',
                            menu:'digital_out_pins'
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
                            menu:'on_off'
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
            ],
            menus: {
                digital_in_pins: {
                    acceptReporters: true,
                    items: ['2','4', '5','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39']
                },

                digital_out_pins: {
                    acceptReporters: true,
                    items: [ '2','4', '5', '16','17','18','19','20','21','22','23','24','28','29','30','31','32','33','37','38']
                },

                touch_pins:{
                    acceptReporters: true,
                    items: ['T0','T3','T4','T7','T9']
                },
                dht_items: 'getAllDHTMenuItems',
                dht11_in_pins: {
                    acceptReporters: true,
                    items: ['3', '16','17','18','19','20','21','22','23','24','28','29','30','31','32','33','34','35','36','37','38','39']
                },

                analog_in_pins: {
                    acceptReporters: true,
                    items: ['32', '33', '34','35','36','39']
                },

                pwm_pins: {
                    acceptReporters: true,
                    items: [ '3', '5', '16','17','18','19','20','21','22','23','24','28','29','30','31','32','33','37','38']
                },

                mode: {
                    acceptReporters: true,
                    items: [{text: "Input", value: '1'}, {text: "Output", value: '2'}]
                },
                on_off: {
                    acceptReporters: true,
                    items: ['0', '1']
                },
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
            },
            
        };
    }

    // The block handlers

    // command blocks

    async content_ap(args) {
            let ssid = args['SSID'];
            let password = args['PASSWORD']
            const sendData = 'w#'+ ssid+'#'+password+'#';
            console.log(sendData);
            this.serialSend(sendData);
            return this.serialRead();

    }
    
    async ws2812_write(args){
        let input_pin = args['PIN'];
        let num = args['NUM'];
        num = parseInt(num, 10)-1;
        let red = args['RED'];
        red = parseInt(red, 10);
        let green = args['GREEN'];
        green = parseInt(green, 10);
        let blue = args['BLUE'];
        blue = parseInt(blue, 10);
        const sendData = 'ws#'+input_pin+'#'+red.toString()+','+green.toString()+','+blue.toString()+'#'+num.toString();
        console.log(sendData);
        this.serialSend(sendData);
    }

    async digital_write(args) {
            let input_pin = args['PIN'];
            let split_pin = input_pin.split('(');
            //inputpin = split_pin[0];
            //console.log(split_pin);
            let value = args['ON_OFF'];
            value = parseInt(value, 10);
            //let sendData;
            const sendData = 'digitalWrite#'+ split_pin[0]+'#'+value.toString();
            console.log(sendData);
            this.serialSend(sendData);
    }

    //pwm
    async pwm_write(args) {
            let pin = args['PIN'];
            const split_pin = pin.split('(');
            pin = parseInt(split_pin[0], 10);
            // maximum value for RPi and Arduino
            let the_max = 255;
            pin = parseInt(pin, 10);

            let value = args['VALUE'];
            value = parseInt(value, 10);

            // calculate the value based on percentage
            value = the_max * (value / 100);
            value = Math.round(value);
            let sendData = 'pwm#'+pin.toString()+'#'+value;
            console.log('sendData:',sendData);
            this.serialSend(sendData);
        
    }

    //tone
    async tone_on(args) {
        let pin = args['PIN'];
        let freq = Number(args['FREQ']);
        if(freq <24){
            freq =24;
        }
        if(freq>83){
            freq=83
        }

        //freq = parseInt(freq, 10);
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
        await new Promise(resolve => setTimeout(resolve, duration));        
    }


    // move servo
    async servo(args) {

            let pin = args['PIN'];
            const split_pin = pin.split('(');
            pin = parseInt(split_pin[0], 10);
            let angle = args['ANGLE'];
            angle = parseInt(angle, 10);

            let sendData = 'servoWrite#'+pin.toString()+'#'+angle;
            console.log('sendData:',sendData);
            this.serialSend(sendData);
    }

    // reporter blocks
    async analog_read(args) {
        let pin = args['PIN'];
        let sendData = 'analogRead#'+pin.toString();
        //const serial_request = this.serialSendRead(sendData);
        this.serialSend(sendData);
        console.log(sendData);
        //const serial_request = this.serialRead();
        return this.serialRead();
    }
    async touch_read(args){
        let pin = args['PIN'];
        let sendData = 'touchRead#'+pin+'#';
        const touch_value = 40;
        this.serialSend(sendData);
        console.log(sendData);
        let return_value = this.serialRead();
        return_value = (await return_value).split('\r\n');
        return_value = parseInt(return_value[0],10);
        console.log('return:',return_value);
        /*if( return_value()<40){
            return true;
        }else{
            return false;
        }*/
        return  return_value < touch_value;
        //return this.serialRead();
    }

    async serialSend(sendData){
        let esp_writer = esp32_port.writable.getWriter();
        const encoder = new TextEncoder();
        await esp_writer.write(encoder.encode(sendData));
        esp_writer.releaseLock(); 

    }

    async serialRead(){
        //讀取serial
        //return analog_inputs;
        let esp_reader = esp32_port.readable.getReader(); 
        let readValue = await esp_reader.read();
        let uint8array = new TextEncoder().encode();
        let  string = new TextDecoder().decode(readValue.value);
        //let astring = string.split('\r\n');
        //const serial_request = astring[0];
        console.log("read string:",string);
        esp_reader.releaseLock();
        return string;
    }

    async digital_read(args) {
            let pin = args['PIN'];
            let sendData = 'digitalRead#'+pin.toString();
            console.log('sendData:',sendData);
            this.serialSend(sendData);
            //const serial_request = this.serialSendRead(sendData); 
            let serial_data = (await this.serialRead()).split(':');
            if( serial_data[0] == 'G'+pin ){
                return serial_data[1];
            }
            //return this.serialRead();
    }

    async sonar_read(args) {
        let trigger_pin = args['TRIGGER_PIN'];
        //trigger_pin = parseInt(trigger_pin, 10);
        sonar_report_pin = trigger_pin;
        let echo_pin = args['ECHO_PIN'];
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

    async dht11_set(args){
        let pin = args['PIN'];
        const split_pin = pin.split('(');
        let sendData = 'dht11Set#'+split_pin[0];
        console.log('sendData:',sendData);
        this.serialSend(sendData);
    }

    async dht11_read(args){
        let tem_hum_text = args['TH'];
        let th_index = this.getAllDHTMenuItems().indexOf(tem_hum_text);
        let tem_hum = this.mapDHTSensors(th_index);
        //console.log(tem_hum);
        let sendData = 'dht11Read#16#';
        console.log('sendData:',sendData);
        this.serialSend(sendData);
        let dht11_return = (await this.serialRead()).split(",");
        console.log('dht11_return:',dht11_return);
        //let dht11_array = dht11_return.split(",");
        //let dht11_return = (await this.serialRead()).split(',');
        //console.log('dht11_array',dht11_array);
        if (tem_hum == 'Temperature'){
            return dht11_return[0];
         }else{
            return dht11_return[1];
         }
    }

    async oled_show(args){
        let value = args['VALUE'];
        value = value.substring(0,32);
        let rowx = args['ROWX'];
        rowx = parseInt(rowx,10);
        if(rowx>120){
            rowx = 120;
        }
        let rowy = args['ROWY'];
        rowy = parseInt(rowy,10);
        if(rowy>60){
            rowy = 60;
        }
        //send data format o#string#row  max 20 char
        let sendData;
        sendData = 'o#'+value+'#'+rowx+','+rowy;
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
        sendData = 'l_clear#';
        console.log('sendData=',sendData);
        this.serialSend(sendData);
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
        if(esp32_port){
           await esp32_port.close();
         }
         esp32_port = await navigator.serial.requestPort({});
         await esp32_port.open({ baudRate: 115200 });
    	 console.log('esp32_port:',esp32_port);

    }
    //ws2812 sh
    ws2812_set_clear() {
        send_color_data = '';
    }

    ws2812_set_pin(args) {
        ws2812_pin = args['PIN'];
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
        const data_pin = args['DATA_PIN'];
        const cs_pin = args['CS_PIN'];
        const clk_pin = args['CLK_PIN'];
        const devices = args['DEVICES'];
        const txt = args['TEXT'];
        const sendData = 'max#' + data_pin+ ',' + cs_pin+','+clk_pin+','+devices+'#'+txt+'#';
        console.log(sendData);
        this.serialSend(sendData);
        await new Promise(resolve => setTimeout(resolve, 15));
    }

    async max7219_set(args){
        let data_pin = args['DATA_PIN'];
        let cs_pin = args['CS_PIN'];
        let clk_pin = args['CLK_PIN'];
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

}

module.exports = Scratch3Esp32WebSerial;
