const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

var KoleksiItemset = require('simple-apriori/KoleksiItemset')
var Itemset = require('simple-apriori/Itemset.js')
var Apriori = require('simple-apriori/Apriori')

const menuIconURI = null;
const blockIconURI = null;

const defaultId = 'default';
let theLocale = null;

class dataMining {
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

        this.dataset = [];
        this.support = 50;
        this.confidence = 50;

        this.itemset = "";
        this.ruleset = "";
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
            id: 'dataMining',
            name: msg.title[theLocale],
            color1: '#320A37',
            color2: '#320A37',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'minimumSupport',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        support: {
                            type: ArgumentType.STRING,
                            defaultValue: "50"
                        },
                    },
                    text: msg.minimumSupport[theLocale]
                },
                {
                    opcode: 'minimumConfidence',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        confidence: {
                            type: ArgumentType.STRING,
                            defaultValue: "50"
                        },
                    },
                    text: msg.minimumConfidence[theLocale]
                },
                {
                    opcode: 'trainAssociationRules',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: "資料"
                        },
                    },
                    text: msg.trainAssociationRules[theLocale]
                },
                {
                    opcode: 'showItemset',
                    blockType: BlockType.REPORTER,
                    text: msg.itemset[theLocale]
                },
                {
                    opcode: 'showAssociationRules',
                    blockType: BlockType.REPORTER,
                    text: msg.associationRules[theLocale]
                },
            ],
        };
    }

    minimumSupport(arg) {
        if (0 <= arg.support && arg.support <= 100) this.support = arg.support;
        else return "請輸入 0 到 100 的最小支持度"
    }

    minimumConfidence(arg) {
        if (0 <= arg.confidence && arg.confidence <= 100) this.confidence = arg.confidence;
        else return "請輸入 0 到 100 的最小信賴度"
    }

    trainAssociationRules(arg) {
        var data = JSON.parse(arg.data);        // 資料來源
        var keys = Object.keys(data[0]);        // 欄位名稱
        var dataset = [];                       // 資料集
        var itemset = [];                       // 項目集
        var ruleset = [];                       // 關聯規則集
        var support = this.support;             // 最小支持度
        var confidence = this.confidence;       // 最小信賴度

        console.log("最小支持度：", support, " 最小信賴度：", confidence);

        alert(msg.pleaseWait[theLocale]);

        // 整理資料集
        for (var i = 0; i < data.length; i++) {
            var tmpData = "";
            for (var j = 0; j < keys.length; j++) {
                if (data[i][keys[j]] != "")
                    tmpData += `${data[i][keys[j]]}, `;
            }
            dataset.push(tmpData.slice(0, -2));
        }

        // 處理資料
        var db = new KoleksiItemset();

        for (var i in dataset) {
            var items = dataset[i].split(', ');
            db.push(Itemset.from(items));
        }

        // 計算項目集的支持度
        var supportData = parseFloat(support);
        var itemSupport = Apriori.getSupport(db, supportData);

        // 整理項目集
        for (var i = 0; i < itemSupport.length; i++) {
            var itemsKeys = Object.keys(itemSupport[i]);
            var tmpData = "";
            var tmpSupport = this.formatNumber(itemSupport[i]["Support"].toFixed(2));

            for (var j = 0; j < itemsKeys.length; j++) {
                if (itemsKeys[j] != "Support")
                    tmpData += itemSupport[i][j] + ",";
            }

            itemset.push({ ["項目"]: tmpData.slice(0, -1), ["支持度"]: tmpSupport });
        }

        this.itemset = JSON.stringify(itemset);
        console.log("項目集：");
        console.table(itemset);

        // 建立關聯規則
        var confidenceData = parseFloat(confidence);
        var rules = Apriori.getConfidence(db, itemSupport, confidenceData);

        // 整理關聯規則
        for (var i = 0; i < rules.length; i++) {
            var tmpData = "";
            var X = rules[i]["X"];
            var Y = rules[i]["Y"];
            var tmpSupport = this.formatNumber(rules[i]["Support"].toFixed(2));
            var tmpConfidence = this.formatNumber(rules[i]["Confidence"].toFixed(2));

            ruleset.push({ ["規則"]: `{${X}} -> {${Y}}`, ["支持度"]: tmpSupport, ["信賴度"]: tmpConfidence });
        }

        this.ruleset = JSON.stringify(ruleset);
        console.log("關聯規則：");
        console.table(ruleset);

        alert(msg.complete[theLocale]);
    }

    formatNumber(str) {
        if (str.endsWith('.00')) { return str.slice(0, -3); }
        if (str.endsWith('0')) { return str.slice(0, -1); }
        return str;
    }

    showItemset() {
        return this.itemset;
    }

    showAssociationRules() {
        return this.ruleset;
    }
}
module.exports = dataMining;
