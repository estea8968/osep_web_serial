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

//# Point to the local server

const menuIconURI = 'data:image/png;base64,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';
const blockIconURI = menuIconURI;
let theLocale = null;
//let ai_assistant='簡單回答問題';
let ai_question='';
//this.prompt='';

class scratch3_llmstudio {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        this.ai_server ='http://127.0.0.1:1234/v1';
        this.ai_answer = '';
        this.ai_mode ='';
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
            id: 'llmstudio',
            name: 'LLMStudio',
            color1: '#f95834',
            color2: '#f95834',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                /*{
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
                '---',*/
                {
                    opcode: 'set_ai_modle',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MODLE: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.set_ai_modle[theLocale]
                },
                {
                    opcode: 'set_ai_server',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: this.ai_server,
                        },
                    },
                    text: msg.set_ai_server[theLocale]
                },
                /*{
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
                },*/
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
                
                /*modleItem:{
                    acceptReporters: true,
                    items: ['gpt-3.5-turbo','gpt-4o'],
                },*/
            }
        };
    }

    /*openai_apikey(args){
        this.api_key = args.KEY;
        console.log('api_key=',this.api_key);
    }*/
    set_ai_modle(args){
        this.ai_mode=args.MODLE;
        console.log('ai_mode=',this.ai_mode);
    }
    set_ai_server(args){
        this.ai_server =args.URL;
        console.log('ai_server=',this.ai_server);
    }
    

    async do_question(args){
        ai_question = args.QUESTION;
        console.log('ai_question=',ai_question);

        /*client = new OpenAIApi();
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input="Hello world! This is a streaming test.",
        )  //https://platform.openai.com/docs/guides/text-to-speech/quickstart
        response.stream_to_file("output.mp3");*/

        if(ai_question.trim()=='' | this.ai_mode.trim()==''){
            this.ai_answer= msg.error_input[theLocale];//'api_key system assistant user can not empty';
        }else{

        /*const configuration = new Configuration({
            apiKey: this.api_key,
            //apiKey: process.env.OPENAI_API_KEY,
          });*/
        //const openai = new OpenAIApi(configuration);  
        //const lms_client = new OpenAIApi(base_url="http://localhost:12345/v1", api_key="lm-studio");
        let openai_question = new OpenAIApi({
            baseURL: this.ai_server,
            apiKey: 'lm-studio',
            dangerouslyAllowBrowser: true,
        });
                
        try {
            const completion = await openai_question.chat.completions.create({
            //model: ai_model,
            model:this.ai_mode, //"lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF",  used
            messages: [
                //{ role: "system", content: ai_user},
                //{ role: "assistant", content: ai_assistant },
                { role: "user", content: ai_question },
                ],
            /*temperature: ai_temperature,
            max_tokens: max_tokens,
            top_p: ai_top_p,
            frequency_penalty: ai_frequency_penalty,
            presence_penalty: ai_presence_penalty,
            n: 1,
            stop: "",*/
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

module.exports = scratch3_llmstudio;
