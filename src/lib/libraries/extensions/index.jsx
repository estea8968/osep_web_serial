import React from "react";
import { FormattedMessage } from "react-intl";

import musicIconURL from "./music/music.png";
import musicInsetIconURL from "./music/music-small.svg";

import penIconURL from "./pen/pen.png";
import penInsetIconURL from "./pen/pen-small.svg";

import videoSensingIconURL from "./videoSensing/video-sensing.png";
import videoSensingInsetIconURL from "./videoSensing/video-sensing-small.svg";

import text2speechIconURL from "./text2speech/text2speech.png";
import text2speechInsetIconURL from "./text2speech/text2speech-small.svg";

import translateIconURL from "./translate/translate.png";
import translateInsetIconURL from "./translate/translate-small.png";

import makeymakeyIconURL from "./makeymakey/makeymakey.png";
import makeymakeyInsetIconURL from "./makeymakey/makeymakey-small.svg";

import microbitIconURL from "./microbit/microbit.png";
import microbitInsetIconURL from "./microbit/microbit-small.svg";
import microbitConnectionIconURL from "./microbit/microbit-illustration.svg";
import microbitConnectionSmallIconURL from "./microbit/microbit-small.svg";

import ev3IconURL from "./ev3/ev3.png";
import ev3InsetIconURL from "./ev3/ev3-small.svg";
import ev3ConnectionIconURL from "./ev3/ev3-hub-illustration.svg";
import ev3ConnectionSmallIconURL from "./ev3/ev3-small.svg";

import wedo2IconURL from "./wedo2/wedo.png"; // TODO: Rename file names to match variable/prop names?
import wedo2InsetIconURL from "./wedo2/wedo-small.svg";
import wedo2ConnectionIconURL from "./wedo2/wedo-illustration.svg";
import wedo2ConnectionSmallIconURL from "./wedo2/wedo-small.svg";
import wedo2ConnectionTipIconURL from "./wedo2/wedo-button-illustration.svg";

import boostIconURL from "./boost/boost.png";
import boostInsetIconURL from "./boost/boost-small.svg";
import boostConnectionIconURL from "./boost/boost-illustration.svg";
import boostConnectionSmallIconURL from "./boost/boost-small.svg";
import boostConnectionTipIconURL from "./boost/boost-button-illustration.svg";

import gdxforIconURL from "./gdxfor/gdxfor.png";
import gdxforInsetIconURL from "./gdxfor/gdxfor-small.svg";
import gdxforConnectionIconURL from "./gdxfor/gdxfor-illustration.svg";
import gdxforConnectionSmallIconURL from "./gdxfor/gdxfor-small.svg";

import chartImage from "./chart/chart.png";
import chartInsetIconURL from "./chart/chart-small.png";

import stockInfoImage from "./stockInfo/stockInfo.png";
import stockInfoInsetIconURL from "./stockInfo/stockInfo-small.png";

import googleMapImage from "./googleMap/googleMap.png";
import googleMapInsetIconURL from "./googleMap/googleMap-small.png";

import dataProcessingImage from "./dataProcessing/dataProcessing.png";
import dataProcessingInsetIconURL from "./dataProcessing/dataProcessing-small.png";

import jsonImage from "./json/json.png";
import jsonInsetIconURL from "./json/clound-small.png";
import lassImage from "./lass/lass.png";
import lassInsetIconURL from "./lass/clound-small.png";
import iftttImage from "./ifttt/ifttt.png";
import iftttInsetIconURL from "./ifttt/clound-small.png";
import thingspeakImage from "./thingspeak/thingspeak.png";
import thingspeakInsetIconURL from "./thingspeak/clound-small.png";

import voicetotextImage from "./voicetotext/voicetotext.png";
import voicetotextInsetIconURL from "./voicetotext/voicetotext.svg";

import urltxtImage from "./urltxt/urltxt.png";
import urltxtInsetIconURL from "./urltxt/clound-small.png";
import rwGoogleImage from "./rwgoogle/rwgoogle.png";
import rwGoogleInsetIconURL from "./rwgoogle/clound-small.png";

