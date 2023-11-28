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
const msg = require('./translation');
//wait ...
const Cast = require('../../util/cast.js');
// The following are constants used within the extension

require('sweetalert');
//async await estea
const ml5 = require('ml5');
const { stringByteLength } = require('@tensorflow/tfjs-core/dist/io/io_utils');
const { isInteger } = require('lodash');
//require('babel-polyfill');

// Digital Modes
const DIGITAL_INPUT = 1;
const DIGITAL_OUTPUT = 2;
const PWM = 3;
const SERVO = 4;
const TONE = 5;
const SONAR = 6;
const ANALOG_INPUT = 7;

let Linkitport;
let Linkitreader;
//s#pin#1,255$2,255$ 30bites
let ws2812_pin = '9';
let send_color_data = '';
let firmware_ver ='';
// an array to save the current pin mode
// this is common to all board types since it contains enough
// entries for all the boards.
// Modes are listed above - initialize to invalid mode of -1
//let pin_modes = new Array(30).fill(-1);

// has an websocket message already been received
//let alerted = false;

//def freq array
let freq_ary=[];
for(var i=24;i<96;i++){
    freq_ary.push(i);
}

// general outgoing websocket message holder
//let msg = null;

// the pin assigned to the sonar trigger
// initially set to -1, an illegal value
//let sonar_report_pin = -1;

//estea flag to indicate if the user connected to a board
//let connected = true;

// arrays to hold input values
//let digital_inputs = new Array(32);
//let analog_inputs = new Array(8);


let the_locale = null;
//pms5003
let pms_array =[0,0,0,0,0];

let theDHTSensorMap = { 0: 'Temperature', 1: 'Humidity' };
let max7219_config = ['','','',''];
const max7219_img={
    smile:'00001c2208140000',
    sad:'00221c0008220000',
    love:'00183c7e7e7e2400',
    right:'0010307e7e301000',
    left:'00080c7e7e0c0800',
    up:'001818187e3c1800',
    down:'00183c7e18181800',
    o:'0018244242241800',
    x:'00466c381c366200',    
}

class Scratch3Linkit7697WebSerial {
    constructor(runtime) {
        the_locale = this._setLocale();
        this.runtime = runtime;
    }
    
