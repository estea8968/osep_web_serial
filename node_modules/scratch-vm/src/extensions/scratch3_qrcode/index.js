const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const TargetType = require('../../extension-support/target-type');
const Cast = require('../../util/cast.js');
const formatMessage = require('format-message');
const Video = require('../../io/video');
const StageLayering = require('../../engine/stage-layering');

const jsQR = require('jsqr'); //https://github.com/cozmo/jsQR
const encoding = require('encoding-japanese'); //https://github.com/polygonplanet/encoding.js

const ml5 = require('ml5');
let webcam_obj ;
let now_webcamId;
let webcamId_ary=[];
let webcamLabel_ary=[];

const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQwIDQwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgd2lkdGg9IjQwcHgiIGhlaWdodD0iNDBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzgiIGhlaWdodD0iMzgiIHN0eWxlPSJmaWxsOiByZ2IoMjU1LCAyNTUsIDI1NSk7IiB4PSIxIiB5PSIxIi8+CiAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMC4wNjQ0NTMsIDAsIDAsIDAuMDY0NDUzLCAzLjUwMDAzMSwgMy41MDAwMzEpIj4KICAgIDxnPgogICAgICA8Zz4KICAgICAgICA8cGF0aCBkPSJNMCwwdjIzMy43MzloMjMzLjczOVYwSDB6IE0yMDAuMzQ4LDIwMC4zNDhIMzMuMzkxVjMzLjM5MWgxNjYuOTU3VjIwMC4zNDh6IiBzdHlsZT0ic3Ryb2tlOiByZ2IoMCwgMCwgMCk7IHN0cm9rZS1vcGFjaXR5OiAwLjE1OyBmaWxsOiByZ2IoNzcsIDc3LCA3Nyk7IHN0cm9rZS13aWR0aDogNi44MjY2OHB4OyIvPgogICAgICA8L2c+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPGc+CiAgICAgICAgPHJlY3QgeD0iNjYuNzgzIiB5PSI2Ni43ODMiIHdpZHRoPSIxMDAuMTc0IiBoZWlnaHQ9IjEwMC4xNzQiIHN0eWxlPSJzdHJva2U6IHJnYigwLCAwLCAwKTsgc3Ryb2tlLW9wYWNpdHk6IDAuMTU7IGZpbGw6IHJnYig3NywgNzcsIDc3KTsgc3Ryb2tlLXdpZHRoOiA2LjgyNjY4cHg7Ii8+CiAgICAgIDwvZz4KICAgIDwvZz4KICAgIDxnPgogICAgICA8Zz4KICAgICAgICA8cGF0aCBkPSJNMjc4LjI2MSwwdjIzMy43MzlINTEyVjBIMjc4LjI2MXogTTQ3OC42MDksMjAwLjM0OEgzMTEuNjUyVjMzLjM5MWgxNjYuOTU3VjIwMC4zNDh6IiBzdHlsZT0ic3Ryb2tlOiByZ2IoMCwgMCwgMCk7IHN0cm9rZS1vcGFjaXR5OiAwLjE1OyBmaWxsOiByZ2IoNzcsIDc3LCA3Nyk7IHN0cm9rZS13aWR0aDogNi44MjY2OHB4OyIvPgogICAgICA8L2c+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPGc+CiAgICAgICAgPHJlY3QgeD0iMzQ1LjA0MyIgeT0iNjYuNzgzIiB3aWR0aD0iMTAwLjE3NCIgaGVpZ2h0PSIxMDAuMTc0IiBzdHlsZT0ic3Ryb2tlOiByZ2IoMCwgMCwgMCk7IHN0cm9rZS1vcGFjaXR5OiAwLjE1OyBmaWxsOiByZ2IoNzcsIDc3LCA3Nyk7IHN0cm9rZS13aWR0aDogNi44MjY2OHB4OyIvPgogICAgICA8L2c+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPGc+CiAgICAgICAgPHBhdGggZD0iTTAsMjc4LjI2MVY1MTJoMjMzLjczOVYyNzguMjYxSDB6IE0yMDAuMzQ4LDQ3OC42MDlIMzMuMzkxVjMxMS42NTJoMTY2Ljk1N1Y0NzguNjA5eiIgc3R5bGU9InN0cm9rZTogcmdiKDAsIDAsIDApOyBzdHJva2Utb3BhY2l0eTogMC4xNTsgZmlsbDogcmdiKDc3LCA3NywgNzcpOyBzdHJva2Utd2lkdGg6IDYuODI2NjhweDsiLz4KICAgICAgPC9nPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxnPgogICAgICAgIDxyZWN0IHg9IjY2Ljc4MyIgeT0iMzQ1LjA0MyIgd2lkdGg9IjEwMC4xNzQiIGhlaWdodD0iMTAwLjE3NCIgc3R5bGU9InN0cm9rZTogcmdiKDAsIDAsIDApOyBzdHJva2Utb3BhY2l0eTogMC4xNTsgZmlsbDogcmdiKDc3LCA3NywgNzcpOyBzdHJva2Utd2lkdGg6IDYuODI2NjhweDsiLz4KICAgICAgPC9nPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxnPgogICAgICAgIDxwb2x5Z29uIHBvaW50cz0iMzQ1LjA0MywzMTEuNjUyIDM0NS4wNDMsMjc4LjI2MSAyNzguMjYxLDI3OC4yNjEgMjc4LjI2MSw1MTIgMzQ1LjA0Myw1MTIgMzQ1LjA0Myw0NzguNjA5IDMxMS42NTIsNDc4LjYwOSAmIzEwOyYjOTsmIzk7JiM5OzMxMS42NTIsNDExLjgyNiAzNDUuMDQzLDQxMS44MjYgMzQ1LjA0MywzNzguNDM1IDMxMS42NTIsMzc4LjQzNSAzMTEuNjUyLDMxMS42NTIgJiM5OyYjOTsiIHN0eWxlPSJzdHJva2U6IHJnYigwLCAwLCAwKTsgc3Ryb2tlLW9wYWNpdHk6IDAuMTU7IGZpbGw6IHJnYig3NywgNzcsIDc3KTsgc3Ryb2tlLXdpZHRoOiA2LjgyNjY4cHg7Ii8+CiAgICAgIDwvZz4KICAgIDwvZz4KICAgIDxnPgogICAgICA8Zz4KICAgICAgICA8cmVjdCB4PSI0NzguNjA5IiB5PSIyNzguMjYxIiB3aWR0aD0iMzMuMzkxIiBoZWlnaHQ9IjMzLjM5MSIgc3R5bGU9InN0cm9rZTogcmdiKDAsIDAsIDApOyBzdHJva2Utb3BhY2l0eTogMC4xNTsgZmlsbDogcmdiKDc3LCA3NywgNzcpOyBzdHJva2Utd2lkdGg6IDYuODI2NjhweDsiLz4KICAgICAgPC9nPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxnPgogICAgICAgIDxwb2x5Z29uIHBvaW50cz0iNDc4LjYwOSwzNTYuMTc0IDQ3OC42MDksNDc4LjYwOSA0NDUuMjE3LDQ3OC42MDkgNDQ1LjIxNyw1MTIgNTEyLDUxMiA1MTIsMzU2LjE3NCAmIzk7JiM5OyIgc3R5bGU9InN0cm9rZTogcmdiKDAsIDAsIDApOyBzdHJva2Utb3BhY2l0eTogMC4xNTsgZmlsbDogcmdiKDc3LCA3NywgNzcpOyBzdHJva2Utd2lkdGg6IDYuODI2NjhweDsiLz4KICAgICAgPC9nPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxnPgogICAgICAgIDxyZWN0IHg9IjM3OC40MzUiIHk9IjI3OC4yNjEiIHdpZHRoPSI2Ni43ODMiIGhlaWdodD0iMzMuMzkxIiBzdHlsZT0ic3Ryb2tlOiByZ2IoMCwgMCwgMCk7IHN0cm9rZS1vcGFjaXR5OiAwLjE1OyBmaWxsOiByZ2IoNzcsIDc3LCA3Nyk7IHN0cm9rZS13aWR0aDogNi44MjY2OHB4OyIvPgogICAgICA8L2c+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPGc+CiAgICAgICAgPHBvbHlnb24gcG9pbnRzPSI0NDUuMjE3LDM3OC40MzUgNDQ1LjIxNywzNDUuMDQzIDM3OC40MzUsMzQ1LjA0MyAzNzguNDM1LDQ0NS4yMTcgNDQ1LjIxNyw0NDUuMjE3IDQ0NS4yMTcsNDExLjgyNiAmIzEwOyYjOTsmIzk7JiM5OzQxMS44MjYsNDExLjgyNiA0MTEuODI2LDM3OC40MzUgJiM5OyYjOTsiIHN0eWxlPSJzdHJva2U6IHJnYigwLCAwLCAwKTsgc3Ryb2tlLW9wYWNpdHk6IDAuMTU7IGZpbGw6IHJnYig3NywgNzcsIDc3KTsgc3Ryb2tlLXdpZHRoOiA2LjgyNjY4cHg7Ii8+CiAgICAgIDwvZz4KICAgIDwvZz4KICAgIDxnPgogICAgICA8Zz4KICAgICAgICA8cmVjdCB4PSIzNzguNDM1IiB5PSI0NzguNjA5IiB3aWR0aD0iMzMuMzkxIiBoZWlnaHQ9IjMzLjM5MSIgc3R5bGU9InN0cm9rZTogcmdiKDAsIDAsIDApOyBzdHJva2Utb3BhY2l0eTogMC4xNTsgZmlsbDogcmdiKDc3LCA3NywgNzcpOyBzdHJva2Utd2lkdGg6IDYuODI2NjhweDsiLz4KICAgICAgPC9nPgogICAgPC9nPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogICAgPGcvPgogIDwvZz4KPC9zdmc+';

