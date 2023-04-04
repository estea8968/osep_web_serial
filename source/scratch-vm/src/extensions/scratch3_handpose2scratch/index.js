const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const ml5 = require('ml5');


const blockIconURI = 'data:image/png;base64,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';

const Message = {
  getX: {
    'ja': '[LANDMARK] のx座標',
    'ja-Hira': '[LANDMARK] のxざひょう',
    'en': 'x of [LANDMARK]',
    'zh-tw': '[LANDMARK]的x',
  },
  getY: {
    'ja': '[LANDMARK] のy座標',
    'ja-Hira': '[LANDMARK] のyざひょう',
    'en': 'y of [LANDMARK]',
    'zh-tw': '[LANDMARK]的y',
  },
  getZ: {
    'ja': '[LANDMARK] のz座標',
    'ja-Hira': '[LANDMARK] のzざひょう',
    'en': 'z of [LANDMARK]',
    'zh-tw': '[LANDMARK]的z',
  },
  videoToggle: {
    'ja': 'ビデオを [VIDEO_STATE] にする',
    'ja-Hira': 'ビデオを [VIDEO_STATE] にする',
    'en': 'turn video [VIDEO_STATE]',
    'zh-tw': '切換影像[VIDEO_STATE]',
  },
  setRatio: {
    'ja': '倍率を [RATIO] にする',
    'ja-Hira': 'ばいりつを [RATIO] にする',
    'en': 'set ratio to [RATIO]',
    'zh-tw': '比值設置為 [RATIO]',
  },
  setInterval: {
    'ja': '認識を [INTERVAL] 秒ごとに行う',
    'ja-Hira': 'にんしきを [INTERVAL] びょうごとにおこなう',
    'en': 'Label once every [INTERVAL] seconds',
    'zh-tw': '每 [INTERVAL] 秒標記一次',
  },
  on: {
    'ja': '入',
    'ja-Hira': 'いり',
    'en': 'on',
    'zh-tw': '開',
  },
  off: {
    'ja': '切',
    'ja-Hira': 'きり',
    'en': 'off',
    'zh-tw': '關',
  },
  video_on_flipped: {
    'ja': '左右反転',
    'ja-Hira': 'さゆうはんてん',
    'en': 'on flipped',
    'zh-tw': '左右反轉',
  },
  please_wait: {
    'ja': '準備に時間がかかります。少しの間、操作ができなくなりますがお待ち下さい。',
    'ja-Hira': 'じゅんびにじかんがかかります。すこしのあいだ、そうさができなくなりますがおまちください。',
    'en': 'Setup takes a while. The browser will get stuck, but please wait.',
    'zh-tw': '安裝需要一段時間。 瀏覽器會暫時卡頓，請稍候。',
  },
  landmarks: [
    {
      'ja': '手首',
      'ja-Hira': 'てくび',
      'en': 'wrist',
      'zh-tw': '手腕',
    },
    {
      'ja': '親指の根元',
      'ja-Hira': 'おやゆびのねもと',
      'en': 'the base of thumb',
      'zh-tw': '拇指根部',
    },
    {
      'ja': '親指の第2関節',
      'ja-Hira': 'おやゆびのだい2かんせつ',
      'en': 'the 2nd joint of thumb',
      'zh-tw': '拇指第二關節',
    },
    {
      'ja': '親指の第1関節',
      'ja-Hira': 'おやゆびのだい1かんせつ',
      'en': 'the 1st joint of thumb',
      'zh-tw': '拇指第一關節',
    },
    {
      'ja': '親指の先端',
      'ja-Hira': 'おやゆびのさき',
      'en': 'thumb',
      'zh-tw': '拇指尖',
    },
    {
      'ja': '人差し指の第3関節',
      'ja-Hira': 'ひとさしゆびのだい3かんせつ',
      'en': 'the 3rd joint of index finger',
      'zh-tw': '食指第三關節',
    },
    {
      'ja': '人差し指の第2関節',
      'ja-Hira': 'ひとさしゆびのだい2かんせつ',
      'en': 'the 2nd joint of index finger',
      'zh-tw': '食指第二關節',
    },
    {
      'ja': '人差し指の第1関節',
      'ja-Hira': 'ひとさしゆびのだい1かんせつ',
      'en': 'the 1st joint of index finger',
      'zh-tw': '食指第一關節',
    },
    {
      'ja': '人差し指の先端',
      'ja-Hira': 'ひとさしゆびのせんたん',
      'en': 'index finger',
      'zh-tw': '食指尖',
    },
    {
      'ja': '中指の第3関節',
      'ja-Hira': 'なかゆびのだい3かんせつ',
      'en': 'the 3rd joint of middle finger',
      'zh-tw': '中指第三關節',
    },
    {
      'ja': '中指の第2関節',
      'ja-Hira': 'なかゆびのだい2かんせつ',
      'en': 'the 2nd joint of middle finger',
      'zh-tw': '中指第二關節',
    },
    {
      'ja': '中指の第1関節',
      'ja-Hira': 'なかゆびのだい1かんせつ',
      'en': 'the 1st joint of middle finger',
      'zh-tw': '中指第一關節',
    },
    {
      'ja': '中指の先端',
      'ja-Hira': 'なかゆびのせんたん',
      'en': 'middle finger',
      'zh-tw': '中指尖',
    },
    {
      'ja': '薬指の第3関節',
      'ja-Hira': 'くすりゆびのだい3かんせつ',
      'en': 'the 3rd joint of ring finger',
      'zh-tw': '無名指第三關節',
    },
    {
      'ja': '薬指の第2関節',
      'ja-Hira': 'くすりゆびのだい2かんせつ',
      'en': 'the 2nd joint of ring finger',
      'zh-tw': '無名指第二關節',
    },
    {
      'ja': '薬指の第1関節',
      'ja-Hira': 'くすりゆびのだい1かんせつ',
      'en': 'the 1st joint of ring finger',
      'zh-tw': '無名指第一關節',
    },
    {
      'ja': '薬指の先端',
      'ja-Hira': 'くすりゆびのせんたん',
      'en': 'ring finger',
      'zh-tw': '無名指尖',
    },
    {
      'ja': '小指の第3関節',
      'ja-Hira': 'こゆびのだい3かんせつ',
      'en': 'the 3rd joint of little finger',
      'zh-tw': '小指第三關節',
    },
    {
      'ja': '小指の第2関節',
      'ja-Hira': 'こゆびのだい2かんせつ',
      'en': 'the 2nd joint of little finger',
      'zh-tw': '小指第二關節',
    },
    {
      'ja': '小指の第1関節',
      'ja-Hira': 'こゆびのだい1かんせつ',
      'en': 'the 1st joint of little finger',
      'zh-tw': '小指第一關節',
    },
    {
      'ja': '小指の先端',
      'ja-Hira': 'こゆびのせんたん',
      'en': 'little finger',
      'zh-tw': '小指尖',
    }
  ]
}
const AvailableLocales = ['en', 'ja', 'ja-Hira','zh-tw'];

