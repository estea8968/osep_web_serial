const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');
//add by estea
const ml5 = require('ml5');

const menuIconURI = null;
const blockIconURI = null;

const defaultValue = '';
let theLocale = null;

let ts_writekey ='';
let ts_write_data ='';
const en_field = ['field1','field2','field3','field4','field5','field6','field7','field8'];

class gasoThingSpeak {
    constructor (runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        // communication related
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension('gasoThingSpeak', this);
        // session callbacks
        this.reporter = null;
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.write = this.write.bind(this);
        // string op
        this.decoder = new TextDecoder();
        this.lineBuffer = '';
        //jsondata from estea
        this.jsondata = {};
    }

    onclose () {
        this.session = null;
    }

    write (data, parser = null) {
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

    onmessage (data) {
        const dataStr = this.decoder.decode(data);
        this.lineBuffer += dataStr;
        if (this.lineBuffer.indexOf('\n') !== -1){
            const lines = this.lineBuffer.split('\n');
            this.lineBuffer = lines.pop();
            for (const l of lines) {
                if (this.reporter) {
                    const {parser, resolve} = this.reporter;
                    resolve(parser(l));
                }
            }
        }
    }
/*
    scan () {
        this.comm.getDeviceList().then(result => {
            this.runtime.emit(this.runtime.constructor.PERIPHERAL_LIST_UPDATE, result);
        });
    }
*/
    _setLocale () {
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

    getInfo () {
        theLocale = this._setLocale();

        return {
            id: 'gasoThingSpeak',
            name: msg.name[theLocale],
            color1: '#4a90e2',
            color2: '#4a90e2',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'TS_Writekey',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.TS_Writekey[theLocale]
                },
                {
                    opcode: 'TS_col',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLUMN: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.field[theLocale][0],
                            menu:'field'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.TS_col[theLocale]
                },
                
                {
                    opcode: 'Write_TS',
                    blockType: BlockType.COMMAND,
                    text:msg.Write_TS[theLocale]
                },
                {
                    opcode: 'TS_Read',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        CHANNEL:{
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        }
                    },
                    text: msg.TS_Read[theLocale]
                },
                {
                    opcode: 'TS_JSON',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        id: {
                            type: ArgumentType.STRING,
                            defaultValue: 'id'
                        }
                    },
                    text: msg.readJSON[theLocale]
                },
                '---',
                /*{
                    opcode: 'thingBoard',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        url:{
                            type: ArgumentType.STRING,
                            defaultValue:'https://thingsboard.io/'
                        },
                        key: {
                            type: ArgumentType.STRING,
                            defaultValue: 'key'
                        },
                        value1: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        }
                    },
                    text: msg.thingBoard[theLocale]
                }*/
            ],
            menus: {
                
                
                field: {
                    acceptReporters: true,
                    items:msg.field[theLocale]
                    //items: ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8'],
                },
            }
        };
    }

    TS_Writekey (args){
        ts_key = args.KEY;
        ts_write_data ='';
    }

    TS_col(args){
        let column = args.COLUMN;
        let i=0;
        for( i==0;i<en_field.length;i++){
            if (column == msg.field[theLocale][i]){
                column =en_field[i];
                break;
            }
            
        }
        ts_write_data = ts_write_data+'&'+column+'='+args.VALUE;
    }

    Write_TS(args){
        
        //https://api.thingspeak.com/update?api_key=NKK41CPEBQDC5FDG&field2=28&field3=15
        const originalURL = `https://api.thingspeak.com/update?api_key=${ts_key}${ts_write_data}`
        console.log(originalURL);
        return fetch(originalURL, {
            method: 'GET'
        }).catch(error => console.error('Error:', error));
    }
///

    async TS_Read (args){
        const ts_Readkey = args.KEY;
        const ts_channel = args.CHANNEL;
        const url =  'https://api.thingspeak.com/channels/'+ts_channel+'/feeds.json?api_key='+ts_Readkey;
        //url:        https://api.thingspeak.com/channels/1597889/feeds.json?api_key=9A7CO04Z340N1MZT&results=2
        await fetch(url).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    //console.log("got json set", json);
                    this.jsondata.data = JSON.stringify(json);
                    parsed = JSON.parse(this.jsondata.data);
                    const data = parsed['feeds'];
                    console.log('data:',data);
                    typeof data === 'string' ? data : JSON.stringify(data);
                    this.jsondata.data = JSON.stringify(data);
                    this.jsondata.fetched = true;
                    return this.jsondata.data;
                });
            }
        })
    }

    TS_JSON () {
        if (this.isDataFetched()) {
            console.log('return ', this.jsondata.data);
            return this.jsondata.data;
        }
        return msg.readJSONErr[theLocale];
    }

    isDataFetched () {
        return this.jsondata.fetched;
    }

    /*
    fetch_TS (args) {
        const url = args.url;
        https://api.thingspeak.com/channels/1597889/feeds.json?api_key=9A7CO04Z340N1MZT&results=2
        let cors_url = 'https://cors-anywhere.herokuapp.com/';

        return await fetch(url).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    //console.log("got json set", json);
                    this.data.fetched = true;
                    this.data.data = JSON.stringify(json);
                    this.runtime.startHats('gasoJSON_onJSONReceived', {});
                });
            }
        })
        .catch((error) => {
            console.log('----');
            var xmlhttpRequest = new XMLHttpRequest();
            xmlhttpRequest.open("GET", `${cors_url}${url}`);
            console.log(cors_url+url);
            xmlhttpRequest.setRequestHeader(
                "X-Requested-With",
                "XMLHttpRequest"
            );
            xmlhttpRequest.send();

            fetch(cors_url + url).then((res) => {
                if (res.ok) {
                    res.json().then((json) => {
                        this.data.fetched = true;
                        this.data.data = JSON.stringify(json);
                        this.runtime.startHats(
                            "gasoJSON_onJSONReceived",
                            {}
                        );
                    });
                }
            });
        });
    }*/

    thingBoard (args) {
    	const url = args.url;
    	const key = args.key;
        const value1 = args.value1 || defaultValue;
        const originalURL = url+ 'api/v1/'+key+'/telemetry';
        return fetch(originalURL, {
		headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json',
			},
        	method: 'POST',
		body: JSON.stringify({temperature: value1})    
        }).catch(error => console.error('Error:', error));
    }
}

module.exports = gasoThingSpeak;
