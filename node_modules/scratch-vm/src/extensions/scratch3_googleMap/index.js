const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

const menuIconURI = null;
const blockIconURI = null;

const defaultId = 'default';
let theLocale = null;
const GOOGLE_MAP_API_KEY = "AIzaSyDuGsDZbA_qhW_994yBcxGTwh7QssOqGEw";

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
                            defaultValue: '佛光大學'
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
                    opcode: 'recordMarker2',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: '名稱,經度,緯度,備註'
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
     * 在此聲明，感謝石原純也(Junya Ishihara)先生提供 Github 開源專案
     * 此 showMarker() 與 recordMarker2() 兩個函式的程式碼源自 sheet2gmap 專案改編而來
     * champierre/sheet2gmap 專案來源：https://github.com/champierre/sheet2gmap/
     */

    showMarker(args) {
        var width = screen.width / 2;
        var height = screen.height / 2;
        var openGoogleMapWindow = window.open('', 'Google Map 擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');

        openGoogleMapWindow.document.write('<head><meta charset="utf-8" /><title>Google Map 擴充功能</title><style>');
        openGoogleMapWindow.document.write('#map {height: 100%;}html,body {height: 100%;margin: 0;padding: 0;}');
        openGoogleMapWindow.document.write('#sidebar {position: absolute;top: 20%;left: 75%;width: 20%;height: 50%;');
        openGoogleMapWindow.document.write('border: 1px solid #666;padding: 10px;background-color: white;font-size: 16px;font-weight: bold;}</style></head>');
        openGoogleMapWindow.document.write('<body><div id="map"></div><div id="sidebar"></div>');
        openGoogleMapWindow.document.write('<script src="https://maps.googleapis.com/maps/api/js?region=TW&language=zh-TW&key=' + GOOGLE_MAP_API_KEY + '&callback=initMap" defer></script><script>');

        openGoogleMapWindow.document.write('var markerData = [');

        for (var i = 0; i < this.recordCoordinate.length; i++) {
            var label = this.recordCoordinate[i][0];
            var lat = this.recordCoordinate[i][1];
            var lng = this.recordCoordinate[i][2];

            openGoogleMapWindow.document.write('{ label:"' + label + '", lat: ' + lat + ', lng: ' + lng + '},');
        }

        openGoogleMapWindow.document.write('];');

        openGoogleMapWindow.document.write('var map;var marker = [];var infoWindow = [];var windowOpened;');
        openGoogleMapWindow.document.write('function initMap() {var target = document.getElementById("map");');
        openGoogleMapWindow.document.write('var centerp = { lat: calculateLatAverage(), lng: calculateLngAverage() };');
        openGoogleMapWindow.document.write('map = new google.maps.Map(target, {center: centerp,zoom: 15,});setData(markerData);}');
        openGoogleMapWindow.document.write('function calculateLatAverage() {var tmpLat = [];for (var i = 0; i < markerData.length; i++)tmpLat[i] = markerData[i].lat;');
        openGoogleMapWindow.document.write('var latMin = Math.max(...tmpLat);var latMax = Math.min(...tmpLat);var latAvg = (latMin + latMax) / 2;return latAvg;}');
        openGoogleMapWindow.document.write('function calculateLngAverage() {var tmpLng = [];for (var i = 0; i < markerData.length; i++)tmpLng[i] = markerData[i].lng;');
        openGoogleMapWindow.document.write('var lngMin = Math.max(...tmpLng);var lngMax = Math.min(...tmpLng);var lngAvg = (lngMin + lngMax) / 2;return lngAvg;}');
        openGoogleMapWindow.document.write('function addMarker(i, lat, lng, label) {');
        openGoogleMapWindow.document.write('var markerLatLng = new google.maps.LatLng({lat: lat,lng: lng,});');
        openGoogleMapWindow.document.write('marker[i] = new google.maps.Marker({position: markerLatLng,map: map});');
        openGoogleMapWindow.document.write('const contentString = \'<h2>\' + label + \'</h2><p style="font-size:16px;font-weight:bold;"></p>\';');
        openGoogleMapWindow.document.write('infoWindow[i] = new google.maps.InfoWindow({content: contentString});markerEvent(i);}');
        openGoogleMapWindow.document.write('function setData(markerData) {var sidebar_html = `座標清單：<br>`;');
        openGoogleMapWindow.document.write('for (var i = 0; i < markerData.length; i++) {addMarker(i, markerData[i].lat, markerData[i].lng, markerData[i].label);');
        openGoogleMapWindow.document.write(' var name = markerData[i]["label"];sidebar_html += `<b>${i + 1}.</b> <a href="javascript:openWindow(${i})">${name}<\/a><br />`;}');
        openGoogleMapWindow.document.write('document.getElementById("sidebar").innerHTML = sidebar_html;}');
        openGoogleMapWindow.document.write('function markerEvent(i) {marker[i].addListener("click", function () {if (windowOpened) {windowOpened.close();}infoWindow[i].open(map, marker[i]);windowOpened = infoWindow[i];});}');
        openGoogleMapWindow.document.write('function openWindow(i) {if (windowOpened) {windowOpened.close();}infoWindow[i].open(map, marker[i]);windowOpened = infoWindow[i];}');
        openGoogleMapWindow.document.write('</script></body></html>');

        openGoogleMapWindow.document.close();

        this.recordCoordinate = [];
    }

    recordMarker2(args) {
        if (args.data == "名稱,經度,緯度,備註") return "請建立 Google 試算表，依序建立名稱,經度,緯度,備註等四個欄位名稱，搭配使用讀寫 Google 試算表擴充功能即可使用此積木";

        var data = JSON.parse(args.data);

        var width = screen.width / 2;
        var height = screen.height / 2;
        var openGoogleMapWindow = window.open('', 'Google Map 擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');

        openGoogleMapWindow.document.write('<head><meta charset="utf-8" /><title>Google Map 擴充功能</title><style>');
        openGoogleMapWindow.document.write('#map {height: 100%;}html,body {height: 100%;margin: 0;padding: 0;}');
        openGoogleMapWindow.document.write('#sidebar {position: absolute;top: 20%;left: 75%;width: 20%;height: 50%;');
        openGoogleMapWindow.document.write('border: 1px solid #666;padding: 10px;background-color: white;font-size: 16px;font-weight: bold;}</style></head>');
        openGoogleMapWindow.document.write('<body><div id="map"></div><div id="sidebar"></div>');
        openGoogleMapWindow.document.write('<script src="https://maps.googleapis.com/maps/api/js?region=TW&language=zh-TW&key=' + GOOGLE_MAP_API_KEY + '&callback=initMap" defer></script><script>');

        openGoogleMapWindow.document.write('var markerData = [');

        for (var i = 0; i < data.length; i++) {
            var label = data[i]["名稱"].length ? data[i]["名稱"] : "";
            var lng = data[i]["經度"].length ? data[i]["經度"] : "";
            var lat = data[i]["緯度"].length ? data[i]["緯度"] : "";
            var remark = data[i]["備註"].length ? data[i]["備註"] : "";

            openGoogleMapWindow.document.write('{label:"' + label + '",lat:' + lat + ',lng:' + lng + ',remark:"' + remark + '"},');
        }

        openGoogleMapWindow.document.write('];');

        openGoogleMapWindow.document.write('var map;var marker = [];var infoWindow = [];var windowOpened;');
        openGoogleMapWindow.document.write('function initMap() {var target = document.getElementById("map");');
        openGoogleMapWindow.document.write('var centerp = { lat: calculateLatAverage(), lng: calculateLngAverage() };');
        openGoogleMapWindow.document.write('map = new google.maps.Map(target, {center: centerp,zoom: 15,});setData(markerData);}');
        openGoogleMapWindow.document.write('function calculateLatAverage() {var tmpLat = [];for (var i = 0; i < markerData.length; i++)tmpLat[i] = markerData[i].lat;');
        openGoogleMapWindow.document.write('var latMin = Math.max(...tmpLat);var latMax = Math.min(...tmpLat);var latAvg = (latMin + latMax) / 2;return latAvg;}');
        openGoogleMapWindow.document.write('function calculateLngAverage() {var tmpLng = [];for (var i = 0; i < markerData.length; i++)tmpLng[i] = markerData[i].lng;');
        openGoogleMapWindow.document.write('var lngMin = Math.max(...tmpLng);var lngMax = Math.min(...tmpLng);var lngAvg = (lngMin + lngMax) / 2;return lngAvg;}');
        openGoogleMapWindow.document.write('function addMarker(i, lat, lng, label, remark) {');
        openGoogleMapWindow.document.write('var markerLatLng = new google.maps.LatLng({lat: lat,lng: lng,});');
        openGoogleMapWindow.document.write('marker[i] = new google.maps.Marker({position: markerLatLng,map: map});');
        openGoogleMapWindow.document.write('const contentString = \'<h2>\' + label + \'</h2><p style="font-size:16px;font-weight:bold;">\' + remark + \'</p>\';');
        openGoogleMapWindow.document.write('infoWindow[i] = new google.maps.InfoWindow({content: contentString});markerEvent(i);}');
        openGoogleMapWindow.document.write('function setData(markerData) {var sidebar_html = `座標清單：<br>`;');
        openGoogleMapWindow.document.write('for (var i = 0; i < markerData.length; i++) {addMarker(i, markerData[i].lat, markerData[i].lng, markerData[i].label, markerData[i].remark);');
        openGoogleMapWindow.document.write(' var name = markerData[i]["label"];sidebar_html += `<b>${i + 1}.</b> <a href="javascript:openWindow(${i})">${name}<\/a><br />`;}');
        openGoogleMapWindow.document.write('document.getElementById("sidebar").innerHTML = sidebar_html;}');
        openGoogleMapWindow.document.write('function markerEvent(i) {marker[i].addListener("click", function () {if (windowOpened) {windowOpened.close();}infoWindow[i].open(map, marker[i]);windowOpened = infoWindow[i];});}');
        openGoogleMapWindow.document.write('function openWindow(i) {if (windowOpened) {windowOpened.close();}infoWindow[i].open(map, marker[i]);windowOpened = infoWindow[i];}');
        openGoogleMapWindow.document.write('</script></body></html>');

        openGoogleMapWindow.document.close();
    }

}

module.exports = googleMap;
