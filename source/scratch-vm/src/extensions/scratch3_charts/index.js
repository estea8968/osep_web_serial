const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');
const { object } = require('prop-types');

const menuIconURI = null;
const blockIconURI = null;

const defaultId = 'default';
let theLocale = null;

class chart {
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

        this.chartData = null;
        this.colorTable = this.saveColorTable();
        this.chartTitle = null;
        this.X_axisTitle = null;
        this.Y_axisTitle = null;

        //this.showText();

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
            id: 'chart',
            name: msg.title[theLocale],
            color1: '#525252',
            color2: '#4C5B5C',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'showChartTitle',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        title: {
                            type: ArgumentType.STRING,
                            defaultValue: '圖表標題'
                        },
                    },
                    text: msg.showChartTitle[theLocale]
                },
                {
                    opcode: 'showAxisTitle',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X_axis: {
                            type: ArgumentType.STRING,
                            defaultValue: 'X軸標題'
                        },
                        Y_axis: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Y軸標題'
                        }
                    },
                    text: msg.showAxisTitle[theLocale]
                },
                {
                    opcode: 'showChart',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: '資料'
                        },
                        chart: {
                            type: ArgumentType.STRING,
                            menu: 'chartSelectField',
                            defaultValue: '折線圖'
                        },
                    },
                    text: msg.showChart[theLocale]
                },
            ],
            menus: {
                chartSelectField: {
                    acceptReporters: true,
                    items: ["折線圖", "長條圖", "圓餅圖", "環形圖", "雷達圖"],
                },
            }
        };
    }

    saveColorTable() {
        var color = [
            ["#FF53784D", "#FF97AD"],
            ["#FF9B394D", "#FFCF9F"],
            ["#FFCC534D", "#FFE6AA"],
            ["#43BDBD4D", "#A5DFDF"],
            ["#31A0EA4D", "#9AD0F5"],
            ["#945FFF4D", "#CCB2FF"],
            ["#C9CBCF4D", "#E4E5E7"]
        ];
        return color;
    }

    showChartTitle(args) {
        this.chartTitle = args.title;
    }

    showAxisTitle(args) {
        this.X_axisTitle = args.X_axis;
        this.Y_axisTitle = args.Y_axis;
    }

    showChart(args) {
        var data = args.data;
        var chart = args.chart;
        this.chartData = data;

        if (chart == "折線圖")
            this.showLineChart();
        if (chart == "長條圖")
            this.showBarChart();
        if (chart == "圓餅圖")
            this.showPieChart();
        if (chart == "環形圖")
            this.showDoughnutChart();
        if (chart == "雷達圖")
            this.showRadarChart();
    }

    showLineChart() {
        var keys = Object.keys(JSON.parse(this.chartData)[0]);
        var dataLength = JSON.parse(this.chartData).length;
        var column = [];

        for (var i = 0; i < dataLength; i++)
            column.push(JSON.parse(this.chartData)[i][keys[0]]);

        var width = screen.width / 2;
        var height = screen.height / 2;

        var openChartWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');
        openChartWindow.document.write('<head><title>圖表擴充功能</title><script src="https://cdn.jsdelivr.net/npm/chart.js"></script></head>');
        openChartWindow.document.write('<body><canvas id="myChart" style="width:100%;"></canvas><script>');

        openChartWindow.document.write('var labels = [');
        for (var i = 0; i < column.length; i++)
            openChartWindow.document.write('"' + column[i] + '",');
        openChartWindow.document.write('];');

        openChartWindow.document.write('var data = { labels:labels, datasets:[');
        for (var i = 1; i < keys.length; i++) {
            var label = keys[i];
            var data = [];
            for (var j = 0; j < dataLength; j++)
                data.push(JSON.parse(this.chartData)[j][keys[i]]);

            openChartWindow.document.write('{ label:"' + label + '",');
            openChartWindow.document.write('backgroundColor:"' + this.colorTable[(i - 1) % 7][1] + '",');
            openChartWindow.document.write('borderColor:"' + this.colorTable[(i - 1) % 7][0] + '",');

            openChartWindow.document.write('data:[');
            for (var k = 0; k < data.length; k++)
                openChartWindow.document.write('"' + data[k].replace(/([,*=!:${}()|[\]/\\])/g, '') + '",');
            openChartWindow.document.write(']');

            openChartWindow.document.write('},');
        }
        openChartWindow.document.write(']};');

        openChartWindow.document.write('var config = { type:"line", data:data, options:{ radius:4, hoverRadius:8, responsive:true,');
        openChartWindow.document.write('plugins:{ title:{ display:true, text:"' + this.chartTitle + '", font:{ size:16 }}, legend:{ labels:{ font:{ size:16 }},},},');
        openChartWindow.document.write('scales:{ x:{ display:true, title:{ display:true, text:"' + this.X_axisTitle + '", font:{ size:14, }}, ticks:{ font:{ size:14, }}},');
        openChartWindow.document.write('y:{ display:true, title:{ display:true, text:"' + this.Y_axisTitle + '", font:{ size:14, }}, ticks:{ font:{ size:14, }}}},');
        openChartWindow.document.write('animation: { duration: 0, }}};');
        openChartWindow.document.write('var myChart = new Chart(document.getElementById("myChart"), config);</script></body>');

        openChartWindow.document.close();
    }

    showBarChart() {
        var keys = Object.keys(JSON.parse(this.chartData)[0]);
        var dataLength = JSON.parse(this.chartData).length;
        var column = [];

        for (var i = 0; i < dataLength; i++)
            column.push(JSON.parse(this.chartData)[i][keys[0]]);

        var width = screen.width / 2;
        var height = screen.height / 2;

        var openChartWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');
        openChartWindow.document.write('<head><title>圖表擴充功能</title><script src="https://cdn.jsdelivr.net/npm/chart.js"></script></head>');
        openChartWindow.document.write('<body><canvas id="myChart" style="width:100%;"></canvas><script>');

        openChartWindow.document.write('var labels = [');
        for (var i = 0; i < column.length; i++)
            openChartWindow.document.write('"' + column[i] + '",');
        openChartWindow.document.write('];');

        openChartWindow.document.write('var data = { labels:labels, datasets:[');
        for (var i = 1; i < keys.length; i++) {
            var label = keys[i];
            var data = [];
            for (var j = 0; j < dataLength; j++)
                data.push(JSON.parse(this.chartData)[j][keys[i]]);

            openChartWindow.document.write('{ label:"' + label + '",');
            openChartWindow.document.write('backgroundColor:"' + this.colorTable[(i - 1) % 7][1] + '",');
            openChartWindow.document.write('borderColor:"' + this.colorTable[(i - 1) % 7][0] + '",');

            openChartWindow.document.write('data:[');
            for (var k = 0; k < data.length; k++)
                openChartWindow.document.write('"' + data[k].replace(/([,*=!:${}()|[\]/\\])/g, '') + '",');
            openChartWindow.document.write(']');

            openChartWindow.document.write('},');
        }
        openChartWindow.document.write(']};');

        openChartWindow.document.write('var config = { type:"bar", data:data, options:{ radius:4, hoverRadius:8, responsive:true,');
        openChartWindow.document.write('plugins:{ title:{ display:true, text:"' + this.chartTitle + '", font:{ size:16 }}, legend:{ labels:{ font:{ size:16 }},},},');
        openChartWindow.document.write('scales:{ x:{ display:true, title:{ display:true, text:"' + this.X_axisTitle + '", font:{ size:14, }}, ticks:{ font:{ size:14, }}},');
        openChartWindow.document.write('y:{ display:true, title:{ display:true, text:"' + this.Y_axisTitle + '", font:{ size:14, }}, ticks:{ font:{ size:14, }}}},');
        openChartWindow.document.write('animation: { duration: 0, }}};');
        openChartWindow.document.write('var myChart = new Chart(document.getElementById("myChart"), config);</script></body>');

        openChartWindow.document.close();
    }

    showPieChart() {
        var keys = Object.keys(JSON.parse(this.chartData)[0]);
        var dataLength = JSON.parse(this.chartData).length;
        var column = [];

        for (var i = 0; i < dataLength; i++)
            column.push(JSON.parse(this.chartData)[i][keys[0]]);

        var width = screen.width / 2;
        var height = screen.height;

        var openChartWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');
        openChartWindow.document.write('<head><title>圖表擴充功能</title><script src="https://cdn.jsdelivr.net/npm/chart.js"></script></head>');
        openChartWindow.document.write('<body><canvas id="myChart" style="width:100%;"></canvas><script>');

        openChartWindow.document.write('var label = [');
        for (var i = 0; i < column.length; i++)
            openChartWindow.document.write('"' + column[i] + '",');
        openChartWindow.document.write('];');

        openChartWindow.document.write('var color = [');
        for (var i = 0; i < column.length; i++)
            openChartWindow.document.write('"' + this.colorTable[i % 7][1] + '",');
        openChartWindow.document.write('];');

        openChartWindow.document.write('var data = { labels:label, datasets:[');
        for (var i = 1; i < keys.length; i++) {
            var label = keys[i];
            var data = [];
            for (var j = 0; j < dataLength; j++)
                data.push(JSON.parse(this.chartData)[j][keys[i]]);

            openChartWindow.document.write('{ label:"' + label + '",');

            openChartWindow.document.write('data:[');
            for (var l = 0; l < data.length; l++)
                openChartWindow.document.write('"' + data[l].replace(/([,*=!:${}()|[\]/\\])/g, '') + '",');
            openChartWindow.document.write('],');

            openChartWindow.document.write('backgroundColor:color,},');
        }
        openChartWindow.document.write(']};');

        openChartWindow.document.write('var config = { type:"doughnut", data:data, options:{ responsive:true,');
        openChartWindow.document.write('plugins:{ legend:{ position:"top",}, title:{ display:true, text:"' + this.chartTitle + '",font: { size: 16 }}, legend:{ labels: {font: { size:16 }},},},');
        openChartWindow.document.write('animation:{ duration:0, }},};');
        openChartWindow.document.write('var myChart = new Chart(document.getElementById("myChart"), config);</script></body>');

        openChartWindow.document.close();
    }

    showDoughnutChart() {
        var keys = Object.keys(JSON.parse(this.chartData)[0]);
        var dataLength = JSON.parse(this.chartData).length;
        var column = [];

        for (var i = 0; i < dataLength; i++)
            column.push(JSON.parse(this.chartData)[i][keys[0]]);

        var width = screen.width / 2;
        var height = screen.height;

        var openChartWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');
        openChartWindow.document.write('<head><title>圖表擴充功能</title><script src="https://cdn.jsdelivr.net/npm/chart.js"></script></head>');
        openChartWindow.document.write('<body><canvas id="myChart" style="width:100%;"></canvas><script>');

        openChartWindow.document.write('var label = [');
        for (var i = 0; i < column.length; i++)
            openChartWindow.document.write('"' + column[i] + '",');
        openChartWindow.document.write('];');

        openChartWindow.document.write('var color = [');
        for (var i = 0; i < column.length; i++)
            openChartWindow.document.write('"' + this.colorTable[i % 7][1] + '",');
        openChartWindow.document.write('];');

        openChartWindow.document.write('var data = { labels:label, datasets:[');
        for (var i = 1; i < keys.length; i++) {
            var label = keys[i];
            var data = [];
            for (var j = 0; j < dataLength; j++)
                data.push(JSON.parse(this.chartData)[j][keys[i]]);

            openChartWindow.document.write('{ label:"' + label + '",');

            openChartWindow.document.write('data:[');
            for (var l = 0; l < data.length; l++)
                openChartWindow.document.write('"' + data[l].replace(/([,*=!:${}()|[\]/\\])/g, '') + '",');
            openChartWindow.document.write('],');

            openChartWindow.document.write('backgroundColor:color,},');
        }
        openChartWindow.document.write(']};');

        openChartWindow.document.write('var config = { type:"doughnut", data:data, options:{ responsive:true,');
        openChartWindow.document.write('plugins:{ legend:{ position:"top",}, title:{ display:true, text:"' + this.chartTitle + '",font: { size: 16 }}, legend:{ labels: {font: { size:16 }},},},');
        openChartWindow.document.write('animation:{ duration:0, }},};');
        openChartWindow.document.write('var myChart = new Chart(document.getElementById("myChart"), config);</script></body>');

        openChartWindow.document.close();
    }

    showRadarChart() {
        var keys = Object.keys(JSON.parse(this.chartData)[0]);
        var dataLength = JSON.parse(this.chartData).length;
        var column = [];

        for (var i = 0; i < dataLength; i++)
            column.push(JSON.parse(this.chartData)[i][keys[0]]);

        var width = screen.width / 2;
        var height = screen.height;

        var openChartWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');
        openChartWindow.document.write('<head><title>圖表擴充功能</title><script src="https://cdn.jsdelivr.net/npm/chart.js"></script></head>');
        openChartWindow.document.write('<body><canvas id="myChart" style="width:100%;"></canvas><script>');

        openChartWindow.document.write('var label = [');
        for (var i = 0; i < column.length; i++)
            openChartWindow.document.write('"' + column[i] + '",');
        openChartWindow.document.write('];');

        openChartWindow.document.write('var data = { labels:label, datasets:[');
        for (var i = 1; i < keys.length; i++) {
            var label = keys[i];
            var data = [];
            for (var j = 0; j < dataLength; j++)
                data.push(JSON.parse(this.chartData)[j][keys[i]]);

            openChartWindow.document.write('{ label:"' + label + '",');
            openChartWindow.document.write('backgroundColor:"' + this.colorTable[(i - 1) % 7][0] + '",');
            openChartWindow.document.write('borderColor:"' + this.colorTable[(i - 1) % 7][1] + '",');

            openChartWindow.document.write('data:[');
            for (var k = 0; k < data.length; k++)
                openChartWindow.document.write('"' + data[k].replace(/([,*=!:${}()|[\]/\\])/g, '') + '",');
            openChartWindow.document.write(']');

            openChartWindow.document.write('},');
        }
        openChartWindow.document.write(']};');

        openChartWindow.document.write('var config = { type:"radar", data:data, options:{ responsive:true,');
        openChartWindow.document.write('plugins:{ legend:{ position:"top",}, title:{ display:true, text:"' + this.chartTitle + '",font: { size: 16 }}, legend:{ labels: {font: { size:16 }},},},');
        openChartWindow.document.write('animation:{ duration:0, }},};');
        openChartWindow.document.write('var myChart = new Chart(document.getElementById("myChart"), config);</script></body>');

        openChartWindow.document.close();
    }
}

module.exports = chart;