class Scratch3Handpose2ScratchBlocks {
    get LANDMARK_MENU () {
      landmark_menu = [];
      for (let i = 1; i <= 21; i++) {
        landmark_menu.push({text: `${Message.landmarks[i - 1][this._locale]} (${i})`, value: String(i)})
      }
      return landmark_menu;
    }

    get VIDEO_MENU () {
      return [
          {
            text: Message.off[this._locale],
            value: 'off'
          },
          {
            text: Message.on[this._locale],
            value: 'on'
          },
          {
            text: Message.video_on_flipped[this._locale],
            value: 'on-flipped'
          }
      ]
    }

    get INTERVAL_MENU () {
      return [
          {
            text: '0.1',
            value: '0.1'
          },
          {
            text: '0.2',
            value: '0.2'
          },
          {
            text: '0.5',
            value: '0.5'
          },
          {
            text: '1.0',
            value: '1.0'
          }
      ]
    }

    get RATIO_MENU () {
      return [
          {
            text: '0.5',
            value: '0.5'
          },
          {
            text: '0.75',
            value: '0.75'
          },
          {
            text: '1',
            value: '1'
          },
          {
            text: '1.5',
            value: '1.5'
          },
          {
            text: '2.0',
            value: '2.0'
          }
      ]
    }

    constructor (runtime) {
        this.runtime = runtime;

        this.landmarks = [];
        this.ratio = 0.75;

        this.detectHand = () => {
          this.video = this.runtime.ioDevices.video.provider.video;

          alert(Message.please_wait[this._locale]);

          const handpose = ml5.handpose(this.video, function() {
            console.log("Model loaded!")
          });

          handpose.on('predict', hands => {
            hands.forEach(hand => {
              this.landmarks = hand.landmarks;
            });
          });
        }
        this.runtime.ioDevices.video.enableVideo().then(this.detectHand)
    }

