const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

//async add estea
const ml5 = require('ml5');
//require('babel-polyfill');
//end
//const { Configuration, OpenAIApi } = require('openai');
const OpenAIApi  = require('openai');
OpenAIApi.api_key ='';
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjU2cHgi\
IGhlaWdodD0iMjYwcHgiIHZpZXdCb3g9IjAgMCAyNTYgMjYwIiB2ZXJzaW9uPSIxLjEiIHhtbG5z\
PSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMu\
b3JnLzE5OTkveGxpbmsiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4KICAgIDx0aXRs\
ZT5PcGVuQUk8L3RpdGxlPgogICAgPGc+CiAgICAgICAgPHBhdGggZD0iTTIzOS4xODM5MTQsMTA2\
LjIwMjc4MyBDMjQ1LjA1NDMwNCw4OC41MjQyMDk2IDI0My4wMjIyOCw2OS4xNzMzODA1IDIzMy42\
MDc1OTksNTMuMDk5ODg2NCBDMjE5LjQ1MTY3OCwyOC40NTg4MDIxIDE5MC45OTk3MDMsMTUuNzgz\
NjEyOSAxNjMuMjEzMDA3LDIxLjczOTUwNSBDMTQ3LjU1NDA3Nyw0LjMyMTQ1ODgzIDEyMy43OTQ5\
MDksLTMuNDIzOTg1NTQgMTAwLjg3OTAxLDEuNDE4NzM4OTggQzc3Ljk2MzExMDUsNi4yNjE0NjM0\
OSA1OS4zNjkwMDkzLDIyLjk1NzI1MzYgNTIuMDk1OTYyMSw0NS4yMjE0MjE5IEMzMy44NDM2NDk0\
LDQ4Ljk2NDQ4NjcgMTguMDkwMTcyMSw2MC4zOTI3NDkgOC44NjY3MjUxMyw3Ni41ODE4MDMzIEMt\
NS40NDM0OTEsMTAxLjE4Mjk2MiAtMi4xOTU0NDQzMSwxMzIuMjE1MjU1IDE2Ljg5ODY2NjIsMTUz\
LjMyMDA5NCBDMTEuMDA2MDg2NSwxNzAuOTkwNjU2IDEzLjAxOTcyODMsMTkwLjM0Mzk5MSAyMi40\
MjM4MjMxLDIwNi40MjI5OTEgQzM2LjU5NzU1NTMsMjMxLjA3MjM0NCA2NS4wNjgwMzQyLDI0My43\
NDY1NjYgOTIuODY5NTczOCwyMzcuNzgzMzcyIEMxMDUuMjM1NjM5LDI1MS43MDgyNDkgMTIzLjAw\
MTExMywyNTkuNjMwOTQyIDE0MS42MjM5NjgsMjU5LjUyNjkyIEMxNzAuMTA1MzU5LDI1OS41NTIx\
NjkgMTk1LjMzNzYxMSwyNDEuMTY1NzE4IDIwNC4wMzc3NzcsMjE0LjA0NTY2MSBDMjIyLjI4NzM0\
LDIxMC4yOTYzNTYgMjM4LjAzODQ4OSwxOTguODY5NzgzIDI0Ny4yNjcwMTQsMTgyLjY4NTI4IEMy\
NjEuNDA0NDUzLDE1OC4xMjc1MTUgMjU4LjE0MjQ5NCwxMjcuMjYyNzc1IDIzOS4xODM5MTQsMTA2\
LjIwMjc4MyBMMjM5LjE4MzkxNCwxMDYuMjAyNzgzIFogTTE0MS42MjM5NjgsMjQyLjU0MTIwNyBD\
MTMwLjI1NTY4MiwyNDIuNTU5MTc3IDExOS4yNDM4NzYsMjM4LjU3NDY0MiAxMTAuNTE5MzgxLDIz\
MS4yODYxOTcgTDExMi4wNTQxNDYsMjMwLjQxNjQ5NiBMMTYzLjcyNDU5NSwyMDAuNTkwODgxIEMx\
NjYuMzQwNjQ4LDE5OS4wNTY0NDQgMTY3Ljk1NDMyMSwxOTYuMjU2ODE4IDE2Ny45NzA3ODEsMTkz\
LjIyNDAwNSBMMTY3Ljk3MDc4MSwxMjAuMzczNzg4IEwxODkuODE1NjE0LDEzMy4wMTAwMjYgQzE5\
MC4wMzQxMzIsMTMzLjEyMTQyMyAxOTAuMTg2MjM1LDEzMy4zMzA1NjQgMTkwLjIyNDg4NSwxMzMu\
NTcyNzc0IEwxOTAuMjI0ODg1LDE5My45NDAyMjkgQzE5MC4xNjg2MDMsMjIwLjc1ODQyNyAxNjgu\
NDQyMTY2LDI0Mi40ODQ4NjQgMTQxLjYyMzk2OCwyNDIuNTQxMjA3IFogTTM3LjE1NzU3NDksMTk3\
LjkzMDYyIEMzMS40NTY0OTgsMTg4LjA4NjM1OSAyOS40MDk0ODE4LDE3Ni41NDY5ODQgMzEuMzc2\
NjIzNywxNjUuMzQyNDI2IEwzMi45MTEzODk1LDE2Ni4yNjMyODUgTDg0LjYzMjk5NzMsMTk2LjA4\
ODkwMSBDODcuMjM4OTM0OSwxOTcuNjE4MjA3IDkwLjQ2ODI3MTcsMTk3LjYxODIwNyA5My4wNzQy\
MDkzLDE5Ni4wODg5MDEgTDE1Ni4yNTU0MDIsMTU5LjY2Mzc5MyBMMTU2LjI1NTQwMiwxODQuODg1\
MTExIEMxNTYuMjQzNTU3LDE4NS4xNDk3NzEgMTU2LjExMTcyNSwxODUuMzk0NjAyIDE1NS44OTcy\
OSwxODUuNTUwMTc2IEwxMDMuNTYxNzc2LDIxNS43MzM5MDMgQzgwLjMwNTQ5NTMsMjI5LjEzMTYz\
MiA1MC41OTI0OTU0LDIyMS4xNjU0MzUgMzcuMTU3NTc0OSwxOTcuOTMwNjIgWiBNMjMuNTQ5MzE4\
MSw4NS4zODExMjczIEMyOS4yODk5ODYxLDc1LjQ3MzMwOTcgMzguMzUxMTkxMSw2Ny45MTYyNjQ4\
IDQ5LjEyODc0ODIsNjQuMDQ3ODgyNSBMNDkuMTI4NzQ4MiwxMjUuNDM4NTE1IEM0OS4wODkxNDky\
LDEyOC40NTk0MjUgNTAuNjk2NTM4NiwxMzEuMjYyNTU2IDUzLjMyMzc3NDgsMTMyLjc1NDIzMiBM\
MTE2LjE5ODAxNCwxNjkuMDI1ODY0IEw5NC4zNTMxODA4LDE4MS42NjIxMDIgQzk0LjExMzIzMjUs\
MTgxLjc4OTQzNCA5My44MjU3NDYxLDE4MS43ODk0MzQgOTMuNTg1Nzk3OSwxODEuNjYyMTAyIEw0\
MS4zNTI2MDE1LDE1MS41Mjk1MzQgQzE4LjE0MTk0MjYsMTM4LjA3NjA5OCAxMC4xODE3NjgxLDEw\
OC4zODU1NjIgMjMuNTQ5MzE4MSw4NS4xMjUzMzMgTDIzLjU0OTMxODEsODUuMzgxMTI3MyBaIE0y\
MDMuMDE0NiwxMjcuMDc1NTk4IEwxMzkuOTM1NzI1LDkwLjQ0NTg1NDUgTDE2MS43Mjk0LDc3Ljg2\
MDc3NDggQzE2MS45NjkzNDgsNzcuNzMzNDQzNCAxNjIuMjU2ODM0LDc3LjczMzQ0MzQgMTYyLjQ5\
Njc4Myw3Ny44NjA3NzQ4IEwyMTQuNzI5OTc5LDEwOC4wNDQ1MDIgQzIzMS4wMzIzMjksMTE3LjQ1\
MTc0NyAyNDAuNDM3Mjk0LDEzNS40MjYxMDkgMjM4Ljg3MTUwNCwxNTQuMTgyNzM5IEMyMzcuMzA1\
NzE0LDE3Mi45MzkzNjggMjI1LjA1MDcxOSwxODkuMTA1NTcyIDIwNy40MTQyNjIsMTk1LjY3OTYz\
IEwyMDcuNDE0MjYyLDEzNC4yODg5OTggQzIwNy4zMjI1MjEsMTMxLjI3Njg2NyAyMDUuNjUwNjk3\
LDEyOC41MzU4NTMgMjAzLjAxNDYsMTI3LjA3NTU5OCBaIE0yMjQuNzU3MTE2LDk0LjM4NTA4Njcg\
TDIyMy4yMjIzNSw5My40NjQyMjcyIEwxNzEuNjAzMDYsNjMuMzgyODE3MyBDMTY4Ljk4MTI5Myw2\
MS44NDQzNzUxIDE2NS43MzI0NTYsNjEuODQ0Mzc1MSAxNjMuMTEwNjg5LDYzLjM4MjgxNzMgTDk5\
Ljk4MDY1NTQsOTkuODA3OTI1OSBMOTkuOTgwNjU1NCw3NC41ODY2MDc3IEM5OS45NTMzMDA0LDc0\
LjMyNTQwODggMTAwLjA3MTA5NSw3NC4wNzAxODY5IDEwMC4yODc2MDksNzMuOTIxNTQyNiBMMTUy\
LjUyMDgwNSw0My43ODg5NzM4IEMxNjguODYzMDk4LDM0LjM3NDM1MTggMTg5LjE3NDI1NiwzNS4y\
NTI5MDQzIDIwNC42NDI1NzksNDYuMDQzNDg0MSBDMjIwLjExMDkwMyw1Ni44MzQwNjM4IDIyNy45\
NDkyNjksNzUuNTkyMzk1OSAyMjQuNzU3MTE2LDk0LjE4MDQ1MTMgTDIyNC43NTcxMTYsOTQuMzg1\
MDg2NyBaIE04OC4wNjA2NDA5LDEzOS4wOTc5MzEgTDY2LjIxNTgwNzYsMTI2LjUxMjg1MSBDNjUu\
OTk1MDM5OSwxMjYuMzc5MDkxIDY1Ljg0NTA5NjUsMTI2LjE1NDE3NiA2NS44MDY1MzY3LDEyNS44\
OTg5NDUgTDY1LjgwNjUzNjcsNjUuNjg0OTY2IEM2NS44MzE0NDk1LDQ2LjgyODUzNjcgNzYuNzUw\
MDYwNSwyOS42ODQ2MDMyIDkzLjgyNzA4NTIsMjEuNjg4MzA1NSBDMTEwLjkwNDExLDEzLjY5MjAw\
NzkgMTMxLjA2MzgzMywxNi4yODM1NDYyIDE0NS41NjMyLDI4LjMzODk5OCBMMTQ0LjAyODQzNCwy\
OS4yMDg2OTg2IEw5Mi4zNTc5ODUyLDU5LjAzNDMxNDIgQzg5Ljc0MTkzMjcsNjAuNTY4NzUxMyA4\
OC4xMjgyNTk3LDYzLjM2ODM3NjcgODguMTExNzk5OCw2Ni40MDExOTAxIEw4OC4wNjA2NDA5LDEz\
OS4wOTc5MzEgWiBNOTkuOTI5NDk2NSwxMTMuNTE4NSBMMTI4LjA2Njg3LDk3LjMwMTE0MTcgTDE1\
Ni4yNTU0MDIsMTEzLjUxODUgTDE1Ni4yNTU0MDIsMTQ1Ljk1MzIxOCBMMTI4LjE2OTE4NywxNjIu\
MTcwNTc3IEw5OS45ODA2NTU0LDE0NS45NTMyMTggTDk5LjkyOTQ5NjUsMTEzLjUxODUgWiIgZmls\
bD0iIzAwMDAwMCI+PC9wYXRoPgogICAgPC9nPgo8L3N2Zz4K';
const blockIconURI = menuIconURI;
let theLocale = null;
let ai_user='一般人';
let ai_assistant='簡單回答問題';
let ai_question='';
let ai_model='gpt-4';
//this.prompt='';
let ai_temperature=0.5;
let max_tokens=500;
let ai_top_p=0.9;  //>0 <1
let ai_frequency_penalty=0.8; //>0.1 <0.9
let ai_presence_penalty=0.5;  //>0 <1         