const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDIwIDIwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgd2lkdGg9IjIwcHgiIGhlaWdodD0iMjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Zz4KICAgIDxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgc3R5bGU9InN0cm9rZS13aWR0aDogMHB4OyBmaWxsOiByZ2IoMjU1LCAyNTUsIDI1NSk7Ii8+CiAgICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjAzNTE1NiwgMCwgMCwgMC4wMzUxNTYsIDEuMDAwMDYzLCAxLjAwMDA2MykiPgogICAgICA8Zz4KICAgICAgICA8Zz4KICAgICAgICAgIDxwYXRoIGQ9Ik0wLDB2MjMzLjczOWgyMzMuNzM5VjBIMHogTTIwMC4zNDgsMjAwLjM0OEgzMy4zOTFWMzMuMzkxaDE2Ni45NTdWMjAwLjM0OHoiIHN0eWxlPSJzdHJva2Utb3BhY2l0eTogMC4xNTsgZmlsbDogcmdiKDc3LCA3NywgNzcpOyBzdHJva2Utd2lkdGg6IDYuODI2NjhweDsiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICA8cmVjdCB4PSI2Ni43ODMiIHk9IjY2Ljc4MyIgd2lkdGg9IjEwMC4xNzQiIGhlaWdodD0iMTAwLjE3NCIgc3R5bGU9InN0cm9rZS1vcGFjaXR5OiAwLjE1OyBmaWxsOiByZ2IoNzcsIDc3LCA3Nyk7IHN0cm9rZS13aWR0aDogNi44MjY2OHB4OyIvPgogICAgICAgIDwvZz4KICAgICAgPC9nPgogICAgICA8Zz4KICAgICAgICA8Zz4KICAgICAgICAgIDxwYXRoIGQ9Ik0yNzguMjYxLDB2MjMzLjczOUg1MTJWMEgyNzguMjYxeiBNNDc4LjYwOSwyMDAuMzQ4SDMxMS42NTJWMzMuMzkxaDE2Ni45NTdWMjAwLjM0OHoiIHN0eWxlPSJzdHJva2Utb3BhY2l0eTogMC4xNTsgZmlsbDogcmdiKDc3LCA3NywgNzcpOyBzdHJva2Utd2lkdGg6IDYuODI2NjhweDsiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICA8cmVjdCB4PSIzNDUuMDQzIiB5PSI2Ni43ODMiIHdpZHRoPSIxMDAuMTc0IiBoZWlnaHQ9IjEwMC4xNzQiIHN0eWxlPSJzdHJva2Utb3BhY2l0eTogMC4xNTsgZmlsbDogcmdiKDc3LCA3NywgNzcpOyBzdHJva2Utd2lkdGg6IDYuODI2NjhweDsiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICA8cGF0aCBkPSJNMCwyNzguMjYxVjUxMmgyMzMuNzM5VjI3OC4yNjFIMHogTTIwMC4zNDgsNDc4LjYwOUgzMy4zOTFWMzExLjY1MmgxNjYuOTU3VjQ3OC42MDl6IiBzdHlsZT0ic3Ryb2tlLW9wYWNpdHk6IDAuMTU7IGZpbGw6IHJnYig3NywgNzcsIDc3KTsgc3Ryb2tlLXdpZHRoOiA2LjgyNjY4cHg7Ii8+CiAgICAgICAgPC9nPgogICAgICA8L2c+CiAgICAgIDxnPgogICAgICAgIDxnPgogICAgICAgICAgPHJlY3QgeD0iNjYuNzgzIiB5PSIzNDUuMDQzIiB3aWR0aD0iMTAwLjE3NCIgaGVpZ2h0PSIxMDAuMTc0IiBzdHlsZT0ic3Ryb2tlLW9wYWNpdHk6IDAuMTU7IGZpbGw6IHJnYig3NywgNzcsIDc3KTsgc3Ryb2tlLXdpZHRoOiA2LjgyNjY4cHg7Ii8+CiAgICAgICAgPC9nPgogICAgICA8L2c+CiAgICAgIDxnPgogICAgICAgIDxnPgogICAgICAgICAgPHBvbHlnb24gcG9pbnRzPSIzNDUuMDQzLDMxMS42NTIgMzQ1LjA0MywyNzguMjYxIDI3OC4yNjEsMjc4LjI2MSAyNzguMjYxLDUxMiAzNDUuMDQzLDUxMiAzNDUuMDQzLDQ3OC42MDkgMzExLjY1Miw0NzguNjA5ICYjMTA7JiM5OyYjOTsmIzk7MzExLjY1Miw0MTEuODI2IDM0NS4wNDMsNDExLjgyNiAzNDUuMDQzLDM3OC40MzUgMzExLjY1MiwzNzguNDM1IDMxMS42NTIsMzExLjY1MiAmIzk7JiM5OyIgc3R5bGU9InN0cm9rZS1vcGFjaXR5OiAwLjE1OyBmaWxsOiByZ2IoNzcsIDc3LCA3Nyk7IHN0cm9rZS13aWR0aDogNi44MjY2OHB4OyIvPgogICAgICAgIDwvZz4KICAgICAgPC9nPgogICAgICA8Zz4KICAgICAgICA8Zz4KICAgICAgICAgIDxyZWN0IHg9IjQ3OC42MDkiIHk9IjI3OC4yNjEiIHdpZHRoPSIzMy4zOTEiIGhlaWdodD0iMzMuMzkxIiBzdHlsZT0ic3Ryb2tlLW9wYWNpdHk6IDAuMTU7IGZpbGw6IHJnYig3NywgNzcsIDc3KTsgc3Ryb2tlLXdpZHRoOiA2LjgyNjY4cHg7Ii8+CiAgICAgICAgPC9nPgogICAgICA8L2c+CiAgICAgIDxnPgogICAgICAgIDxnPgogICAgICAgICAgPHBvbHlnb24gcG9pbnRzPSI0NzguNjA5LDM1Ni4xNzQgNDc4LjYwOSw0NzguNjA5IDQ0NS4yMTcsNDc4LjYwOSA0NDUuMjE3LDUxMiA1MTIsNTEyIDUxMiwzNTYuMTc0ICYjOTsmIzk7IiBzdHlsZT0ic3Ryb2tlLW9wYWNpdHk6IDAuMTU7IGZpbGw6IHJnYig3NywgNzcsIDc3KTsgc3Ryb2tlLXdpZHRoOiA2LjgyNjY4cHg7Ii8+CiAgICAgICAgPC9nPgogICAgICA8L2c+CiAgICAgIDxnPgogICAgICAgIDxnPgogICAgICAgICAgPHJlY3QgeD0iMzc4LjQzNSIgeT0iMjc4LjI2MSIgd2lkdGg9IjY2Ljc4MyIgaGVpZ2h0PSIzMy4zOTEiIHN0eWxlPSJzdHJva2Utb3BhY2l0eTogMC4xNTsgZmlsbDogcmdiKDc3LCA3NywgNzcpOyBzdHJva2Utd2lkdGg6IDYuODI2NjhweDsiLz4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgICAgPGc+CiAgICAgICAgPGc+CiAgICAgICAgICA8cG9seWdvbiBwb2ludHM9IjQ0NS4yMTcsMzc4LjQzNSA0NDUuMjE3LDM0NS4wNDMgMzc4LjQzNSwzNDUuMDQzIDM3OC40MzUsNDQ1LjIxNyA0NDUuMjE3LDQ0NS4yMTcgNDQ1LjIxNyw0MTEuODI2ICYjMTA7JiM5OyYjOTsmIzk7NDExLjgyNiw0MTEuODI2IDQxMS44MjYsMzc4LjQzNSAmIzk7JiM5OyIgc3R5bGU9InN0cm9rZS1vcGFjaXR5OiAwLjE1OyBmaWxsOiByZ2IoNzcsIDc3LCA3Nyk7IHN0cm9rZS13aWR0aDogNi44MjY2OHB4OyIvPgogICAgICAgIDwvZz4KICAgICAgPC9nPgogICAgICA8Zz4KICAgICAgICA8Zz4KICAgICAgICAgIDxyZWN0IHg9IjM3OC40MzUiIHk9IjQ3OC42MDkiIHdpZHRoPSIzMy4zOTEiIGhlaWdodD0iMzMuMzkxIiBzdHlsZT0ic3Ryb2tlLW9wYWNpdHk6IDAuMTU7IGZpbGw6IHJnYig3NywgNzcsIDc3KTsgc3Ryb2tlLXdpZHRoOiA2LjgyNjY4cHg7Ii8+CiAgICAgICAgPC9nPgogICAgICA8L2c+CiAgICAgIDxnLz4KICAgICAgPGcvPgogICAgICA8Zy8+CiAgICAgIDxnLz4KICAgICAgPGcvPgogICAgICA8Zy8+CiAgICAgIDxnLz4KICAgICAgPGcvPgogICAgICA8Zy8+CiAgICAgIDxnLz4KICAgICAgPGcvPgogICAgICA8Zy8+CiAgICAgIDxnLz4KICAgICAgPGcvPgogICAgICA8Zy8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4=';

