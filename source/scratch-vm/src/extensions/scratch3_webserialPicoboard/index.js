/*
This is the Scratch 3 extension to remotely control an Picoboard

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
//wait ...
const Cast = require('../../util/cast.js');

require('sweetalert');
//estea web serial
//require('babel-polyfill');
const ml5 = require('ml5');
//const { send } = require('react-ga');

let p_port ;
//let reader ;
//let writer ;
let lastDataSample = [0, 0, 0, 0, 0, 0, 0, 0];
//["滑桿", "光線", "聲音", "按鈕", "A", "B", "C", "D"],
let send_key_array = [0,6,3,7,5,4,2,1];
// flag to indicate if a websocket connect was
// ever attempted.
//let connect_attempt = false;
// an array to buffer operations until socket is opened
//let wait_open = [];
let the_locale = null;
//let is_connect = false;
/* map of sensors to indices for ALL_SENSORS
["Slider", "Light", "Sound", "Button", "A", "B", "C", "D"]
The key is the same used by the gateway when
values are published to the extension.
data value 0 = D  analog inverted logic
data value 1 = C  analog inverted logic
data value 2 = B  analog inverted logic
data value 3 = Button  digital inverted logic
data value 4 = A  analog inverted logic
data value 5 = Light  analog inverted logic
data value 6 = sound  analog
data value 7 = slider analog
*/
let theAllSensorMap = {0: 7, 1: 5, 2: 6, 3: 3, 4: 4, 5: 2, 6: 1, 7: 0};
/* map of sensors to indices for NON_BUTTON_SENSORS
["Slider", "Light", "Sound", "A", "B", "C", "D"]
values are published to the extension.
data value 0 = D  analog inverted logic
data value 1 = C  analog inverted logic
data value 2 = B  analog inverted logic
data value 3 = Button  digital inverted logic
data value 4 = A  analog inverted logic
data value 5 = Light  analog inverted logic
data value 6 = sound  analog
data value 7 = slider analog
*/
let theNonButtonSensorMap = {0: 7, 1: 5, 2: 6, 3: 4, 4: 2, 5: 1, 6: 0};
// flag to indicate alert already generated
//let alerted = false;

const FormConnect ={
    'en': 'connect PicoBoard',
    'zh-tw': '連線到 PicoBoard',
    'zh-cn': '连线到 PicoBoard',
}

const FormDisconnect ={
    'en': 'Dicconnected',
    'zh-tw': '已離線',
}

const DisConnect ={
    'en': 'Disconnect',
    'zh-tw': '離線',
}
const FormNotSupport ={
    'en': 'Browser not support Web Serial API',
    'zh-tw': '瀏覽器不支援 Web Serial API',
}

const FormComparison = {
    'en': 'When [SENSOR] [COMP] [VALUE].',
    'zh-tw': '當 [SENSOR] 的偵測值 [COMP] [VALUE]',
    'zh-cn': '当 [SENSOR] 的侦测值 [COMP] [VALUE]',
    'pt-br': 'Quando [SENSOR] for [COMP] que [VALUE]',
    'pt': 'Quando [SENSOR] for [COMP] que [VALUE]',
    'fr': 'si [SENSOR] [COMP] [VALUE].',
    'pl': 'Kiedy [SENSOR] [COMP] [VALUE].',
};

const FormAnalog_0 ={
    'en': 'Slider',
    'zh-tw': '滑桿',
    'zh-cn': '滑杆',
    'pt-br': 'Controle deslizante',
    'pt': 'Controle deslizante',
    'fr': 'Glissière',
    'pl': 'Suwak',
}

const FormAnalog_6 ={
    'en': 'Light',
    'zh-tw': '光線',
    'zh-cn': '光线',
    'pt-br': 'Luz',
    'pt': 'Luz',
    'fr': 'Lumière',
    'pl': 'Światło',
}

const FormAnalog_3 ={
    'en': 'Sound',
    'zh-tw': '聲音',
    'zh-cn': '声音',
    'pt-br': 'Som',
    'pt': 'Som',
    'fr': 'Son',
    'pl': 'Dźwięk',
}

const FormDigital_2 ={
    'en': 'Button',
    'zh-tw': '按鈕',
    'zh-cn': '按鈕',
    'pt-br': 'botão',
    'pt': 'botão',
    'fr': 'Bouton',
    'pl': 'przycisk',
}