import webserialArduinoImage from "./webserialArduino/webserialArduino.png";
import webserialArduinoInsetIconURL from "./webserialArduino/webserialArduino-small.png";

import webserialEsp8266Image from "./webserialEsp8266/webserialEsp.png";
import webserialEsp8266InsetIconURL from "./webserialEsp8266/webserialEsp-small.png";

import webserialEsp32Image from "./webserialEsp32/webserialEsp32.png";
import webserialEsp32InsetIconURL from "./webserialEsp32/webserialEsp-small.png";

import webserialPicoboardImage from "./webserialPicoboard/webserialPicoboard.png";
import webserialPicoboardInsetIconURL from "./webserialPicoboard/webserialPicoboard-small.png";

import mqttImage from "./mqtt/mqtt.png";
import mqttInsetIconURL from "./mqtt/mqtt-small.png";

import linenotifyImage from "./linenotify/linenotify.svg";
import linenotifyInsetIconURL from "./linenotify/linenotify_small.svg";

import ml2scratchIconURL from "./ml2scratch/ml2scratch.png";
import ml2scratchInsetIconURL from "./ml2scratch/ml2scratch-small.png";

import posenet2scratchIconURL from "./posenet2scratch/posenet2scratch.png";
import posenet2scratchInsetIconURL from "./posenet2scratch/posenet2scratch-small.png";

import tm2scratchIconURL from "./tm2scratch/tm2scratch.png";
import tm2scratchInsetIconURL from "./tm2scratch/tm2scratch-small.png";

import tmpose2scratchIconURL from "./tmpose2scratch/tmpose2scratch.png";
import tmpose2scratchInsetIconURL from "./tmpose2scratch/tmpose2scratch-small.png";
import qrcodeIconURL from "./qrcode/qrcode.png";
import qrcodeInsetIconURL from "./qrcode/qrcode-small.svg";

let formatMessage = (messageData) => messageData.defaultMessage;
import microbitMoreIconURL from "./microbitMore/entry-icon.png";
import microbitMoreInsetIconURL from "./microbitMore/inset-icon.svg";
import microbitMoreConnectionIconURL from "./microbitMore/connection-icon.svg";
import microbitMoreConnectionSmallIconURL from "./microbitMore/connection-small-icon.svg";
import openaiImage from "./openai/openai.png";
import openaiInsetIconURL from "./openai/openai-small.svg";
const version = "v2-0.2.4";

const translationMap = {
  en: {
    "gui.extension.microbitMore.description": `Play with all functions of micro:bit. (${version})`,
  },
  ja: {
    "gui.extension.microbitMore.description": `micro:bitのすべての機能で遊ぶ。 (${version})`,
  },
  "ja-Hira": {
    "gui.extension.microbitMore.description": `マイクロビットのすべてのきのうであそぶ。 (${version})`,
  },
  "zh-tw": {
    "gui.extension.microbitMore.description": `玩轉micro:bit所有功能. (${version})`,
  },
};

