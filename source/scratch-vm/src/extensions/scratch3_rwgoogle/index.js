const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const msg = require("./translation");
const formatMessage = require("format-message");
const sheetrock = require("sheetrock");
//add by estea
const ml5 = require('ml5');
const jqueryMin = require("./jquery.min.js");
//require("babel-polyfill");
//
const menuIconURI =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAYCAYAAAB9ejRwAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOpQAADqUBKmWIAgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAUMSURBVEiJtZdtTJVlGMd/D3CAc05GcDAUDi9izkTzCzCbWJaaUlTkppb6wbCXZXNqq8mH0rU1q1WSTtlwVstN0DJrirLl2wcZkW9JapuuSFSk8SIeEM45cDjn34cHOUd5CSdd29nO87+v+7p+z/U8z3Xft8GQplRgAfAUMAWIA2zALcAF/A5UArvA+GfoWMM3YxCYFOAT4GUgPDoaMjMhJQUcDujshKYmOHcOrl0DwG+CUQhGw0jBhQK9AroF0pw5UkWF5HZrUDtzRiookMLDpd55q0YaaA0oMGaMdORIf4D6eqmmRrpwQWpt7Q+Xni6BBJo7UkALQIGJE6WGhmCyhgZpzRopObkvoUAyDCk7W9q5U/L7pc5OaebMvvHHRwIoEeSKj5dqa4NA5eXSqFESKAAqB71hVkGLQJtBLpDy8qTZs/uAPhoBIADtAGnbtiBQVZUUGSmBmkBPDzIvDvRlSAW3jBRQIsg3frzk85lA3d1SWpoE8oAyhxHjTdBnoEG+5nuHeh2ktWuDVSot7bvzDSOU5J6hfgTp6NEg1NKlEqgHNGaIeRaQ9f+C+gukurog1KRJEujsXX5O0Le9/oGQ96gH1Aq6Aqrt/W2+H6IIIAYgISEo3rgBwN93+f4EZM2aZXb1EAsHYoHYQAD27gXAfT9QgLwgeb3BSiUkSKAfQnwst6tTXT14d/d6+6r36f0QRQAtQFJzMzidpuhwQGMjqUE3wwdqAUafOgUdHXcGyc6GmJg7pDuv7t1UDtLx4/1edB8oPsRvkdkYdSK0s4PZ0+6q1L5hZy8peUHbt08N1cKA4wCHDgXFefMAs4pvB1XjezDWgTENeBL4c4hcicOFwutdS1vbulDJ6F2nqjMy4Px5CAuDri5IT4eGBjzADDB+G+Ae4zD3U86qKpg+3ZwXHQ3AdTCcKilZTFeX3Vi9+iuVlU3l8uU8srK+JjIyjMrKV4FI0tJewuW6TGLi+1y8mEtOzs7eDqwLwOTSUliyxFSOHYO5c8Hv5yZQAMYAj0RlwOIBoFpUsu0drNYdREQYBAKFtLe/R0zMw7S3V+L33yIu7jkcDrh6tYNA4BA+XxY2WwoeT8VtqDzggNMJJ0/C2LGmumcPLFsGHg8AZ4CDQB2QAkwDcgFjAKgr2lp8EZstke5uFw7HBPx+BzbbZjo7V2OztWGx/EJd3TxiYv7Aao2gsfExAoEaYmNTwnqf4kFgU3095OeDy2WqCxfCpUuwciUkJ5MJrAe+AT4Ens3IwNi4EbKy+pWwBpvtQbq6LuPxXMLrHYXV6sHp/A6324LX24rLlUtUVDNer5ueHjupqWC1PkJHR2vIAqpwYCvwVno67N5tfuqh1tgIzc3m/6QkiI0Njnk8UFgIW8x9wjP6/IsC4uNz8Xi6iItrJhCYQm3tCSZMmAy0cPhwIpmZFdjt8YSHx+PxPMrVq/uIjW0fYFXXcqAoLIyY/HxYtQpycsBi6e8JUFcHu3ZBcTFcvw5AERjvav/+ydTW/kxUlIHd/jwdHRuw22dy8+bHREUtx2Zz4nRaaGo6j8tlwec7j8PxIm1tRwc7OIwGCoHXgIfsdvPgkJRkNkm321yKQg4OAGeB9WAc6IsiRQIYhtHde20H3JSVubh2rRqncwbt7R+wYkWxYRg+SQ8YhtHxH/sfWYEZwEzgCWA85hELoB2zV/0K7APj9NCxQqIWFW3Cbl9KZ+dp5s+fb4wb5w0d/xdQ5xScgmy3MQAAAABJRU5ErkJggg==";
const blockIconURI =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAYCAYAAAB9ejRwAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOpQAADqUBKmWIAgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAUMSURBVEiJtZdtTJVlGMd/D3CAc05GcDAUDi9izkTzCzCbWJaaUlTkppb6wbCXZXNqq8mH0rU1q1WSTtlwVstN0DJrirLl2wcZkW9JapuuSFSk8SIeEM45cDjn34cHOUd5CSdd29nO87+v+7p+z/U8z3Xft8GQplRgAfAUMAWIA2zALcAF/A5UArvA+GfoWMM3YxCYFOAT4GUgPDoaMjMhJQUcDujshKYmOHcOrl0DwG+CUQhGw0jBhQK9AroF0pw5UkWF5HZrUDtzRiookMLDpd55q0YaaA0oMGaMdORIf4D6eqmmRrpwQWpt7Q+Xni6BBJo7UkALQIGJE6WGhmCyhgZpzRopObkvoUAyDCk7W9q5U/L7pc5OaebMvvHHRwIoEeSKj5dqa4NA5eXSqFESKAAqB71hVkGLQJtBLpDy8qTZs/uAPhoBIADtAGnbtiBQVZUUGSmBmkBPDzIvDvRlSAW3jBRQIsg3frzk85lA3d1SWpoE8oAyhxHjTdBnoEG+5nuHeh2ktWuDVSot7bvzDSOU5J6hfgTp6NEg1NKlEqgHNGaIeRaQ9f+C+gukurog1KRJEujsXX5O0Le9/oGQ96gH1Aq6Aqrt/W2+H6IIIAYgISEo3rgBwN93+f4EZM2aZXb1EAsHYoHYQAD27gXAfT9QgLwgeb3BSiUkSKAfQnwst6tTXT14d/d6+6r36f0QRQAtQFJzMzidpuhwQGMjqUE3wwdqAUafOgUdHXcGyc6GmJg7pDuv7t1UDtLx4/1edB8oPsRvkdkYdSK0s4PZ0+6q1L5hZy8peUHbt08N1cKA4wCHDgXFefMAs4pvB1XjezDWgTENeBL4c4hcicOFwutdS1vbulDJ6F2nqjMy4Px5CAuDri5IT4eGBjzADDB+G+Ae4zD3U86qKpg+3ZwXHQ3AdTCcKilZTFeX3Vi9+iuVlU3l8uU8srK+JjIyjMrKV4FI0tJewuW6TGLi+1y8mEtOzs7eDqwLwOTSUliyxFSOHYO5c8Hv5yZQAMYAj0RlwOIBoFpUsu0drNYdREQYBAKFtLe/R0zMw7S3V+L33yIu7jkcDrh6tYNA4BA+XxY2WwoeT8VtqDzggNMJJ0/C2LGmumcPLFsGHg8AZ4CDQB2QAkwDcgFjAKgr2lp8EZstke5uFw7HBPx+BzbbZjo7V2OztWGx/EJd3TxiYv7Aao2gsfExAoEaYmNTwnqf4kFgU3095OeDy2WqCxfCpUuwciUkJ5MJrAe+AT4Ens3IwNi4EbKy+pWwBpvtQbq6LuPxXMLrHYXV6sHp/A6324LX24rLlUtUVDNer5ueHjupqWC1PkJHR2vIAqpwYCvwVno67N5tfuqh1tgIzc3m/6QkiI0Njnk8UFgIW8x9wjP6/IsC4uNz8Xi6iItrJhCYQm3tCSZMmAy0cPhwIpmZFdjt8YSHx+PxPMrVq/uIjW0fYFXXcqAoLIyY/HxYtQpycsBi6e8JUFcHu3ZBcTFcvw5AERjvav/+ydTW/kxUlIHd/jwdHRuw22dy8+bHREUtx2Zz4nRaaGo6j8tlwec7j8PxIm1tRwc7OIwGCoHXgIfsdvPgkJRkNkm321yKQg4OAGeB9WAc6IsiRQIYhtHde20H3JSVubh2rRqncwbt7R+wYkWxYRg+SQ8YhtHxH/sfWYEZwEzgCWA85hELoB2zV/0K7APj9NCxQqIWFW3Cbl9KZ+dp5s+fb4wb5w0d/xdQ5xScgmy3MQAAAABJRU5ErkJggg==";

