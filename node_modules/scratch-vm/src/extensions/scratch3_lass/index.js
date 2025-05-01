const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');
const ml5 = require('ml5');
const menuIconURI = null;
const blockIconURI = null;

const LASS_URI = 'https://pm25.lass-net.org/data/last.php?device_id=';
const AQI_URI = 'https://data.moenv.gov.tw/api/v2/aqx_p_432?api_key=e8dd42e6-9b8b-43f8-991e-b3dee723a52d&limit=1000&sort=ImportDate%20desc&format=json';
const WERTHER_URL = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?format=JSON&Authorization=';

let theLocale = null;

class gasoLASS {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension('gasoLASS', this);
        this.reporter = null;
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.write = this.write.bind(this);

        this.decoder = new TextDecoder();
        this.lineBuffer = '';

        this.LASSData = {};
        this.fetched = false;

        this.getEPAStation();
        this.siteName = ["基隆"];
        this.EPAData = {};

        this.weatherData = {};
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
            id: 'gasoLASS',
            name: 'LASS',
            color1: '#4a90e2',
            color2: '#4a90e2',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'openAirmapG0v',
                    blockType: BlockType.COMMAND,
                    text: msg.openAirmapG0v[theLocale]
                },
                {
                    opcode: 'fetchLASS',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        id: {
                            type: ArgumentType.STRING,
                            defaultValue: "08BEAC245D70"
                        }
                    },
                    text: msg.fetchLASS[theLocale]
                },
                {
                    opcode: 'onLASSReceived',
                    blockType: BlockType.HAT,
                    isEdgeActivated: false,
                    arguments: {},
                    text: msg.onLASSReceived[theLocale]
                },
                {
                    opcode: 'parseAttrFromLASS',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        attr: {
                            type: ArgumentType.STRING,
                            menu: 'lassAttrs',
                            defaultValue: 'PM2.5'
                        }
                    },
                    text: msg.parseAttrFromLASS[theLocale]
                },
                "---",
                {
                    opcode: 'getEPAData',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        siteName: {
                            type: ArgumentType.STRING,
                            menu: 'sitename',
                            defaultValue: "基隆"
                        },
                        attr: {
                            type: ArgumentType.STRING,
                            menu: 'EPAAttrs',
                            defaultValue: 'aqi',
                        }
                    },
                    text: msg.getEPAData[theLocale]
                },
                {
                    opcode: 'EPAStation',
                    blockType: BlockType.REPORTER,
                    text: msg.EPAStation[theLocale]
                },
                "---",
                {
                    opcode: 'authorization',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        apiKey: {
                            type: ArgumentType.STRING,
                            defaultValue: "API Key"
                        }
                    },
                    text: msg.authorization[theLocale]
                },
                {
                    opcode: 'getWeatherData',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        locationName: {
                            type: ArgumentType.STRING,
                            menu: 'locationName',
                            defaultValue: msg.taipeiCity[theLocale]
                        },
                        forecastTime: {
                            type: ArgumentType.NUMBER,
                            menu: 'forecastTime',
                            defaultValue: '12'
                        },
                        weatherAttrs: {
                            type: ArgumentType.STRING,
                            menu: 'weatherAttrs',
                            defaultValue: msg.Wx[theLocale]
                        }
                    },
                    text: msg.getWeatherData[theLocale]
                },
            ],
            menus: {
                lassAttrs: {
                    acceptReporters: true,
                    items: ["PM2.5", msg.tempc[theLocale], msg.humidity[theLocale], msg.time[theLocale]],
                },
                sitename: {
                    acceptReporters: true,
                    items: 'get_sitename_items',
                },
                EPAAttrs: {
                    acceptReporters: true,
                    items: [
                        { text: 'AQI', value: 'aqi' },
                        { text: 'PM2.5', value: 'pm2.5' },
                        { text: 'PM10', value: 'pm10' },
                        { text: 'O3', value: 'o3' },
                        { text: msg.publishTime[theLocale], value: 'publishtime' }
                    ]
                },
                locationName: {
                    acceptReporters: true,
                    items: [
                        msg.taipeiCity[theLocale],
                        msg.newTaipeiCity[theLocale],
                        msg.taoyuanCity[theLocale],
                        msg.taichungCity[theLocale],
                        msg.tainanCity[theLocale],
                        msg.kaohsiungCity[theLocale],
                        msg.keelungCity[theLocale],
                        msg.hsinchuCounty[theLocale],
                        msg.hsinchuCity[theLocale],
                        msg.miaoliCounty[theLocale],
                        msg.changhuaCounty[theLocale],
                        msg.nantouCounty[theLocale],
                        msg.yunlinCounty[theLocale],
                        msg.chiayiCounty[theLocale],
                        msg.chiayiCity[theLocale],
                        msg.pingtungCounty[theLocale],
                        msg.yilanCounty[theLocale],
                        msg.hualienCounty[theLocale],
                        msg.taitungCounty[theLocale],
                        msg.penghuCounty[theLocale],
                        msg.kinmenCounty[theLocale],
                        msg.lienchiangCounty[theLocale],
                    ]
                },
                forecastTime: {
                    acceptReporters: true,
                    items: ['12', '24', '36']
                },
                weatherAttrs: {
                    acceptReporters: true,
                    items: [msg.Wx[theLocale], msg.MaxT[theLocale], msg.MinT[theLocale], msg.CI[theLocale], msg.PoP[theLocale]]
                },
            }
        };
    }

    openAirmapG0v() {
        window.open("https://list.airmap.g0v.tw/");
    }

    async fetchLASS(args) {
        const id = args.id;
        const url = `${LASS_URI}${id}`;

        await fetch(url).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    var jsonData = JSON.stringify(json);
                    var feeds = JSON.parse(jsonData)["feeds"]
                    var AirBox = feeds.length == 1 ? feeds[0]["AirBox"] : "設備不存在";
                    this.fetched = true;
                    this.LASSData = AirBox;
                    this.runtime.startHats('gasoLASS_onLASSReceived', {});
                });
            }
        });
    }

    onLASSReceived() {
        if (this.fetched) return true;
    }

    parseAttrFromLASS(args) {
        var attr = args.attr;
        console.log(this.LASSData);
        if (this.fetched) {
            if (attr == "PM2.5")
                return this.LASSData["s_d0"];
            if (attr == msg.tempc[theLocale])
                return this.LASSData["s_t0"];
            if (attr == msg.humidity[theLocale])
                return this.LASSData["s_h0"];
            if (attr == msg.time[theLocale]) {
                var date = this.LASSData["timestamp"].substring(0, 10);
                var dateTime = date + " " + this.LASSData["time"];
                return dateTime;
            }
        }
        return msg.readFromLASSErr[theLocale];
    }

    get_sitename_items() {
        return this.siteName;
    }

    async getEPAStation() {
        await fetch(AQI_URI).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    var jsonData = JSON.stringify(json);
                    var parseData = JSON.parse(jsonData);
                    var length = parseData["records"].length;

                    for (var i = 1; i < length; i++) {
                        var tmpSitename = parseData["records"][i]["sitename"];
                        this.siteName.push(tmpSitename);
                    }
                });
            }
        })
    }

    EPAStation() {
        var siteName = "";
        for (var i = 0; i < this.siteName.length; i++)
            siteName += this.siteName[i] + ", ";
        return siteName;
    }

    async fetchEPAData(siteName, attr) {
        await fetch(AQI_URI).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    var jsonData = JSON.stringify(json);
                    var parseData = JSON.parse(jsonData);
                    var length = parseData["records"].length;

                    for (var i = 0; i < length; i++) {
                        var tmpSitename = parseData["records"][i]["sitename"];

                        if (siteName == tmpSitename) {
                            this.EPAData = parseData["records"][i][attr];
                        }
                    }
                });
            }
        });
    }

    async getEPAData(args) {
        var siteName = args.siteName;
        var attr = args.attr;

        // 待想辦法
        this.fetchEPAData(siteName, attr);
        await this.fetchEPAData(siteName, attr);
        this.fetchEPAData(siteName, attr);

        return this.EPAData;
    }

    authorization(args) {
        var apiKey = args.apiKey;
        const url = `${WERTHER_URL}${apiKey}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                this.weatherData = data;
            });
    }

    getWeatherData(args) {
        var locationName = args.locationName;
        var forecastTime = args.forecastTime;
        var weatherAttrs = args.weatherAttrs;

        var locationMap = {
            [msg.taipeiCity[theLocale]]: 5,
            [msg.newTaipeiCity[theLocale]]: 1,
            [msg.taoyuanCity[theLocale]]: 13,
            [msg.taichungCity[theLocale]]: 11,
            [msg.tainanCity[theLocale]]: 6,
            [msg.kaohsiungCity[theLocale]]: 15,
            [msg.keelungCity[theLocale]]: 18,
            [msg.hsinchuCounty[theLocale]]: 3,
            [msg.hsinchuCity[theLocale]]: 4,
            [msg.miaoliCounty[theLocale]]: 8,
            [msg.changhuaCounty[theLocale]]: 20,
            [msg.nantouCounty[theLocale]]: 14,
            [msg.yunlinCounty[theLocale]]: 9,
            [msg.chiayiCounty[theLocale]]: 0,
            [msg.chiayiCity[theLocale]]: 2,
            [msg.pingtungCounty[theLocale]]: 17,
            [msg.yilanCounty[theLocale]]: 7,
            [msg.hualienCounty[theLocale]]: 10,
            [msg.taitungCounty[theLocale]]: 12,
            [msg.penghuCounty[theLocale]]: 19,
            [msg.kinmenCounty[theLocale]]: 16,
            [msg.lienchiangCounty[theLocale]]: 21
        };

        locationName = locationMap[locationName];

        var forecastTimeMap = {
            '12': 0,
            '24': 1,
            '36': 2,
        };

        forecastTime = forecastTimeMap[forecastTime];

        var weatherAttrsMap = {
            [msg.Wx[theLocale]]: 0,
            [msg.MaxT[theLocale]]: 4,
            [msg.MinT[theLocale]]: 2,
            [msg.CI[theLocale]]: 3,
            [msg.PoP[theLocale]]: 1
        };

        weatherAttrs = weatherAttrsMap[weatherAttrs];

        var jsonData = JSON.stringify(this.weatherData);
        var parseData = JSON.parse(jsonData);

        var wx8 = parseData["records"]["location"][locationName]["weatherElement"][weatherAttrs]["time"][forecastTime]["parameter"]["parameterName"];

        return wx8;
    }
}

module.exports = gasoLASS;