const MENU_NON_BUTTON_SENSORS = {
    'en': ["Slider", "Light", "Sound", "A", "B", "C", "D"],
    'zh-tw': ["滑桿", "光線", "聲音", "A", "B", "C", "D"],
    'zh-cn': ["滑杆", "光线", "声音", "A", "B", "C", "D"],
    'pt-br': ["Controle deslizante", "Luz", "Som", "A", "B", "C", "D"],
    'pt': ["Controle deslizante", "Luz", "Som", "A", "B", "C", "D"],
    'fr': ["Glissière", "Lumière", "Son", "A", "B", "C", "D"],
    'pl': ["Suwak", "Światło", "Dźwięk", "A", "B", "C", "D"],
};

const MENU_ALL_SENSORS = {
    'en': ["Slider", "Light", "Sound", "Button", "A", "B", "C", "D"],
    'zh-tw': ["滑桿", "光線", "聲音", "按鈕", "A", "B", "C", "D"],
    'zh-cn': ["滑杆", "光线", "声音", "按钮", "A", "B", "C", "D"],
    'pt-br': ["Controle deslizante", "Luz", "Som", "Botão", "A", "B", "C", "D"],
    'pt': ["Controle deslizante", "Luz", "Som", "Botão", "A", "B", "C", "D"],
    'fr': ["Glissière", "Lumière", "Son", "Bouton", "A", "B", "C", "D"],
    'pl': ["Suwak", "Światło", "Dźwięk", "Przycisk", "A", "B", "C", "D"],
};

const FormIsButtonPressed = {
    'en': 'Button pressed ?',
    'zh-tw': '按鈕被按下？',
    'zh-cn': '按钮被按下？',
    'pt-br': 'O botão está pressionado?',
    'pt': 'O botão está pressionado?',
    'fr': 'Bouton appuyé ?',
    'pl': 'Czy przycisk jest wciśnięty?',
};

const MENU_COMPARISONS = {
    'en': ['>', '<'],
    'zh-tw': ['>', '<'],
    'zh-cn': ['>', '<'],
    'pt-br': ['>', '<'],
    'pt': ['>', '<'],
    'fr': ['>', '<'],
    'pl': ['>', '<'],
};
const FormRangeConverter = {
    'en': 'convert [SENSOR] value to a range of [RANGE1] to [RANGE2]',
    'zh-tw': '轉換 [SENSOR] 的偵測值到 [RANGE1] 與 [RANGE2] 之間',
    'zh-cn': '转换 [SENSOR] 的侦测值到 [RANGE1] 与 [RANGE2] 之间',
    'pt-br': 'converte valor: [SENSOR] para que fique entre [RANGE1] e [RANGE2]',
    'pt': 'converte valor: [SENSOR] para que fique entre [RANGE1] e [RANGE2]',
    'fr': 'convertir la valeur de [SENSOR] dans la plage [RANGE1] à [RANGE2]',
    'pl': 'Przelicz wartość [SENSOR] do zakresu od [RANGE1] do [RANGE2]',
};

const FormCurrentSensorValue = {
    'en': 'read [SENSOR]',
    'zh-tw': '讀取 [SENSOR]',
    'zh-cn': '讀取 [SENSOR]',
    'pt': 'Ler valor atual: [SENSOR]',
    'pt-br': 'Ler valor atual: [SENSOR]',
    'fr': 'valeur actuelle de [SENSOR].',
    'pl': 'Aktualna wartość [SENSOR].',
};

class Scratch3PicoboardWebSerial {
    constructor(runtime) {
        the_locale = this._setLocale();
        this.runtime = runtime;
    }
    