    getInfo() {
        the_locale = this._setLocale();
        this.content_port();
        return {
            id: 'webserialLinkit7697',
            color1: '#20540A', //'#0C5986',
            color2: '#34B0F7',
            name: 'Webserial Linkit7697',
            blockIconURI: 'data:image/png;base64,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',
            blocks: [
                {
                    opcode: 'content_port',
                    blockType: BlockType.COMMAND,
                    text: msg.ContentPort[the_locale]

                },
                {
                    opcode: 'analog_read',
                    blockType: BlockType.REPORTER,
                    text: msg.FormAnalogRead[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'A0',
                            menu: 'analog_pins'
                        },
                    }
                },
                {
                    opcode: 'digital_read',
                    blockType: BlockType.REPORTER,
                    text: msg.FormDigitalRead[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '13',
                            menu: 'digital_read_pins'
                        },
                    }
                },
                {
                    opcode: 'digitalWrite',
                    blockType: BlockType.COMMAND,
                    text: msg.digitalWrite[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '13',
                            menu: 'digital_write_pins'
                        },
                        ON_OFF: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                            menu: "on_off"
                        }
                    }
                },
                {
                    opcode: 'pwm_write',
                    blockType: BlockType.COMMAND,
                    text: msg.FormPwmWrite[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '3',
                            menu: 'digital_write_pins'
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
                    text: msg.FormTone[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 9,
                            menu: 'digital_write_pins'
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
                    text: msg.FormServo[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '9',
                            menu: 'digital_write_pins'
                        },
                        ANGLE: {
                            type: ArgumentType.ANGLE,
                            defaultValue: 90,
                        },

                    }
                },
                /*
                {
                    opcode: 'ws2812_write',
                    blockType: BlockType.COMMAND,
                    text: msg.FormWs2812Write[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '6',
                            menu: 's_pins'
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
                },*/
                //lcd 16x2
                {
                    opcode: 'lcd_show',
                    blockType: BlockType.COMMAND,
                    text: msg.FormLcdShow[the_locale],
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Word!',
                        },
                        ROW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0',
                            menu: 'lcd_row'
                        }
                    }
                },
                {
                    opcode: 'lcd_clear',
                    blockType: BlockType.COMMAND,
                    text: msg.FormLcdClear[the_locale],
                },
                '---',                
                {
                    opcode: 'conver_num',
                    blockType: BlockType.REPORTER,
                    text: msg.FormConverNum[the_locale],
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50',
                        },
                        F_BEGIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0',
                        },
                        F_END: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1023',
                        },
                        T_BEGIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0',
                        },
                        T_END: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '100',
                        },
                    }
                },
                {
                    opcode: 'dht11_read',
                    blockType: BlockType.REPORTER,
                    text: msg.FormDht11Read[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'A0',
                            menu: 'analog_pins'
                        },
                        TH: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.MENU_DHT_SENSORS[the_locale][0],
                            menu: 'dht_items'
                        }
                    }
                },
                {
                    opcode: 'ntc_read',
                    blockType: BlockType.REPORTER,
                    text: msg.FormNtcRead[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            defaultValue: 'A0',
                            menu: 'analog_pins'
                        },
                        OM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '10000',
                            menu: 'om'
                        },
                        TYPE: {
                            type: ArgumentType.STRING,
                            defaultValue: '+',
                            menu: 'ab'
                        },
                        VOLTE: {
                            type: ArgumentType.STRING,
                            defaultValue: '3.3',
                            menu: 'volt'
                        }
                    }

                },
                {
                    opcode: 'sonar_read',
                    blockType: BlockType.REPORTER,
                    text: msg.FormSonarRead[the_locale],

                    arguments: {
                        TRIGGER_PIN: {
                            type: ArgumentType.STRING,
                            defaultValue: '13',
                            menu: 'digital_write_pins'
                        },
                        ECHO_PIN: {
                            type: ArgumentType.STRING,
                            defaultValue: '12',
                            menu: 'digital_read_pins'
                        }
                    }
                },
                
                /*
                {
                    opcode: 'pms_read',
                    blockType: BlockType.COMMAND,
                    text: msg.FormPmsRead[the_locale]
                    
                },
                
                {
                    opcode: 'pms_value',
                    blockType: BlockType.REPORTER,
                    text: msg.FormPmsValue[the_locale],
                    arguments: {
                        PMS: {
                            type: ArgumentType.STRING,
                            defaultValue: 'PM2.5',
                            menu: 'pms'
                        }
                        
                    }
                },
                '---',
                {
                    opcode: 'ws2812_set_clear',
                    blockType: BlockType.COMMAND,
                    text: msg.FormWs2812SetClear[the_locale],
                },
                {
                    opcode: 'ws2812_set_pin',
                    blockType: BlockType.COMMAND,
                    text: msg.FormWs2812SetPin[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '6',
                            menu: 's_pins'
                        }

                    }
                },
                {
                    opcode: 'ws2812_set_num',
                    blockType: BlockType.COMMAND,
                    text: msg.FormWs2812SetNum[the_locale],
                    arguments: {
                        NUM: {
                            type: ArgumentType.STRING,
                            defaultValue: '1',
                            menu: 'lednum'
                        },
                        RGB: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.FormRGB[the_locale][0],
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
                    text: msg.FormWs2812Show[the_locale],
                },*/
                /*'---',                
                {
                    opcode: 'max7219_set',
                    blockType: BlockType.COMMAND,
                    text: msg.FormMax7219Set[the_locale],
                    arguments:{
                        DATA_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '12',
                            menu:'s_pins'
                        },
                        CS_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '11',
                            menu:'s_pins'
                        },
                        CLK_PIN:{
                            type: ArgumentType.STRING,
                            defaultValue: '10',
                            menu:'s_pins'
                        },                        
                        //DEVICES:{
                        //    type: ArgumentType.STRING,
                        //    defaultValue: '1',
                        //},
                    }
                },*/
                /*{
                    opcode: 'max7219_clear',
                    blockType: BlockType.COMMAND,
                    text: msg.FormMax7219Clear[the_locale],
                },*/
                /*{
                    opcode: 'max7219_show',
                    blockType: BlockType.COMMAND,
                    text: msg.Form7219_show[the_locale],
                    arguments:{
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: '0018187e7e181800',
                        },
                    }
                },
                {
                    opcode: 'max7219_matrix',
                    blockType: BlockType.COMMAND,
                    text: msg.Max7219_matrix[the_locale],
                    arguments:{
                        VALUE:{
                            type: ArgumentType.STRING,
                            defaultValue:'0000000000011000000110000111111001111110000110000001100000000000',
                        }
                    }
                },*/
                
                {
                    opcode: 'firmwareversion',
                    blockType: BlockType.REPORTER,
                    text: msg.FirmwareVersion[the_locale],
                }
                
            ],
            menus: {
                
                digital_read_pins: {
                    acceptReporters: true,
                    items: [ '2', '3', '4', '5', '6', '10', '11', '12', '13']
                },
                digital_write_pins: {
                    acceptReporters: true,
                    items: ['1', '2', '3', '4', '5', '6','8', '9', '10', '11', '12', '13']
                },
                analog_pins: {
                    acceptReporters: true,
                    items: ['A0', 'A1', 'A2', 'A3']
                },
                lcd_row: {
                    acceptReporters: true,
                    items: ['0', '1']
                },
                mode: {
                    acceptReporters: true,
                    items: [{ text: "Input", value: '1' }, { text: "Output", value: '2' }]
                },
                on_off: {
                    acceptReporters: true,
                    items: ['0', '1']
                },
                tone_list: {
                    acceptReporters: true,
                    items: ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5', 'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6']
                },
                dht_items: 'getAllDHTMenuItems',
                tem_hum: {
                    acceptReporters: true,
                    items: ['Temperature', 'Humidity']
                },
                in_out: {
                    acceptReporters: true,
                    items: ['input', 'output']
                },
                volt:{
                    acceptReporters: true,
                    items: ['5', '3.3']
                },
                rgb: {
                    acceptReporters: true,
                    items: msg.FormRGB[the_locale]
                },
                lednum: {
                    acceptReporters: true,
                    items: ['1', '2', '3', '4', '5', '6', '7', '8','9','10','11','12']
                },
                pms:{
                    acceptReporters: true,
                    items:msg.pmsItems[the_locale]
                    //items: ['PM1.0', 'PM2.5', 'PM10.0','Temperature','Humidity']
                },
                om:{
                    acceptReporters: true,
                    items: ['100000', '5000']
                },
                ab:{
                    acceptReporters: true,
                    items: ['+', '-']
                },
            }
        };
    }

    // command blocks
      
    //pwm
    async pwm_write(args) {
        let pin = args['PIN'];
        // maximum value for RPi and Arduino
        let the_max = 255;
        let value = args['VALUE'];
        value = parseInt(value, 10);
        if(value >255){
            value =255;
        }
        // calculate the value based on percentage
        //value = the_max * (value / 100);
        //value = Math.round(value);
        let sendData = 'analogWrite#' + pin + '#' + value;
        console.log('sendData:', sendData);
        this.serialSend(sendData);

    }

    async tone_on(args, util) {
        let pin = args['PIN'];
        pin = pin.toString().substring(0,2);
        //pin = parseInt(pin, 10);
        let freq = Number(args['FREQ']);
        if(freq <24){
            freq =24;
        }
        if(freq>96){
            freq=96
        }
        console.log('freq = ',freq);
        //freq = parseInt(freq, 10);
        let duration = args['DURATION'];
        duration = parseInt(duration, 10);
        // make sure duration maximum is 5 seconds
        if (duration > 10000) {
            duration = 10000;
        }
        if (duration < 4) {
            duration = 4;
        }
        let valueFreq = 0;
        const toneArray1 = ['C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1', 'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5', 'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6'];
        const toneArray2 = [33, 35, 37, 39, 41, 44, 46, 49, 52, 55, 58, 62, 65, 69, 73, 78, 82, 87, 93, 98, 104, 110, 117, 123, 131, 139, 147, 156, 165, 175, 185, 196, 208, 220, 233, 247, 262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 493, 523, 554, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988,1047,1109,1175,1245,1319,1397,1480,1568,1661,1760,1865,1976];
        //for (let i = 0; i < toneArray1.length; i++) {
            for (let i = 0; i < freq_ary.length; i++) {    
            if (freq_ary[i] == freq) {
                valueFreq = toneArray2[i];
                console.log('toneArray[i]=',toneArray1[i]);
            }
        }
        console.log('toneArray2.length=',toneArray2.length);
        let sendData = 'tonePlay#' + pin + '#' + valueFreq + '#' + duration;
        console.log('sendData:', sendData);
        this.serialSend(sendData);
        await new Promise(resolve => setTimeout(resolve, duration));
    }

    async ws2812_write(args) {
        let pin = args['PIN'];
        pin = pin.toString().substring(0,2);
        let num = args['NUM'];
        let red = args['RED'];
        red = parseInt(red, 10);
        let green = args['GREEN'];
        green = parseInt(green, 10);
        let blue = args['BLUE'];
        blue = parseInt(blue, 10);
        const sendData = 'ws#' + pin + '#' + red.toString() + ',' + green.toString() + ',' + blue.toString() + '#' + num;
        console.log(sendData);
        this.serialSend(sendData);
    }

    // move servo
    async servo(args) {
        let pin = args['PIN'];
        pin = pin.toString().substring(0,2);
        let angle = args['ANGLE'];
        angle = parseInt(angle, 10);
        let sendData = 'servoWrite#' + pin + '#' + angle+'#';
        console.log('sendData:',sendData);
        this.serialSend(sendData);

    }


    //
    async content_port() {
        //console.log('is support:',navigator?.serial);
        if(!navigator?.serial){
            alert(msg.browser_not_support[the_locale]);
        }
        if (!Linkitport) {
            Linkitport = await navigator.serial.requestPort({});
            /*port = await navigator.bluetooth.requestDevice({acceptAllDevices: true,
                optionalServices: ['battery_service']  });*/
            await Linkitport.open({ baudRate: 115200 });
            console.log('Linkitport:', Linkitport);
        }
        this.listener();
    }

    async serialSend(sendData) {
        const encoder = new TextEncoder();
        const writer = Linkitport.writable.getWriter();
        await writer.write(encoder.encode(sendData));
        writer.releaseLock();
    }

    async serialRead() {
        Linkitreader = Linkitport.readable.getReader();
        try{
            let value = await Linkitreader.read();
            //console.log('value',value);
            //let uint8array = new TextEncoder().encode();
            let string = new TextDecoder().decode(value.value);
            string = string.split('\r\n');
            Linkitreader.releaseLock();
            return string[0];
        }catch (error) {
            Linkitreader.releaseLock();
            console.log(error);
            
        }// finally {
         //   reader.releaseLock();
        //}
        Linkitreader.releaseLock();    

    }

    async conver_num(args){
        const value = parseInt(args.VALUE,10) ;
        let f_begin = parseInt(args.F_BEGIN,10);
        let f_end = parseInt(args.F_END,10);
        let f_range;
        if(f_end>f_begin){
            f_range = f_end-f_begin;
        }else{
            f_range = f_begin-f_end;
        }
        const t_begin = parseInt(args.T_BEGIN,10);
        const t_end = parseInt(args.T_END,10);
        let t_range;
        let t_add;
        if(t_end>t_begin){
            t_range = t_end -t_begin;
            t_add = t_begin;
        }else{
            t_range = t_begin-t_end;
            t_add = t_end;
        }
        const conver_value = Math.round(((value/f_range)*t_range)+t_add); 
        console.log('conver_value',conver_value);
        return conver_value;
    }

    async digitalWrite(args) {
        let pin = args.PIN;
        pin = pin.toString().substring(0,2);
        //pin = parseInt(pin, 10);
        let value = args['ON_OFF'];
        //value = parseInt(value, 10);
        let sendData = 'digitalWrite#' + pin + '#' + value.toString();
        /*
        let adata = `
        void setup() {
            pinMode(LED_BUILTIN, OUTPUT);
          }
        void loop() {
            digitalWrite(LED_BUILTIN, HIGH);
            delay(1000);
            digitalWrite(LED_BUILTIN, LOW);
            delay(1000);
        }`;
        //console.log(adata);
        adata ='digitalWrite(13,1)';
        let bytes = new ArrayBuffer[adata.length()/2];
        for(var i=0;i<adata.length()/2;i++){
            let subStr = adata.substring(i*2,i*2+2);
            bytes[i] = subStr.parseInt(subStr,16);
        }
        console.log(bytes);*/
        //console.log(intel_hex.parse(adata));
        console.log(sendData);
        this.serialSend(sendData);
    }

    
    //I2C lcd
    async lcd_show(args) {
        let value = args['VALUE'];
        value = value.substring(0, 16);
        let row = args['ROW']
        row = parseInt(row, 10);
        //send data format l#string#row  max 20 char
        let sendData;
        sendData = 'l#' + value + '#' + row;
        console.log('sendData=', sendData);
        this.serialSend(sendData);
    }

    async lcd_clear(args) {
        let sendData;
        sendData = 'l#clear#';
        console.log('sendData=', sendData);
        this.serialSend(sendData);
    }
    // reporter blocks


    //dht11
    getAllDHTMenuItems() {
        return msg.MENU_DHT_SENSORS[the_locale];
    }

    mapDHTSensors(th_data) {
        //['Temperature','Humidity']
        return theDHTSensorMap[th_data];

    }
    // 
    async dht11_set(args) {
        //送出pin並取回值
        let pin = args['PIN'].substring(0,2);
        let sendData = 'dht11Set#' + pin;
        console.log('sendData:', sendData);
        this.serialSend(sendData);
    }

    async dht11_read(args) {
        //送出pin並取回值
        let pin = args['PIN'];
        console.log(pin);
        pin = pin.substring(1,2);
        //let split_pin = pin.split('(');
        //pin = parseInt(pin, 10);
        //let tem_hum = args['TH'];
        //先取出使用者選擇的值，再到選單中找出index的值，再從最前面中取出原始值。
        let tem_hum_text = args['TH'];
        let th_index = this.getAllDHTMenuItems().indexOf(tem_hum_text);
        let tem_hum = this.mapDHTSensors(th_index);
        //console.log(tem_hum);
        let send_th = '';
        if (tem_hum == 'Temperature') {
            send_th = '1';
        } else {
            send_th = '0';
        }
        let sendData = 'dht11Read#' +pin+'#';
        this.serialSend(sendData);
        //await new Promise(resolve => setTimeout(resolve, 16));
        console.log('sendData:', sendData);
        let dht11_return = (await this.serialRead()).split(',');
        if(dht11_return.length === 2 ){
            if (tem_hum == 'Temperature') {
                return dht11_return[1];
            } else {
                return dht11_return[0];
            }
        }

    }
    async ntc_read(args){
        //送出pin並取回值
        let pin = args['PIN'].substr(1, 2);
        const Rs = parseInt(args.OM,10);
        console.log('om=',Rs);
        const type = args.TYPE;
        console.log('type=',type);
        const Vcc = parseFloat(args.VOLTE);
        console.log('volte=',Vcc);
        //pin = parseInt(pin, 10);
        let sendData = 'ntc#' + pin + '#';
        this.serialSend(sendData);
        console.log(sendData);
        let serial_data = (await this.serialRead()).split(':');
        let analog_value = parseInt(serial_data[1],10);
        if (serial_data[0] == 'N') {
            if(type==='+'){
                analog_value = 4095-analog_value;    
            }
            console.log('analog_value=',analog_value);
            //const Rs = 5000;   //電阻
            //const Vcc = 5.0;    //電壓
            const V_NTC =analog_value / 1024;
            let R_NTC =(Rs * V_NTC)/(Vcc-V_NTC); 
            R_NTC = Math.log(R_NTC); 
            let Temp = 1 /(0.001129148 +(0.000234125 +(0.0000000876741 * R_NTC * R_NTC))* R_NTC); 
            Temp= Math.round((Temp - 273.15)*10)/10;   //取小數第1位
            console.log('temp=',Temp);
            return Temp;
        }
    }
    async analog_read(args) {
        //送出pin並取回值
        let pin = args['PIN'].substr(1, 2);
        //pin = parseInt(pin, 10);
        let sendData = 'analogRead#' + pin + '#';
        this.serialSend(sendData);
        console.log(sendData);
        let serial_data = (await this.serialRead()).split(':');
        if (serial_data[0] == 'A' + pin) {
            return serial_data[1];
        }/*else {
            reader.releaseLock();
            this.analog_read(args);
        }*/
    }

    async pms_read(args){
        let sendData = 'pm#1#';
        console.log(sendData);
        await this.serialSend(sendData);
        //return await this.serialRead();
        pms_array = ((await this.serialRead()).split(','));
        console.log(pms_array);
        /*
        pms_1 = pms_return[0];
        pms_25 = pms_return[1];
        pms_100 = pms_return[2];
        pms_Temperature = pms_return[3];
        pms_Humidity = pms_return[4];*/

    }

    pms_value(args){
        let pms =args['PMS'];
        let  key = 0;
        for (i=0;i<msg.pmsItems[the_locale].length;i++){
            if(pms == msg.pmsItems[the_locale][i]){
                key = i;
                break;
            }
        }
        return Number(pms_array[key]);
    }

    async digital_read(args) {
        //送出pin並取回值
        const pin = args['PIN'].substring(0,2);
        let sendData = 'digitalRead#' + pin;
        await this.serialSend(sendData);
        console.log('sendData:', sendData);
        let serial_data = (await this.serialRead()).split(':');

        if (serial_data[0] == 'D' + pin) {
            return serial_data[1];
        }/*else{
            reader.releaseLock();
            this.digital_read(args);            
        }*/ 

    }

    async sonar_read(args) {
        let trigger_pin = parseInt(args['TRIGGER_PIN'],10);
        //let trigger_pin = parseInt(trigger_pin, 10);
        let echo_pin = parseInt(args['ECHO_PIN'],10);
        //echo_pin = parseInt(echo_pin, 10);
        let sendData = 'HC-SR04#' + trigger_pin + '#' + echo_pin;
        console.log('sendData:', sendData);
        this.serialSend(sendData);
        let hc_return = (await this.serialRead()).split(',');
        //let hc_return =(await this.serialRead()).split(',');
        //let hc_return =(await this.serialRead());
        console.log('hc_return=',hc_return);
        if(hc_return[0]=='HC'){
            console.log('hc=',hc_return[1]);
            return hc_return[1];
        }        
    }
    
    //shu
    ws2812_set_pin(args) {
        ws2812_pin = args['PIN'].substring(0, 2);       
    }

    mapminmax(in_value,min,max){
        if(in_value<min){
            in_value=min;
        }else if(in_value>max){
            in_value=max;
        }
        return in_value;
    }

    ws2812_set_num(args) {
        let led_num = args['NUM'];
        let led_value = args['VALUE'];
        led_value = parseInt(led_value, 10);
        let max_value =85;
        //console.log(led_num,led_value);
        let color_set = args['RGB'];
        let color_set_num;
        for (i = 0; i < msg.FormRGB[the_locale].length; i++) {
            if (msg.FormRGB[the_locale][i] == color_set) {
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
        
        send_color_data = send_color_data + led_num + ',' + color_set_num.toString() + ',' + led_value.toString() + ',';
        console.log(send_color_data);
    }

    /*ws2812_set_num1(args) {
        let led_num = this.mapminmax(parseInt(args.NUM,10),1,25);
        let r_value = this.mapminmax(parseInt(args.colorR,10),0,255);
        let g_value = this.mapminmax(parseInt(args.colorG,10),0,255);
        let b_value = this.mapminmax(parseInt(args.colorB,10),0,255);
        //let max_value =85;
        //let color_set = parseInt(args['RGB'].toString,10);
        //get {r: 1, g: 135, b: 244}
        //}
        if((r_value+g_value+b_value)>0){
            r_value=this.mapminmax(Math.trunc((r_value/(r_value+g_value+b_value))*10),0,9);
            g_value=this.mapminmax(Math.trunc((g_value/(r_value+g_value+b_value))*10),0,9);
            b_value=this.mapminmax(Math.trunc((b_value/(r_value+g_value+b_value))*10),0,9);
        }
        console.log(r_value,g_value,b_value);
        const color_set_num=r_value.toString()+g_value.toString()+b_value.toString();       
        send_color_data = send_color_data + led_num + ',' + color_set_num + ',' ;
        console.log(send_color_data);
    }*/

    async ws2812_show() {
        const sendData = 'sh#' + ws2812_pin + '#' + send_color_data;
        console.log(sendData);
        this.serialSend(sendData);
    }

    ws2812_set_clear() {
        send_color_data = '';
    }

    /*max7219_show (args){
        const devices = args['DEVICES'];
        const  cs_pin = args['CS_PIN'];
        const data_pin = args['DdevicesATA_PIN'];
        const clk_pin = args['CLK_PIN'];
        const text = args['TEXT'];
        const sendData = 'max#' +data_pin+','+ clk_pin+','+ cs_pin+','+devices + '#'+text+'#';
        console.log(sendData);
        this.serialSend(sendData);
    }*/
    async max7219_clear(){
        const sendData= 'maxshow#clear';
        console.log('sendData=',sendData);
        await this.serialSend(sendData);
    }
    async max7219_show(args){
        let hextext=args.TEXT;
        switch (hextext) {
            case 'o':
                hextext=max7219_img.o;
                console.log(max7219_img.o);
                break;
            case 'x':
                hextext=max7219_img.x;
                break;
            case 'up':
                hextext=max7219_img.up;
                break;
            case 'down':
                hextext=max7219_img.down;
                break;    
            case 'left':
                hextext=max7219_img.left;
                break;
            case 'right':
                hextext=max7219_img.right;
                break;    
            case 'hart':
                hextext=max7219_img.hart;
                break;
            case 'o':
                hextext=max7219_img.o;
                break;    
            case 'sad':
                hextext=max7219_img.sad;
                break;
            case 'smile':
                hextext=max7219_img.smile;
                break;
            default:           
        }
        const sendData = "maxshow#0x"+hextext+'#'+max7219_config[0]+','+max7219_config[2]+','+max7219_config[1];
        //const sendData = "maxshow#"+max7219_config[0]+','+max7219_config[1]+','+max7219_config[2]+"#0x"+hextext;
        //const sendData = "maxshow#0x"+hextext;
        console.log('sendData=',sendData);
        await this.serialSend(sendData);
    }
    async max7219_set(args){
        max7219_config[0] = args.DATA_PIN.substring(0,2);
        max7219_config[1] = args.CS_PIN.substring(0,2);
        max7219_config[2] = args.CLK_PIN.substring(0,2);
        //const devices = args.DEVICES;
        //let send_data ='maxset#'+data_pin+','+clock_pin+','+cs_pin+',1';
        //console.log('sendData=',send_data);
        //this.serialSend(send_data);
    }

    async max7219_matrix(args){
        const value_2 = parseInt(args.VALUE,2);
        let hextext = value_2.toString(16);
        let i = hextext.length;
        while(i++<16){
            hextext='0'+hextext;
        }
        const sendData = "maxshow#0x"+hextext+'#'+max7219_config[0]+','+max7219_config[2]+','+max7219_config[1];
        console.log('sendData=',sendData);
        await this.serialSend(sendData);
    }
    

    async listener(){
        navigator.serial.addEventListener('disconnect', (event) => {
            Linkitport = null;
            alert(msg.FormDisconnect[the_locale]);
        // TODO: Remove |event.target| from the UI.
        // If the serial port was opened, a stream error would be observed as well.
       });
    }
    
    async firmwareversion(){
        if(firmware_ver == ''){
        const sendData = "ver#";
        await this.serialSend(sendData);
        console.log(sendData);
        firmware_ver= await this.serialRead();
        }
        return firmware_ver;
        //console.log(serial_data);
        //return serial_data;
    }

    _setLocale() {
        let now_locale = '';
        switch (formatMessage.setup().locale) {
            case 'pt-br':
            case 'pt':
                now_locale = 'pt-br';
                break;
            case 'en':
                now_locale = 'en';
                break;
            case 'fr':
                now_locale = 'fr';
                break;
            case 'zh-tw':
                now_locale = 'zh-tw';
                break;
            case 'zh-cn':
                now_locale = 'zh-cn';
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

}

module.exports = Scratch3Linkit7697WebSerial;
