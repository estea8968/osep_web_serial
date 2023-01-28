/*
This is the Scratch 3 extension to remotely control an
MQTT
 */
// Boiler plate from the Scratch Team

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const msg = require('./translation');

const { locale } = require('core-js');
require('sweetalert');
//async await estea
const ml5 = require('ml5');
const jqueryMin = require("./jquery.min.js");
//require('babel-polyfill');

let the_locale = null;

class Scratch3LineNotify {
    constructor(runtime) {
        the_locale = this._setLocale();
        this.runtime = runtime;
        this.payload ={
            token:'',
            message:'',
            imageFile:'',
            stickerID : '',
            stickerPackageId : ''
        };
        this.exec = 'https://script.google.com/macros/s/AKfycbyPMsaLgEEcia39_vcK1AmSGfpAi2YViAUcZFMbmKdYJ5niqDVui9Rgb4241Zdwca5d/exec';
    }

    getInfo() {
        the_locale = this._setLocale();
        return {
            id: 'linenotify',
            color1: '#336600', //'#0C5986',
            color2: '#FFFFFF',
            name: 'Line Notify',
            blockIconURI: 'data:image/png;base64,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',
            blocks: [
                {
                    opcode: 'gettoken',
                    blockType: BlockType.COMMAND,
                    text: msg.Token[the_locale],
                    arguments: {
                        TOKEN: {
                            type: ArgumentType.STRING,
                            defaultValue: ' ',
                            //defaultValue: 'ws://broker.emqx.io:8083/mqtt'
                        }
                    },

                },
                {
                    opcode: 'sendstickerId',
                    blockType: BlockType.COMMAND,
                    text: msg.SendstickerId[the_locale],
                    arguments: {
                        STICKERId: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                        },
                        StickerPackageId:{
                            type: ArgumentType.NUMBER,
                            defaultValue: 1,
                        }
                    },
                },
                {
                    opcode: 'sendmessage',
                    blockType: BlockType.COMMAND,
                    text: msg.SendMessage[the_locale],
                    arguments: {
                        MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: ' ',
                        }
                    },
                },
                {
                    opcode: 'sendimagefile',
                    blockType: BlockType.COMMAND,
                    text: msg.SendImageFile[the_locale],
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://.png',
                        }
                    },
                }
            ],

        };
    }

    // command blocks
    gettoken(args){
        this.payload.token = args.TOKEN;
        console.log(this.payload.token);
    }

    async sendmessage(args){
        const args_message = args.MESSAGE;
        this.payload.message = args_message;
        console.log(this.payload);
        if(this.payload.token =='' || this.payload.message == ''){
            alert(msg.TokenNull[the_locale]);
        }else{
            jqueryMin.post(this.exec,this.payload);
        }
        this.payload={
            token:'',
            message:'',
            imageFile:'',
            STICKERId:'',
            StickerPackageId:''
        };

    }
    
    async sendimagefile(args){
        const args_imagefile = args.URL;
        //const args_imagefile = args.URL;
        //console.log('imagefile=',args_imagefile);
        this.payload.imageFile = args_imagefile;
        this.payload.message =' ';
        console.log('payload=',this.payload);
        if(this.payload.token =='' || this.payload.imageFile == 'https://.png'){
            alert(msg.TokenNull[the_locale]);
        }else{
            jqueryMin.post(this.exec,this.payload);
        }
        this.payload={
            token:'',
            message:'',
            imageFile:'',
            STICKERId:'',
            StickerPackageId:''
        };

    }

    async sendstickerId(args){
        this.payload.stickerID = args.STICKERId;
        this.payload.stickerPackageId = args.StickerPackageId;
    } 
    // end of block handlers

    _setLocale() {
        let now_locale = '';
        switch (formatMessage.setup().locale) {
            case 'zh-tw':
                now_locale = 'zh-tw';
                break;
            default:
                now_locale = 'en';
                break;
        }
        return now_locale;
    }

    // helpers

}

module.exports = Scratch3LineNotify;
