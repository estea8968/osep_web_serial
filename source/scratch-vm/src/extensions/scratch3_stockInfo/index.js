const ArgumentType = require('scratch-vm/src/extension-support/argument-type');
const BlockType = require('scratch-vm/src/extension-support/block-type');
const msg = require('scratch-vm/src/extensions/scratch3_stockInfo/translation');
const formatMessage = require('format-message');

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

        this.realTimeData = "";
        this.stockName = "";
        this.stockData = "";
        this.stockZ = "";
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
            color1: '#525252',
            color2: '#6C6C6C',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'readInstantInfo',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        code: {
                            type: ArgumentType.STRING,
                            defaultValue: '2330'
                        },
                        field: {
                            type: ArgumentType.STRING,
                            menu: 'instantInfoSelectField',
                            defaultValue: '選擇欄位'
                        },
                    },
                    text: msg.instantInfo[theLocale]
                },
                '---',
                {
                    opcode: 'readTheStockName',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        code: {
                            type: ArgumentType.STRING,
                            defaultValue: '2330'
                        },
                    },
                    text: msg.stockCode[theLocale]
                },
                {
                    opcode: 'showStockName',
                    blockType: BlockType.REPORTER,
                    text: msg.stockName[theLocale],
                },
                '---',
                {
                    opcode: 'queryInformation',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        code: {
                            type: ArgumentType.STRING,
                            defaultValue: '2330'
                        },
                        year: {
                            type: ArgumentType.STRING,
                            menu: 'selectYear',
                            defaultValue: this.getNowYear()
                        },
                        month: {
                            type: ArgumentType.STRING,
                            menu: 'selectMonth',
                            defaultValue: this.getNowMonth()
                        },
                    },
                    text: msg.queryInformation[theLocale]
                },
                {
                    opcode: 'readStockData',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        date: {
                            type: ArgumentType.STRING,
                            menu: 'selectDate',
                            defaultValue: '選擇日期'
                        },
                        field: {
                            type: ArgumentType.STRING,
                            menu: 'stockDataSelectField',
                            defaultValue: '選擇欄位'
                        },
                    },
                    text: msg.readStockData[theLocale]
                },
                {
                    opcode: 'clearData',
                    blockType: BlockType.COMMAND,
                    text: msg.clearData[theLocale]
                },
                {
                    opcode: 'showStockFieldName',
                    blockType: BlockType.REPORTER,
                    text: msg.stockFieldName[theLocale],
                },
                {
                    opcode: 'showStockData',
                    blockType: BlockType.REPORTER,
                    text: msg.stockData[theLocale],
                },
            ],
            menus: {
                instantInfoSelectField: {
                    acceptReporters: true,
                    items: 'getInstantInfoSelectField',
                },
                selectYear: {
                    acceptReporters: true,
                    items: 'getSelectYear',
                },
                selectMonth: {
                    acceptReporters: true,
                    items: 'getSelectMonth',
                },
                selectDate: {
                    acceptReporters: true,
                    items: 'getSelectDate',
                },
                stockDataSelectField: {
                    acceptReporters: true,
                    items: 'getStockDataSelectField',
                }
            }
        };
    }

    getInstantInfoSelectField() {
        var FieldName = ["選擇欄位", "公司簡稱", "公司全名", "開盤價", "昨日收盤價", "最高價", "最低價", "成交價", "成交量", "累積成交量", "交易日期", "交易時間"];

        return FieldName;
    }

    readInstantInfo(args) {
        var queryStockCode = args.code;
        var queryField = args.field;

        var FieldName = ["公司簡稱", "公司全名", "開盤價", "昨日收盤價", "最高價", "最低價", "成交價", "成交量", "累積成交量", "交易日期", "交易時間"];
        var FieldNameIndex = FieldName.indexOf(queryField);
        var FieldCode = ["n", "nf", "o", "y", "h", "l", "z", "tv", "v", "d", "t"];

        var URL = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_' + queryStockCode + '.tw';
        const url = encodeURIComponent(URL);
        let cors_url = 'https://script.google.com/macros/s/AKfycbwl9X5GtnL20B4WjxqlZAhTpw5hvO0qY23gBCx9TTL2Wg1O_tig2RN_gfSgxH8EuVuR/exec';

        if (queryField != "選擇欄位") {
            fetch(cors_url + '?url=' + url).then(response => {
                if (response.ok) {
                    response.json().then(json => {
                        this.realTimeData = JSON.stringify(json["msgArray"][0]);
                    });
                }
            });

            var tmp = JSON.parse(this.realTimeData)[FieldCode[FieldNameIndex]]

            if (tmp != "-") this.stockZ = tmp;

            return this.stockZ;
        }
        else
            return "請選擇欄位";
    }

    readTheStockName(args) {
        var queryStockCode = args.code;
        var URL = 'https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&stockNo=' + queryStockCode;
        const url = encodeURIComponent(URL);
        let cors_url = 'https://script.google.com/macros/s/AKfycbwl9X5GtnL20B4WjxqlZAhTpw5hvO0qY23gBCx9TTL2Wg1O_tig2RN_gfSgxH8EuVuR/exec';

        fetch(cors_url + '?url=' + url).then(response => {
            if (response.ok) {
                response.json().then(json => {
                    if (json["stat"] == "OK")
                        this.stockName = json["title"].split(" ")[2];
                    else
                        this.stockName = "查無資料";
                });
            }
        });
    }

    getNowYear() {
        var getDate = new Date();
        var nowYear = getDate.getFullYear();

        return nowYear;
    }

    getSelectYear() {
        var year = [];

        for (var i = this.getNowYear(); i >= 2010; i--)
            year.push(i.toString());

        return year;
    }

    getNowMonth() {
        var getDate = new Date();
        var nowMonth = getDate.getMonth() + 1;

        return nowMonth;
    }

    getSelectMonth() {
        var month = [];

        for (var i = 1; i <= 12; i++)
            month.push(i.toString());

        return month;
    }

    queryInformation(args) {
        var queryCode = args.code;
        var queryYear = args.year;
        var queryMonth = args.month.toString().padStart(2, '0');
        var URL = 'https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=' + queryYear + queryMonth + '01&stockNo=' + queryCode;
        const url = encodeURIComponent(URL);
        let cors_url = 'https://script.google.com/macros/s/AKfycbwl9X5GtnL20B4WjxqlZAhTpw5hvO0qY23gBCx9TTL2Wg1O_tig2RN_gfSgxH8EuVuR/exec';

        fetch(cors_url + '?url=' + url).then(response => {
            if (response.ok) {
                response.json().then(json => {
                    if (json["stat"] == "OK") {
                        this.stockName = json["title"].split(" ")[2];
                        this.stockData = JSON.stringify(json["data"]);
                    }
                    else
                        this.stockName = this.stockData = "查無資料";
                });
            }
        })
    }

    getSelectDate() {
        var date = ['選擇日期'];

        if (this.stockData != "" && this.stockData != "查無資料") {
            var stockData = JSON.parse(this.stockData);
            for (var i = 0; i < stockData.length; i++)
                date.push(stockData[i][0].toString());
        }

        return date;
    }

    getStockDataSelectField() {
        var FieldName = ["選擇欄位", "成交股數", "成交金額", "開盤價", "最高價", "最低價", "收盤價", "漲跌價差", "成交筆數"];

        return FieldName;
    }

    readStockData(args) {
        if (this.stockData != "" && this.stockData != "查無資料") {
            var stockData = JSON.parse(this.stockData);
            var queryDate = args.date;
            var queryField = args.field;
            var FieldName = ["選擇欄位", "成交股數", "成交金額", "開盤價", "最高價", "最低價", "收盤價", "漲跌價差", "成交筆數"];
            var FieldNameIndex = FieldName.indexOf(queryField);
            var getData = null;

            for (var i = 0; i < stockData.length; i++) {
                if (stockData[i][0] == queryDate)
                    getData = stockData[i][FieldNameIndex];
            }

            return getData;
        }
        else
            return "請查詢股票資料";
    }

    clearData() {
        this.stockName = this.stockData = "";

        return "資料已清除";
    }

    showStockFieldName() {
        var FieldName = ["日期", "成交股數", "成交金額", "開盤價", "最高價", "最低價", "收盤價", "漲跌價差", "成交筆數"];
        var text = '';

        for (var i = 0; i < FieldName.length; i++)
            text += FieldName[i] + ',';

        return text;
    }

    showStockName() {
        if (this.stockName != "")
            return this.stockName;
        else
            return "";
    }

    showStockData() {
        if (this.stockData != "")
            return this.stockData;
        else
            return "";
    }
}

module.exports = stockInfo;
