const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const log = require('../../util/log');
const cast = require('../../util/cast');
const formatMessage = require('format-message');
//const BLE = require('../../io/ble');
const Base64Util = require('../../util/base64-util');
//async await estea
const ml5 = require('ml5');
const msg = require('./translation');
const { Console } = require('minilog');
const { locale } = require('core-js');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';

//estea
let mic_port;
let the_locale = null;
//tone
let freq_ary=[];
//let serial_isbusy = false;
let ws2812_pin = '12';
for(var i=24;i<96;i++){
    freq_ary.push(i);
}
/**
 * Enum for micro:bit BLE command protocol.
 * https://github.com/LLK/scratch-microbit-firmware/blob/master/protocol.md
 * @readonly
 * @enum {number}
 */
/*const BLECommand = {
    CMD_PIN_CONFIG: 0x80,
    CMD_DISPLAY_TEXT: 0x81,
    CMD_DISPLAY_LED: 0x82
};*/

const tilt_direction_menu_ary=['front','back','left','right','any'];
const ledTextAry = ['smile', 'sad', 'led_on','yes','no'];
const dht11_sensor_ary =['temperature', 'humidity'];
let dht11_value_ary =[0,0];
//const direct_ary= ['east', 'northeast', 'north','northwest','west','southwest','south','southeast'];

/**
 * A time interval to wait (in milliseconds) before reporting to the BLE socket
 * that data has stopped coming from the peripheral.
 */
//const BLETimeout = 4500;

/**
 * A time interval to wait (in milliseconds) while a block that sends a BLE message is running.
 * @type {number}
 */
const BLESendInterval = 100;

/**
 * A string to report to the BLE socket when the micro:bit has stopped receiving data.
 * @type {string}
 */
//const BLEDataStoppedError = 'micro:bit extension stopped receiving data';

/**
 * Enum for micro:bit protocol.
 * https://github.com/LLK/scratch-microbit-firmware/blob/master/protocol.md
 * @readonly
 * @enum {string}
 */
/*const BLEUUID = {
    service: 0xf005,
    rxChar: '5261da01-fa7e-42ab-850b-7c80220097cc',
    txChar: '5261da02-fa7e-42ab-850b-7c80220097cc'
};*/


/**
 * Enum for micro:bit gestures.
 * @readonly
 * @enum {string}
 */
/*const MicroBitGestures = {
    MOVED: 'moved',
    SHAKEN: 'shaken',
    JUMPED: 'jumped'
};*/

/**
 * Scratch 3.0 blocks to interact with a MicroBit peripheral.
 */
