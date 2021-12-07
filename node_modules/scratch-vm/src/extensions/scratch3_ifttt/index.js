const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

const menuIconURI = null;
const blockIconURI = null;

const defaultValue = '';
let theLocale = null;

class gasoIFTTT {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        // communication related
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension('gasoIFTTT', this);
        // session callbacks
        this.reporter = null;
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.write = this.write.bind(this);
        // string op
        this.decoder = new TextDecoder();
        this.lineBuffer = '';
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
            id: 'gasoIFTTT',
            name: 'IFTTT',
            color1: '#4a90e2',
            color2: '#4a90e2',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'fetchIFTTT',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        key: {
                            type: ArgumentType.STRING,
                            defaultValue: 'key'
                        },
                        event: {
                            type: ArgumentType.STRING,
                            defaultValue: 'event'
                        },
                        value1: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        value2: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        value3: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        }
                    },
                    text: msg.fetchIFTTT[theLocale]
                }
            ]
        };
    }

    fetchIFTTT(args) {
        const key = args.key;
        const event = args.event;
        const value1 = args.value1 || defaultValue;
        const value2 = args.value2 || defaultValue;
        const value3 = args.value3 || defaultValue;
        const originalURL = `https://maker.ifttt.com/trigger/${event}/with/key/${key}?value1=${value1}&value2=${value2}&value3=${value3}`;
        return fetch(originalURL, {
            mode: 'no-cors',
            method: 'POST'
        }).catch(error => console.error('Error:', error));
    }
}

module.exports = gasoIFTTT;
