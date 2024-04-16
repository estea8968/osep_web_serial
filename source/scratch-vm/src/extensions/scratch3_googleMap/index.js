const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');
const { Client } = require('@googlemaps/google-maps-services-js');
const googleMapsClient = new Client({ key: "AIzaSyDQyvBdtQG4wBygmCMLjNhniJXd55PXLyA" });

const menuIconURI = null;
const blockIconURI = null;

const defaultId = 'default';
let theLocale = null;
const GOOGLE_MAP_API_KEY = "AIzaSyDQyvBdtQG4wBygmCMLjNhniJXd55PXLyA";

var aaa;

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

        this.name = "name";
        this.longitude = "longitude";
        this.latitude = "latitude";
        this.note = "note";
        this.color = "color";
        this.link = "image link";
        this.length = 45;
        this.width = 30;

        this.distanceKM = 0;
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
                    opcode: 'recordMarker1',
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
                    text: msg.recordMarker1[theLocale]
                },
                {
                    opcode: 'recordMarker2',
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
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: 'FFFF00'
                        }
                    },
                    text: msg.recordMarker2[theLocale]
                },
                {
                    opcode: 'recordMarker3',
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
                        color: {
                            type: ArgumentType.STRING,
                            menu: 'selectColor',
                            defaultValue: 'EA4335'
                        },
                    },
                    text: msg.recordMarker3[theLocale]
                },
                {
                    opcode: 'recordMarker4',
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
                        photo: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://*'
                        },
                    },
                    text: msg.recordMarker4[theLocale]
                },
                {
                    opcode: 'showMarker1',
                    blockType: BlockType.COMMAND,
                    text: msg.showMarker1[theLocale]
                },
                {
                    opcode: 'calculateDistance',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        display: {
                            type: ArgumentType.STRING,
                            menu: 'selectDisplay',
                            defaultValue: 0
                        },
                        traffic: {
                            type: ArgumentType.STRING,
                            menu: 'selectTraffic',
                            defaultValue: 'DRIVING'
                        },
                    },
                    text: msg.calculateDistance[theLocale]
                },
                {
                    opcode: 'distance',
                    blockType: BlockType.REPORTER,
                    text: msg.distance[theLocale]
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
                    opcode: 'setFieldNames2',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        length: {
                            type: ArgumentType.STRING,
                            defaultValue: 45
                        },
                        width: {
                            type: ArgumentType.STRING,
                            defaultValue: 30
                        },
                    },
                    text: msg.setFieldNames2[theLocale]
                },
                {
                    opcode: 'showMarker2',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.tmpData1[theLocale]
                        },
                    },
                    text: msg.showMarker2[theLocale]
                },
                {
                    opcode: 'showMarker3',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.tmpData2[theLocale]
                        },
                    },
                    text: msg.showMarker3[theLocale]
                },
                {
                    opcode: 'showMarker4',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.tmpData3[theLocale]
                        },
                    },
                    text: msg.showMarker4[theLocale]
                },
            ],
            menus: {
                selectColor: {
                    acceptReporters: true,
                    items: [
                        {
                            text: msg.red[theLocale],
                            value: 'EA4335'
                        },
                        {
                            text: msg.yellow[theLocale],
                            value: 'FFFF00'
                        },
                        {
                            text: msg.green[theLocale],
                            value: '00FF00'
                        },
                        {
                            text: msg.blue[theLocale],
                            value: '4285F4'
                        },
                    ]
                },
                selectTraffic: {
                    acceptReporters: true,
                    items: [
                        {
                            text: msg.driving[theLocale],
                            value: 'DRIVING'
                        },
                        {
                            text: msg.transit[theLocale],
                            value: 'TRANSIT'
                        },
                        {
                            text: msg.walking[theLocale],
                            value: 'WALKING'
                        },
                    ]
                },
                selectDisplay: {
                    acceptReporters: true,
                    items: [
                        {
                            text: msg.open[theLocale],
                            value: 1
                        },
                        {
                            text: msg.close[theLocale],
                            value: 0
                        },
                    ]
                },
            }
        };
    }

    recordMarker1(args) {
        var label = args.label;
        var lat = args.lat;
        var lng = args.lng;
        var color = "EA4335";

        if (label == "") return "請輸入座標名稱";
        if (lat == "") return "請輸入緯度座標";
        if (lng == "") return "請輸入經度座標";

        var tmpMarker = [];
        tmpMarker.push(label, lat, lng, color);

        this.recordCoordinate.push(tmpMarker);
        this.recordMarker = 1;
    }

    recordMarker2(args) {
        var label = args.label;
        var lat = args.lat;
        var lng = args.lng;
        var color = args.color;

        if (label == "") return "請輸入座標名稱";
        if (lat == "") return "請輸入緯度座標";
        if (lng == "") return "請輸入經度座標";
        if (color == "") return "請輸入顏色色碼";

        var tmpMarker = [];
        tmpMarker.push(label, lat, lng, color);

        this.recordCoordinate.push(tmpMarker);
        this.recordMarker = 2;
    }

    recordMarker3(args) {
        var label = args.label;
        var lat = args.lat;
        var lng = args.lng;
        var color = args.color;

        if (label == "") return "請輸入座標名稱";
        if (lat == "") return "請輸入緯度座標";
        if (lng == "") return "請輸入經度座標";
        if (color == "") return "請輸入顏色色碼";

        var tmpMarker = [];
        tmpMarker.push(label, lat, lng, color);

        this.recordCoordinate.push(tmpMarker);
        this.recordMarker = 2;
    }

    recordMarker4(args) {
        var label = args.label;
        var lat = args.lat;
        var lng = args.lng;
        var photo = args.photo;

        if (label == "") return "請輸入座標名稱";
        if (lat == "") return "請輸入緯度座標";
        if (lng == "") return "請輸入經度座標";
        if (photo == "") return "請輸入圖片連結";

        var tmpMarker = [];
        tmpMarker.push(label, lat, lng, photo);

        this.recordCoordinate.push(tmpMarker);
        this.recordMarker = 3;
    }

    /**
     * 在此聲明致謝，感謝石原純也(Junya Ishihara)先生提供 Github 開源專案
     * 此 showMarker() 與 recordMarker2() 兩個函式的程式碼源自 sheet2gmap 專案改編而來
     * champierre/sheet2gmap 專案來源：https://github.com/champierre/sheet2gmap/
     */

    showMarker1(args) {

        if (this.recordMarker == 1) {
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
        }

        if (this.recordMarker == 2) {
            var width = screen.width / 2;
            var height = screen.height / 2;
            var openGoogleMapWindow = window.open('', 'Google Map 擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, name=no, status=no');

            openGoogleMapWindow.document.write(`
        <html lang="en">

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
                var color = this.recordCoordinate[i][3];
                openGoogleMapWindow.document.write('{ label:"' + label + '", lat: ' + lat + ', lng: ' + lng + ', color:"' + color + '"},');
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
                        addMarker(i, markerData[i].lat, markerData[i].lng, markerData[i].label, markerData[i].color);
                        var name = markerData[i]["label"];
                        sidebar_html += '<b>' + (i + 1) + '.</b> <a href="javascript:openWindow(' + i + ')">' + name + '</a><br />';
                    }
                    document.getElementById("sidebar").innerHTML = sidebar_html;
                }

                function addMarker(i, lat, lng, label, color) {
                    var markerLatLng = new google.maps.LatLng({ lat: lat, lng: lng, });
                    var pinColor = color.substr(1); // remove '#' from color code
                    var pinImage = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="#' + color + '"><path d="M12 2C7.6 2 4 5.6 4 10c0 4.4 8 13 8 13s8-8.6 8-13c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/></svg>');

                    marker[i] = new google.maps.Marker({
                        position: markerLatLng,
                        map: map,
                        icon: pinImage
                    });
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
        }

        if (this.recordMarker == 3) {
            var width = screen.width / 2;
            var height = screen.height / 2;
            var openGoogleMapWindow = window.open('', 'Google Map 擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, name=no, status=no');

            openGoogleMapWindow.document.write(`
        <html lang="en">

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
                var photo = this.recordCoordinate[i][3];
                var width = this.width;
                var length = this.length;
                openGoogleMapWindow.document.write('{ label:"' + label + '", lat: ' + lat + ', lng: ' + lng + ', color:"EA4335", photo:"' + photo + '", length: ' + length + ', width: ' + width + '},');
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
                        addMarker(i, markerData[i].lat, markerData[i].lng, markerData[i].label, markerData[i].color, markerData[i].photo, markerData[i].length, markerData[i].width);
                        var name = markerData[i]["label"];
                        sidebar_html += '<b>' + (i + 1) + '.</b> <a href="javascript:openWindow(' + i + ')">' + name + '</a><br />';
                    }
                    document.getElementById("sidebar").innerHTML = sidebar_html;
                }

                function addMarker(i, lat, lng, label, color, photo, length, width) {
                    var markerLatLng = new google.maps.LatLng({ lat: lat, lng: lng, });
                    var pinImage = photo;
                    marker[i] = new google.maps.Marker({
                        position: markerLatLng,
                        map: map,
                        icon: {
                            url: pinImage,
                            scaledSize: new google.maps.Size(width, length)
                        }
                    });
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
        }

        this.recordCoordinate = [];
    }

    calculateDistance(args) {
        var traffic = args.traffic;

        var traffic_Text;

        if (traffic == "DRIVING") traffic_Text = msg.driving[theLocale]
        if (traffic == "TRANSIT") traffic_Text = msg.transit[theLocale]
        if (traffic == "WALKING") traffic_Text = msg.walking[theLocale]

        if(args.display == 1){

            var width = screen.width / 2;
            var height = screen.height / 2;

            var openGoogleMapWindow = window.open('', 'Google Map 擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, name=no, status=no');

            openGoogleMapWindow.document.write(`
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Calculate Distance, Mark Locations, Display Path and InfoWindow</title>
                <script
                    src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&libraries=geometry,directions"></script>
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
                </style>
            </head>

            <body>

                <div id="map"></div>

                <script>
                    var map;
                    var directionsService;
                    var directionsRenderer;

                    function initMap() {

                        map = new google.maps.Map(document.getElementById('map'), {
                            center: { lat: ${this.recordCoordinate[0][1]}, lng: ${this.recordCoordinate[0][2]} },
                            zoom: 10
                        });

                        var location1 = new google.maps.LatLng(${this.recordCoordinate[0][1]}, ${this.recordCoordinate[0][2]});
                        var location2 = new google.maps.LatLng(${this.recordCoordinate[1][1]}, ${this.recordCoordinate[1][2]});

                        var marker1 = new google.maps.Marker({
                            position: location1,
                            map: map,
                            title: '${this.recordCoordinate[0][0]}'
                        });

                        var marker2 = new google.maps.Marker({
                            position: location2,
                            map: map,
                            title: '${this.recordCoordinate[1][0]}'
                        });

                        directionsService = new google.maps.DirectionsService();
                        directionsRenderer = new google.maps.DirectionsRenderer({ map: map, suppressMarkers: true });

                        var request = {
                            origin: location1,
                            destination: location2,
                            travelMode: '${traffic}'
                        };

                        directionsService.route(request, function (result, status) {
                            if (status == 'OK') {
                                directionsRenderer.setDirections(result);

                                var route = result.routes[0];
                                var distance = 0;
                                for (var i = 0; i < route.legs.length; i++) { distance += route.legs[i].distance.value; }

                                var distanceInKm = distance / 1000;

                                var infoWindow1 = new google.maps.InfoWindow({ content: '${this.recordCoordinate[0][0]}' });
                                var infoWindow2 = new google.maps.InfoWindow({ content: '${this.recordCoordinate[1][0]}' });

                                google.maps.event.addListener(marker1, 'click', function () { infoWindow1.open(map, marker1); });
                                google.maps.event.addListener(marker2, 'click', function () { infoWindow2.open(map, marker2); });

                                var distanceInfoWindow = new google.maps.InfoWindow({ content: '從${this.recordCoordinate[0][0]}到${this.recordCoordinate[1][0]}的${traffic_Text}距離是' + distanceInKm.toFixed(2) + ' 公里' });

                                distanceInfoWindow.setPosition(route.legs[0].end_location);
                                distanceInfoWindow.open(map);

                                window.opener.postMessage({ distance: distanceInKm.toFixed(2) }, '*');
                            }
                        });
                    }

                    google.maps.event.addDomListener(window, 'load', initMap);

                </script>

            </body>
            `);

            openGoogleMapWindow.document.close();

            var that = this;

            var promise = new Promise(function (resolve) { promiseResolver = resolve; });

            window.removeEventListener('message', that.messageHandler);

            that.messageHandler = function (event) {
                if (event.source === openGoogleMapWindow) {
                    var distanceValue = event.data.distance;
                    distanceKMValue = distanceValue;

                    promiseResolver();
                }
            };

            window.addEventListener('message', that.messageHandler);

            promise.then(function () { that.distanceKM = distanceKMValue; });

        }

        if(args.display == 0){

            const origin = "'"+ this.recordCoordinate[0][1] +"," + this.recordCoordinate[0][2] + "'";
            const destination = "'"+ this.recordCoordinate[1][1] +"," + this.recordCoordinate[1][2] + "'";
            
            // 可选参数，例如交通模式（driving, walking, transit等）
            const params = {
              origin: origin,
              destination: destination,
              mode: traffic, // 交通模式：驾车
            };
            
            // 调用Google Maps Directions API
            googleMapsClient.directions({
              params: params,
            }).then(response => {
              const route = response.data.routes[0];
              const distance = route.legs[0].distance.text;
              console.log(`Distance: ${distance}`);
            }).catch(error => {
              console.error(error);
            });
        }

        this.recordCoordinate = [];
    }

    distance(args) {
        return this.distanceKM;
    }

    setFieldNames(args) {
        this.name = args.name;
        this.longitude = args.longitude;
        this.latitude = args.latitude;
        this.note = args.note;
    }

    setFieldNames2(args) {
        this.length = args.length;
        this.width = args.width;
    }

    showMarker2(args) {
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

    showMarker3(args) {
        var data = JSON.parse(args.data);

        var width = screen.width / 2;
        var height = screen.height / 2;
        var openGoogleMapWindow = window.open('', 'Google Map 擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, name=no, status=no');

        openGoogleMapWindow.document.write(`
        <html lang="en">

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
                var color = data[i]["顏色"] == undefined ? "EA4335" : data[i]["顏色"];
                var remark = data[i]["備註"] == undefined ? "" : data[i]["備註"];
                var width = this.width;
                var length = this.length;
            }

            if (data[i][this.name]) {
                var label = data[i][this.name];
                var lng = data[i][this.longitude];
                var lat = data[i][this.latitude];
                var color = data[i][this.color] == undefined ? "EA4335" : data[i][this.color];
                var remark = data[i][this.note] == undefined ? "" : data[i][this.note];
                var width = this.width;
                var length = this.length;
            }
            openGoogleMapWindow.document.write('{label:"' + label + '",lat:' + lat + ',lng:' + lng + ', color:"' + color + '", remark:"' + remark + '", length: ' + length + ', width: ' + width + '},');
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
                        addMarker(i, markerData[i].lat, markerData[i].lng, markerData[i].label, markerData[i].color, markerData[i].remark, markerData[i].length, markerData[i].width);
                        var name = markerData[i]["label"];
                        sidebar_html += '<b>' + (i + 1) + '.</b> <a href="javascript:openWindow(' + i + ')">' + name + '</a><br />';
                    }
                    document.getElementById("sidebar").innerHTML = sidebar_html;
                }

                function addMarker(i, lat, lng, label, color, remark, length, width) {
                    var markerLatLng = new google.maps.LatLng({ lat: lat, lng: lng, });
                    var pinImage = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="#' + color + '"><path d="M12 2C7.6 2 4 5.6 4 10c0 4.4 8 13 8 13s8-8.6 8-13c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/></svg>');
                    marker[i] = new google.maps.Marker({
                        position: markerLatLng,
                        map: map,
                        icon: {
                            url: pinImage,
                            scaledSize: new google.maps.Size(width, length)
                        }
                    });
                    const contentString = '<h2>' + label + '</h2><p style="font-size:16px;font-weight:bold;">' + remark + '</p>';
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
    }

    showMarker4(args) {
        var data = JSON.parse(args.data);

        var width = screen.width / 2;
        var height = screen.height / 2;
        var openGoogleMapWindow = window.open('', 'Google Map 擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, name=no, status=no');

        openGoogleMapWindow.document.write(`
        <html lang="en">

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
                var link = data[i]["圖片連結"] == undefined ? "" : data[i]["圖片連結"];
                var remark = data[i]["備註"] == undefined ? "" : data[i]["備註"];
                var width = this.width;
                var length = this.length;
            }

            if (data[i][this.name]) {
                var label = data[i][this.name];
                var lng = data[i][this.longitude];
                var lat = data[i][this.latitude];
                var link = data[i][this.link] == undefined ? "" : data[i][this.link];
                var remark = data[i][this.note] == undefined ? "" : data[i][this.note];
                var width = this.width;
                var length = this.length;
            }
            openGoogleMapWindow.document.write('{label:"' + label + '",lat:' + lat + ',lng:' + lng + ', link:"' + link + '", remark:"' + remark + '", length: ' + length + ', width: ' + width + '},');
        }

        openGoogleMapWindow.document.write('];');

        openGoogleMapWindow.document.write(`
                var map;console.log(markerData);
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
                        addMarker(i, markerData[i].lat, markerData[i].lng, markerData[i].label, markerData[i].link, markerData[i].remark, markerData[i].length, markerData[i].width);
                        var name = markerData[i]["label"];
                        sidebar_html += '<b>' + (i + 1) + '.</b> <a href="javascript:openWindow(' + i + ')">' + name + '</a><br />';
                    }
                    document.getElementById("sidebar").innerHTML = sidebar_html;
                }

                function addMarker(i, lat, lng, label, link, remark, length, width) {
                    var markerLatLng = new google.maps.LatLng({ lat: lat, lng: lng, });
                    var pinImage = link;
                    marker[i] = new google.maps.Marker({
                        position: markerLatLng,
                        map: map,
                        icon: {
                            url: pinImage,
                            scaledSize: new google.maps.Size(width, length)
                        }
                    });
                    const contentString = '<h2>' + label + '</h2><p style="font-size:16px;font-weight:bold;">' + remark + '</p>';
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
    }

}

module.exports = googleMap;