const extensions = [
  {
    name: (
      <FormattedMessage
        defaultMessage="Music"
        description="Name for the 'Music' extension"
        id="gui.extension.music.name"
      />
    ),
    extensionId: "music",
    iconURL: musicIconURL,
    insetIconURL: musicInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Play instruments and drums."
        description="Description for the 'Music' extension"
        id="gui.extension.music.description"
      />
    ),
    featured: true,
  },
  {
    name: (
      <FormattedMessage
        defaultMessage="Pen"
        description="Name for the 'Pen' extension"
        id="gui.extension.pen.name"
      />
    ),
    extensionId: "pen",
    iconURL: penIconURL,
    insetIconURL: penInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Draw with your sprites."
        description="Description for the 'Pen' extension"
        id="gui.extension.pen.description"
      />
    ),
    featured: true,
  },
  {
    name: (
      <FormattedMessage
        defaultMessage="Video Sensing"
        description="Name for the 'Video Sensing' extension"
        id="gui.extension.videosensing.name"
      />
    ),
    extensionId: "videoSensing",
    iconURL: videoSensingIconURL,
    insetIconURL: videoSensingInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Sense motion with the camera."
        description="Description for the 'Video Sensing' extension"
        id="gui.extension.videosensing.description"
      />
    ),
    featured: true,
  },
  {
    name: (
      <FormattedMessage
        defaultMessage="Text to Speech"
        description="Name for the Text to Speech extension"
        id="gui.extension.text2speech.name"
      />
    ),
    extensionId: "text2speech",
    collaborator: "Amazon Web Services",
    iconURL: text2speechIconURL,
    insetIconURL: text2speechInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Make your projects talk."
        description="Description for the Text to speech extension"
        id="gui.extension.text2speech.description"
      />
    ),
    featured: true,
    internetConnectionRequired: true,
  },
  {
    name: (
      <FormattedMessage
        defaultMessage="Translate"
        description="Name for the Translate extension"
        id="gui.extension.translate.name"
      />
    ),
    extensionId: "translate",
    collaborator: "Google",
    iconURL: translateIconURL,
    insetIconURL: translateInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Translate text into many languages."
        description="Description for the Translate extension"
        id="gui.extension.translate.description"
      />
    ),
    featured: true,
    internetConnectionRequired: true,
  },
  {
    name: "Makey Makey",
    extensionId: "makeymakey",
    collaborator: "JoyLabz",
    iconURL: makeymakeyIconURL,
    insetIconURL: makeymakeyInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Make anything into a key."
        description="Description for the 'Makey Makey' extension"
        id="gui.extension.makeymakey.description"
      />
    ),
    featured: true,
  },
  {
    name: "micro:bit",
    extensionId: "microbit",
    collaborator: "micro:bit",
    iconURL: microbitIconURL,
    insetIconURL: microbitInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Connect your projects with the world."
        description="Description for the 'micro:bit' extension"
        id="gui.extension.microbit.description"
      />
    ),
    featured: true,
    disabled: false,
    bluetoothRequired: true,
    internetConnectionRequired: true,
    launchPeripheralConnectionFlow: true,
    useAutoScan: false,
    connectionIconURL: microbitConnectionIconURL,
    connectionSmallIconURL: microbitConnectionSmallIconURL,
    connectingMessage: (
      <FormattedMessage
        defaultMessage="Connecting"
        description="Message to help people connect to their micro:bit."
        id="gui.extension.microbit.connectingMessage"
      />
    ),
    helpLink: "https://scratch.mit.edu/microbit",
  },
  {
    name: "LEGO MINDSTORMS EV3",
    extensionId: "ev3",
    collaborator: "LEGO",
    iconURL: ev3IconURL,
    insetIconURL: ev3InsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Build interactive robots and more."
        description="Description for the 'LEGO MINDSTORMS EV3' extension"
        id="gui.extension.ev3.description"
      />
    ),
    featured: true,
    disabled: false,
    bluetoothRequired: true,
    internetConnectionRequired: true,
    launchPeripheralConnectionFlow: true,
    useAutoScan: false,
    connectionIconURL: ev3ConnectionIconURL,
    connectionSmallIconURL: ev3ConnectionSmallIconURL,
    connectingMessage: (
      <FormattedMessage
        defaultMessage="Connecting. Make sure the pin on your EV3 is set to 1234."
        description="Message to help people connect to their EV3. Must note the PIN should be 1234."
        id="gui.extension.ev3.connectingMessage"
      />
    ),
    helpLink: "https://scratch.mit.edu/ev3",
  },
  {
    name: "LEGO BOOST",
    extensionId: "boost",
    collaborator: "LEGO",
    iconURL: boostIconURL,
    insetIconURL: boostInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Bring robotic creations to life."
        description="Description for the 'LEGO BOOST' extension"
        id="gui.extension.boost.description"
      />
    ),
    featured: true,
    disabled: false,
    bluetoothRequired: true,
    internetConnectionRequired: true,
    launchPeripheralConnectionFlow: true,
    useAutoScan: true,
    connectionIconURL: boostConnectionIconURL,
    connectionSmallIconURL: boostConnectionSmallIconURL,
    connectionTipIconURL: boostConnectionTipIconURL,
    connectingMessage: (
      <FormattedMessage
        defaultMessage="Connecting"
        description="Message to help people connect to their BOOST."
        id="gui.extension.boost.connectingMessage"
      />
    ),
    helpLink: "https://scratch.mit.edu/boost",
  },
  {
    name: "LEGO Education WeDo 2.0",
    extensionId: "wedo2",
    collaborator: "LEGO",
    iconURL: wedo2IconURL,
    insetIconURL: wedo2InsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Build with motors and sensors."
        description="Description for the 'LEGO WeDo 2.0' extension"
        id="gui.extension.wedo2.description"
      />
    ),
    featured: true,
    disabled: false,
    bluetoothRequired: true,
    internetConnectionRequired: true,
    launchPeripheralConnectionFlow: true,
    useAutoScan: true,
    connectionIconURL: wedo2ConnectionIconURL,
    connectionSmallIconURL: wedo2ConnectionSmallIconURL,
    connectionTipIconURL: wedo2ConnectionTipIconURL,
    connectingMessage: (
      <FormattedMessage
        defaultMessage="Connecting"
        description="Message to help people connect to their WeDo."
        id="gui.extension.wedo2.connectingMessage"
      />
    ),
    helpLink: "https://scratch.mit.edu/wedo",
  },
  {
    name: "Go Direct Force & Acceleration",
    extensionId: "gdxfor",
    collaborator: "Vernier",
    iconURL: gdxforIconURL,
    insetIconURL: gdxforInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Sense push, pull, motion, and spin."
        description="Description for the Vernier Go Direct Force and Acceleration sensor extension"
        id="gui.extension.gdxfor.description"
      />
    ),
    featured: true,
    disabled: false,
    bluetoothRequired: true,
    internetConnectionRequired: true,
    launchPeripheralConnectionFlow: true,
    useAutoScan: false,
    connectionIconURL: gdxforConnectionIconURL,
    connectionSmallIconURL: gdxforConnectionSmallIconURL,
    connectingMessage: (
      <FormattedMessage
        defaultMessage="Connecting"
        description="Message to help people connect to their force and acceleration sensor."
        id="gui.extension.gdxfor.connectingMessage"
      />
    ),
    helpLink: "https://scratch.mit.edu/vernier",
  },
  {
    name: "圖表",
    extensionId: "chart",
    collaborator: "TYiC",
    iconURL: chartImage,
    insetIconURL: chartInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Chart"
        description="Chart extension"
        id="gui.extension.chart.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    useAutoScan: false,
    helpLink: "https://github.com/estea8968/scratch3-internet",
  },
  {
    name: "股票資訊",
    extensionId: "stockInfo",
    collaborator: "TYiC",
    iconURL: stockInfoImage,
    insetIconURL: stockInfoInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Stock Infomation"
        description="StockInfo extension"
        id="gui.extension.stockInfo.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    useAutoScan: false,
    helpLink: "https://github.com/estea8968/scratch3-internet",
  },
  {
    name: "Google Map",
    extensionId: "googleMap",
    collaborator: "TYiC",
    iconURL: googleMapImage,
    insetIconURL: googleMapInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Google Map"
        description="Google Map extension"
        id="gui.extension.googleMap.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    useAutoScan: false,
    helpLink: "https://github.com/estea8968/scratch3-internet",
  },
  {
    name: "數位資料表示與處理",
    extensionId: "dataProcessing",
    collaborator: "TYiC",
    iconURL: dataProcessingImage,
    insetIconURL: dataProcessingInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Data Processing"
        description="Data Processing extension"
        id="gui.extension.dataProcessing.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    useAutoScan: false,
    helpLink: "https://github.com/estea8968/scratch3-internet",
  },
  {
    name: "JSON",
    extensionId: "gasoJSON",
    collaborator: "gasolin,TYiC",
    iconURL: jsonImage,
    insetIconURL: jsonInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Fetch JSON."
        description="Fetch JSON extension"
        id="gui.extension.gasojson.description"
      />
    ),
    featured: true,
    disabled: false,
    // bluetoothRequired: false,
    internetConnectionRequired: true,
    // launchPeripheralConnectionFlow: false,
    useAutoScan: false,
    helpLink: "https://github.com/gasolin/scratch3-internet",
  },
  {
    name: "IFTTT",
    extensionId: "gasoIFTTT",
    collaborator: "gasolin",
    iconURL: iftttImage,
    insetIconURL: iftttInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="IFTTT Webhook"
        description="IFTTT Webhook extension"
        id="gui.extension.gasoifttt.description"
      />
    ),
    featured: true,
    disabled: false,
    // bluetoothRequired: false,
    internetConnectionRequired: true,
    // launchPeripheralConnectionFlow: false,
    useAutoScan: false,
    helpLink: "https://github.com/gasolin/scratch3-internet",
  },
  {
    name: "LASS",
    extensionId: "gasoLASS",
    collaborator: "gasolin",
    iconURL: lassImage,
    insetIconURL: lassInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Fetch LASS."
        description="Fetch LASS extension"
        id="gui.extension.gasolass.description"
      />
    ),
    featured: true,
    disabled: false,
    // bluetoothRequired: false,
    internetConnectionRequired: true,
    // launchPeripheralConnectionFlow: false,
    useAutoScan: false,
    helpLink: "https://github.com/gasolin/scratch3-internet",
  },
  {
    name: "ThingSpeak",
    extensionId: "gasoThingSpeak",
    collaborator: "gasolin",
    iconURL: thingspeakImage,
    insetIconURL: thingspeakInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Send data to ThingSpeak."
        description="ThingSpeak extension"
        id="gui.extension.gasothingspeak.description"
      />
    ),
    featured: true,
    disabled: false,
    // bluetoothRequired: false,
    internetConnectionRequired: true,
    // launchPeripheralConnectionFlow: false,
    useAutoScan: false,
    helpLink: "https://github.com/gasolin/scratch3-internet",
  },
  {
    name: "Speech to Text",
    extensionId: "voicetoTEXT",
    collaborator: "estea chen",
    iconURL: voicetotextImage,
    insetIconURL: voicetotextInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Convert speech to text."
        description="Speech To Text extension"
        id="gui.extension.voicetotext.description"
      />
    ),
    featured: true,
    disabled: false,
    // bluetoothRequired: false,
    internetConnectionRequired: false,
    // launchPeripheralConnectionFlow: false,
    useAutoScan: false,
    helpLink: "https://github.com/estea8968/scratch3-internet",
  },
  {
    name: "URL & Text File",
    extensionId: "urlTXT",
    collaborator: "estea chen",
    iconURL: urltxtImage,
    insetIconURL: urltxtInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Read and write text files and open a URL."
        description="get url text data extension"
        id="gui.extension.urltxt.description"
      />
    ),
    featured: true,
    disabled: false,
    // bluetoothRequired: false,
    internetConnectionRequired: true,
    // launchPeripheralConnectionFlow: false,
    useAutoScan: false,
    helpLink: "https://github.com/estea8968/scratch3-internet",
  },

  {
    name: "Google Sheets",
    extensionId: "rwGoogle",
    collaborator: "TYiC",
    iconURL: rwGoogleImage,
    insetIconURL: rwGoogleInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Read and write Google Sheets and Google Forms."
        description="read write google sheets extension"
        id="gui.extension.rwgoogle.description"
      />
    ),
    featured: true,
    disabled: false,
    // bluetoothRequired: false,
    internetConnectionRequired: true,
    // launchPeripheralConnectionFlow: false,
    useAutoScan: false,
    helpLink: "https://github.com/estea8968/scratch3-internet",
  },
  {
    name: "Web Serial Arduino",
    extensionId: "webserialArduino",
    collaborator: "estea chen",

    iconURL: webserialArduinoImage,
    insetIconURL: webserialArduinoInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Connect Arudino and Google Chrome using Web Serial API."
        description="Web serial for the Arduino extension"
        id="gui.extension.WebSerialArduino.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    bluetoothRequired: false,
    helpLink: "https://sites.google.com/view/scratch-web-serial-api/",
  },
  {
    name: "Web Serial ESP-8266",
    extensionId: "webserialEsp",
    collaborator: "estea chen",
    iconURL: webserialEsp8266Image,
    insetIconURL: webserialEsp8266InsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Connect ESP-8266 and Google Chrome with Web Serial API."
        description="Webserial ESP-8266 extension"
        id="gui.extension.WebserialEsp.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    bluetoothRequired: false,
    helpLink: "https://sites.google.com/view/scratch-web-serial-api/",
  },
  {
    name: "Webserial ESP-32",
    extensionId: "webserialEsp32",
    collaborator: "estea chen",
    iconURL: webserialEsp32Image,
    insetIconURL: webserialEsp32InsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Webserial ESP-32"
        description="Webserial ESP-32 extension"
        id="gui.extension.WebserialEsp32.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    bluetoothRequired: false,
    helpLink: "https://sites.google.com/view/scratch-web-serial-api/",
  },
  {
    name: "WebSerial Picoboard",
    extensionId: "webserialPicoboard",
    collaborator: "estea chen",
    iconURL: webserialPicoboardImage,
    insetIconURL: webserialPicoboardInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="WebSerial Picoboard"
        description="WebSerial Picoboard extension"
        id="gui.extension.WebSerialPcoboard.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    bluetoothRequired: false,
    helpLink: "https://ys-fang.github.io/OSEP/app/",
  },
  {
    name: "MQTT",
    extensionId: "mqtt",
    collaborator: "estea chen",
    iconURL: mqttImage,
    insetIconURL: mqttInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Use MQTT for data transfer."
        description="MQTT extension"
        id="gui.extension.Mqtt.description"
      />
    ),
    featured: true,

    disabled: false,
    internetConnectionRequired: true,
    bluetoothRequired: false,
    //helpLink: ''
  },
  {
    name: "LineNotify",
    extensionId: "linenotify",
    collaborator: "estea chen",
    iconURL: linenotifyImage,
    insetIconURL: linenotifyInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Use Line Notify send message."
        description="Line Notify extension"
        id="gui.extension.linenotify.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    bluetoothRequired: false,
    //helpLink: ''
  },
  {
    name: "ML2Scratch",
    extensionId: "ml2scratch",
    collaborator: "champierre",
    iconURL: ml2scratchIconURL,
    insetIconURL: ml2scratchInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Machine learning for Scratch"
        description="ML2Scratch Blocks."
        id="gui.extension.ml2scratchblocks.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    bluetoothRequired: false,
  },
  {
    name: "Posenet2Scratch",
    extensionId: "posenet2scratch",
    collaborator: "champierre",
    iconURL: posenet2scratchIconURL,
    insetIconURL: posenet2scratchInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Pose detection for Scratch"
        description="PoseNet2Scratch Blocks."
        id="gui.extension.posenet2scratchblocks.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    bluetoothRequired: false,
  },
  {
    name: "TM2Scratch",
    extensionId: "tm2scratch",
    collaborator: "Tsukurusha, YengawaLab and Google",
    iconURL: tm2scratchIconURL,
    insetIconURL: tm2scratchInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Machine learning for images and sound"
        description="画像や音声を学習させよう。"
        id="gui.extension.tm2scratchblocks.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    bluetoothRequired: false,
  },
  {
    name: "Microbit More",
    extensionId: "microbitMore",
    //extensionURL: 'https://microbit-more.github.io/dist/microbitMore.mjs',
    collaborator: "Yengawa Lab",
    iconURL: microbitMoreIconURL,
    insetIconURL: microbitMoreInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Play with all functions of micro:bit."
        description="Description for the 'Microbit More' extension"
        id="gui.extension.microbitMore.description"
      />
    ),
    /*get description () {
        return formatMessage({
            defaultMessage: 'Play with all functions of micro:bit.',
            description: "Description for the 'Microbit More' extension",
            id: 'gui.extension.microbitMore.description'
        });
    },*/
    featured: true,
    disabled: false,
    bluetoothRequired: true,
    internetConnectionRequired: false,
    launchPeripheralConnectionFlow: true,
    useAutoScan: false,
    connectionIconURL: microbitMoreConnectionIconURL,
    connectionSmallIconURL: microbitMoreConnectionSmallIconURL,
    get connectingMessage() {
      return formatMessage({
        defaultMessage: "Connecting",
        description: "Message to help people connect to their micro:bit.",
        id: "gui.extension.microbit.connectingMessage",
      });
    },
    helpLink: "https://microbit-more.github.io/",
    setFormatMessage: (formatter) => {
      formatMessage = formatter;
    },
    translationMap: translationMap,
  },
  {
    name: (
      <FormattedMessage
        defaultMessage="QR Code"
        description="Name for the QR Code extension"
        id="gui.extension.qrcodeblocks.name"
      />
    ),
    extensionId: "qrcode",
    collaborator: "Sugiura Lab",
    iconURL: qrcodeIconURL,
    insetIconURL: qrcodeInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Scan QR Code.{credit_en}"
        description="Description for the QR Code extension"
        values={{
          credit_ja: (
            <div style={{ fontSize: "0.6em" }}>
              QRコードは株式会社デンソーウェーブの登録商標です。
            </div>
          ),
          credit_ja_Hira: (
            <div
              style={{
                fontSize: "0.6em",
                lineHeight: "1.3",
                marginTop: "0.5em",
              }}
            >
              QRコードはかぶしきがいしゃデンソーウェーブのとうろくしょうひょうです。
            </div>
          ),
          credit_en: (
            <div style={{ fontSize: "0.6em" }}>
              QR Code is a registered trademark of DENSO WAVE.
            </div>
          ),
        }}
        id="gui.extension.qrcodeblocks.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: false,
    bluetoothRequired: false,
    translationMap: {
      ja: {
        "gui.extension.qrcodeblocks.name": "QRコード",
        "gui.extension.qrcodeblocks.description":
          "QRコードを読み取ります。{credit_ja}",
      },
      "ja-Hira": {
        "gui.extension.qrcodeblocks.name": "QRコード",
        "gui.extension.qrcodeblocks.description":
          "QRコードをよみとります。{credit_ja_Hira}",
      },
    },
  },
  {
    name: "TMPose2Scratch",
    extensionId: "tmpose2scratch",
    collaborator: "Tsukurusha, YengawaLab and Google",
    iconURL: tmpose2scratchIconURL,
    insetIconURL: tmpose2scratchInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Recognize your own poses."
        description="Recognize your own poses."
        id="gui.extension.tmpose2scratchblocks.description"
      />
    ),
    featured: true,
    disabled: false,
    internetConnectionRequired: true,
    bluetoothRequired: false,
    translationMap: {
      ja: {
        "gui.extension.tmpose2scratchblocks.description":
          "ポーズを学習させよう。",
      },
      "ja-Hira": {
        "gui.extension.tmpose2scratchblocks.description":
          "ポーズをがくしゅうさせよう。",
      },
      en: {
        "gui.extension.tmpose2scratchblocks.description":
          "Recognize your own poses.",
      },
      ko: {
        "gui.extension.tmpose2scratchblocks.description":
          "나의 몸동작 포즈를 인식해볼까요",
      },
    },
  },
  {
    name: "OPENAI",
    extensionId: "openai",
    collaborator: "estea,chen",
    iconURL: openaiImage,
    insetIconURL: openaiInsetIconURL,
    description: (
      <FormattedMessage
        defaultMessage="Fetch OPENAI."
        description="Fetch OPENAI extension"
        id="gui.extension.openai.description"
      />
    ),
    featured: true,
    disabled: false,
    // bluetoothRequired: false,
    internetConnectionRequired: true,
    // launchPeripheralConnectionFlow: false,
    useAutoScan: false,
    helpLink: "https://openai.com/",
  },
];
export { extensions };
export default extensions;