    getInfo() {
        the_locale = this._setLocale();
        // connect to the websocket server
        this.connect();

        return {
            id: 'webserialPicoboard',
            color1: '#0C5986',
            color2: '#34B0F7',
            name: 'Picoboard',
            blockIconURI: 'data:image/png;base64,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',
            blocks: [
                {
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: FormConnect[the_locale],
                },
                /*
                {
                    opcode: 'disconnect',
                    blockType: BlockType.COMMAND,
                    text: DisConnect[the_locale],
                },*/
                {
                    opcode: 'current_sensor_value',
                    blockType: BlockType.REPORTER,
                    text: FormCurrentSensorValue[the_locale],
                    arguments: {
                        SENSOR: {
                            type: ArgumentType.STRING,
                            defaultValue: MENU_ALL_SENSORS[the_locale][0],
                            menu: 'all_sensors'
                        }
                    }
                },
                {
                    opcode: 'range_convert',
                    blockType: BlockType.REPORTER,
                    text: FormRangeConverter[the_locale],
                    arguments: {
                        SENSOR: {
                            type: ArgumentType.STRING,
                            defaultValue: MENU_NON_BUTTON_SENSORS[the_locale][0],
                            menu: 'non_button_sensors'
                        },
                        RANGE1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: -240,
                        },
                        RANGE2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 240,
                        }
                    }
                },
                {
                    opcode: 'is_button_pressed',
                    blockType: BlockType.BOOLEAN,
                    text: FormIsButtonPressed[the_locale],
                },
                /*{
                    opcode: 'sensor_comparison',
                    blockType: BlockType.HAT,
                    text: FormComparison[the_locale],
                    arguments: {
                        SENSOR: {
                            type: ArgumentType.STRING,
                            defaultValue: MENU_NON_BUTTON_SENSORS[the_locale][0],
                            menu: 'non_button_sensors'
                        },
                        COMP: {
                            type: ArgumentType.STRING,
                            defaultValue: MENU_COMPARISONS[the_locale][0],
                            menu: 'comparisons'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50,
                        }
                    }
                },*/                
            ],
            menus: {
                all_sensors: MENU_ALL_SENSORS[the_locale],
                non_button_sensors: 'getAllNonButtonMenuItems',
                comparisons: MENU_COMPARISONS[the_locale],
            }
        };
    }

    async writeSerial(send_key){
        //let sendData = parseInt(send_key,10);        
        const encoder = new TextEncoder();
        let writer = p_port.writable.getWriter();
        try{
            await writer.write(encoder.encode(send_key));
        }catch (error) {
            //new Promise(resolve => setTimeout(resolve, 15));
            console.log('writeSerial err=',err);
        }//finally {}
        writer.releaseLock();
        console.log('writeSerial send_key',send_key);
    }
    
    async readSerial(){
        //await new Promise(resolve => setTimeout(resolve, 10));
        let reader = p_port.readable.getReader(); 
        try{
            const avalue = await reader.read();
            let returnString = new TextDecoder().decode(avalue.value);
            console.log('retrun string =',returnString );
            if(returnString != 'NaN'){
            //console.log(returnString);
                let return_txt= returnString.split('\r\n');
                const sp_ary= return_txt[0].split(':');
            //滑桿A0 lastDataSample[7], J4 A1 lastDataSample[4], J3 A2 lastDataSample[1] 
            //聲音A3 lastDataSample[6], J2 A4 lastDataSample[2], J1 A5 lastDataSample[5]
            //光敏A6 lastDataSample[3] ,按鈕D2 lastDataSample[3]
                if(sp_ary[2]=='p'){
                    if(sp_ary[0].length===2){
                    const i = Number(sp_ary[0].substring(1, 2));
                    lastDataSample[i] = Number(sp_ary[1]);
                    console.log('sp_ary[1]=',sp_ary[1]);
                    }                
                }
            }     
                
        }catch (error) {
            //new Promise(resolve => setTimeout(resolve, 15));
            console.log('error=',error);
        } /*finally {
            reader.releaseLock();
        }*/
        reader.releaseLock();
        console.log(lastDataSample);
  }

  async is_button_pressed(args) {
    // get current button value
    this.writeSerial(7);
    //new Promise(resolve => setTimeout(resolve, 15));
    this.readSerial();
    return Boolean(lastDataSample[7]);
    }

  async current_sensor_value(args) {
    // get the text of the menu item
    let sensor_text = args['SENSOR'];
    // get its index in the list of menu items
    console.log('sensor_text=',sensor_text);
    let send_key;
    for(var i=0 ;i <MENU_ALL_SENSORS[the_locale].length;i++){
        if(MENU_ALL_SENSORS[the_locale][i] == sensor_text){
            //get send in board key value
            send_key = send_key_array[i];
            break;
        }
    }
    console.log('send_key=',send_key);
    this.writeSerial(send_key);
    //new Promise(resolve => setTimeout(resolve, 15));
    this.readSerial();
    console.log('lastDataSample[send_key]=',lastDataSample[send_key]);
    return lastDataSample[send_key];
  }
  
    getAllSensorMenuItems() {
        return MENU_ALL_SENSORS[the_locale];
    }

    getAllNonButtonMenuItems() {
        return MENU_NON_BUTTON_SENSORS[the_locale];
    }

    mapAllSensors(device) {
        //["Slider", "Light", "Sound", "Button", "A", "B", "C", "D"]
        /*
        data value 0 = D  analog inverted logic
        data value 1 = C  analog inverted logic
        data value 2 = B  analog inverted logic
        data value 3 = Button  digital inverted logic
        data value 4 = A  analog inverted logic
        data value 5 = Light  analog inverted logic
        data value 6 = sound  analog
        data value 7 = slider analog
         */
         return theAllSensorMap[device];
    }

    mapNonButtonSensors(device) {
        //["Slider", "Light", "Sound", "A", "B", "C", "D"]
        return theNonButtonSensorMap[device];

    }

    // The block handlers
    
    async range_convert(args) {
            sensor_text = args['SENSOR'];
            //console.log('sensor_text=',sensor_text);
            item_index = this.getAllSensorMenuItems().indexOf(sensor_text);
            //console.log('item_index=',item_index);
            //滑桿A0 lastDataSample[7], J4 A1 lastDataSample[4], J3 A2 lastDataSample[1] 
            //聲音A3 lastDataSample[6], J2 A4 lastDataSample[2], J1 A5 lastDataSample[5]
            //光敏A6 lastDataSample[3] ,按鈕D2 lastDataSample[3]
            const send_aa = [0,6,3,5,4,2,1];
            console.log(send_aa[item_index]);
            this.writeSerial(send_aa[item_index]);
            //new Promise(resolve => setTimeout(resolve, 15));
            this.readSerial();
            let value = lastDataSample[send_aa[item_index]];
            value = parseInt(value,10);
            let high = parseInt(args['RANGE2'], 10);
            let low = parseInt(args['RANGE1'], 10);
            return Math.round(((value/1023) * (high - low) ) + low);
    }

    async sensor_comparison(args) {
            
        let sensor_text = args['SENSOR'];
        // get its index in the list of menu items
        //this.getAllNonButtonMenuItems
        item_index = this.getAllNonButtonMenuItems().indexOf(sensor_text);
            //滑桿A0 lastDataSample[7], J4 A1 lastDataSample[4], J3 A2 lastDataSample[1] 
            //聲音A3 lastDataSample[6], J2 A4 lastDataSample[2], J1 A5 lastDataSample[5]
            //光敏A6 lastDataSample[3] ,按鈕D2 lastDataSample[3]
        const send_aa = [0,6,3,5,4,2,1];
        //console.log('send_aa_index',send_aa[item_index]);        
        let value = lastDataSample[send_aa[item_index]];
        //console.log('value=',value);
        //value = parseInt(value,10);
        let comp_type = args['COMP'];
        let comp_value = parseInt(args['VALUE'], 10);
        if (comp_type === '<') {
            console.log('value<compvalue:',value < comp_value);
            return value < comp_value;
        } else {
            console.log('value>compvalue:',value > comp_value);
            return value > comp_value;
        }
        
    }

    // end of block handlers
    _setLocale() {
        let now_locale = '';
        switch (formatMessage.setup().locale) {
            case 'zh-tw':
                now_locale = 'zh-tw';
                break;
            case 'zh-cn':
                now_locale = 'zh-cn';
                break;
            case 'en':
                now_locale = 'en';
                break;
            case 'pt-br':
                now_locale = 'pt-br';
                break;
            case 'pt':
                now_locale = 'pt';
                break;
            case 'fr':
                now_locale = 'fr';
                break;
            case 'pl':
                now_locale = 'pl';
                break;
            default:
                now_locale = 'en';
                break;
        }
        return now_locale;
    }

    // helpers
    async connect() {
        //console.log('is support:',navigator?.serial);
        if(!navigator?.serial){
            //alert(msg.browser_not_support[the_locale]);
            alert(FormNotSupport[the_locale]);
        }
        if (!p_port) {
            //await port.close();
            p_port = await navigator.serial.requestPort({});
            await p_port.open({ baudRate: 115200 });
            console.log('p_port:', p_port);
            //connect_attempt = true;
            console.log('lastDataSample:',lastDataSample);
            //const ports = await navigator.serial.getPorts();
            //is_connect = true;
            this.listener();
        }
    }

    async listener(){
        navigator.serial.addEventListener('disconnect', (event) => {
            alert(FormDisconnect[the_locale]);
            p_port = null;
        // TODO: Remove |event.target| from the UI.
        // If the serial port was opened, a stream error would be observed as well.
       });
    }
}

module.exports = Scratch3PicoboardWebSerial;
