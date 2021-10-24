import React from 'react';
import {FormattedMessage} from 'react-intl';

import musicIconURL from './music/music.png';
import musicInsetIconURL from './music/music-small.svg';

import penIconURL from './pen/pen.png';
import penInsetIconURL from './pen/pen-small.svg';

import videoSensingIconURL from './videoSensing/video-sensing.png';
import videoSensingInsetIconURL from './videoSensing/video-sensing-small.svg';

import text2speechIconURL from './text2speech/text2speech.png';
import text2speechInsetIconURL from './text2speech/text2speech-small.svg';

import translateIconURL from './translate/translate.png';
import translateInsetIconURL from './translate/translate-small.png';

import makeymakeyIconURL from './makeymakey/makeymakey.png';
import makeymakeyInsetIconURL from './makeymakey/makeymakey-small.svg';

import microbitIconURL from './microbit/microbit.png';
import microbitInsetIconURL from './microbit/microbit-small.svg';
import microbitConnectionIconURL from './microbit/microbit-illustration.svg';
import microbitConnectionSmallIconURL from './microbit/microbit-small.svg';

import ev3IconURL from './ev3/ev3.png';
import ev3InsetIconURL from './ev3/ev3-small.svg';
import ev3ConnectionIconURL from './ev3/ev3-hub-illustration.svg';
import ev3ConnectionSmallIconURL from './ev3/ev3-small.svg';

import wedo2IconURL from './wedo2/wedo.png'; // TODO: Rename file names to match variable/prop names?
import wedo2InsetIconURL from './wedo2/wedo-small.svg';
import wedo2ConnectionIconURL from './wedo2/wedo-illustration.svg';
import wedo2ConnectionSmallIconURL from './wedo2/wedo-small.svg';
import wedo2ConnectionTipIconURL from './wedo2/wedo-button-illustration.svg';

import boostIconURL from './boost/boost.png';
import boostInsetIconURL from './boost/boost-small.svg';
import boostConnectionIconURL from './boost/boost-illustration.svg';
import boostConnectionSmallIconURL from './boost/boost-small.svg';
import boostConnectionTipIconURL from './boost/boost-button-illustration.svg';

import gdxforIconURL from './gdxfor/gdxfor.png';
import gdxforInsetIconURL from './gdxfor/gdxfor-small.svg';
import gdxforConnectionIconURL from './gdxfor/gdxfor-illustration.svg';
import gdxforConnectionSmallIconURL from './gdxfor/gdxfor-small.svg';

import jsonImage from './json/json.png';
import lassImage from './lass/lass.png';
import iftttImage from './ifttt/ifttt.png';
import thingspeakImage from './thingspeak/thingspeak.png';

import voicetotextImage from './voicetotext/voicetotext.png';
import voicetotextInsetIconURL from './voicetotext/voicetotext.svg';

import urltxtImage from './urltxt/urltxt.png';
import urltxtInsetIconURL from './urltxt/urltxt.svg';
import rwGoogleImage from './rwgoogle/rwgoogle.png';
import rwGoogleInsetIconURL from './rwgoogle/rwgoogle.svg';

import knnalgorithmImage from './knnAlgorithm/knnAlgorithm.png';
import knnalgorithmInsetImage from './knnAlgorithm/knnAlgorithm-small.svg';

import webserialArduinoImage from './webserialArduino/webserialArduino.png';
import webserialArduinoInsetIconURL from './webserialArduino/onegpioArduino-small.png';


export default [
    {
        name: (
            <FormattedMessage
                defaultMessage="Music"
                description="Name for the 'Music' extension"
                id="gui.extension.music.name"
            />
        ),
        extensionId: 'music',
        iconURL: musicIconURL,
        insetIconURL: musicInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Play instruments and drums."
                description="Description for the 'Music' extension"
                id="gui.extension.music.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Pen"
                description="Name for the 'Pen' extension"
                id="gui.extension.pen.name"
            />
        ),
        extensionId: 'pen',
        iconURL: penIconURL,
        insetIconURL: penInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Draw with your sprites."
                description="Description for the 'Pen' extension"
                id="gui.extension.pen.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Video Sensing"
                description="Name for the 'Video Sensing' extension"
                id="gui.extension.videosensing.name"
            />
        ),
        extensionId: 'videoSensing',
        iconURL: videoSensingIconURL,
        insetIconURL: videoSensingInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Sense motion with the camera."
                description="Description for the 'Video Sensing' extension"
                id="gui.extension.videosensing.description"
            />
        ),
        featured: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Text to Speech"
                description="Name for the Text to Speech extension"
                id="gui.extension.text2speech.name"
            />
        ),
        extensionId: 'text2speech',
        collaborator: 'Amazon Web Services',
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
        internetConnectionRequired: true
    },
    {
        name: (
            <FormattedMessage
                defaultMessage="Translate"
                description="Name for the Translate extension"
                id="gui.extension.translate.name"
            />
        ),
        extensionId: 'translate',
        collaborator: 'Google',
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
        internetConnectionRequired: true
    },
    {
        name: 'Makey Makey',
        extensionId: 'makeymakey',
        collaborator: 'JoyLabz',
        iconURL: makeymakeyIconURL,
        insetIconURL: makeymakeyInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Make anything into a key."
                description="Description for the 'Makey Makey' extension"
                id="gui.extension.makeymakey.description"
            />
        ),
        featured: true
    },
    {
        name: 'micro:bit',
        extensionId: 'microbit',
        collaborator: 'micro:bit',
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
        helpLink: 'https://scratch.mit.edu/microbit'
    },
    {
        name: 'LEGO MINDSTORMS EV3',
        extensionId: 'ev3',
        collaborator: 'LEGO',
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
        helpLink: 'https://scratch.mit.edu/ev3'
    },
    {
        name: 'LEGO BOOST',
        extensionId: 'boost',
        collaborator: 'LEGO',
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
        helpLink: 'https://scratch.mit.edu/boost'
    },
    {
        name: 'LEGO Education WeDo 2.0',
        extensionId: 'wedo2',
        collaborator: 'LEGO',
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
        helpLink: 'https://scratch.mit.edu/wedo'
    },
    {
        name: 'Go Direct Force & Acceleration',
        extensionId: 'gdxfor',
        collaborator: 'Vernier',
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
        helpLink: 'https://scratch.mit.edu/vernier'
    }
