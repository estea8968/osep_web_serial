const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

const menuIconURI = null;
const blockIconURI = null;

const defaultId = 'default';
let theLocale = null;

class dataProcessing {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        // communication related
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension('chart', this);
        // session callbacks
        this.reporter = null;
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.write = this.write.bind(this);

    }

    onclose() {
        this.session = null;
    }

    write(data, parser = null) {
        if (this.session) {
            return new Promise(resolve => {
                if (parser) {
                    this.reporter = {
                        parser,
                        resolve
                    };
                }
                this.session.write(data);
            });
        }
    }

    onmessage(data) {
        const dataStr = this.decoder.decode(data);
        this.lineBuffer += dataStr;
        if (this.lineBuffer.indexOf('\n') !== -1) {
            const lines = this.lineBuffer.split('\n');
            this.lineBuffer = lines.pop();
            for (const l of lines) {
                if (this.reporter) {
                    const { parser, resolve } = this.reporter;
                    resolve(parser(l));
                }
            }
        }
    }

    scan() {
        this.comm.getDeviceList().then(result => {
            this.runtime.emit(this.runtime.constructor.PERIPHERAL_LIST_UPDATE, result);
        });
    }

    _setLocale() {
        let nowLocale = '';
        switch (formatMessage.setup().locale) {
            case 'zh-tw':
                nowLocale = 'zh-tw';
                break;
            default:
                nowLocale = 'en';
                break;
        }
        return nowLocale;
    }

    getInfo() {
        theLocale = this._setLocale();

        return {
            id: 'dataProcessing',
            name: msg.title[theLocale],
            color1: '#566988',
            color2: '#566988',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'conversion',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        before: {
                            type: ArgumentType.STRING,
                            menu: 'selectYear',
                            defaultValue: '1'
                        },
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: '1010'
                        },
                        after: {
                            type: ArgumentType.STRING,
                            menu: 'selectYear',
                            defaultValue: '3'
                        },
                    },
                    text: msg.conversion[theLocale]
                },
                '---',
                {
                    opcode: 'substring',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'text'
                        },
                        start: {
                            type: ArgumentType.STRING,
                            defaultValue: '1'
                        },
                        finish: {
                            type: ArgumentType.STRING,
                            defaultValue: '2'
                        },
                    },
                    text: msg.substring[theLocale]
                },
                "---",
                {
                    opcode: 'startsWith',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'text'
                        },
                        text: {
                            type: ArgumentType.STRING,
                            defaultValue: 't'
                        },
                    },
                    text: msg.startsWith[theLocale]
                },
                {
                    opcode: 'endsWith',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'text'
                        },
                        text: {
                            type: ArgumentType.STRING,
                            defaultValue: 'd'
                        },
                    },
                    text: msg.endsWith[theLocale]
                },
                "---",
                {
                    opcode: 'replace',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'text'
                        },
                        originalText: {
                            type: ArgumentType.STRING,
                            defaultValue: 't'
                        },
                        replaceText: {
                            type: ArgumentType.STRING,
                            defaultValue: 'a'
                        },
                    },
                    text: msg.replace[theLocale]
                },
                {
                    opcode: 'repeat',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'text'
                        },
                        number: {
                            type: ArgumentType.STRING,
                            defaultValue: '3'
                        },
                    },
                    text: msg.repeat[theLocale]
                },
                {
                    opcode: 'trim',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: ' text  '
                        },
                    },
                    text: msg.trim[theLocale]
                },
                {
                    opcode: 'uppercase',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'text'
                        },
                    },
                    text: msg.uppercase[theLocale]
                },
                {
                    opcode: 'lowerCase',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'TEXT'
                        },
                    },
                    text: msg.lowerCase[theLocale]
                },

            ],
            menus: {
                selectYear: {
                    acceptReporters: true,
                    items: [
                        {
                            text: msg.Binary[theLocale],
                            value: '1'
                        },
                        {
                            text: msg.Octal[theLocale],
                            value: '2'
                        },
                        {
                            text: msg.Decimal[theLocale],
                            value: '3'
                        },
                        {
                            text: msg.Hexadecimal[theLocale],
                            value: '4'
                        },
                    ]
                },
            }
        };
    }

    conversion(args) {
        var beforeConversion = args.before;
        var afterConversion = args.after;
        var data = args.data;
        var convertToDecimal;
        var convertToOtherBases;

        switch (beforeConversion) {
            case "1": convertToDecimal = parseInt(data, 2); break;
            case "2": convertToDecimal = parseInt(data, 8); break;
            case "3": convertToDecimal = parseInt(data, 10); break;
            case "4": convertToDecimal = parseInt(data, 16); break;
        }

        switch (afterConversion) {
            case "1": convertToOtherBases = convertToDecimal.toString(2); break;
            case "2": convertToOtherBases = convertToDecimal.toString(8); break;
            case "3": convertToOtherBases = convertToDecimal.toString(10); break;
            case "4": convertToOtherBases = convertToDecimal.toString(16); break;
        }

        return convertToOtherBases;
    }

    substring(args) {
        var data = args.data;
        var start = args.start;
        var finish = args.finish;
        var text = data.substring(start - 1, finish);

        return text;
    }

    startsWith(args){
        var data = args.data;
        var text = args.text;

        return data.startsWith(text);
    }

    endsWith(args){
        var data = args.data;
        var text = args.text;

        return data.endsWith(text);
    }

    replace(args) {
        var data = args.data;
        var originalText = args.originalText;
        var replaceText = args.replaceText;
        var text = data.replace(originalText, replaceText);

        return text;
    }

    repeat(args){
        var data = args.data;
        var number = args.number;

        return data.repeat(number);
    }

    trim(args){
        return args.data.trim();
    }

    uppercase(args){
        return args.data.toUpperCase();
    }

    lowerCase(args){
        return args.data.toLowerCase();
    }
    
}

module.exports = dataProcessing;
