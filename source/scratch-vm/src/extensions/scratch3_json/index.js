const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');
const xml2js = require('xml2js');
//async add estea
const ml5 = require('ml5');
const { result } = require('lodash');
//require('babel-polyfill');
//end
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgd2lkdGg9IjE1MCIKICAgaGVpZ2h0PSIxNDkuOTk5NzciCiAgIHZpZXdCb3g9IjAgMCAxNS4zNiAxNS4zNTk5NzciCiAgIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmc0MjgiCiAgIHNvZGlwb2RpOmRvY25hbWU9Impzb24uc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIxLjIuMiAoYjBhODQ4NjU0MSwgMjAyMi0xMi0wMSwgY3VzdG9tKSIKICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9Im5hbWVkdmlldzQzMCIKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMS4wIgogICAgIGlua3NjYXBlOnNob3dwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgaW5rc2NhcGU6cGFnZWNoZWNrZXJib2FyZD0iMCIKICAgICBpbmtzY2FwZTpkZXNrY29sb3I9IiNkMWQxZDEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOnpvb209IjAuMTI1IgogICAgIGlua3NjYXBlOmN4PSIxNDA0IgogICAgIGlua3NjYXBlOmN5PSIxNDIwIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTI5NCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI3MDQiCiAgICAgaW5rc2NhcGU6d2luZG93LXg9IjcyIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIyNyIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzQyOCIgLz4KICA8ZGVmcwogICAgIGlkPSJkZWZzNDIyIj4KICAgIDxsaW5lYXJHcmFkaWVudAogICAgICAgeDE9IjM5LjEwOTkxMyIKICAgICAgIHkxPSIzNi42NTQzNDMiCiAgICAgICB4Mj0iMjI1LjQwMzk4IgogICAgICAgeTI9IjIxMS4yNDA5MSIKICAgICAgIGlkPSJhIgogICAgICAgZ3JhZGllbnRUcmFuc2Zvcm09InNjYWxlKDAuOTY4MDc0NDQsMS4wMzI5Nzg0KSIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHN0b3AKICAgICAgICAgb2Zmc2V0PSIwJSIKICAgICAgICAgaWQ9InN0b3A0MTIiIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIHN0b3AtY29sb3I9IiNGRkYiCiAgICAgICAgIG9mZnNldD0iMTAwJSIKICAgICAgICAgaWQ9InN0b3A0MTQiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50CiAgICAgICB4MT0iMjQwLjAzOTM1IgogICAgICAgeTE9IjE5OC4zNjE0IgogICAgICAgeDI9IjQxLjY1MDM5MSIKICAgICAgIHkyPSIzNC40MTkyMDkiCiAgICAgICBpZD0iYiIKICAgICAgIGdyYWRpZW50VHJhbnNmb3JtPSJzY2FsZSgwLjkwOTA1MjQsMS4xMDAwNDY2KSIKICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHN0b3AKICAgICAgICAgb2Zmc2V0PSIwJSIKICAgICAgICAgaWQ9InN0b3A0MTciIC8+CiAgICAgIDxzdG9wCiAgICAgICAgIHN0b3AtY29sb3I9IiNGRkYiCiAgICAgICAgIG9mZnNldD0iMTAwJSIKICAgICAgICAgaWQ9InN0b3A0MTkiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8ZwogICAgIGlkPSJnNTc0IgogICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuMDYsMCwwLDAuMDYsMCwtMi4zNTgyNDYyZS01KSI+CiAgICA8cGF0aAogICAgICAgZD0iTSAxMjcuNzgzLDE5MC41NiBDIDE4NC40MiwyNjcuNzY4IDIzOS44NDcsMTY5LjAxIDIzOS43NjUsMTA5LjYyIDIzOS42NywzOS40MDQgMTY4LjUsMC4xNiAxMjcuNzM3LDAuMTYgNjIuMzA5LDAuMTU5IDAsNTQuMjMyIDAsMTI4LjIxNiAwLDIxMC40NSA3MS40MjUsMjU2IDEyNy43MzcsMjU2IDExNC45OTQsMjU0LjE2NSA3Mi41MjcsMjQ1LjA2NiA3MS45NTcsMTQ3LjI1MyA3MS41NzIsODEuMDk5IDkzLjUzNyw1NC42NjggMTI3LjY0NSw2Ni4yOTUgYyAwLjc2NCwwLjI4MyAzNy42MjIsMTQuODIzIDM3LjYyMiw2Mi4zMiAwLDQ3LjI5NiAtMzcuNDg0LDYxLjk0NCAtMzcuNDg0LDYxLjk0NCB6IgogICAgICAgZmlsbD0idXJsKCNhKSIKICAgICAgIGlkPSJwYXRoNDI0IgogICAgICAgc3R5bGU9ImZpbGw6dXJsKCNhKSIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJNIDEyNy43MTcsNjYuMjQxIEMgOTAuMjkzLDUzLjM0MiA0NC40NDgsODQuMTg3IDQ0LjQ0OCwxNDUuOTY3IDQ0LjQ0OCwyNDYuODQ0IDExOS4yMDEsMjU2IDEyOC4yNjMsMjU2IDE5My42OTEsMjU2IDI1NiwyMDEuOTI2IDI1NiwxMjcuOTQzIDI1Niw0NS43MDkgMTg0LjU3NSwwLjE1OSAxMjguMjYzLDAuMTU5IGMgMTUuNTk3LC0yLjE2IDg0LjA2NSwxNi44OCA4NC4wNjUsMTEwLjQ1OCAwLDYxLjAyNiAtNTEuMTI0LDk0LjI0OCAtODQuMzc2LDgwLjA1NCAtMC43NjQsLTAuMjgzIC0zNy42MjMsLTE0LjgyMyAtMzcuNjIzLC02Mi4zMiAwLC00Ny4yOTcgMzcuMzg4LC02Mi4xMSAzNy4zODgsLTYyLjExIHoiCiAgICAgICBmaWxsPSJ1cmwoI2IpIgogICAgICAgaWQ9InBhdGg0MjYiCiAgICAgICBzdHlsZT0iZmlsbDp1cmwoI2IpIiAvPgogIDwvZz4KPC9zdmc+Cg==';
const blockIconURI = menuIconURI;
//2.4
//let cors_url ='https://script.google.com/macros/s/AKfycbzF0Bvv27nBC3xXdAYRzM4ZIvoipG0cOHVM_NniomcySjs0PKyQHBBKJBje9q-oeZTW/exec';
//2.5
let cors_url ='https://script.google.com/macros/s/AKfycbzRvs-7yVYjIgMGqjbvmydBQScWWI-jABP-VAlekJhqYeNyDvId2JRxFG7mhnJZt2pv/exec';
const defaultId = 'default';
let theLocale = null;

