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
                            defaultValue: '二進制'
                        },
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: '1010'
                        },
                        after: {
                            type: ArgumentType.STRING,
                            menu: 'selectYear',
                            defaultValue: '十進制'
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
                            defaultValue: 'data'
                        },
                        start: {
                            type: ArgumentType.STRING,
                            defaultValue: '1'
                        },
                        finish: {
                            type: ArgumentType.STRING,
                            defaultValue: '1'
                        },
                    },
                    text: msg.substring[theLocale]
                },
                {
                    opcode: 'split',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'data'
                        },
                        separator: {
                            type: ArgumentType.STRING,
                            defaultValue: 'a'
                        },
                        number: {
                            type: ArgumentType.STRING,
                            defaultValue: '1'
                        },
                    },
                    text: msg.split[theLocale]
                },
                {
                    opcode: 'search',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        text: {
                            type: ArgumentType.STRING,
                            defaultValue: 'a'
                        },
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'data'
                        },
                    },
                    text: msg.search[theLocale]
                },
                "---",
                {
                    opcode: 'includes',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'data'
                        },
                        text: {
                            type: ArgumentType.STRING,
                            defaultValue: 'text'
                        },
                    },
                    text: msg.includes[theLocale]
                },
                {
                    opcode: 'startsWith',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'data'
                        },
                        text: {
                            type: ArgumentType.STRING,
                            defaultValue: 'd'
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
                            defaultValue: 'data'
                        },
                        text: {
                            type: ArgumentType.STRING,
                            defaultValue: 'a'
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
                            defaultValue: 'data'
                        },
                        originalText: {
                            type: ArgumentType.STRING,
                            defaultValue: 'd'
                        },
                        replaceText: {
                            type: ArgumentType.STRING,
                            defaultValue: 'text'
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
                            defaultValue: 'data'
                        },
                        number: {
                            type: ArgumentType.STRING,
                            defaultValue: '3'
                        },
                    },
                    text: msg.repeat[theLocale]
                },
                "---",
                {
                    opcode: 'uppercase',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello World!'
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
                            defaultValue: 'Hello World!'
                        },
                    },
                    text: msg.lowerCase[theLocale]
                },

            ],
            menus: {
                selectYear: {
                    acceptReporters: true,
                    items: ["二進制", "八進制", "十進制", "十六進制"],
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
            case "二進制": convertToDecimal = parseInt(data, 2); break;
            case "八進制": convertToDecimal = parseInt(data, 8); break;
            case "十六進制": convertToDecimal = parseInt(data, 16); break;
            default: convertToDecimal = parseInt(data, 10); break;
        }

        switch (afterConversion) {
            case "二進制": convertToOtherBases = convertToDecimal.toString(2); break;
            case "八進制": convertToOtherBases = convertToDecimal.toString(8); break;
            case "十六進制": convertToOtherBases = convertToDecimal.toString(16); break;
            default: convertToOtherBases = convertToDecimal.toString(10);; break;
        }

        return convertToOtherBases.toString();
    }

    substring(args) {
        var data = args.data;
        var start = args.start;
        var finish = args.finish;
        var text = data.substring(start - 1, finish);

        return text.toString();
    }

    split(args) {
        var data = args.data;
        var separator = args.separator;
        var number = args.number < 1 ? 0 : args.number - 1;
        var text = data.split(separator)[number];

        return text.toString();
    }

    search(args){
        var data = args.data;
        var text = args.text;

        return (data.search(text) + 1).toString();
    }

    includes(args) {
        var data = args.data;
        var text = args.text;
        var text = data.includes(text) ? true : false;

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

        return text.toString();
    }

    repeat(args){
        var data = args.data;
        var number = args.number;

        return data.repeat(number).toString();
    }

    uppercase(args){
        return args.data.toUpperCase().toString();
    }

    lowerCase(args){
        return args.data.toLowerCase().toString();
    }
    
}

module.exports = dataProcessing;