const Locales = ['ja', 'ja-Hira', 'en', 'zh-tw'];

const Message = {
    qrCode : {
        'ja': 'QRコード',
        'ja-Hira': 'QRコード',
        'en': 'QR Code',
        'zh-tw': '二維條碼'
    },
    qrStart : {
        'ja': '[INPUT]の読み取りを始める',
        'ja-Hira': '[INPUT]のよみとりをはじめる',
        'en': 'start scanning [INPUT]',
        'zh-tw': '開始掃瞄[INPUT]'
    },
    qrCameraInput : {
        'ja': 'カメラ',
        'ja-Hira': 'カメラ',
        'en': 'camera',
        'zh-tw': '相機'
    },
    qrStageInput : {
        'ja': 'ステージ',
        'ja-Hira': 'ステージ',
        'en': 'stage',
        'zh-tw': '舞台'
    },
    qrStop : {
        'ja': '読み取りを止める',
        'ja-Hira': 'よみとりをとめる',
        'en': 'stop scanning',
        'zh-tw': '停止掃瞄'
    },
    qrScanning : {
        'ja': '読み取り中',
        'ja-Hira': 'よみとりちゅう',
        'en': 'scanning?',
        'zh-tw': '掃瞄中?'
    },
    qrSetInterval : {
        'ja': '読み取りの間隔を[INTERVAL]秒にする',
        'ja-Hira': 'よみとりのかんかくを[INTERVAL]びょうにする',
        'en': 'set scan interval [INTERVAL] sec',
        'zh-tw': '設定掃瞄間隔[INTERVAL]秒'
    },
    qrData : {
        'ja': '読み取り結果',
        'ja-Hira': 'よみとりけっか',
        'en': 'data',
        'zh-tw': '條碼內容'
    },
    qrASCII : {
        'ja': '読み取り結果の[INDEX]番目の文字のASCIIコード',
        'ja-Hira': 'よみとりけっかの[INDEX]ばんめのもじのASCIIコード',
        'en': 'letter [INDEX] ASCII code of data',
        'zh-tw': '文字[INDEX]的ASCII碼'
    },
    qrReset : {
        'ja': '読み取り結果を消す',
        'ja-Hira': 'よみとりけっかをけす',
        'en': 'reset data',
        'zh-tw': '清除資料'
    },
    qrSetCameraTransparency : {
        'ja': 'カメラの透明度を[TRANSPARENCY]にする',
        'ja-Hira': 'カメラのとうめいどを[TRANSPARENCY]にする',
        'en': 'set camera transparency to [TRANSPARENCY]',
        'zh-tw': '相機透明度設定為[TRANSPARENCY]'
    },
    changeUsbWebcam:{
        'en': 'Use another webcam',
        'zh-tw': '切換鏡頭'
    },
    ue_Webcam:{
        'en': ['environment','user'],
        'zh-tw':['後','前']
    }
};