class openai {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        this.api_key ='';
        this.ai_answer = '';
        this.image_size_d2_ary=['1024x1024','512x512','256x256'];
        this.image_size_d3_ary=['1024x1024','1792x1024','1024x1792'];
        //this.runtime.registerPeripheralExtension('openai', this);
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
            id: 'openai',
            name: 'OpenAI',
            color1: '#f95834',
            color2: '#f95834',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'openai_apikey',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'api key'
                        },
                    },
                    text: msg.openai_apikey[theLocale]
                },
                {
                    opcode: 'drawimage_d2',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        NUM: {
                            type: ArgumentType.STRING,
                            menu:'num13',
                            defaultValue: '1'
                        },
                        SIZE: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.size_d2[theLocale][1],
                            menu:'sized2Item'
                        },
                    },
                    text: msg.drawimage_d2[theLocale]
                },
                {
                    opcode: 'drawimage_d3',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        NUM: {
                            type: ArgumentType.STRING,
                            menu:'num13',
                            defaultValue: '1'
                        },
                        SIZE: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.size_d3[theLocale][0],
                            menu:'sized3Item'
                        },
                    },
                    text: msg.drawimage_d3[theLocale]
                },
                
                /*
                {
                    opcode: 'talktext',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        MAX_tokens:{
                            type: ArgumentType.NUMBER,
                            defaultValue: 1000
                        }
                    },
                    text: msg.talktext[theLocale]
                },*/
                '---',
                {
                    opcode: 'set_ai_modle',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MODLE: {
                            type: ArgumentType.STRING,
                            menu:'modleItem',
                            defaultValue: 'gpt-4o'
                        },
                    },
                    text: msg.set_ai_modle[theLocale]
                },
                {
                    opcode: 'set_ai_user',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        USER: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.set_ai_user[theLocale]
                },
                {
                    opcode: 'set_max_token',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TOKEN: {
                            type: ArgumentType.STRING,
                            defaultValue: '500'
                        },
                    },
                    text: msg.set_max_token[theLocale]
                },
                //temperature
                {
                    opcode: 'set_temperature',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEMP: {
                            type: ArgumentType.STRING,
                            defaultValue: '0.5'
                        },
                    },
                    text: msg.set_temperature[theLocale]
                },
                {
                    opcode: 'set_assistant',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ASSISTANT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.set_assistant[theLocale]
                },
                {
                    opcode: 'do_question',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        QUESTION:{
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.set_question[theLocale]
                },
                '---',
                {
                    opcode: 'aianswer',
                    blockType: BlockType.REPORTER,
                    text: msg.ananswer[theLocale],
                    arguments: {
                        id: {
                            type: ArgumentType.STRING,
                            defaultValue: 'id'
                        }
                    },
                },
                {
                    opcode: 'copyTEXT_memory',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.copyTEXT_memory[theLocale]
                },
                
            ],
            menus: {
                sized2Item: {
                    acceptReporters: true,
                    items: msg.size_d2[theLocale],
                },
                sized3Item: {
                    acceptReporters: true,
                    items: msg.size_d3[theLocale],
                },
                num13:{
                    acceptReporters: true,
                    items: ['1','2','3'],
                },
                modleItem:{
                    acceptReporters: true,
                    items: ['gpt-3.5-turbo','gpt-4o'],
                },
            }
        };
    }

    openai_apikey(args){
        this.api_key = args.KEY;
        console.log('api_key=',this.api_key);
    }

    set_ai_modle(args){
        ai_model =args.MODLE;
        console.log('ai_modle=',ai_model);
    }
    set_max_token(args){
        max_tokens=parseInt(args.TOKEN,10);
        if(max_tokens>2000){
            max_tokens=2000;
        }
        console.log('max_tokens=',max_tokens);
    }
    set_temperature(args){
        this.temperature=parseFloat(args.TEMP);
        if(ai_temperature<0){
            ai_temperature=0;
        } 
        if(ai_temperature>1){
            ai_temperature=1;
        }
        console.log('temperature=',ai_temperature);
    }
    async drawimage_d3(args){
        let image_size = args.SIZE;
        let n_num = parseInt(args.NUM,10);
        if(n_num<1){
            n_num=1;
        }
        if(n_num>3){
            n_num = 3;
        }
        for(var i=0;i<this.image_size_d3_ary.length;i++){
            if(image_size==msg.size_d3[theLocale][i]){
                image_size = this.image_size_d3_ary[i];
                break;
            }
        }
        const prompt_text = args.TEXT;
        
        if(this.api_key=='' ||  this.api_key=='api key'){
            alert('api_key is null');
        }
        /*const configuration = new Configuration({
            apiKey: this.api_key,
            //apiKey: process.env.OPENAI_API_KEY,
          });*/
        //let openai_draw = new OpenAIApi(configuration);
        let openai_draw = new OpenAIApi({
            apiKey: this.api_key,
            dangerouslyAllowBrowser: true,
        });
        //console.log('openai_draw=',openai_draw);
        console.log('prompt_text=',prompt_text,image_size);
        try{
            const draw_respone = await openai_draw.images.generate({
                model: "dall-e-3",
                prompt:prompt_text,
                n:n_num,
                quality: "hd",
                size: image_size
            })
          //const  image_url = draw_respone.data.data[0].url
          const  image_url = draw_respone.data;
          console.log('response.data=',draw_respone.data);
          const w_size = image_size.split('x');
          for(n=0;n<draw_respone.data.length;n++){
            window.open(image_url[n].url, 'openAI 生圖功能'+n, 'width=' + w_size[0] + ', height=' + w_size[1] + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');
          }
          
          
        }catch (error) {
            if (error.response) {
              console.log(error.draw_respone.status);
              console.log(error.draw_respone.data);
              alert(error.draw_respone.data);
            } else {
                //console.log('response=',draw_respone);
              console.log(error.message);
              alert(error.message);
            }
        }  
    }

    async drawimage_d2(args){
        let image_size = args.SIZE;
        let n_num = parseInt(args.NUM,10);
        if(n_num<1){
            n_num=1;
        }
        if(n_num>3){
            n_num = 3;
        }
        for(var i=0;i<this.image_size_d2_ary.length;i++){
            if(image_size==msg.size_d2[theLocale][i]){
                image_size = this.image_size_d2_ary[i];
                break;
            }
        }
        const prompt_text = args.TEXT;
        
        if(this.api_key=='' ||  this.api_key=='api key'){
            alert('api_key is null');
        }
        let openai_draw = new OpenAIApi({
            apiKey: this.api_key,
            dangerouslyAllowBrowser: true,
        });
        //console.log('openai_draw=',openai_draw);
        console.log('prompt_text=',prompt_text,image_size);
        try{
            const draw_respone = await openai_draw.images.generate({
                model: "dall-e-2",
                prompt:prompt_text,
                n:n_num,
                quality: "hd",
                size: image_size
            })
          //const  image_url = draw_respone.data.data[0].url
          const  image_url = draw_respone.data ; 
          console.log('response.data=',draw_respone.data);
          const w_size = image_size.split('x');
          for(n=0;n<draw_respone.data.length;n++){
            window.open(image_url[n].url, 'openAI 生圖功能'+n, 'width=' + w_size[0] + ', height=' + w_size[1] + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');
          }
            
          //const  image_url = draw_respone.data.data[0].url
          /*const  image_url = draw_respone.data.data  
          console.log('response.data=',draw_respone.data);
          const w_size = image_size.split('x');
          for(n=0;n<draw_respone.data.data.length;n++){
            window.open(image_url[n].url, 'openAI 生圖功能'+n, 'width=' + w_size[0] + ', height=' + w_size[1] + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');
          }*/
        }catch (error) {
            if (error.response) {
              console.log(error.draw_respone.status);
              console.log(error.draw_respone.data);
              alert(error.draw_respone.data);
            } else {
                //console.log('response=',draw_respone);
              console.log(error.message);
              alert(error.message);
            }
        }  
    }
    /*async talktext(args){
        const input_text = args.TEXT;
        const max_tokens = parseInt(args.MAX_tokens,10);
        if(this.api_key=='' || this.api_key=='api key'){
            this.ai_answer= 'api_key is null';
            return this.ai_answer;
        }else{
        const configuration = new Configuration({
            apiKey: this.api_key,
            //apiKey: process.env.OPENAI_API_KEY,
          });
        let openai_talk = new OpenAIApi(configuration);
        try {
            const completion = await openai_talk.createCompletion({
              model: "text-davinci-003",
              prompt: input_text,
              temperature:0.5,
              max_tokens:max_tokens,
              top_p:1.0,
              frequency_penalty:0.0,
              presence_penalty:0.6,
              //stop:["\n"]
            });
            //await new Promise(resolve => setTimeout(resolve, wait_time));
            this.ai_answer = completion.data.choices[0].text;
            console.log('return text=',completion.data.choices[0].text);
          } catch (error) {
            if (error.response) {                
              console.log('error status=',error.response.status);
              console.log('error data=',error.response.data);
              this.ai_answer = error.response.data.error.message;              
            } else {
              this.ai_answer =  error.message;   
              console.log(error.message);
            }
          }
        }
    }*/

    set_ai_user(args){
        ai_user = args.USER;
    }

    set_assistant(args){
        ai_assistant = args.ASSISTANT;
    }

    async do_question(args){
        ai_question = args.QUESTION;
        console.log('ai_question=',ai_question+ai_assistant);
        if(this.api_key=='' || this.api_key=='api key' || this.ai_question==''){
            this.ai_answer= msg.error_ai35[theLocale];//'api_key system assistant user can not empty';
        }else{

        /*const configuration = new Configuration({
            apiKey: this.api_key,
            //apiKey: process.env.OPENAI_API_KEY,
          });*/
        //const openai = new OpenAIApi(configuration);  
        let openai_question = new OpenAIApi({
            apiKey: this.api_key,
            dangerouslyAllowBrowser: true,
        });
                
        try {
            const completion = await openai_question.chat.completions.create({
            model: ai_model,
            messages: [
                { role: "system", content: ai_user},
                { role: "assistant", content: ai_assistant },
                { role: "user", content: ai_question },
                ],
            temperature: ai_temperature,
            max_tokens: max_tokens,
            top_p: ai_top_p,
            frequency_penalty: ai_frequency_penalty,
            presence_penalty: ai_presence_penalty,
            n: 1,
            stop: "",
            });
            console.log('completion=',completion.choices[0].message.content);
            this.ai_answer = completion.choices[0].message.content;
        } catch (error) {
            console.error(error); 
        };
        
        }
    }

    aianswer(){
        return this.ai_answer;
    }

    copyTEXT_memory(args){
        const copy_text = args.TEXT;
        navigator.clipboard.writeText(copy_text).then(function() {
            console.log('Async: Copying to clipboard was successful!');
          }, function(err) {
            alert(err);
            console.error('Async: Could not copy text: ', err);
          });

    }
      
    /**/
}

module.exports = openai;