const defaultId = "default";
let theLocale = null;

let data ={};

class rwGoogle {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        // communication related
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension("rwGoogle", this);
        // session callbacks
        this.reporter = null;
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.write = this.write.bind(this);
        // string op
        this.decoder = new TextDecoder();
        this.lineBuffer = "";
        //this.data = {};
        this.googlecolumn = {};
        this.emptyObj = {
            VALUE: {},
        };

        this.googleSheetURL = "";
        this.googleSheetData = "";

        this.googleSheetURL_1 = "";
        this.googleSheetTAG_1 = "";
        this.googleSheetData_1 = "";

        this.googleFormID = "";
        this.googleFormData = "";
    }

    onclose() {
        this.session = null;
    }

    write(data, parser = null) {
        if (this.session) {
            return new Promise((resolve) => {
                if (parser) {
                    this.reporter = {
                        parser,
                        resolve,
                    };
                }
                this.session.write(data);
            });
        }
    }

    onmessage(data) {
        const dataStr = this.decoder.decode(data);
        this.lineBuffer += dataStr;
        if (this.lineBuffer.indexOf("\n") !== -1) {
            const lines = this.lineBuffer.split("\n");
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
        this.comm.getDeviceList().then((result) => {
            this.runtime.emit(
                this.runtime.constructor.PERIPHERAL_LIST_UPDATE,
                result
            );
        });
    }

    _setLocale() {
        let nowLocale = "";
        switch (formatMessage.setup().locale) {
            case "zh-tw":
                nowLocale = "zh-tw";
                break;
            default:
                nowLocale = "en";
                break;
        }
        return nowLocale;
    }

    getInfo() {
        theLocale = this._setLocale();

        return {
            id: "rwGoogle",
            name: msg.name[theLocale],
            color1: "#08086E",
            color2: "#08086E",
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: "googleJSON",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        url: {
                            type: ArgumentType.STRING,
                            defaultValue:
                                "https://docs.google.com/spreadsheets/d/KEY_ID/edit?usp=sharing",
                        },
                    },
                    text: msg.googleJSON[theLocale],
                },
                {
                    opcode: "readFromJSON",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        id: {
                            type: ArgumentType.STRING,
                            defaultValue: "id",
                        },
                    },
                    text: msg.readFromJSON[theLocale],
                },
                {
                    opcode: "getJsonAllNum",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        variable: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.data[theLocale],
                        },
                    },
                    text: msg.jsonFormNum[theLocale],
                },
                {
                    opcode: "googlecolumnTEXT",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        variable: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.data[theLocale],
                        },
                        n: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "1",
                        },
                        column: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                            //defaultValue: "title",
                        },
                    },
                    text: msg.googlecolumnTEXT[theLocale],
                },
                "---",
                {
                    opcode: "readGoogleSheetURL",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        url: {
                            type: ArgumentType.STRING,
                            defaultValue:
                                "https://script.google.com/macros/s/「key」/exec",
                        },
                    },
                    text: msg.readGoogleSheetURL[theLocale],
                },
                {
                    opcode: "writeGoogleSheetCol",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        column: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                            //defaultValue: "column",
                        },
                        value: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                            //defaultValue: "value",
                        },
                    },
                    text: msg.writeGoogleSheetCol[theLocale],
                },
                {
                    opcode: "sendGoogleSheet",
                    blockType: BlockType.COMMAND,
                    text: msg.sendGoogleSheet[theLocale],
                },

                "---",
                {
                    opcode: "readGoogleSheetURL_1",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        url: {
                            type: ArgumentType.STRING,
                            defaultValue:
                                "https://docs.google.com/spreadsheets/d/xxIDxx/edit?usp=sharing",
                        },
                    },
                    text: msg.readGoogleSheetURL_1[theLocale],
                },
                {
                    opcode: "readGoogleSheetTAG_1",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        tag: {
                            type: ArgumentType.STRING,
                            defaultValue:
                                "工作表1",
                        },
                    },
                    text: msg.readGoogleSheetTAG_1[theLocale],
                },
                {
                    opcode: "writeGoogleSheetCol_1",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        value1: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                        },
                        value2: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                        },
                        value3: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                        },
                    },
                    text: msg.writeGoogleSheetCol_1[theLocale],
                },
                {
                    opcode: "readGoogleSheetCol_1",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        COL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "2",
                        },
                        ROW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "3",
                        },
                    },
                    text: msg.readGoogleSheetCol_1[theLocale],
                },
                {
                    opcode: "readGoogleSheet_json",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COL_b: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "1",
                        },
                        ROW_b: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "1",
                        },
                        COL_e: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "3",
                        },
                        ROW_e: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "4",
                        },
                    },
                    text: msg.readGoogleSheet_json[theLocale],
                },
                {
                    opcode: "sendGoogleSheet_1",
                    blockType: BlockType.COMMAND,
                    text: msg.sendGoogleSheet_1[theLocale],
                },
                {
                    opcode: "sendGoogleSheet_2",
                    blockType: BlockType.COMMAND,
                    text: msg.sendGoogleSheet_2[theLocale],
                    arguments: {
                        COL_b: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "3",
                        },
                        ROW_b: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "4",
                        },
                    },
                },
                {
                    opcode: "clearworksheet",
                    blockType: BlockType.COMMAND,
                    text: msg.clearworksheet[theLocale],
                },
                '---',
                {
                    opcode: "queryTheNumber",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: "資料",
                        },
                        field: {
                            type: ArgumentType.NUMBER,
                            defaultValue: "欄位",
                        },
                        data2: {
                            type: ArgumentType.STRING,
                            defaultValue: "資料值",
                        },
                    },
                    text: msg.queryTheNumber[theLocale],
                },
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
                    opcode: 'selectData',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: '資料'
                        },
                        field: {
                            type: ArgumentType.STRING,
                            defaultValue: '欄位'
                        },
                        symbol: {
                            type: ArgumentType.STRING,
                            menu: 'symbolItem',
                            defaultValue: '='
                        },
                        value: {
                            type: ArgumentType.STRING,
                            defaultValue: '數值'
                        },
                    },
                    text: msg.selectData[theLocale]
                },

                "---",
                {
                    opcode: "writeGoogleForm",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        googleID: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                        },
                        column1_name: {
                            type: ArgumentType.STRING,
                            defaultValue: "entry.*",
                        },
                        column1_value: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                        },
                        column2_name: {
                            type: ArgumentType.STRING,
                            defaultValue: "entry.*",
                        },
                        column2_value: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                        },
                        column3_name: {
                            type: ArgumentType.STRING,
                            defaultValue: "entry.*",
                        },
                        column3_value: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                        },
                    },
                    text: msg.writeGoogleForm[theLocale],
                },
                "---",
                {
                    opcode: "readGoogleFormID",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ID: {
                            type: ArgumentType.STRING,
                            defaultValue: "Google Form ID",
                        },
                    },
                    text: msg.readGoogleFormID[theLocale],
                },
                {
                    opcode: "writeGoogleFormCol",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        column: {
                            type: ArgumentType.STRING,
                            defaultValue: "entry.*",
                        },
                        value: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                        },
                    },
                    text: msg.writeGoogleFormCol[theLocale],
                },
                {
                    opcode: "sendGoogleForm",
                    blockType: BlockType.COMMAND,
                    text: msg.sendGoogleForm[theLocale],
                },
            ],
            menus: {
                symbolItem: {
                    acceptReporters: true,
                    items: [">", ">=", "!=", "=", "<=", "<"],
                },
            }
        };
    }

    getJsonAllNum(args) {
        const variable = args.variable || this.emptyObj;
        const parsed = JSON.parse(variable);
        const size = parsed.length;
        console.log(size);
        return size;
    }

    csvJSON(csv) {
        var lines = csv.split("\r\n");
        var result = [];
        var headers = lines[0].split(",");
        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(",");

            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        //return result; //JavaScript object
        return JSON.stringify(result); //JSON
    }

    async googleJSON(args) {
        const urlsplit = args.url.split("/");
        //const aurl ='https://docs.google.com/spreadsheets/d/'+urlsplit[5]+'/edit#gid=0';
        const aurl =
            "https://docs.google.com/spreadsheets/d/" +
            urlsplit[5] +
            "/export?format=csv";
        const csv_data = await fetch(aurl, { method: "get" }).then((response) =>
            response.text()
        );
        data.data = this.csvJSON(csv_data);
        data.fetched = true;
        console.log(data.data);
    }

    isDataFetched() {
        return data.fetched;
    }

    onJSONReceived() {
        if (this.isDataFetched()) {
            console.log("got data");
            return true;
        }
    }

    readFromJSON() {
        if (this.isDataFetched()) {
            console.log("return ", data.data);
            return data.data;
        }
        return msg.readFromJSONErr[theLocale];
    }

    readEntryFromJSON(args) {
        const variable = args.variable || this.emptyObj;
        const n = args.n;
        try {
            const parsed = JSON.parse(variable);
            const data = parsed[n - 1];
            return typeof data === "string" ? data : JSON.stringify(data);
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
            return typeof data === "string" ? data : JSON.stringify(data);
        } catch (err) {
            return `Error: ${err}`;
        }
    }

    googlecolumnTEXT(args) {
        const variable = args.variable || this.emptyObj;
        const n = args.n;
        const column = args.column;
        const parsed = JSON.parse(variable);
        var data = parsed[n - 1];
        data = JSON.stringify(data);
        const a_parsed = JSON.parse(data);

        var a_data = a_parsed[column];
        a_data = JSON.stringify(a_data);
        const t_parsed = JSON.parse(a_data);
        return t_parsed;
    }

    writeGoogleCalc(args) {
        const column1 = args.column1 || defaultValue;
        const column2 = args.column2 || defaultValue;
        const column3 = args.column3 || defaultValue;
        const column4 = args.column4 || defaultValue;
        const column5 = args.column5 || defaultValue;
        const column6 = args.column6 || defaultValue;
        const column7 = args.column7 || defaultValue;
        const column8 = args.column8 || defaultValue;
        const url = args.url;

        var alldata = "";
        if (column1.trim() !== "") {
            alldata = alldata + "?c1=" + column1;
        }
        if (column2.trim() !== "") {
            alldata = alldata + "&c2=" + column2;
        }
        if (column3.trim() !== "") {
            alldata = alldata + "&c3=" + column3;
        }
        if (column4.trim() !== "") {
            alldata = alldata + "&c4=" + column4;
        }
        if (column5.trim() !== "") {
            alldata = alldata + "&c5=" + column5;
        }
        if (column6.trim() !== "") {
            alldata = alldata + "&c6=" + column6;
        }
        if (column7.trim() !== "") {
            alldata = alldata + "&c7=" + column7;
        }
        if (column8.trim() !== "") {
            alldata = alldata + "&c8=" + column8;
        }
        var gurl = url + alldata;
        console.log(gurl);
        return fetch(gurl).then((res) => {
            if (res.ok) {
            }
        });
    }

    writeGoogleForm(args) {
        const column1_name = args.column1_name || defaultValue;
        const column2_name = args.column2_name || defaultValue;
        const column3_name = args.column3_name || defaultValue;
        const column1_value = args.column1_value || defaultValue;
        const column2_value = args.column2_value || defaultValue;
        const column3_value = args.column3_value || defaultValue;

        const googleID = args.googleID;
        var alldata = "";
        if (column1_value.trim() !== "") {
            alldata = alldata + column1_name + "=" + column1_value;
        }
        if (column2_value.trim() !== "") {
            alldata = alldata + "&" + column2_name + "=" + column2_value;
        }
        if (column3_value.trim() !== "") {
            alldata = alldata + "&" + column3_name + "=" + column3_value;
        }
        if (googleID.trim() !== "") {
            var gurl =
                "https://docs.google.com/forms/d/e/" +
                googleID +
                "/formResponse?" +
                alldata;
            console.log(gurl);
            fetch(gurl);
        }
    }

    readGoogleSheetURL(args) {
        const defURL = "https://script.google.com/macros/s/「key」/exec";

        if (args.url != "" && args.url != defURL)
            this.googleSheetURL = args.url;

        this.googleSheetData = "";
    }

    writeGoogleSheetCol(args) {
        const column = args.column;
        const value = args.value;

        if (this.googleSheetURL != "") {
            if (column != "" && value != "")
                this.googleSheetData += `${column}=${value}&`;
        }
    }

    sendGoogleSheet() {
        var url = this.googleSheetURL + "?" + this.googleSheetData.slice(0, -1);

        if (this.googleSheetURL != "") {
            if (this.googleSheetData != "") {
                fetch(url, { mode: "no-cors", credentials: "include" });
                this.googleSheetData = "";
            }
        }
    }

    //
    readGoogleSheetURL_1(args) {
        //const defURL = "https://script.google.com/macros/s/「key」/exec";
        const defURL = "https://docs.google.com/spreadsheets/d/xxIDxx/edit?usp=sharing";

        if (args.url != "" && args.url != defURL)
            this.googleSheetURL_1 = args.url;

        this.googleSheetData_1 = "";
    }

    readGoogleSheetTAG_1(args) {
        
        if (args.tag != "" )
            this.googleSheetTAG_1 = args.tag;

        this.googleSheetData_1 = "";
    }

    writeGoogleSheetCol_1(args) {

        const value1 = args.value1;
        const value2 = args.value2;
        const value3 = args.value3;

        if (value1 != "") this.googleSheetData_1 += value1 + ',';
        if (value2 != "") this.googleSheetData_1 += value2 + ',';
        if (value3 != "") this.googleSheetData_1 += value3 + ',';
    }

    async readGoogleSheetCol_1(args) {
        const row_value = parseInt(args.ROW,10);
        const col_value = parseInt(args.COL,10);
        if (this.googleSheetURL_1 != "" && this.googleSheetTAG_1 != "") {
            var a = {
                sheetUrl : this.googleSheetURL_1,
                sheetTag : this.googleSheetTAG_1,
                row: row_value,
                col: col_value,
                endRow : row_value,
                endCol : col_value
            };
            //const exec =`https://script.google.com/macros/s/AKfycbzBZXaA2Gf9-6gW0Whm-zbczf0bs6dIAk0FMyCpi7xItwMVyRRdD3koKRtZmoSeNg_MHQ/exec`;
            const exec = `https://script.google.com/macros/s/AKfycbyZfNyY7p5sYMjUxNM3YigtFq0Yk_yfO0rJvhfB4LiawVvJjy2UVq3ewx2SmPZv2S-eKA/exec`;
            const return_value = jqueryMin.get(exec,a);
            console.log ('return =',return_value);
            return return_value;
        }else{
            alert( msg.readGooglesheet_err[theLocale]);
        }
    }

    async readGoogleSheet_json(args) {
        const row_b_value = parseInt(args.ROW_b,10);
        const col_b_value = parseInt(args.COL_b,10);
        const row_e_value = parseInt(args.ROW_e,10)+1;
        const col_e_value = parseInt(args.COL_e,10);
        if (this.googleSheetURL_1 != "" && this.googleSheetTAG_1 != "") {
            var a = {
                sheetUrl : this.googleSheetURL_1,
                sheetTag : this.googleSheetTAG_1,
                row: row_b_value,
                col: col_b_value,
                endRow : row_e_value,
                endCol : col_e_value
            };
            //const exec =`https://script.google.com/macros/s/AKfycbzBZXaA2Gf9-6gW0Whm-zbczf0bs6dIAk0FMyCpi7xItwMVyRRdD3koKRtZmoSeNg_MHQ/exec`;
            const exec =`https://script.google.com/macros/s/AKfycbyZfNyY7p5sYMjUxNM3YigtFq0Yk_yfO0rJvhfB4LiawVvJjy2UVq3ewx2SmPZv2S-eKA/exec`;
            const aaa=jqueryMin.get(exec,a,function (adata){
                var d = adata.split(',');
                var arr = [];
                for(var i=0; i<(a.endRow-a.row+1); i++){
                    arr[i] = d.splice(0, (a.endCol-a.col+1)); 
                }
                
                var result = [];
                var headers = arr[0];
                for (var i = 1; i < arr.length; i++) {
                    //如果不是空物件才留下來
                    let length0fObject = 0;
                      for(let key in arr[i]){
                        if (arr[i].hasOwnProperty(key)){
                            length0fObject++;
                        }
                    }
                    if(length0fObject>0){
                        var obj = {};
                        var currentline = arr[i];
                            for (var j = 0; j < headers.length; j++) {
                            obj[headers[j]] = currentline[j];
                        }                    
                        result.push(obj);
                    }
                }
                data.data=JSON.stringify(result);
            }
            )
            data.fetched = true;
        }else{
            alert( msg.readGooglesheet_err[theLocale]);
        }
    }

    /*datatoJSON(return_value) {
        console.log('return_value',return_value);
        var result = [];
        var headers = return_value[0];
        for (var i = 1; i < return_value.length; i++) {
            var obj = {};
            var currentline = return_value[i];
                for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        //return result; //JavaScript object
        console.log('result=',result);
        return JSON.stringify(result); //JSON
    }*/

    sendGoogleSheet_1() {
        //const exec =`https://script.google.com/macros/s/AKfycbys9knFlXbx_eHguV-pKm2pqY20PBYFanqUrD-7_9GQi1m3i3-QlRY99OSSS1cNDtC9/exec`;
        const exec =`https://script.google.com/macros/s/AKfycbzkc7c1DK2TqwjjWK1q-x5pV7UFGxyAo85YKQtORCV0jVqAjcqwKEEqdfw9kZtROX0U/exec`;
        let a = { 
            data: this.googleSheetData_1,
            sheetUrl: this.googleSheetURL_1,
            sheetTag: this.googleSheetTAG_1,
            col_b: 0,
            row_b: 0,
        }
        jqueryMin.get(exec,a);
        this.googleSheetData_1 = "";
        
    }

    sendGoogleSheet_2(args) {
        //const exec =`https://script.google.com/macros/s/AKfycbys9knFlXbx_eHguV-pKm2pqY20PBYFanqUrD-7_9GQi1m3i3-QlRY99OSSS1cNDtC9/exec`;
        const exec =`https://script.google.com/macros/s/AKfycbzkc7c1DK2TqwjjWK1q-x5pV7UFGxyAo85YKQtORCV0jVqAjcqwKEEqdfw9kZtROX0U/exec`;
        const row_b_value = parseInt(args.ROW_b,10);
        const col_b_value = parseInt(args.COL_b,10); 
        let a = { 
            data: this.googleSheetData_1,
            sheetUrl: this.googleSheetURL_1,
            sheetTag: this.googleSheetTAG_1,
            col_b: col_b_value,
            row_b: row_b_value,
        }
        jqueryMin.get(exec,a);
        this.googleSheetData_1 = "";
        
        
    }
    
    clearworksheet() {
        const exec =`https://script.google.com/macros/s/AKfycbzkc7c1DK2TqwjjWK1q-x5pV7UFGxyAo85YKQtORCV0jVqAjcqwKEEqdfw9kZtROX0U/exec`;
        const row_b_value = 888888;
        const col_b_value = 888888; 
        let a = { 
            data: this.googleSheetData_1,
            sheetUrl: this.googleSheetURL_1,
            sheetTag: this.googleSheetTAG_1,
            col_b: col_b_value,
            row_b: row_b_value,
        }
        jqueryMin.get(exec,a);
        this.googleSheetData_1 = "";
    }

    queryTheNumber(args) {
        var data = args.data;
        var field = args.field;
        var data2 = args.data2;

        var parseData = JSON.parse(data);
        var tmpNumber = 0;

        for (var i = 0; i < parseData.length; i++) {
            if (parseData[i][field] == data2) {
                tmpNumber = i + 1;
                break;
            }
        }

        return tmpNumber;
    }

    //
    readGoogleFormID(args) {
        if (args.ID != "" && args.ID != "Google Form ID")
            this.googleFormID = args.ID;

        this.googleFormData = "";
    }

    writeGoogleFormCol(args) {
        const column = args.column;
        const value = args.value;

        if (this.googleFormID != "") {
            if (column != "" && value != "")
                this.googleFormData += `${column}=${value}&`;
        }
    }

    sendGoogleForm(args) {
        var url =
            `https://docs.google.com/forms/d/e/${this.googleFormID}/formResponse?` +
            this.googleFormData.slice(0, -1);

        if (this.googleFormID != "") {
            if (this.googleFormData != "") {
                fetch(url, { mode: "no-cors", credentials: "include" });
                this.googleFormData = "";
            }
        }
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

    selectData(args) {
        var data = args.data;
        var field = args.field;
        var symbol = args.symbol;
        var value = args.value;

        var getData = [];

        if (data != "" && data != "資料") {
            if (field != "" && field != "欄位") {
                var parseData = JSON.parse(data);

                for (var i = 0; i < parseData.length; i++) {
                    var tmpData = parseData[i];
                    var compareData = parseData[i][field];

                    if (symbol == ">" && compareData > value) getData.push(tmpData);
                    if (symbol == ">=" && compareData >= value) getData.push(tmpData);
                    if (symbol == "!=" && compareData != value) getData.push(tmpData);
                    if (symbol == "=" && compareData == value) getData.push(tmpData);
                    if (symbol == "<=" && compareData <= value) getData.push(tmpData);
                    if (symbol == "<" && compareData < value) getData.push(tmpData);
                }
                return JSON.stringify(getData);
            }
            else return "請填寫篩選的欄位";
        }
        else return "請讀取資料";
    }
}

module.exports = rwGoogle;