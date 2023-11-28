const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

const menuIconURI = null;
const blockIconURI = null;

const defaultId = 'default';
let theLocale = null;
const GOOGLE_MAP_API_KEY = "AIzaSyDQyvBdtQG4wBygmCMLjNhniJXd55PXLyA";

class googleMap {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        // communication related
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension('chart', this);
        // session callbacks
        this.reporter = null;
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.write = this.write.bind(this);

        this.recordCoordinate = [];

        this.name = "location";
        this.longitude = "longitude";
        this.latitude = "latitude";
        this.note = "descriptions";
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
            id: 'googleMap',
            name: msg.title[theLocale],
            color1: '#525252',
            color2: '#4C5B5C',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'recordMarker',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        label: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.tmpLabel[theLocale]
                        },
                        lat: {
                            type: ArgumentType.STRING,
                            defaultValue: '24.8158753'
                        },
                        lng: {
                            type: ArgumentType.STRING,
                            defaultValue: '121.7289251'
                        },

                    },
                    text: msg.recordMarker[theLocale]
                },
                {
                    opcode: 'showMarker',
                    blockType: BlockType.COMMAND,
                    text: msg.showMarker[theLocale]
                },
                '---',
                {
                    opcode: 'setFieldNames',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        name: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.name[theLocale]
                        },
                        longitude: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.longitude[theLocale]
                        },
                        latitude: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.latitude[theLocale]
                        },
                        note: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.note[theLocale]
                        },
                    },
                    text: msg.setFieldNames[theLocale]
                },
                {
                    opcode: 'recordMarker2',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.tmpData[theLocale]
                        },
                    },
                    text: msg.recordMarker2[theLocale]
                },
            ],
        };
    }

    recordMarker(args) {
        var label = args.label;
        var lat = args.lat;
        var lng = args.lng;

        if (label == "") return "請輸入座標名稱";
        if (lat == "") return "請輸入緯度座標";
        if (lng == "") return "請輸入經度座標";

        var tmpMarker = [];
        tmpMarker.push(label, lat, lng);

        this.recordCoordinate.push(tmpMarker);
    }

    /**
     * 在此聲明致謝，感謝石原純也(Junya Ishihara)先生提供 Github 開源專案
     * 此 showMarker() 與 recordMarker2() 兩個函式的程式碼源自 sheet2gmap 專案改編而來
     * champierre/sheet2gmap 專案來源：https://github.com/champierre/sheet2gmap/
     */

    showMarker(args) {
        var width = screen.width / 2;
        var height = screen.height / 2;
        var openGoogleMapWindow = window.open('', 'Google Map 擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, name=no, status=no');

        openGoogleMapWindow.document.write(`
        <head>
            <meta charset="utf-8" />
            <title>Google Map 擴充功能</title>
            <style>
                #map {
                    height: 100%;
                }

                html,
                body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }

                #sidebar {
                    position: absolute;
                    top: 20%;
                    left: 75%;
                    width: 20%;
                    height: 50%;
                    border: 1px solid #666;
                    padding: 10px;
                    background-color: white;
                    font-size: 16px;
                    font-weight: bold;
                }
            </style>
        </head>

        <body>
            <div id="map"></div>
            <div id="sidebar" style="overflow:scroll;"></div>
            <script
                src="https://maps.googleapis.com/maps/api/js?region=TW&language=zh-TW&key=${GOOGLE_MAP_API_KEY}&callback=initMap"
                defer></script>
            <script>
        `);

        openGoogleMapWindow.document.write('var markerData = [');
        for (var i = 0; i < this.recordCoordinate.length; i++) {
            var label = this.recordCoordinate[i][0];
            var lat = this.recordCoordinate[i][1];
            var lng = this.recordCoordinate[i][2];

            openGoogleMapWindow.document.write('{ label:"' + label + '", lat: ' + lat + ', lng: ' + lng + '},');
        }
        openGoogleMapWindow.document.write('];');

        openGoogleMapWindow.document.write(`
                var map;
                var marker = [];
                var infoWindow = [];
                var windowOpened;

                function initMap() {
                    var target = document.getElementById("map");
                    var latMax = lat_Max();
                    var latMin = lat_Min();
                    var lngMax = lng_Max();
                    var lngMin = lng_Min();
                    var bounds = new google.maps.LatLngBounds(
                        { lat: latMax, lng: lngMin },
                        { lat: latMin, lng: lngMax }
                    );

                    map = new google.maps.Map(
                        target, {
                        center: {
                            lat: latMax,
                            lng: lngMin
                        }, zoom: 16,
                    });
                    setData(markerData);
                    if (markerData.length > 1) map.fitBounds(bounds);
                }

                function lat_Max() {
                    var a = 0;
                    for (var i = 0; i < markerData.length; i++)
                        if (markerData[i].lat > a) a = markerData[i].lat;
                    return a;
                }

                function lat_Min() {
                    var b = 1000;
                    for (var i = 0; i < markerData.length; i++)
                        if (markerData[i].lat < b) b = markerData[i].lat;
                    return b;
                }

                function lng_Max() {
                    var c = 0;
                    for (var i = 0; i < markerData.length; i++)
                        if (markerData[i].lng > c) c = markerData[i].lng;
                    return c;
                }

                function lng_Min() {
                    var d = 1000;
                    for (var i = 0; i < markerData.length; i++)
                        if (markerData[i].lng < d) d = markerData[i].lng;
                    return d;
                }

                function setData(markerData) {
                    var sidebar_html = '座標清單：<br>';
                    for (var i = 0; i < markerData.length; i++) {
                        var name = markerData[i]["label"];
                        sidebar_html += '<b>' + (i + 1) + '.</b> <a href="javascript:openWindow(' + i + ')">' + name + '</a><br />';
                        addMarker(i, markerData[i].lat, markerData[i].lng, markerData[i].label);
                    }
                    document.getElementById("sidebar").innerHTML = sidebar_html;
                }

                function addMarker(i, lat, lng, label) {
                    var markerLatLng = new google.maps.LatLng({ lat: lat, lng: lng, });
                    marker[i] = new google.maps.Marker({ position: markerLatLng, map: map });
                    const contentString = '<h2>' + label + '</h2><p style="font-size:16px;font-weight:bold;"></p>';
                    infoWindow[i] = new google.maps.InfoWindow({ content: contentString });
                    markerEvent(i);
                }

                function markerEvent(i) {
                    marker[i].addListener("click",
                        function () {
                            if (windowOpened) windowOpened.close();
                            infoWindow[i].open(map, marker[i]);
                            windowOpened = infoWindow[i];
                        }
                    );
                }

                function openWindow(i) {
                    if (windowOpened) windowOpened.close();
                    infoWindow[i].open(map, marker[i]);
                    windowOpened = infoWindow[i];
                }
            </script>
        </body>
        </html>
        `);

        openGoogleMapWindow.document.close();

        this.recordCoordinate = [];
    }

    setFieldNames(args){
        this.name = args.name;
        this.longitude = args.longitude;
        this.latitude = args.latitude;
        this.note = args.note;
    }

    recordMarker2(args) {
        var data = JSON.parse(args.data);

        var width = screen.width / 2;
        var height = screen.height / 2;
        var openGoogleMapWindow = window.open('', 'Google Map 擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');

        openGoogleMapWindow.document.write(`
        <head>
            <meta charset="utf-8" />
            <title>Google Map 擴充功能</title>
            <style>
                #map {
                    height: 100%;
                }

                html,
                body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }

                #sidebar {
                    position: absolute;
                    top: 20%;
                    left: 75%;
                    width: 20%;
                    height: 50%;
                    border: 1px solid #666;
                    padding: 10px;
                    background-color: white;
                    font-size: 16px;
                    font-weight: bold;
                }
            </style>
        </head>

        <body>
            <div id="map"></div>
            <div id="sidebar" style="overflow:scroll;"></div>
            <script
                src="https://maps.googleapis.com/maps/api/js?region=TW&language=zh-TW&key=${GOOGLE_MAP_API_KEY}&callback=initMap"
                defer></script>
            <script>
        `);

        openGoogleMapWindow.document.write('var markerData = [');
        for (var i = 0; i < data.length; i++) {
            if (data[i]["名稱"]) {
                var label = data[i]["名稱"];
                var lng = data[i]["經度"];
                var lat = data[i]["緯度"];
                var remark = data[i]["備註"] == undefined ? "" : data[i]["備註"];
            }
            
            if (data[i][this.name]) {
                var label = data[i][this.name];
                var lng = data[i][this.longitude];
                var lat = data[i][this.latitude];
                var remark = data[i][this.note] == undefined ? "" : data[i][this.note];
            }
            openGoogleMapWindow.document.write('{label:"' + label + '",lat:' + lat + ',lng:' + lng + ',remark:"' + remark + '"},');
        }
        openGoogleMapWindow.document.write('];');

        openGoogleMapWindow.document.write(`
                var map;
                var marker = [];
                var infoWindow = [];
                var windowOpened;

                function initMap() {
                    var target = document.getElementById("map");
                    var latMax = lat_Max();
                    var latMin = lat_Min();
                    var lngMax = lng_Max();
                    var lngMin = lng_Min();
                    var bounds = new google.maps.LatLngBounds(
                        { lat: latMax, lng: lngMin },
                        { lat: latMin, lng: lngMax }
                    );

                    map = new google.maps.Map(target, {
                        center: {
                            lat: latMax,
                            lng: lngMin
                        },
                        zoom: 16,
                    });
                    setData(markerData);
                    map.fitBounds(bounds);
                }

                function lat_Max() {
                    var a = 0;
                    for (var i = 0; i < markerData.length; i++)
                        if (markerData[i].lat > a) a = markerData[i].lat;
                    return a;
                }

                function lat_Min() {
                    var b = 1000;
                    for (var i = 0; i < markerData.length; i++)
                        if (markerData[i].lat < b) b = markerData[i].lat;
                    return b;
                }

                function lng_Max() {
                    var c = 0;
                    for (var i = 0; i < markerData.length; i++)
                        if (markerData[i].lng > c) c = markerData[i].lng;
                    return c;
                }

                function lng_Min() {
                    var d = 1000;
                    for (var i = 0; i < markerData.length; i++)
                        if (markerData[i].lng < d) d = markerData[i].lng;
                    return d;
                }

                function setData(markerData) {
                    var sidebar_html = '座標清單：<br>';
                    for (var i = 0; i < markerData.length; i++) {
                        addMarker(i, markerData[i].lat, markerData[i].lng, markerData[i].label, markerData[i].remark);
                        var name = markerData[i]["label"];
                        sidebar_html += '<b>' + (i + 1) + '.</b> <a href="javascript:openWindow(' + i + ')">' + name + '</a><br />';
                    }
                    document.getElementById("sidebar").innerHTML = sidebar_html;
                }

                function addMarker(i, lat, lng, label, remark) {
                    var markerLatLng = new google.maps.LatLng({ lat: lat, lng: lng, });
                    marker[i] = new google.maps.Marker({ position: markerLatLng, map: map });
                    const contentString = '<h2>' + label + '</h2><p style="font-size:16px;font-weight:bold;">' + remark + '</p>';
                    infoWindow[i] = new google.maps.InfoWindow({ content: contentString }); markerEvent(i);
                }

                function markerEvent(i) {
                    marker[i].addListener("click",
                        function () {
                            if (windowOpened) { windowOpened.close(); }
                            infoWindow[i].open(map, marker[i]);
                            windowOpened = infoWindow[i];
                        }
                    );
                }

                function openWindow(i) {
                    if (windowOpened) { windowOpened.close(); }
                    infoWindow[i].open(map, marker[i]);
                    windowOpened = infoWindow[i];
                }
            </script>
        </body>
        </html>
        `);

        openGoogleMapWindow.document.close();
    }

}

module.exports = googleMap;
