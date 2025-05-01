const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');
const ml5 = require('ml5');
const menuIconURI = null;
const blockIconURI = null;

const defaultId = 'default';

let theLocale = null;

class stockInfo {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension('stockInfo', this);
        this.reporter = null;
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.write = this.write.bind(this);

        this.decoder = new TextDecoder();
        this.lineBuffer = '';

        this.stockData = "";
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
            id: 'stockInfo',
            name: msg.title[theLocale],
            color1: '#2C5862',
            color2: '#2C5862',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'realTimeStockData',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        option: {
                            type: ArgumentType.STRING,
                            menu: 'selectClass',
                            defaultValue: '1'
                        },
                        code: {
                            type: ArgumentType.STRING,
                            defaultValue: '2330'
                        },
                        field: {
                            type: ArgumentType.STRING,
                            menu: 'stockField',
                            defaultValue: '選擇欄位'
                        },
                    },
                    text: msg.realTimeStockData[theLocale]
                },
            ],
            menus: {
                selectClass: {
                    acceptReporters: true,
                    items: [
                        {
                            text: msg.TSE[theLocale],
                            value: '1'
                        },
                        {
                            text: msg.OTC[theLocale],
                            value: '2'
                        },
                    ],
                },
                stockField: {
                    acceptReporters: true,
                    items: 'getStockField',
                },
            }
        };
    }

    getStockField() {
        var FieldName = ["選擇欄位", "公司簡稱", "公司全名", "開盤價", "昨日收盤價", "最高價", "最低價", "成交價", "成交量", "累積成交量", "交易日期", "交易時間"];

        return FieldName;
    }

    async fetchTseOrOtcStock(a, b, c) {
        var option = a;
        var stockCode = b;
        var field = c;

        var FieldName = ["公司簡稱", "公司全名", "開盤價", "昨日收盤價", "最高價", "最低價", "成交價", , "成交量", "累積成交量", "交易日期", "交易時間"];
        var FieldNameIndex = FieldName.indexOf(field);
        var FieldCode = ["n", "nf", "o", "y", "h", "l", "z", "tv", "v", "d", "t"];

        var tseURL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_' + stockCode + '.tw&json=1&delay=0';
        var tseURL = encodeURIComponent(tseURL);
        
        var otcURL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=otc_' + stockCode + '.tw&json=1&delay=0';
        var otcURL = encodeURIComponent(otcURL);

        var corsURL = 'https://script.google.com/macros/s/AKfycbwl9X5GtnL20B4WjxqlZAhTpw5hvO0qY23gBCx9TTL2Wg1O_tig2RN_gfSgxH8EuVuR/exec';

        var URL = option == 1 ? corsURL + '?url=' + tseURL : corsURL + '?url=' + otcURL;

        await fetch(URL).then(response => {
            if (response.ok) {
                response.json().then(json => {
                    var realTimeData = JSON.stringify(json["msgArray"][0]);
                    var data = JSON.parse(realTimeData)[FieldCode[FieldNameIndex]];
                    this.stockData = data;
                });
            }
        });

    }

    async realTimeStockData(args) {
        var option = args.option;
        var stockCode = args.code;
        var field = args.field;

        this.stockData = "";

        if (field != "選擇欄位") {
            this.fetchTseOrOtcStock(option, stockCode, field);
            await this.fetchTseOrOtcStock(option, stockCode, field);
            this.fetchTseOrOtcStock(option, stockCode, field);

            return this.stockData;
        }
        else
            return "請選擇欄位";
    }
}

module.exports = stockInfo;
