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

let port;
let reader;
//s#pin#1,255$2,255$ 30bites
let ws2812_pin = '9';
let send_color_data = '';

// an array to save the current pin mode
// this is common to all board types since it contains enough
// entries for all the boards.
// Modes are listed above - initialize to invalid mode of -1
let pin_modes = new Array(30).fill(-1);

// has an websocket message already been received
let alerted = false;

let connection_pending = false;
//def freq array
let freq_ary=[];
for(var i=24;i<84;i++){
    freq_ary.push(i);
}

// general outgoing websocket message holder
//let msg = null;

// the pin assigned to the sonar trigger
// initially set to -1, an illegal value
let sonar_report_pin = -1;

//estea flag to indicate if the user connected to a board
let connected = true;

// arrays to hold input values
let digital_inputs = new Array(32);
let analog_inputs = new Array(8);

// flag to indicate if a websocket connect was
// ever attempted.
let connect_attempt = false;

// an array to buffer operations until socket is opened
let wait_open = [];

let the_locale = null;
//pms5003
let pms_array =[0,0,0,0,0];

let theDHTSensorMap = { 0: 'Temperature', 1: 'Humidity' };

class Scratch3ArduinoWebSerial {
    constructor(runtime) {
        the_locale = this._setLocale();
        this.runtime = runtime;
    }
    