class gasoJSON {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        // communication related
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension('gasoJSON', this);
        // session callbacks
        this.reporter = null;
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.write = this.write.bind(this);
        // string op
        this.decoder = new TextDecoder();
        this.lineBuffer = '';
        this.data = {};
        //estea
        this.jsoncol = {};
        //estea end
        this.emptyObj = {
            VALUE: {}
        };
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
            id: 'gasoJSON',
            name: 'JSON',
            color1: '#4a90e2',
            color2: '#4a90e2',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'fetchJSON',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        url: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://'
                        },
                    },
                    text: msg.fetchJSON[theLocale]
                },
                {
                    opcode: 'corsfetchJSON',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        url: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://'
                        },
                    },
                    text: msg.corsfetchJSON[theLocale]
                },
                {
                    opcode: 'fetchCSV',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        url: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://'
                        },
                    },
                    text: msg.fetchCSV[theLocale]
                },
                {
                    opcode: 'fetchTXT',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        url: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://'
                        },
                    },
                    text: msg.fetchTXT[theLocale]
                },
                {
                    opcode: 'fetchXML',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        url: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://'
                        },
                    },
                    text: msg.fetchXML[theLocale]
                },
                {
                    opcode: 'openCorsSite',
                    blockType: BlockType.COMMAND,
                    text: msg.openCORS[theLocale]
                },
                {
                    opcode: "clearJSONData",
                    blockType: BlockType.COMMAND,
                    text: msg.clearJSONData[theLocale],
                },
                "---",
                {
                    opcode: 'onJSONReceived',
                    blockType: BlockType.HAT,
                    isEdgeActivated: false,
                    arguments: {},
                    text: msg.onJSONReceived[theLocale]
                },
                "---",
                {
                    opcode: 'readFromJSON',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        id: {
                            type: ArgumentType.STRING,
                            defaultValue: 'id'
                        }
                    },
                    text: msg.readFromJSON[theLocale]
                },
                {
                    opcode: 'readEntryFromJSON',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        variable: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.data[theLocale]
                        },
                        n: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1'
                        }
                    },
                    text: msg.readEntryFromJSON[theLocale]
                },
                {
                    opcode: 'readAttrFromJSON',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        variable: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.data[theLocale]
                        },
                        attr: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.attr[theLocale]
                        }
                    },
                    text: msg.readAttrFromJSON[theLocale]
                },
                {
                    opcode: 'getJsonCol',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        variable: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.data[theLocale]
                        },
                    },
                    text: msg.getJsonCol[theLocale]
                },
                {
                    opcode: 'getJsonAllNum',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        variable: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.data[theLocale]
                        }
                    },
                    text: msg.jsonFormNum[theLocale]
                },
                "---",
                {
                    opcode: "useTextSearchGetData",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.data[theLocale],
                        },
                        column: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.Column_name[theLocale],
                        },
                        value: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.value[theLocale],
                        },
                        column2: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.Column_name[theLocale],
                        },
                    },
                    text: msg.useTextSearchGetData[theLocale],
                },
                {
                    opcode: "useNumberCompareGetData",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.data[theLocale],
                        },
                        column: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.Column_name[theLocale],
                        },
                        symbol: {
                            type: ArgumentType.STRING,
                            defaultValue: ">",
                            menu: "symbolItem",
                        },
                        number: {
                            type: ArgumentType.NUMBER,
                            defaultValue: msg.number[theLocale],
                        },
                        column2: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.Column_name[theLocale],
                        },
                    },
                    text: msg.useNumberCompareGetData[theLocale],
                },
                {
                    opcode: "splitString",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.data[theLocale],
                        },
                        n: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "1",
                        },
                    },
                    text: msg.splitString[theLocale],
                },
            ],
            menus: {
                symbolItem: {
                    acceptReporters: true,
                    items: [">", ">=", "!=", "=", "<=", "<"],
                },
                file_type: {
                    acceptReporters: true,
                    items: ["json", "txt", "csv"],
                }
            }
        };
    }

    async fetchJSON(args) {
        //const url = encodeURIComponent(args.url);
        url = args.url;
        //console.log(url);
        const f_type = 'json';
        let request;
        //直接取回url
        request = this.myfetch(url,f_type);
        console.log('request1=',request);
        //if(request == msg.readerror[theLocale]){
            //google script + url
            //console.log(cors_url +'?f='+f_type+'&url='+ url);
            //request = this.myfetch(cors_url +'?f='+f_type+'&url='+ url,f_type);
        //}
        return request ;
    }

    async fetchJSON1(in_url,f_type) {
        let url = encodeURIComponent(in_url);
        //const f_type = 'json';
        console.log(url);
        //let cors_url = 'https://script.google.com/macros/s/AKfycbzE3fs6P0HAkK0dUE31wLambBLhjtsRK1zY3ZytotQenoVNpaAsunXhz9lqKgoiEpp9/exec';
        console.log(cors_url +'?url='+ url);
        return await fetch(cors_url +'?f='+f_type+'&url='+ url).then(res => {
           
            if (res.ok) {
                if(f_type=='txt' || f_type =='csv' ){
                    res.text().then(json =>{
                        if(f_type=='txt'){
                            this.data.data =JSON.stringify(Object.assign({}, json.split('\n')));
                        }else if(f_type=='csv'){
                            this.data.data = JSON.stringify(Object.assign({}, json.split('\\r\\n')));
                        }
                        this.data.fetched = true;
                        this.runtime.startHats('gasoJSON_onJSONReceived', {});
                    });
                    }
                if(f_type=='json' || f_type=='xml'){
                    res.json().then(json => {
                        if(f_type=='json'){
                            this.data.data = JSON.stringify(json);                                //this.runtime.startHats('gasoJSON_onJSONReceived', {});
                        }else if(f_type=='xml'){
                            xml2js.parseString(json, (err, result) => {
                            if (err) {
                                   throw err
                                }
                                  this.data.data = JSON.stringify(result, null, 4);
                                })
                            }
                            this.data.fetched = true;
                            this.runtime.startHats('gasoJSON_onJSONReceived', {});
                        });
                    }
            }
        })   
    }

    async myfetch(in_url,f_type){
            await fetch(in_url)
            .then(res => {
                if (res.ok) {
                    if(f_type=='txt' || f_type =='csv' ){
                    res.text().then(json =>{
                        if(f_type=='txt'){
                            this.data.data =JSON.stringify(Object.assign({}, json.split('\n')));
                        }else if(f_type=='csv'){
                            this.data.data = JSON.stringify(Object.assign({}, json.split('\\r\\n')));
                        }
                        this.data.fetched = true;
                        this.runtime.startHats('gasoJSON_onJSONReceived', {});
                    });
                    }
                    if(f_type=='json' || f_type=='xml'){
                        res.json().then(json => {
                            if(f_type=='json'){
                                this.data.data = JSON.stringify(json);                                //this.runtime.startHats('gasoJSON_onJSONReceived', {});
                            }else if(f_type=='xml'){
                                xml2js.parseString(json, (err, result) => {
                                    if (err) {
                                      throw err
                                    }
                                    this.data.data = JSON.stringify(result, null, 4);
                                  })
                            }
                            this.data.fetched = true;
                            this.runtime.startHats('gasoJSON_onJSONReceived', {});
                        });
                    }  
                }
            })
            .catch(error => {
                //console.log('err_url=',in_url);
                //cors_url +'?f='+f_type+'&url='+ in_url;
                this.fetchJSON1(in_url,f_type);

                //my_request='wait ...';
            })
            //return my_request;
    }

    async corsfetchJSON(args) {
        //const url = encodeURIComponent(args.url);
        const url = args.url;
        const f_type = 'json';
        console.log(url);
        //let cors_url = 'https://script.google.com/macros/s/AKfycbzE3fs6P0HAkK0dUE31wLambBLhjtsRK1zY3ZytotQenoVNpaAsunXhz9lqKgoiEpp9/exec';
        console.log(cors_url +'?f='+f_type+'&url='+ url);
        //string result = 
        return await fetch(cors_url +'?f='+f_type+'&url='+ url).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    this.data.fetched = true;
                    this.data.data = JSON.stringify(json);
                    this.runtime.startHats('gasoJSON_onJSONReceived', {});
                });
            }
        })
        
    }

    async fetchCSV(args) {
        //const url = encodeURIComponent(args.url);
        const url = args.url;
        const f_type = 'csv';
        console.log(cors_url +'?f='+f_type+'&url='+ url);
        //await this.myfetch(url,f_type);
        await this.myfetch(url,f_type);
        //await this.myfetch(cors_url +'?f='+f_type+'&url='+ url,f_type);
        /*return await fetch(cors_url +'?f='+f_type+'&url='+ url).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    this.data.fetched = true;
                    this.data.data = JSON.stringify(Object.assign({}, json.split('\r\n')));
                    //if(f_type=='txt'){
                    //    this.data.data = JSON.stringify(Object.assign({}, json.split('\n')));
                    //};
                    
                    this.runtime.startHats('gasoJSON_onJSONReceived', {});
                });
            }
        });*/
    }

    async fetchTXT(args) {
        //const url = encodeURIComponent(args.url);
        const url = args.url;
        const f_type = 'txt';
        await this.myfetch(url,f_type);
        //await this.myfetch(cors_url +'?f='+f_type+'&url='+ url,f_type);
        /*return await fetch(cors_url +'?f='+f_type+'&url='+ url).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    this.data.fetched = true;
                    this.data.data = JSON.stringify(Object.assign({}, json.split('\n')));
                    this.runtime.startHats('gasoJSON_onJSONReceived', {});
                });
            }
        })*/
    }

    async fetchXML(args) {
        //const url = encodeURIComponent(args.url);
        const url = args.url;
        const f_type = 'xml';
        //console.log(cors_url +'?f='+f_type+'&url='+ url);
        //await this.myfetch(url,f_type);
        await this.myfetch(cors_url +'?f='+f_type+'&url='+ url,f_type);
        /*return await fetch(cors_url +'?f='+f_type+'&url='+ url).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    this.data.fetched = true;
                    xml2js.parseString(json, (err, result) => {
                        if (err) {
                          throw err
                        }
                        // `result` is a JavaScript object
                        // convert it to a JSON string
                        this.data.data = JSON.stringify(result, null, 4)
                        // log JSON string
                        //console.log(this.data.data)
                      })
                    this.runtime.startHats('gasoJSON_onJSONReceived', {});
                });
            }
        })*/
    }
    
      
    openCorsSite(args) {
        window.open('https://cors-anywhere.herokuapp.com/corsdemo');
    }

    clearJSONData() {
        return (this.data = {});
    }

    isDataFetched() {
        return this.data.fetched;
    }

    onJSONReceived() {
        if (this.isDataFetched()) {
            console.log('got data');
            return true;
        }
    }

    readFromJSON() {
        if (this.isDataFetched()) {
            console.log('return ', this.data.data);
            return this.data.data;
        }
        return msg.readFromJSONErr[theLocale];
    }

    readEntryFromJSON(args) {
        const variable = args.variable || this.emptyObj;
        const n = args.n;
        try {
            const parsed = JSON.parse(variable);
            const data = parsed[n - 1];
            return typeof data === 'string' ? data : JSON.stringify(data);
        } catch (err) {
            return `Error: ${err}`;
        }
    }

    readAttrFromJSON(args) {
        const variable = args.variable || this.emptyObj;
        const attr = args.attr;
        try {
            const parsed = JSON.parse(variable);
            const data = parsed[attr];
            return typeof data === 'string' ? data : JSON.stringify(data);
        } catch (err) {
            return `Error: ${err}`;
        }
    }

    getJsonCol(args) {
        //data 
        const variable = args.variable || this.emptyObj;
        let parsed = JSON.parse(variable);
        //const first_index = parsed[0];
        const first_data = typeof parsed === 'string' ? data : JSON.stringify(parsed);
        console.log(first_data);
        this.jsoncol.fetched = true;
        this.jsoncol.data = Object.keys(JSON.parse(first_data));
        console.log(this.jsoncol.data);
        return JSON.stringify(this.jsoncol.data);
    }

    getJsonAllNum(args) {
        const variable = args.variable || this.emptyObj;
        const parsed = JSON.parse(variable);
        const size = parsed.length;
        console.log(size);
        return size;
    }

    useTextSearchGetData(args) {
        const data = args.data;
        const column = args.column;
        const column2 = args.column2;
        const value = args.value;

        try {
            const parsed = JSON.parse(data);
            const size = parsed.length;
            var getData = "";
            for (var i = 0; i < size; i++) {
                const d = parsed[i][column];
                if (d.includes(value)) getData += parsed[i][column2] + ",";
            }
            return getData.slice(0, getData.length - 1);
        } catch (err) {
            return `Error: ${err}`;
        }
    }

    useNumberCompareGetData(args) {
        const data = args.data;
        const column = args.column;
        const symbol = args.symbol;
        const number = parseInt(args.number, 10);
        const column2 = args.column2;

        try {
            const parsed = JSON.parse(data);
            const size = parsed.length;
            var getData = "";

            for (var i = 0; i < size; i++) {
                const d = parsed[i][column];

                if (symbol == ">" && d > number)
                    getData += parsed[i][column2] + ",";
                if (symbol == ">=" && d >= number)
                    getData += parsed[i][column2] + ",";
                if (symbol == "!=" && d != number)
                    getData += parsed[i][column2] + ",";
                if (symbol == "=" && d == number)
                    getData += parsed[i][column2] + ",";
                if (symbol == "<=" && d <= number)
                    getData += parsed[i][column2] + ",";
                if (symbol == "<" && d < number)
                    getData += parsed[i][column2] + ",";
            }
            return getData.slice(0, getData.length - 1);
        } catch (err) {
            return `Error: ${err}`;
        }
    }

    splitString(args) {
        const data = args.data;
        const n = args.n;
        var splitText = data.split(",");

        return splitText[n - 1] != undefined ? splitText[n - 1] : "" ;
    }
}

module.exports = gasoJSON;