    getInfo () {
        this._locale = this.setLocale();

        return {
            id: 'handpose2scratch',
            name: 'Handpose2Scratch',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'getX',
                    blockType: BlockType.REPORTER,
                    text: Message.getX[this._locale],
                    arguments: {
                        LANDMARK: {
                            type: ArgumentType.STRING,
                            menu: 'landmark',
                            defaultValue: '1'
                        }
                    }
                },
                {
                    opcode: 'getY',
                    blockType: BlockType.REPORTER,
                    text: Message.getY[this._locale],
                    arguments: {
                        LANDMARK: {
                            type: ArgumentType.STRING,
                            menu: 'landmark',
                            defaultValue: '1'
                        }
                    }
                },
                {
                  opcode: 'getZ',
                  blockType: BlockType.REPORTER,
                  text: Message.getZ[this._locale],
                  arguments: {
                      LANDMARK: {
                          type: ArgumentType.STRING,
                          menu: 'landmark',
                          defaultValue: '1'
                      }
                  }
                },
                {
                    opcode: 'videoToggle',
                    blockType: BlockType.COMMAND,
                    text: Message.videoToggle[this._locale],
                    arguments: {
                        VIDEO_STATE: {
                            type: ArgumentType.STRING,
                            menu: 'videoMenu',
                            defaultValue: 'off'
                        }
                    }
                },
                {
                  opcode: 'setVideoTransparency',
                  text: formatMessage({
                      id: 'videoSensing.setVideoTransparency',
                      default: 'set video transparency to [TRANSPARENCY]',
                      description: 'Controls transparency of the video preview layer'
                  }),
                  arguments: {
                      TRANSPARENCY: {
                          type: ArgumentType.NUMBER,
                          defaultValue: 50
                      }
                  }
                },
                {
                    opcode: 'setRatio',
                    blockType: BlockType.COMMAND,
                    text: Message.setRatio[this._locale],
                    arguments: {
                        RATIO: {
                            type: ArgumentType.STRING,
                            menu: 'ratioMenu',
                            defaultValue: '0.75'
                        }
                    }
                }
            ],
            menus: {
              landmark: {
                acceptReporters: true,
                items: this.LANDMARK_MENU
              },
              videoMenu: {
                acceptReporters: true,
                items: this.VIDEO_MENU
              },
              ratioMenu: {
                acceptReporters: true,
                items: this.RATIO_MENU
              },
              intervalMenu: {
                acceptReporters: true,
                items: this.INTERVAL_MENU
              }
            }
        };
    }

    getX (args) {
      let landmark = parseInt(args.LANDMARK, 10) - 1;
      if (this.landmarks[landmark]) {
        if (this.runtime.ioDevices.video.mirror === false) {
          return -1 * (240 - this.landmarks[landmark][0] * this.ratio);
        } else {
          return 240 - this.landmarks[landmark][0] * this.ratio;
        }
      } else {
        return "";
      }
    }

    getY (args) {
      let landmark = parseInt(args.LANDMARK, 10) - 1;
      if (this.landmarks[landmark]) {
        return 180 - this.landmarks[landmark][1] * this.ratio;
      } else {
        return "";
      }
    }

    getZ (args) {
      let landmark = parseInt(args.LANDMARK, 10) - 1;
      if (this.landmarks[landmark]) {
        return this.landmarks[landmark][2];
      } else {
        return "";
      }
    }

    videoToggle (args) {
      let state = args.VIDEO_STATE;
      if (state === 'off') {
        this.runtime.ioDevices.video.disableVideo();
      } else {
        this.runtime.ioDevices.video.enableVideo().then(this.detectHand);
        this.runtime.ioDevices.video.mirror = state === "on";
      }
    }


    /**
     * A scratch command block handle that configures the video preview's
     * transparency from passed arguments.
     * @param {object} args - the block arguments
     * @param {number} args.TRANSPARENCY - the transparency to set the video
     *   preview to
     */
    setVideoTransparency (args) {
        const transparency = Cast.toNumber(args.TRANSPARENCY);
        this.globalVideoTransparency = transparency;
        this.runtime.ioDevices.video.setPreviewGhost(transparency);
    }

    setRatio (args) {
      this.ratio = parseFloat(args.RATIO);
    }

    setLocale() {
      let locale = formatMessage.setup().locale;
      if (AvailableLocales.includes(locale)) {
        return locale;
      } else {
        return 'en';
      }
    }
}

module.exports = Scratch3Handpose2ScratchBlocks;