const DefaultInterval = 300;

const DefaultStageWidth = 480;
const DefaultStageHeight = 360;

const MakerAttributes = {
    color4f: [0.9, 0.6, 0.2, 0.7],
    diameter: 5
};

const Mode = {
    CAMERA: 1,
    STAGE: 2
};

class Scratch3QRCodeBlocks {
    constructor (runtime) {
        this.getdeviceid();
        this.runtime = runtime;
        this.locale = this._getViewerLanguageCode();
        this._canvas = document.querySelector('canvas');
        this._scanning = false;
        this._mode = null;
        this._interval = DefaultInterval;
        this._data = '';
        this._binaryData = null;

        this.runtime.on('PROJECT_STOP_ALL', this.qrStop.bind(this));

        this._penSkinId = this.runtime.renderer.createPenSkin();
        const penDrawableId = this.runtime.renderer.createDrawable(StageLayering.SPRITE_LAYER);
        this.runtime.renderer.updateDrawableProperties(penDrawableId, {skinId: this._penSkinId});
    }

    getInfo () {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            stage.videoTransparency = 0;
        }

        this.locale = this._getViewerLanguageCode();
        return {
            id: 'qrcode',
            name: Message.qrCode[this.locale],
            blockIconURI: blockIconURI,
            menuIconURI: menuIconURI,
            //docsURI: 'https://',
            blocks: [
                {
                    opcode: 'qrStart',
                    text: Message.qrStart[this.locale],
                    blockType: BlockType.COMMAND,
                    arguments: {
                        INPUT: {
                            type: ArgumentType.STRING,
                            menu: 'inputMenu',
                            defaultValue: Message.qrCameraInput[this.locale]
                        }
                    }
                },
                {
                    opcode:'changewebcam',
                    text:Message.changeUsbWebcam[this.locale],
                    blockType:BlockType.COMMAND,
                },
                {
                    opcode:'ue_cam',
                    text:formatMessage({
                        id:'videoSensing.ue_cam',
                        description:'environment or user webcam'
                    }),
                    blockType:BlockType.COMMAND,
                    arguments: {
                        WEBCAM: {
                            menu: 'UE_WEBCAM',
                            type: ArgumentType.STRING,
                            defaultValue: Message.ue_Webcam[this.locale][0]
                        }
                    }
                },
                {
                    opcode: 'qrStop',
                    text: Message.qrStop[this.locale],
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'qrSetInterval',
                    text: Message.qrSetInterval[this.locale],
                    blockType: BlockType.COMMAND,
                    arguments: {
                        INTERVAL: {
                            type: ArgumentType.NUMBER,
                            menu: 'intervalMenu',
                            defaultValue: 0.3
                        }
                    }
                },
                {
                    opcode: 'qrScanning',
                    text: Message.qrScanning[this.locale],
                    blockType: BlockType.BOOLEAN
                },
                '---',
                {
                    opcode: 'qrData',
                    text: Message.qrData[this.locale],
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'qrASCII',
                    text: Message.qrASCII[this.locale],
                    blockType: BlockType.REPORTER,
                    arguments: {
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'qrReset',
                    text: Message.qrReset[this.locale],
                    blockType: BlockType.COMMAND
                },
                '---',
                {
                    opcode: 'qrSetCameraTransparency',
                    text: Message.qrSetCameraTransparency[this.locale],
                    arguments: {
                        TRANSPARENCY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                }
            ],
            menus: {
                inputMenu: {
                    acceptReporters: false,
                    items: [Message.qrCameraInput[this.locale], Message.qrStageInput[this.locale]]
                },
                intervalMenu: {
                    acceptReporters: false,
                    items: ['0.3', '0.5', '1']
                },
                UE_WEBCAM: {
                    acceptReporters: false,
                    items: Message.ue_Webcam[this.locale]
                }
            }
        }
    };

    async ue_cam(args){
        const en_uewebcam=['environment','user'];
        const choice_value=args.WEBCAM;
        const ue_webcam = Message.ue_Webcam[this.locale];
        for(var i=0;i<ue_webcam.length;i++){
            if(choice_value==ue_webcam[i]){
                window.now_webcamId= en_uewebcam[i];
                break;
            }
        }
        console.log('window.now_webcamId=',window.now_webcamId);
        //console.log('formatMessage.videoSensing.u_or_e=',formatMessage({id:'videoSensing.u_or_e'}));
        this.runtime.ioDevices.video.disableVideo();
        //window.now_webcamId= 'environment';
        await new Promise(resolve => setTimeout(resolve, 300));
        this.runtime.ioDevices.video.enableVideo();

    }

    _getViewerLanguageCode () {
        const locale = formatMessage.setup().locale;
        if (Locales.includes(locale)) {
            return locale;
        }
        return 'en';
    }

    _scan(){
        if(!this._scanning ||  (this._mode == Mode.CAMERA && !this.runtime.ioDevices.video.videoReady)){
            this._scanning = false;
            this._clearMark();
            return;
        }

        let frame = null;
        let width, height;
        if(this._mode == Mode.CAMERA){
            frame = this.runtime.ioDevices.video.getFrame({
                format: Video.FORMAT_IMAGE_DATA,
                dimensions: Video.DIMENSIONS
            }).data;
            width = DefaultStageWidth;
            height = DefaultStageHeight;
        } else if (this._mode == Mode.STAGE){
            const webgl = this.runtime.renderer.gl;
            frame = new Uint8Array(webgl.drawingBufferWidth * webgl.drawingBufferHeight * 4);
            webgl.readPixels(0, 0, webgl.drawingBufferWidth, webgl.drawingBufferHeight, webgl.RGBA, webgl.UNSIGNED_BYTE, frame);
            width = webgl.drawingBufferWidth;
            height = webgl.drawingBufferHeight;
        }

        const code = jsQR(frame, width, height, {
            inversionAttempts: 'dontInvert',
        });

        this._clearMark();
        if(code){
            const delimiter = code.binaryData.indexOf(0); //NULL index
            if(delimiter != -1){
                code.binaryData = code.binaryData.slice(0, delimiter);
            }
            this._data = this._decodeBinaryData(code.binaryData);
            this._binaryData = code.binaryData;
            this._drawMark(code.location, width, height);
        }
        setTimeout(this._scan.bind(this), this._interval);
    }

    _drawMark(location, width, height){
        let widthScale = DefaultStageWidth / width;
        let heightScale = DefaultStageHeight / height;

        location.topLeftCorner.x = location.topLeftCorner.x * widthScale - width / 2 * widthScale;
        location.topRightCorner.x = location.topRightCorner.x * widthScale - width / 2 * widthScale;
        location.bottomRightCorner.x = location.bottomRightCorner.x * widthScale - width / 2 * widthScale;
        location.bottomLeftCorner.x = location.bottomLeftCorner.x * widthScale - width / 2 * widthScale;

        if(this._mode == Mode.CAMERA){
            location.topLeftCorner.y = height / 2 * heightScale - location.topLeftCorner.y * heightScale;
            location.topRightCorner.y = height / 2 * heightScale - location.topRightCorner.y * heightScale;
            location.bottomRightCorner.y = height / 2 * heightScale - location.bottomRightCorner.y * heightScale;
            location.bottomLeftCorner.y = height / 2 * heightScale - location.bottomLeftCorner.y * heightScale;
        } else if (this._mode == Mode.STAGE){
            location.topLeftCorner.y = location.topLeftCorner.y * heightScale - height / 2 * heightScale;
            location.topRightCorner.y = location.topRightCorner.y * heightScale - height / 2 * heightScale;
            location.bottomRightCorner.y = location.bottomRightCorner.y * heightScale - height / 2 * heightScale;
            location.bottomLeftCorner.y = location.bottomLeftCorner.y * heightScale - height / 2 * heightScale;
        }

        this.runtime.renderer.penLine(this._penSkinId, MakerAttributes, location.topLeftCorner.x, location.topLeftCorner.y, location.topRightCorner.x, location.topRightCorner.y);
        this.runtime.renderer.penLine(this._penSkinId, MakerAttributes, location.topRightCorner.x, location.topRightCorner.y, location.bottomRightCorner.x, location.bottomRightCorner.y);
        this.runtime.renderer.penLine(this._penSkinId, MakerAttributes, location.bottomRightCorner.x, location.bottomRightCorner.y, location.bottomLeftCorner.x, location.bottomLeftCorner.y);
        this.runtime.renderer.penLine(this._penSkinId, MakerAttributes, location.bottomLeftCorner.x, location.bottomLeftCorner.y, location.topLeftCorner.x, location.topLeftCorner.y);
    }

    _clearMark(){
        this.runtime.renderer.penClear(this._penSkinId);
    }

    _decodeBinaryData(binaryData){
        let encode = encoding.detect(binaryData);
        if(encode == 'UTF16'){
            return  new TextDecoder('utf-16').decode(Uint16Array.from(binaryData).buffer);
        }else{
            try{
                return new TextDecoder(encode).decode(Uint8Array.from(binaryData).buffer);
            }catch (e) {
                return '';
            }
        }
    }

    _getGlobalVideoTransparency () {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            return stage.videoTransparency;
        }
        return 0;
    }