    getInfo() {
        the_locale = this._setLocale();
        this.content_port();
        return {
            id: 'webserialArduino',
            color1: '#003D79', //'#0C5986',
            color2: '#34B0F7',
            name: 'Webserial Arduino',
            blockIconURI: 'data:image/png;base64,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',
            blocks: [
                {
                    opcode: 'content_port',
                    blockType: BlockType.COMMAND,
                    text: msg.ContentPort[the_locale]

                },
                {
                    opcode: 'digitalWrite',
                    blockType: BlockType.COMMAND,
                    text: msg.digitalWrite[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '13',
                            menu: 'digital_pins'
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
                    text: msg.FormPwmWrite[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '3',
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
                    text: msg.FormTone[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '9',
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
                    text: msg.FormServo[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '9',
                            menu: 'pwm_pins'
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
                    text: msg.FormWs2812Write[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '6',
                            menu: 'digital_pins'
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
                            defaultValue: '2',
                            menu: 'digital_pins'
                        },
                    }
                },
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
                    opcode: 'dht11_set',
                    blockType: BlockType.COMMAND,
                    text: msg.FormDht11Set[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '8',
                            menu: 'digital_pins'
                        }
                    }
                },
                {
                    opcode: 'dht11_read',
                    blockType: BlockType.REPORTER,
                    text: msg.FormDht11Read[the_locale],
                    arguments: {
                        /*PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '8',
                            menu: 'digital_pins'
                        },*/
                        TH: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.MENU_DHT_SENSORS[the_locale][0],
                            menu: 'dht_items'
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
                            defaultValue: '12',
                            menu: 'digital_pins'
                        },
                        ECHO_PIN: {
                            type: ArgumentType.STRING,
                            defaultValue: '11',
                            menu: 'digital_pins'
                        }
                    }
                },
                
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
                            menu: 'digital_pins'
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
                },
                /*
                {
                    opcpin.splitode: 'max7219_show',
                    blockType: BlockType.COMMAND,
                    text: msg.Form7219_show[the_locale],
                    arguments:{
                        DEVICES:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                        },
                        CS_PIN:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '10',
                            menu:'digital_pins'
                        },
                        DATA_PIN:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '11',
                            menu:'digital_pins'
                        },
                        CLK_PIN:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '12',
                            menu:'digital_pins'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'A',
                        },
                    }
                },
                '---',
                {
                    opcode: 'max7219_set',
                    blockType: BlockType.COMMAND,
                    text: msg.FormMax7219Set[the_locale],
                    arguments:{
                        DEVICES:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                        },
                        CS_PIN:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '10',
                            menu:'digital_pins'
                        },
                        DATA_PIN:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '11',
                            menu:'digital_pins'
                        },
                        CLK_PIN:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '12',
                            menu:'digital_pins'
                        }
                    }
                },
                {
                    opcode: 'max7219_clear',
                    blockType: BlockType.COMMAND,
                    text: msg.FormMax7219Clear[the_locale],
                }*/
                
            ],
            menus: {
                digital_pins: {
                    acceptReporters: true,
                    items: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
                        '12', '13', '14(A0)', '15(A1)', '16(A2)', '17(A3)', '18(A4)', '19(A5)']
                },
                pwm_pins: {
                    acceptReporters: true,
                    items: ['3', '5', '6', '9', '10', '11']
                },
                analog_pins: {
                    acceptReporters: true,
                    items: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5']
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
                    items: ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5']
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
                rgb: {
                    acceptReporters: true,
                    items: msg.FormRGB[the_locale]
                },
                lednum: {
                    acceptReporters: true,
                    items: ['1', '2', '3', '4', '5', '6', '7', '8']
                },
                pms:{
                    acceptReporters: true,
                    items:msg.pmsItems[the_locale]
                    //items: ['PM1.0', 'PM2.5', 'PM10.0','Temperature','Humidity']
                }
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
        pin = pin.toString();
        if(pin.includes('(')){
            const pin_arry = pin.split('(');
            pin = pin_arry[0];
        }
        //pin = parseInt(pin, 10);
        let freq = Number(args['FREQ']);
        if(freq <24){
            freq =24;
        }
        if(freq>83){
            freq=83
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
        const toneArray1 = ['C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1', 'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'];
        const toneArray2 = [33, 35, 37, 39, 41, 44, 46, 49, 52, 55, 58, 62, 65, 69, 73, 78, 82, 87, 93, 98, 104, 110, 117, 123, 131, 139, 147, 156, 165, 175, 185, 196, 208, 220, 233, 247, 262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 493, 523, 554, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988];
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
        pin = pin.toString();
        if(pin.includes('(')){
            const pin_arry = pin.split('(');
            pin = pin_arry[0];
        }
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
        pin = pin.toString();
        if(pin.includes('(')){
            const pin_arry = pin.split('(');
            pin = pin_arry[0];
        }
        
        //pin = parseInt(pin, 10);
        let angle = args['ANGLE'];
        angle = parseInt(angle, 10);
        let sendData = 'servoWrite#' + pin + '#' + angle;
        //console.log('sendData:',sendData);
        this.serialSend(sendData);

    }


    //
    async content_port() {
        //console.log('is support:',navigator?.serial);
        if(!navigator?.serial){
            alert(msg.browser_not_support[the_locale]);
        }
        if (!port) {
            port = await navigator.serial.requestPort({});
            /*port = await navigator.bluetooth.requestDevice({acceptAllDevices: true,
                optionalServices: ['battery_service']  });*/
            await port.open({ baudRate: 115200 });
            console.log('port:', port);
        }
    }

    async serialSend(sendData) {
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();
        await writer.write(encoder.encode(sendData));
        writer.releaseLock();
    }

    async serialRead() {
        reader = port.readable.getReader();
        try{
            let value = await reader.read();
            //console.log('value',value);
            //let uint8array = new TextEncoder().encode();
            let string = new TextDecoder().decode(value.value);
            string = string.split('\r\n');
            //reader.releaseLock();
            return string[0];
        }catch (error) {
            console.log(error);
    // Handle |error|...
        } finally {
            reader.releaseLock();
        }    

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
        pin = pin.toString();
        if(pin.includes("(")){
            const pin_arry = pin.split('(');
            pin = pin_arry[0];
        }
        
        //pin = parseInt(pin, 10);
        let value = args['ON_OFF'];
        //value = parseInt(value, 10);
        let sendData;
        sendData = 'digitalWrite#' + pin + '#' + value.toString();
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
        let pin = args['PIN'];
        pin = pin.toString();
        if(pin.includes('(')){
            const pin_arry = pin.split('(');
            pin = pin_arry[0];
        }
        let sendData = 'dht11Set#' + pin;
        console.log('sendData:', sendData);
        this.serialSend(sendData);
    }

    async dht11_read(args) {
        //送出pin並取回值
        //let pin = args['PIN'];
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
        let sendData = 'dht11Read#8#' + send_th;
        this.serialSend(sendData);
        await new Promise(resolve => setTimeout(resolve, 16));
        console.log('sendData:', sendData);
        let dht11_return = (await this.serialRead()).split(',');
        if(dht11_return.length === 2 ){
            if (tem_hum == 'Temperature') {
                return dht11_return[0];
            } else {
                return dht11_return[1];
            }
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
        let pin = args['PIN'];
        pin = pin.toString();
        if(pin.includes('(')){
            const pin_arry = pin.split('(');
            pin = pin_arry[0];
        }
        //pin = parseInt(pin, 10);
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
        let trigger_pin = args['TRIGGER_PIN'].split('(');
        //trigger_pin = parseInt(trigger_pin, 10);
        sonar_report_pin = trigger_pin[0];
        let echo_pin = args['ECHO_PIN'].split('(');
        //echo_pin = parseInt(echo_pin, 10);
        let sendData = 'HC-SR04#' + trigger_pin[0] + '#' + echo_pin[0];
        console.log('sendData:', sendData);
        this.serialSend(sendData);
        const hc_return =(await this.serialRead()).split(',');
        
        if(hc_return[0]=='HC'){
            console.log('hc=',hc_return[1]);
            return hc_return[1];
        }        
    }
    //shu
    ws2812_set_pin(args) {
        let led_pin = args['PIN'].split('(');
        ws2812_pin = led_pin[0];
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

    async ws2812_show() {
        const sendData = 'sh#' + ws2812_pin + '#' + send_color_data;
        console.log(sendData);
        this.serialSend(sendData);
    }

    ws2812_set_clear() {
        send_color_data = '';
    }

    max7219_show (args){
        const devices = args['DEVICES'];
        const  cs_pin = args['CS_PIN'];
        const data_pin = args['DATA_PIN'];
        const clk_pin = args['CLK_PIN'];
        const text = args['TEXT'];
        const sendData = 'max#' +devices + ',' + cs_pin+','+data_pin+','+clk_pin+'#'+text+'#';
        console.log(sendData);
        this.serialSend(sendData);
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

module.exports = Scratch3ArduinoWebSerial;