,
    {
	name: 'JSON',
    	extensionId: 'gasoJSON',
    	collaborator: 'gasolin',
    	iconURL: jsonImage,
    	insetIconURL: gdxforInsetIconURL,
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
    	helpLink: 'https://github.com/gasolin/scratch3-internet'
    },
    {
    	name: 'IFTTT',
	extensionId: 'gasoIFTTT',
	collaborator: 'gasolin',
	iconURL: iftttImage,
	insetIconURL: gdxforInsetIconURL,
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
        helpLink: 'https://github.com/gasolin/scratch3-internet'
    },
    {
  	name: 'LASS',
	extensionId: 'gasoLASS',
	collaborator: 'gasolin',
	iconURL: lassImage,
	insetIconURL: gdxforInsetIconURL,
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
        helpLink: 'https://github.com/gasolin/scratch3-internet'
    },
    {
	name: 'ThingSpeak',
	extensionId: 'gasoThingSpeak',
	collaborator: 'gasolin',
	iconURL: thingspeakImage,
	insetIconURL: gdxforInsetIconURL,
	description: (
            <FormattedMessage
                defaultMessage="ThingSpeak"
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
        helpLink: 'https://github.com/gasolin/scratch3-internet'
    },
    {
	name: 'voicetoTEXT',
	extensionId: 'voicetoTEXT',
	collaborator: 'estea chen',
	iconURL: voicetotextImage,
	insetIconURL: voicetotextInsetIconURL,
	description: (
            <FormattedMessage
                defaultMessage="VoiceToText"
                description="Voice To Text extension"
                id="gui.extension.voicetotext.description"
            />
        ),
        featured: true,
        disabled: false,
        // bluetoothRequired: false,
        internetConnectionRequired: false,
        // launchPeripheralConnectionFlow: false,
        useAutoScan: false,
        helpLink: 'https://github.com/estea8968/scratch3-internet'
    },
    {
	name: 'urlTXT',
	extensionId: 'urlTXT',
	collaborator: 'estea chen',
	iconURL: urltxtImage,
	insetIconURL: urltxtInsetIconURL,
	description: (
            <FormattedMessage
                defaultMessage="urlTXT"
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
        helpLink: 'https://github.com/estea8968/scratch3-internet'
    },
    
    {
	name: 'rwGoogle',
	extensionId: 'rwGoogle',
	collaborator: 'estea chen',
	iconURL: rwGoogleImage,
	insetIconURL: rwGoogleInsetIconURL,
	description: (
            <FormattedMessage
                defaultMessage="rwGoogle"
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
        helpLink: 'https://github.com/estea8968/scratch3-internet'
    },
    {
        name: 'knnAlgorithm',
        extensionId: 'knnAlgorithm',
        iconURL: knnalgorithmImage,
        insetIconURL: knnalgorithmInsetImage,
	collaborator: 'wwj718 summercar',
        description: (
           <FormattedMessage
               defaultMessage="knn algorithm."
               description="Description for the 'knn algorithm' extension"
	       id="gui.extension.knnalgorithm.description"
           />
        ),
        featured: true,
        helpLink: 'https://github.com/CodeLabClub/scratch3_knn'
   },
   {
        name: 'Web Serial Arduino',
        extensionId: 'webserialArduino',
        collaborator: "estea chen",
        iconURL: webserialArduinoImage,
        insetIconURL: webserialArduinoInsetIconURL,
	description: (
            <FormattedMessage
                defaultMessage="WebSerialArduino chrome only"
                description="Web serial for the Arduino extension"
                id="gui.extension.WebSerialArduino.description"
            />
        ),
        featured: true,
        disabled: false,
        internetConnectionRequired: true,
        bluetoothRequired: false,
        //helpLink: 'https://mryslab.github.io/s3-extend/'

    }
];
