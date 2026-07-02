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
    'en': 'Content to ESP-32c3',
    'zh-tw': '連線到 ESP-32c3',
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

class Scratch3Esp32c3WebSerial {
    constructor(runtime) {
        the_locale = this._setLocale();
        this.runtime = runtime;
    }

    getInfo() {
        the_locale = this._setLocale();
        this.connect();
        //swal(FormAlrt[the_locale]);

        return {
            id: 'webserialEsp32c3',
            color1: '#0C5986',
            color2: '#34B0F7',
            name: 'WebSerial ESP-32c3',
            blockIconURI: 'data:image/png;base64,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',
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
                            defaultValue: '6',
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
                            defaultValue: '6',
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
                            defaultValue: '6',
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
                '---',
                /*{
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
                },*/
               
                {
                    opcode: 'servo',
                    blockType: BlockType.COMMAND,
                    text: FormServo[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '6',
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
                            defaultValue: '6',
                            menu: 'digital_out_pins'
                        },
                        NUM: {
                            type: ArgumentType.STRING,
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
                            defaultValue: '6',
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
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                            menu: 'lednum'
                        },
                        RGB: {
                            type: ArgumentType.NUMBER,
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
                            defaultValue: '6',
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
                            defaultValue: '6',
                            menu: 'digital_in_pins'
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
                            defaultValue: '6',
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
                            defaultValue: '7',
                            menu: 'digital_out_pins'
                        },
                        ECHO_PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '6',
                            menu: 'digital_in_pins'
                        }
                    }
                },
                '---',
                /*{
                    opcode: 'max7219_max',
                    blockType: BlockType.COMMAND,
                    text: Form7219_max[the_locale],
                    arguments:{
                        DATA_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '6',
                            menu:'digital_out_pins'
                        },
                        CS_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '7',
                            menu:'digital_out_pins'
                        },
                        CLK_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '8',
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
                            defaultValue: '6',
                            menu:'digital_out_pins'
                        },
                        CS_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '7',
                            menu:'digital_out_pins'
                        },
                        CLK_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '8',
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
                },*/
            ],
            menus: {
                digital_in_pins: {
                    acceptReporters: true,
                    items: ['2','3','4','5','6','7','8','9','10','20']
                },

                digital_out_pins: {
                    acceptReporters: true,
                    items: [ '2','3','4','5','6','7','8','9','10','20']
                },

                dht_items: 'getAllDHTMenuItems',
                dht11_in_pins: {
                    acceptReporters: true,
                    items: ['3', '16','17','18','19','20','21','22','23','24','28','29','30','31','32','33','34','35','36','37','38','39']
                },

                analog_in_pins: {
                    acceptReporters: true,
                    items: ['2','3','4','5','6']
                },

                pwm_pins: {
                    acceptReporters: true,
                    items: [ '2','3','4','5','6']
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
                    items: ['1','2', '3', '4', '5', '6', '7', '8', '9','10','11','12']
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
        let input_pin = parseInt(args['PIN'],10);
        //計算字串        
        let num = args['NUM'].trim();
        //if(num == ''){ alert( 'Can not null, try * ');}
        if ( num =='*'){
            num = '0123456789ab';
        } 
        //
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
    async listener(){
        navigator.serial.addEventListener('disconnect', (event) => {
            esp32_port = null;
            //connected = false;
            console.log('disconnect斷線了');
            //alert(msg.FormDisconnect[the_locale]);
        // TODO: Remove |event.target| from the UI.
        // If the serial port was opened, a stream error would be observed as well.
       });
    }

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
         this.listener();
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
        //led_value = parseInt(led_value, 10);
        //let max_value =85;
        let max_value =9;
        //console.log(led_num,led_value);
        let color_set = args['RGB'];
        let color_set_num;
        for (i = 0; i < FormRGB[the_locale].length; i++) {
            if (FormRGB[the_locale][i] == color_set) {
                color_set_num = i;
                if (color_set_num == 1){
                    //max_value = 28;
                    max_value = 9;
                }
                break;
            }
        }
        if (led_value > max_value){
            led_value = max_value;
        }
        send_color_data = send_color_data + led_num.toString() +  color_set_num.toString() + led_value.toString() + ',';
        console.log('send_color_data=',send_color_data); 
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

module.exports = Scratch3Esp32c3WebSerial;