class Scratch3WebserialMicroBitBlocks {

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return 'w_micro:bit';
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return 'webserialmicrobit';
    }

    /**
     * Construct a set of MicroBit blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new MicroBit peripheral instance
        //this._peripheral = new MicroBit(this.runtime, Scratch3WebserialMicroBitBlocks.EXTENSION_ID);
        the_locale = this._setLocale();
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        the_locale = this._setLocale();
        this.content_port();
        return {
            id: 'webserialmicrobit', //Scratch3WebserialMicroBitBlocks.EXTENSION_ID,
            name: Scratch3WebserialMicroBitBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            //showStatusButton: true,
            blocks: [
                /*{
                    opcode: 'whenButtonPressed',
                    text: formatMessage({
                        id: 'microbit.whenButtonPressed',
                        default: 'when [BTN] button pressed',
                        description: 'when the selected button on the micro:bit is pressed'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        BTN: {
                            type: ArgumentType.STRING,
                            menu: 'buttons',
                            defaultValue: MicroBitButtons.A
                        }
                    }
                },*/
                {
                    opcode: 'w_content',
                    text: msg.w_content[the_locale],
                    blockType: BlockType.COMMAND,
                       
                },
                {
                    opcode: 'isButtonPressed',
                    text: formatMessage({
                        id: 'microbit.isButtonPressed',
                        default: '[BTN] button pressed?',
                        description: 'is the selected button on the micro:bit pressed?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        BTN: {
                            type: ArgumentType.STRING,
                            menu: 'buttons',
                            defaultValue: 'A' //MicroBitButtons.A
                        }
                    }
                },
                '---',
                /*{
                    opcode: 'whenGesture',
                    text: formatMessage({
                        id: 'microbit.whenGesture',
                        default: 'when [GESTURE]',
                        description: 'when the selected gesture is detected by the micro:bit'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        GESTURE: {
                            type: ArgumentType.STRING,
                            menu: 'gestures',
                            defaultValue: MicroBitGestures.MOVED
                        }
                    }
                },
                '---',*/
                {
                    opcode: 'displaySymbol',
                    text: formatMessage({
                        id: 'microbit.displaySymbol',
                        default: 'display [MATRIX]',
                        description: 'display a pattern on the micro:bit display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MATRIX: {
                            type: ArgumentType.MATRIX,
                       
                            defaultValue: '0101010101100010101000100'
                        }
                    }
                },
                {
                    opcode: 'displaydrawPixel',
                    text: msg.displaydrawPixel[the_locale],
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X: {
                                type: ArgumentType.STRING,
                                menu:'num05',
                                defaultValue: '0'
                            },
                        Y: {
                                type: ArgumentType.STRING,
                                menu:'num05',
                                defaultValue: '0'
                            },
                        ONOFF:{
                            type: ArgumentType.NUMBER,
                            menu:'onoff',
                                defaultValue: 1
                        }        
                    }    
                },
                {
                    opcode: 'displayTextAry',
                    text: msg.ledDisplayTextAry[the_locale],
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                                type: ArgumentType.STRING,
                                menu: 'ledBmp',
                                defaultValue: 'smile'
                            }
                    }    
                },
                {
                    opcode: 'displayText',
                    text: formatMessage({
                        id: 'microbit.displayText',
                        default: 'display text [TEXT]',
                        description: 'display text on the micro:bit display'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'microbit.defaultTextToDisplay',
                                default: 'Hello!',
                                description: `default text to display.
                                IMPORTANT - the micro:bit only supports letters a-z, A-Z.
                                Please substitute a default word in your language
                                that can be written with those characters,
                                substitute non-accented characters or leave it as "Hello!".
                                Check the micro:bit site documentation for details`
                            })
                        }
                    }
                },
                {
                    opcode: 'displayLine',
                    text: msg.ledDisplayLine[the_locale],
                    blockType: BlockType.COMMAND,
                    arguments: {
                        BX: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                        BY: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                        EX: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 5
                            },
                        EY: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 5
                            }        
                    }    
                },
                {
                    opcode: 'displayOne',
                    text: msg.ledDisplayOne[the_locale],
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                        Y: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                        OF: {
                                type: ArgumentType.STRING,
                                defaultValue: '1',
                                menu:'onoff'
                            },
                    }    
                },
                {
                    opcode: 'displayClear',
                    text: formatMessage({
                        id: 'microbit.clearDisplay',
                        default: 'clear display',
                        description: 'display nothing on the micro:bit display'
                    }),
                    blockType: BlockType.COMMAND
                },
                //'---',
                /*{
                    opcode: 'whenTilted',
                    text: formatMessage({
                        id: 'microbit.whenTilted',
                        default: 'when tilted [DIRECTION]',
                        description: 'when the micro:bit is tilted in a direction'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'tiltDirectionAny',
                            defaultValue: MicroBitTiltDirection.ANY
                        }
                    }
                },*/
                {
                    opcode: 'isTilted',
                    text: formatMessage({
                        id: 'microbit.isTilted',
                        default: 'tilted [DIRECTION]?',
                        description: 'is the micro:bit is tilted in a direction?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'tiltDirectionAny',
                            defaultValue: msg.tilt_direction_menu_ary[the_locale][4] //MicroBitTiltDirection.ANY
                        }
                    }
                },
                {
                    opcode: 'getTiltAngle',
                    text: formatMessage({
                        id: 'microbit.tiltAngle',
                        default: 'tilted [DIRECTION]?',
                        description: 'how much the micro:bit is tilted in a direction'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'tiltDirection',
                            defaultValue: msg.tilt_direction_menu_ary[the_locale][0]
                        }
                    }
                },
                {
                    opcode: 'mma8653_read',
                    text: msg.mma8653Read[the_locale],
                    blockType: BlockType.REPORTER,
                    arguments: {
                        XYZ: {
                            type: ArgumentType.STRING,
                            menu: 'xyz',
                            defaultValue: 'x'
                        }
                    }
                },
                /*{
                    opcode: 'mag3110_direct',
                    text: msg.mag3110direct[the_locale],
                    blockType: BlockType.REPORTER,
                },*/
                {
                    opcode: 'mag3110_read',
                    text: msg.mag3110Read[the_locale],
                    blockType: BlockType.REPORTER,
                    arguments: {
                        XYZ: {
                            type: ArgumentType.STRING,
                            menu: 'xyz',
                            defaultValue: 'y'
                        }
                    }
                },
                '---',
                {
                    opcode: 'analog_read',
                    text: msg.analogRead[the_locale],
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'analogPins',
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'digital_read',
                    text: msg.digitalRead[the_locale],
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'digitalPins',
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'analog_write',
                    text: msg.analogWrite[the_locale],
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'analogPins',
                            defaultValue: '0'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'digital_write',
                    text: msg.digitalWrite[the_locale],
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'digitalPins',
                            defaultValue: '0'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            menu:'v01',
                            defaultValue: '1'
                        }
    
                    }
                },
                '---',
                {
                    opcode: 'light_read',
                    text: msg.lightRead[the_locale],
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'temp_read',
                    text: msg.tempRead[the_locale],
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'tone_on',
                    blockType: BlockType.COMMAND,
                    text: msg.FormTone[the_locale],
                    arguments: {
                        /*PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '9',
                            menu: 's_pins'
                        },*/
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
                    opcode: 'radio_read',
                    text: msg.radioRead[the_locale],
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'radio_send',
                    text: msg.radioSend[the_locale],
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'A'
                        }
                    }
                },
                {
                    opcode: 'servo_value',
                    text: msg.servoValue[the_locale],
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu:'touchPins',
                            defaultValue: '1'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        }
                    }
                },
                {
                    opcode: 'isg248',
                    text: msg.isG248[the_locale],
                    blockType: BlockType.REPORTER,
                    arguments: {
                        GXXX: {
                            type: ArgumentType.STRING,
                            menu:'G248',
                            defaultValue: '2G'
                        }
                    }
                },
                {
                    opcode: 'FirmwareVersion',
                    text: msg.FirmwareVersion[the_locale],
                    blockType: BlockType.REPORTER,
                },
                '---',
                {
                    opcode: 'ws2812_write',
                    blockType: BlockType.COMMAND,
                    text: msg.FormWs2812Write[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '12',
                            menu: 'digitalPins'
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
                    opcode: 'dht11_read',
                    blockType: BlockType.COMMAND,
                    text: msg.dht11_read[the_locale],
                    arguments: {
                        PIN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1',
                            menu: 'digitalPins'
                        }
                    }
                },
                {
                    opcode: 'dht11_data',
                    blockType: BlockType.REPORTER,
                    text: msg.FormDht11Read[the_locale],
                    arguments: {
                        TH: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.Dht11data[the_locale][0],
                            menu: 'dht_items'
                        }
                    }
                },
                //oled
                {
                    opcode: 'oled_show',
                    blockType: BlockType.COMMAND,
                    text: msg.FormOledShow[the_locale],
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
                //ws2812
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
                            defaultValue: '12',
                            menu: 'digitalPins'
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
            ],
            menus: {
                lcd_row: {
                    acceptReporters: true,
                    items: ['0', '1']
                },
                rgb: {
                    acceptReporters: true,
                    items: msg.FormRGB[the_locale]
                },
                lednum: {
                    acceptReporters: true,
                    items: ['1', '2', '3', '4', '5', '6', '7', '8','9','10','11','12']
                },
                dht_items:{
                    acceptReporters: true,
                    items: msg.Dht11data[the_locale],
                },
                buttons: {
                    acceptReporters: true,
                    items: ['A','B','A+B','any'] //this.BUTTONS_MENU
                },
                G248:{
                    acceptReporters: true,
                    items: ['2G','4G','8G']
                },
                onoff:{
                    acceptReporters: true,
                    items: ['1','0']
                },
                /*gestures: {
                    acceptReporters: true,
                    items: this.GESTURES_MENU
                },*/
                /*pinState: {
                    acceptReporters: true,
                    items: this.PIN_STATE_MENU
                },*/
                v01:{
                    acceptReporters: true,
                    items: ['0','1']
                },
                tiltDirection: {
                    acceptReporters: true,
                    items: msg.tilt_direction_menu_ary[the_locale] //this.TILT_DIRECTION_MENU
                },
                tiltDirectionAny: {
                    acceptReporters: true,
                    items: msg.tilt_direction_menu_ary[the_locale] //this.TILT_DIRECTION_ANY_MENU
                },
                touchPins: {
                    acceptReporters: true,
                    items: ['0', '1', '2']
                },
                analogPins: {
                    acceptReporters: true,
                    items: ['0', '1', '2','3','4','10']
                },
                digitalPins: {
                    acceptReporters: true,
                    items: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
                },
                num05:{
                    acceptReporters: true,
                    items: ['0', '1', '2','3','4']
                },
                ledBmp: {
                    acceptReporters: true,
                    items: ledTextAry //['smile', 'sad', 'led_on','yes','no']
                },
                xyz: {
                    acceptReporters: true,
                    items: ['x', 'y', 'z']
                },
                bmpary:{
                    acceptReporters: true,
                    items:['0101010101100010101000100','0010001110101010010000100','0010000100101010111000100']
                },
                tone_list: {
                    acceptReporters: true,
                    items: ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5', 'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6']
                },
            }
        };
    }

    /**
     * Test whether the A or B button is pressed
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    /*whenButtonPressed (args) {
        if (args.BTN === 'any') {
            return this._peripheral.buttonA | this._peripheral.buttonB;
        } else if (args.BTN === 'A') {
            return this._peripheral.buttonA;
        } else if (args.BTN === 'B') {
            return this._peripheral.buttonB;
        }
        return false;
    }*/

    /**
     * Test whether the A or B button is pressed
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the button is pressed.
     */
    async isButtonPressed (args) {
        
            await this.serialSend('b#');
            new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 5);
            });
            const r_data = await this.serialRead();
            console.log("r_data",r_data);
            if(r_data.length>4){
            const v_ary = r_data.split(':');
            //console.log("v_ary[0]",v_ary[0]);
            if(v_ary[0]=='b'){
                const btn_ary = v_ary[1].split(',');
                if(btn_ary.length==2){
                    switch (args.BTN){
                        case 'A':
                            return Boolean(btn_ary[0]==0);
                            
                        case 'B':
                            return Boolean(btn_ary[1]==0);
                        case 'any':
                            return Boolean(btn_ary[0]==0 || btn_ary[1]==0);
                        case 'A+B':
                            return Boolean(btn_ary[0]==0 && btn_ary[1]==0);
                        default :
                            return false;             
                    }
                }
                    
            }
            }
        
    }

    /**
     * Test whether the micro:bit is moving
     * @param {object} args - the block's arguments.
     * @return {boolean} - true if the micro:bit is moving.
     */
    whenGesture (args) {
        const gesture = cast.toString(args.GESTURE);
        if (gesture === 'moved') {
            return (this._peripheral.gestureState >> 2) & 1;
        } else if (gesture === 'shaken') {
            return this._peripheral.gestureState & 1;
        } else if (gesture === 'jumped') {
            return (this._peripheral.gestureState >> 1) & 1;
        }
        return false;
    }

    /**
     * Display a predefined symbol on the 5x5 LED matrix.
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after a tick.
     */
    async displaySymbol (args) {
        const symbol = cast.toString(args.MATRIX).replace(/\s/g, '');
        console.log("symbol",symbol);
        const sendData='led#matrix#'+symbol;
        console.log('sendData=',sendData);
        await this.serialSend(sendData);
        //new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Display text on the 5x5 LED matrix.
     * @param {object} args - the block's arguments.
     * @return {Promise} - a Promise that resolves after the text is done printing.
     * Note the limit is 19 characters
     * The print time is calculated by multiplying the number of horizontal pixels
     * by the default scroll delay of 120ms.
     * The number of horizontal pixels = 6px for each character in the string,
     * 1px before the string, and 5px after the string.
     */
    displayText (args) {
        const text = 'led#'+String(args.TEXT).substring(0, 19);
        if (text.length > 0){
            this.serialSend(text);
        } //this._peripheral.displayText(text);
        //const yieldDelay = 120 * ((6 * text.length) + 6);
        
        let isledtext =false;
        for (i=0;i<ledTextAry.length; i++){
            if( args.TEXT == ledTextAry[i]){
                isledtext = true;
                break;
            }
        }
        if (!isledtext){
            const yieldDelay = 50 * ((6 * text.length) + 6);
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, yieldDelay);
                });
        }
    }
    //led亮線
    async displayLine(args){
        const sendData = 'led#drawLine#'+args.BX+','+args.BY+','+args.EX+','+args.EY;
        console.log('sendData=',sendData);
        await this.serialSend(sendData);
        //new Promise(resolve => setTimeout(resolve, 1000));
    }
    async displayOne(args){
        const xx=this.my_range(args.X,0,4);
        const yy=this.my_range(args.Y,0,4);
        const of=this.my_range(args.OF,0,4);
        const sendData = 'led#matrixone#'+xx+','+yy+'#'+of;
        console.log('sendData=',sendData);
        await this.serialSend(sendData);
    }
    /**
     * Turn all 5x5 matrix LEDs off.
     * @return {Promise} - a Promise that resolves after a tick.
     */
    async displayClear () {
        /*for (let i = 0; i < 5; i++) {
            this._peripheral.ledMatrixState[i] = 0;
        }*/
        const sendData ="led#clear";
        console.log("sendData=",sendData);
        await this.serialSend(sendData);
        /*return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 100);
        });*/
    }
    
    my_range(in_value,mix,max){
        if(in_value < mix)
            return mix;
        if(in_value > max)
            return max;
        return in_value;
    }

    async displaydrawPixel(args){
        const x= this.my_range(parseInt(args.X,10),0,4);
        const y= this.my_range(parseInt(args.Y,10),0,4);
        const onoff = this.my_range(parseInt(args.ONOFF,10),0,1);
        const sendData ="led#drawPixel#"+x+','+y+','+onoff;
        console.log("sendData=",sendData);
        await this.serialSend(sendData);
        //new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Test whether the tilt sensor is currently tilted.
     * @param {object} args - the block's arguments.
     * @property {TiltDirection} DIRECTION - the tilt direction to test (front, back, left, right, or any).
     * @return {boolean} - true if the tilt sensor is tilted past a threshold in the specified direction.
     */
    whenTilted (args) {
        return this._isTilted(args.DIRECTION);
    }

    /**
     * Test whether the tilt sensor is currently tilted.
     * @param {object} args - the block's arguments.
     * @property {TiltDirection} DIRECTION - the tilt direction to test (front, back, left, right, or any).
     * @return {boolean} - true if the tilt sensor is tilted past a threshold in the specified direction.
     */
    isTilted (args) {
        return this._isTilted(args.DIRECTION);
    }

    /**
     * @param {object} args - the block's arguments.
     * @property {TiltDirection} DIRECTION - the direction (front, back, left, right) to check.
     * @return {number} - the tilt sensor's angle in the specified direction.
     * Note that getTiltAngle(front) = -getTiltAngle(back) and getTiltAngle(left) = -getTiltAngle(right).
     */
    getTiltAngle (args) {
        return this._getTiltAngle(args.DIRECTION);
    }

    /**
     * Test whether the tilt sensor is currently tilted.
     * @param {TiltDirection} direction - the tilt direction to test (front, back, left, right, or any).
     * @return {boolean} - true if the tilt sensor is tilted past a threshold in the specified direction.
     * @private
     */
    async _isTilted (direction) {
        console.log('direction=',direction);
        let c_direction='';
        for(let i=0;i<tilt_direction_menu_ary.length;i++){
            if(direction==msg.tilt_direction_menu_ary[the_locale][i]){
                c_direction = tilt_direction_menu_ary[i];
                break;
            }
        }
        this.serialSend('mma#');
        setTimeout(() => {
            console.log("delay 3");
          }, "3");
        const r_data = await this.serialRead();
        console.log("r_data",r_data);
        const v_ary = r_data.split(':');
        if(v_ary[0]=='mma'){
            const v1_ary = v_ary[1].split(',');
            switch (c_direction) {
                case 'left':
                    if(v1_ary[0]<-30){
                        return true;
                    }else{
                        return false;
                    }
                    break;
                case 'right':
                    if(v1_ary[0]>30){
                        return true;
                    }else{
                        return false;
                    }
                    break;          
                case 'front':
                    if(v1_ary[1] <-30){
                        return true;
                    }else{
                        return false;
                    }
                    break; 
                case 'back':
                    if(v1_ary[1] >30){
                        return true;
                    }else{
                        return false;
                    }
                    break;
                case 'any':
                    if(v1_ary[1]<-30 || v1_ary[1]>30 || v1_ary[0]<-30 ||v1_ary[0]>30){
                        return true;
                    }else{
                        return false;
                    }
                    break;
                default :
                    return false;        
                }
            }         
        /*switch (direction) {
        case MicroBitTiltDirection.ANY:
            return (Math.abs(this._peripheral.tiltX / 10) >= Scratch3WebserialMicroBitBlocks.TILT_THRESHOLD) ||
                (Math.abs(this._peripheral.tiltY / 10) >= Scratch3WebserialMicroBitBlocks.TILT_THRESHOLD);
        default:
            return this._getTiltAngle(direction) >= Scratch3WebserialMicroBitBlocks.TILT_THRESHOLD;
        }*/
    }

    /**
     * @param {TiltDirection} direction - the direction (front, back, left, right) to check.
     * @return {number} - the tilt sensor's angle in the specified direction.
     * Note that getTiltAngle(front) = -getTiltAngle(back) and getTiltAngle(left) = -getTiltAngle(right).
     * @private
     */
    async _getTiltAngle (direction) {
        let c_direction='';
        for(let i=0;i<tilt_direction_menu_ary.length;i++){
            if(direction==msg.tilt_direction_menu_ary[the_locale][i]){
                c_direction = tilt_direction_menu_ary[i];
                break;
            }
        }
        this.serialSend('mma#');
        setTimeout(() => {
            console.log("delay 5");
          }, "5");
        const r_data = await this.serialRead();
        console.log("r_data",r_data);
        const v_ary = r_data.split(':');
        if(v_ary[0]=='mma'){
            const v1_ary = v_ary[1].split(',');
            switch (c_direction) {
                case 'left':
                    if(v1_ary[0]<-30){
                        return this.mymap(0,250,0,90,Math.abs(v1_ary[0]));
                    }else{
                        return 0;
                    }
                    break;
                case 'right':
                    if(v1_ary[0]>30){
                        return this.mymap(0,250,0,90,v1_ary[0]);
                    }else{
                        return 0;
                    }
                    break;          
                case 'back':
                    if(v1_ary[1] >30){
                        return this.mymap(0,250,0,90,v1_ary[1]);
                    }else{
                        return 0;
                    }
                    break; 
                case 'front':
                    if(v1_ary[1] <-30){
                        return this.mymap(0,250,0,90,Math.abs(v1_ary[1]));
                    }else{
                        return 0;
                    }
                    break;
                default :
                    return 0;        
                }
            }
    }
    mymap(amin,amax,emin,emax,value){
        return Math.round(value*(emax-emin)/(amax-amin));
    }
    /**
     * @param {object} args - the block's arguments.
     * @return {boolean} - the touch pin state.
     * @private
     */
    async whenPinConnected (args) {
        const pin = parseInt(args.PIN, 10);
        if (isNaN(pin)) return;
        if (pin < 0 || pin > 2) return false;
        this.serialSend('a_read#'+pin+"#");
        setTimeout(() => {
            console.log("delay 5");
          }, "5");
        const r_data = await this.serialRead();
        console.log("r_data",r_data);
        const v_ary = r_data.split(':');
        if(v_ary[0]=='a'+pin){
            return v_ary[1] ;
        }
        //return this._peripheral._checkPinState(pin);
    }

    async analog_read(args){
        const pin = parseInt(args.PIN, 10);
        if (isNaN(pin)) return;
        if (pin < 0 || pin > 2) return false;
        this.serialSend('a_read#'+pin+"#");
        setTimeout(() => {
            console.log("delay 5");
          }, "5");
        const r_data = await this.serialRead();
        console.log("r_data",r_data);
        const v_ary = r_data.split(':');
        if(v_ary[0]=='a'+pin){
            return v_ary[1] ;
        }        
    }

    async digital_read(args){
        const pin = parseInt(args.PIN, 10);
        if (isNaN(pin)) return;
        if (pin < 0 || pin > 2) return false;
        this.serialSend('d_read#'+pin+"#");
        setTimeout(() => {
            console.log("delay 5");
          }, "5");
        const r_data = await this.serialRead();
        console.log("r_data",r_data);
        const v_ary = r_data.split(':');
        if(v_ary[0]=='d'+pin){
            return v_ary[1] ;
        }        
    }
    
    async digital_write(args){
        const pin = parseInt(args.PIN, 10);
        const value = parseInt(args.VALUE,10);
        this.serialSend('d_write#'+pin+"#"+value);
    }

    async analog_write(args){
        const pin = parseInt(args.PIN, 10);
        let value = this.my_range(parseInt(args.VALUE,10),0,255);
        this.serialSend('a_write#'+pin+"#"+value);
    }

    async mma8653_read(args){
        const xyz=args.XYZ;
        this.serialSend('mma#');
        setTimeout(() => {
            console.log("delay 5");
          }, "5");
        const r_data = await this.serialRead();
        console.log("r_data",r_data);
        const v_ary = r_data.split(':');
        if(v_ary[0]=='mma'){
            const v1_ary = v_ary[1].split(',');  
            if(xyz=='x'){
                return v1_ary[0];
            }else if(xyz=='y'){
                return v1_ary[1];
            }else if(xyz=='z'){
                return v1_ary[2];
            }
        } 
    }
    async dht11_read(args){
        this.serialSend('dht11#'+args.PIN+'#');
        setTimeout(() => {
            console.log("delay 15");
          }, "15");
        const r_data = await this.serialRead();
        console.log("r_data",r_data);
        const v_ary = r_data.split(':');
        if(v_ary[0]==='dht11'){
            const sp_ary=v_ary[1].split(',');
            if(sp_ary[0]>-100){
            dht11_value_ary[0] = sp_ary[0];
            dht11_value_ary[1] = sp_ary[1];
            }
        }
    }

    dht11_data(args){
        if(args.TH === msg.Dht11data[the_locale][0]){
            return dht11_value_ary[0];
        }else if (args.TH === msg.Dht11data[the_locale][1]){
            return dht11_value_ary[1];
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

    async mag3110_direct(){
        this.serialSend('mag#');
        const r_data = await this.serialRead();
        console.log("r_data",r_data);
        const v_ary = r_data.split(':');
        if(v_ary[0]=='mag'){
            const v1_ary = v_ary[1].split(',');  
            /*
            e:375  ne:490  n:450  nw:210   w:100   ws:65530  s:655472  se:30
            */ 
           //東3450
            if(v1_ary[1]>3430 && v1_ary[1]<3470 ){
                return msg.directEWSN[the_locale][0];
            }
            //東北3670
            if(v1_ary[1]>3650 && v1_ary[1]<3685 ){
                return msg.directEWSN[the_locale][1];
            }
            //北3700
            if(v1_ary[1]>3690 && v1_ary[1]<3710 ){
                return msg.directEWSN[the_locale][2];
            }
            //西北3490    
            if(v1_ary[1]>3470 && v1_ary[1]<3510 ){
                return msg.directEWSN[the_locale][3];
            }
            //西3400
            if(v1_ary[1]>3380 && v1_ary[1]<3420 ){
                return msg.directEWSN[the_locale][4];
            }
            //西南3320
            if(v1_ary[1]>3300 && v1_ary[1]<3340 ){
                return msg.directEWSN[the_locale][5];
            }
            //南32850
            if(v1_ary[1]>3270 && v1_ary[1]<3300 ){
                return msg.directEWSN[the_locale][6];
            }
            //東南3390
            if(v1_ary[1]>3370 && v1_ary[1]<3410 ){
                return msg.directEWSN[the_locale][7];
            }
        } 

    }

    async mag3110_read(args){
        const xyz=args.XYZ;
        this.serialSend('mag#');
        setTimeout(() => {
            console.log("delay 15");
          }, "15");
        const r_data = await this.serialRead();
        console.log("r_data",r_data);
        const v_ary = r_data.split(':');
        if(v_ary[0]=='mag'){
            const v1_ary = v_ary[1].split(',');  
            // w:200 s:65384 e:655450
            if(xyz=='x'){
                return v1_ary[0];
            }else if(xyz=='y'){
                return v1_ary[1];
            }else if(xyz=='z'){
                return v1_ary[2];
            }
        } 
    }

    async light_read(){
        this.serialSend('light#');
        //new Promise(resolve => setTimeout(resolve, 10));
        let r_data = await this.serialRead();
        console.log("r_data",r_data);
        let v_ary = r_data.split(':');
        //return v_ary[1];
        if(v_ary[0]=='l'){
            return v_ary[1];
        }        
    }

    async temp_read(){
        this.serialSend('temp#');
        //new Promise(resolve => setTimeout(resolve, 10));
        let r_data = await this.serialRead();
        console.log("r_data",r_data);
        let v_ary = r_data.split(':');
        //return v_ary[1];
        if(v_ary[0]=='temp'){
            return v_ary[1];
        }        
    }

    async FirmwareVersion(){
        await this.serialSend('ver#');

        let r_data = await this.serialRead();
        console.log("r_data",r_data);
        let v_ary = r_data.split(':');
        //return v_ary[1];
        if(v_ary[0]=='ver'){
            return v_ary[1];
        }        
    }

    async isg248(args){
        const g248=args.GXXX;
        this.serialSend('g248#');
        let r_data = await this.serialRead();
        console.log("r_data",r_data);
        let v_ary = r_data.split(':');
        //return v_ary[1];
        if(v_ary[0]=='g'){
            const g_ary = v_ary[1].split(',');
            switch(g248){
                case '2G':
                    return Math.abs(g_ary[0]);
                    break;
                case '4G':
                    return Math.abs(g_ary[1]);
                    break;
                case '8G':
                    return Math.abs(g_ary[2]);
                    break;
                default:
                    break;           
            }
        }    
    }

    async radio_read(){
        this.serialSend('radio#');
        //new Promise(resolve => setTimeout(resolve, 10));
        let r_data = await this.serialRead();
        console.log("r_data",r_data);
        let v_ary = r_data.split(':');
        //return v_ary[1];
        if(v_ary[0]=='r0'){
            return v_ary[1];
        }        
    }

    async radio_send(args){
        const send_text = args.TEXT; 
        this.serialSend('radio#'+send_text);
        //new Promise(resolve => setTimeout(resolve, 10));
        //return v_ary[1];
    }
    async servo_value(args){
        const ser_value = args.VALUE;
        const pin = args.PIN;
        this.serialSend('servo#'+pin+'#'+ser_value);
    }
    //tone
    async tone_on(args, util) {
        let pin = args['PIN'];
        //pin = pin.toString().substring(0,2);
        //pin = parseInt(pin, 10);
        let freq = this.my_range(parseInt(args.FREQ,10),24,96);
        /*if(freq <24){
            freq =24;
        }
        if(freq>96){
            freq=96
        }*/
        console.log('freq = ',freq);
        //freq = parseInt(freq, 10);
        let duration = args['DURATION'];
        duration = this.my_range(parseInt(duration, 10),4,10000);
        // make sure duration maximum is 5 seconds
        /*if (duration > 10000) {
            duration = 10000;
        }
        if (duration < 4) {
            duration = 4;
        }*/
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
        let sendData = 'tone#' + valueFreq + '#' + duration;
        console.log('sendData:', sendData);
        this.serialSend(sendData);
        await new Promise(resolve => setTimeout(resolve, duration));
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
    //shu
    ws2812_set_pin(args) {
        ws2812_pin = args['PIN'].substring(0, 2);       
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

    async w_content(){
        mic_port='';
        mic_port = await navigator.serial.requestPort({});
            /*port = await navigator.bluetooth.requestDevice({acceptAllDevices: true,
                optionalServices: ['battery_service']  });*/
            await mic_port.open({ baudRate: 115200 });
            connected = true;
            console.log('mic_port:', mic_port);
            this.listener();
    }

     //
     async content_port() {
        //console.log('is support:',navigator?.serial);
        if(!navigator?.serial){
            alert(msg.browser_not_support[the_locale]);
        }
        if (!mic_port) {
            mic_port = await navigator.serial.requestPort({});
            /*port = await navigator.bluetooth.requestDevice({acceptAllDevices: true,
                optionalServices: ['battery_service']  });*/
            await mic_port.open({ baudRate: 115200 });
            connected = true;
            console.log('mic_port:', mic_port);
        }
        this.listener();
    }

    async serialSend(sendData) {
        
            console.log("serial sendData=",sendData);
            const encoder = new TextEncoder();
            serial_isbusy = true;
            const writer = mic_port.writable.getWriter();
            await writer.write(encoder.encode(sendData));
            writer.releaseLock();
            serial_isbusy = false;
        
    }

    async serialRead() {
        
            serial_isbusy = true;
            let mic_reader = mic_port.readable.getReader();
            try{
                let value = await mic_reader.read();
                //console.log('value',value);
                //let uint8array = new TextEncoder().encode();
                let string = new TextDecoder().decode(value.value);
                string = string.split('\r\n');
                mic_reader.releaseLock();
                console.log("string[0]=",string[0]);
                return string[0];
            }catch (error) {
                console.log(error);
            }// finally {
            //   reader.releaseLock();
            //}
            mic_reader.releaseLock(); 
            serial_isbusy = false;
        
    }

    async listener(){
        navigator.serial.addEventListener('disconnect', (event) => {
            mic_port = null;
            connected = false;
            console.log('disconnect斷線了');
            //alert(msg.FormDisconnect[the_locale]);
        // TODO: Remove |event.target| from the UI.
        // If the serial port was opened, a stream error would be observed as well.
       });
    }

    _setLocale() {
        let now_locale = '';
        switch (formatMessage.setup().locale) {
            case 'en':
                now_locale = 'en';
                break;
            case 'zh-tw':
                now_locale = 'zh-tw';
                break;
            default:
                now_locale = 'en';
                break;
        }
        return now_locale;
    }

    displayTextAry(args){
        return args.TEXT;
    }
}

module.exports = Scratch3WebserialMicroBitBlocks;