    qrStart(args, util) {
        if(args.INPUT == Message.qrCameraInput[this.locale]){
            this._mode = Mode.CAMERA;
        } else if (args.INPUT == Message.qrStageInput[this.locale]){
            this._mode = Mode.STAGE;
        }

        if(this._scanning || (this._mode == Mode.CAMERA && !this.runtime.ioDevices)){
            return;
        }

        if(this._mode == Mode.CAMERA){
            this.runtime.ioDevices.video.setPreviewGhost(this._getGlobalVideoTransparency());
            this.runtime.ioDevices.video.mirror = false;
            this.runtime.ioDevices.video.enableVideo();
            if(this.runtime.ioDevices.video.videoReady){
                this._scanning = true;
                this._scan();
            }else{
                setTimeout(this.qrStart.bind(this, args, util), 500);
            }
        } else if (this._mode == Mode.STAGE){
            this._scanning = true;
            this._scan();
        }
    }

    qrStop(args, util) {
        if(!this._scanning){
            return;
        }

        this.runtime.ioDevices.video.disableVideo();
        this._clearMark();
        this._scanning = false;
    }

    qrSetInterval(args, util){
        this._interval = args.INTERVAL * 1000;
    }

    qrScanning(args, util){
        return this._scanning;
    }

    qrData(args, util) {
        return this._data;
    }

    qrASCII(args, util) {
        if(this._data.length == 0 || this._binaryData.length == 0){
            return 0;
        }
        const index = Cast.toNumber(args.INDEX) - 1;
        if (index < 0 || index >= this._data.length) {
            return 0;
        }

        const encoder = new TextEncoder();
        const codes = encoder.encode(this._data.charAt(index));
        if(codes.length != 1 && codes[0] > 127){
            return 0;
        }
        return codes[0];
    }

    qrReset(args, util) {
        this._data = '';
        this._binaryData = null;
    }

    qrSetCameraTransparency(args, util) {
        const transparency = Cast.toNumber(args.TRANSPARENCY);
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            stage.videoTransparency = transparency;
        }
        this.runtime.ioDevices.video.setPreviewGhost(transparency);
    }
    /**   estea chen     */
    async changewebcam(){
        const now_label =  this.runtime.ioDevices.video.provider._track.label
        console.log('now_label=',now_label); 
        this.runtime.ioDevices.video.disableVideo();
        for(var i=0;i<webcamLabel_ary.length;i++){
            if(webcamLabel_ary[i]==now_label){
                if(i==webcamLabel_ary.length){
                    window.now_webcamId= webcamId_ary[0];
                }else{
                    window.now_webcamId= webcamId_ary[i+1];
                }                
                break;
            }
        }   
        await new Promise(resolve => setTimeout(resolve, 300));
        this.runtime.ioDevices.video.enableVideo();
        console.log('video device=',this.runtime.ioDevices.video.provider);
        console.log('now_webcamId=',now_webcamId);
    }
    /**   estea chen     */
    async getdeviceid(){
        //let webcamId ='' ; //"ec4cb0ec2e01046b378dae13099eb36aa3f9dcdb1695d32e5c524912c6ffe2f9";
        //webcamId_ary =[];
        navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          //webcamId.push(devices[1].deviceId);
          webcam_obj=devices;
          /*devices.forEach((device) => {
            if(device.deviceId!=''){
               webcamId.push((device.deviceId));
               //webcamId.i.label=device.device.label;
            }
            console.log(`${device.kind}: ${device.label} a_id = ${device.deviceId}`);
          });*/
          console.log('webcam_obj=', webcam_obj);
          
        })
        .catch((err) => {
          console.error(`${err.name}: ${err.message}`);
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        webcamId_ary=[];
        webcamLabel_ary=[];
        for(var i=0;i<webcam_obj.length;i++){
            if(webcam_obj[i].kind == 'videoinput'){
              webcamId_ary.push(webcam_obj[i].deviceId);
              webcamLabel_ary.push(webcam_obj[i].label);
            }
        }
        console.log('webcam id label=',webcamId_ary,webcamLabel_ary)
        //return  webcamLabel_ary;
    }
}

module.exports = Scratch3QRCodeBlocks;
