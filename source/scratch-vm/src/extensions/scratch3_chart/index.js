const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

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

        this.chartData = "";
        this.colorTable = this.saveColorTable();
        this.chartTitle = "圖表標題";

        this.X_axisTitle = "X軸標題";
        this.Y_axisTitle = "Y軸標題";

        this.startDate = this.calculateTheStartOfTheMonth();
        this.endDate = this.calculateTheEndOfTheMonth();
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
            color1: '#83251B',
            color2: '#83251B',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'showChartTitle',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        title: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.chartTitle[theLocale]
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
                            defaultValue: msg.XAxis[theLocale]
                        },
                        Y_axis: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.YAxis[theLocale]
                        }
                    },
                    text: msg.showAxisTitle[theLocale]
                },
                '---',
                {
                    opcode: 'showChart2',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        n: {
                            type: ArgumentType.STRING,
                            defaultValue: '2',
                        },
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'data',
                        },
                        chart: {
                            type: ArgumentType.STRING,
                            menu: 'chartSelectField',
                            defaultValue: '1',
                        },
                    },
                    text: msg.showChart2[theLocale]
                },
                {
                    opcode: 'showChart',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: 'data',
                        },
                        chart: {
                            type: ArgumentType.STRING,
                            menu: 'chartSelectField',
                            defaultValue: '1',
                        },
                    },
                    text: msg.showChart[theLocale]
                },
                '---',
                {
                    opcode: 'setDate',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        start: {
                            type: ArgumentType.STRING,
                            defaultValue: this.calculateTheStartOfTheMonth(),
                        },
                        end: {
                            type: ArgumentType.STRING,
                            defaultValue: this.calculateTheEndOfTheMonth(),
                        },
                    },
                    text: msg.setDate[theLocale]
                },
                {
                    opcode: 'showGanttChart',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        data: {
                            type: ArgumentType.STRING,
                            defaultValue: '名稱,開始日期,結束日期',
                        },
                    },
                    text: msg.showGanttChart[theLocale]
                },
            ],
            menus: {
                chartSelectField: {
                    acceptReporters: true,
                    items: [
                        {
                            text: msg.lineChart[theLocale], // 折線圖
                            value: '1'
                        },
                        {
                            text: msg.barChart[theLocale], // 長條圖
                            value: '2'
                        },
                        {
                            text: msg.pieChart[theLocale], // 圓餅圖
                            value: '3'
                        },
                        {
                            text: msg.donutChart[theLocale], // 環形圖
                            value: '4'
                        },
                        {
                            text: msg.radarChart[theLocale], // 雷達圖
                            value: '5'
                        },
                    ],
                },
            }
        };
    }

    saveColorTable() {
        var color = [
            ["rgba(255, 26, 104, 0.3)", "rgba(255, 26, 104, 0.8)"],
            ["rgba(54, 162, 235, 0.3)", "rgba(54, 162, 235, 0.8)"],
            ["rgba(255, 206, 86, 0.3)", "rgba(255, 206, 86, 0.8)"],
            ["rgba(75, 192, 192, 0.3)", "rgba(75, 192, 192, 0.8)"],
            ["rgba(153, 102, 255, 0.3)", "rgba(153, 102, 255, 0.81)"],
            ["rgba(255, 159, 64, 0.3)", "rgba(255, 159, 64, 0.8)"],
            ["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.8)"]
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
        var chart = args.chart;
        this.chartData = args.data;

        if (chart == "1")
            this.showLineChart();
        if (chart == "2")
            this.showBarChart();
        if (chart == "3")
            this.showPieChart();
        if (chart == "4")
            this.showDoughnutChart();
        if (chart == "5")
            this.showRadarChart();
    }

    showChart2(args) {
        var n = args.n;
        var chart = args.chart;
        this.chartData = args.data;

        if (chart == "1")
            this.showLineChart(n);
        if (chart == "2")
            this.showBarChart(n);
        if (chart == "3")
            this.showPieChart(n);
        if (chart == "4")
            this.showDoughnutChart(n);
        if (chart == "5")
            this.showRadarChart(n);
    }

    showLineChart(n = 1) {
        var dataSet = JSON.parse(this.chartData);
        var keys = Object.keys(dataSet[0]);
        var keysLenght = keys.length;
        var dataLength = dataSet.length;
        var column = [];

        if (n > keysLenght - 1)
            return alert("超出試算表的欄位範圍");

        for (var i = 0; i < dataLength; i++)
            column.push(dataSet[i][keys[n - 1]]);

        var width = screen.width / 2;
        var height = screen.height / 2;

        var openWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');

        openWindow.document.write(`
            <head>
                <title>圖表擴充功能</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            </head>
            <body>
                <canvas id="myChart" style="width:100%;"></canvas>
                <script>
        `);

        openWindow.document.write(`var labels = [`);
        for (var i = 0; i < column.length; i++)
            openWindow.document.write(`'${column[i]}',`);
        openWindow.document.write(`];`);

        openWindow.document.write(`var data = { labels:labels, datasets:[`);
        for (var i = n; i < keys.length; i++) {
            var label = keys[i];
            var data = [];
            for (var j = 0; j < dataLength; j++)
                data.push(dataSet[j][keys[i]]);

            openWindow.document.write(`{ label: '${label}',`);
            openWindow.document.write(`backgroundColor: '${this.colorTable[(i - 1) % 7][0]}',`);
            openWindow.document.write(`borderColor: '${this.colorTable[(i - 1) % 7][1]}',`);

            openWindow.document.write(`data:[`);
            for (var k = 0; k < data.length; k++)
                openWindow.document.write(`'${data[k].replace(/([,*=!:${}()|[\]/\\])/g, '')}',`);
            openWindow.document.write(`]`);

            openWindow.document.write(`},`);
        }
        openWindow.document.write(`]};`);

        openWindow.document.write(`
            var config = { 
                type: "line", 
                data: data, 
                options: { 
                    radius: 4, 
                    hoverRadius: 8,
                    responsive: true,
                    plugins: { 
                        title: { 
                            display: true, 
                            text: '${this.chartTitle}', 
                            font: { size:16 , weight: "bold"}
                        }, 
                        legend: { 
                            labels: { 
                                font: { size:16 , weight: "bold" }
                            },
                        },
                    },
                    scales: { 
                        x: { 
                            display: true, 
                            title:{ 
                                display: true, 
                                text: '${this.X_axisTitle}', 
                                font: { size:14 ,weight: "bold" }
                            }, 
                            ticks: { font:{ size:14 }}
                        },
                        y: { 
                            display: true, 
                            title: { 
                                display :true, 
                                text: '${this.Y_axisTitle}',
                                font: { size:14 ,weight: "bold" }
                            }, 
                            ticks: { font:{ size:14 }}
                        }
                    },
                    animation: { duration: 0 }
                }
            };
            var myChart = new Chart(document.getElementById("myChart"), config);
            </script></body>
        `);

        openWindow.document.close();
    }

    showBarChart(n = 1) {
        var dataSet = JSON.parse(this.chartData);
        var keys = Object.keys(dataSet[0]);
        var keysLenght = keys.length;
        var dataLength = dataSet.length;
        var column = [];

        if (n > keysLenght)
            return alert("超出試算表的欄位範圍");

        for (var i = 0; i < dataLength; i++)
            column.push(dataSet[i][keys[n - 1]]);

        var width = screen.width / 2;
        var height = screen.height / 2;

        var openWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');

        openWindow.document.write(`
            <head>
                <title>圖表擴充功能</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            </head>
            <body>
                <canvas id="myChart" style="width:100%;"></canvas>
                <script>
        `);

        openWindow.document.write(`var labels = [`);
        for (var i = 0; i < column.length; i++)
            openWindow.document.write(`'${column[i]}',`);
        openWindow.document.write(`];`);

        openWindow.document.write(`var data = { labels:labels, datasets:[`);
        for (var i = n; i < keys.length; i++) {
            var label = keys[i];
            var data = [];
            for (var j = 0; j < dataLength; j++)
                data.push(dataSet[j][keys[i]]);

            openWindow.document.write(`{ label: '${label}',`);
            openWindow.document.write(`backgroundColor: '${this.colorTable[(i - 1) % 7][0]}',`);
            openWindow.document.write(`borderColor: '${this.colorTable[(i - 1) % 7][1]}',`);

            openWindow.document.write(`data:[`);
            for (var k = 0; k < data.length; k++)
                openWindow.document.write(`'${data[k].replace(/([,*=!:${}()|[\]/\\])/g, '')}',`);
            openWindow.document.write(`]`);

            openWindow.document.write(`},`);
        }
        openWindow.document.write(`]};`);

        openWindow.document.write(`
            var config = { 
                type: "bar",
                data: data,
                options: {
                    radius: 4,
                    hoverRadius: 8,
                    responsive: true,
                    plugins: { 
                        title: { 
                            display: true, 
                            text: '${this.chartTitle}', 
                            font: { size:16 ,weight: "bold" }
                        }, 
                        legend: { 
                            labels: { 
                                font:{ size:16 , weight: "bold" }
                            },
                        },
                    },
                    scales: { 
                        x: { 
                            display: true, 
                            title: { 
                                display: true, 
                                text: '${this.X_axisTitle}', 
                                font: { size:14 , weight: "bold" }
                            },
                            ticks: { font:{ size:14, } }
                        },
                        y: {
                            display: true, 
                            title: {
                                display: true, 
                                text: '${this.Y_axisTitle}', 
                                font: { size:14 , weight: "bold" }
                            },
                            ticks: { font:{ size:14, }}
                        }
                    },
                    animation: { duration: 0 },
                }
            };
            var myChart = new Chart(document.getElementById("myChart"), config);
            </script></body>
        `);

        openWindow.document.close();
    }

    showPieChart(n = 1) {
        var dataSet = JSON.parse(this.chartData);
        var keys = Object.keys(dataSet[0]);
        var keysLenght = keys.length;
        var dataLength = dataSet.length;
        var column = [];

        if (n > keysLenght)
            return alert("超出試算表的欄位範圍");

        for (var i = 0; i < dataLength; i++)
            column.push(dataSet[i][keys[n - 1]]);

        var width = screen.width / 2;
        var height = screen.height;
        var openWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');

        openWindow.document.write(`
            <head>
                <title>圖表擴充功能</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            </head>
            <body>
                <canvas id="myChart" style="width:100%;"></canvas>
                <script>
        `);

        openWindow.document.write(`var label = [`);
        for (var i = 0; i < column.length; i++)
            openWindow.document.write(`'${column[i]}',`);
        openWindow.document.write(`];`);

        openWindow.document.write(`var color = [`);
        for (var i = 0; i < column.length; i++)
            openWindow.document.write(`'${this.colorTable[i % 7][0]}',`);
        openWindow.document.write(`];`);

        openWindow.document.write(`var data = { labels:label, datasets:[`);
        for (var i = n; i < keys.length; i++) {
            var label = keys[i];
            var data = [];
            for (var j = 0; j < dataLength; j++)
                data.push(dataSet[j][keys[i]]);

            openWindow.document.write(`{ label: '${label}',`);

            openWindow.document.write(`data:[`);
            for (var l = 0; l < data.length; l++)
                openWindow.document.write(`'${data[l].replace(/([,*=!:${}()|[\]/\\])/g, '')}',`);
            openWindow.document.write(`],`);

            openWindow.document.write(`backgroundColor:color,},`);
        }
        openWindow.document.write(`]};`);

        openWindow.document.write(`
            var config = { 
                type: "pie", 
                data: data, 
                options: { 
                    responsive: true,
                    plugins: { 
                        legend: { 
                            position: "top",
                        }, 
                        title: { 
                            display: true,
                            text: '${this.chartTitle}',
                            font: { size: 16 ,weight: "bold" }
                        }, 
                        legend: { 
                            labels: {
                                font: { size:16 ,weight: "bold" }
                            },
                        },
                    },
                    animation: { duration: 0, }
                },
            };
            var myChart = new Chart(document.getElementById("myChart"), config);
            </script></body>
        `);

        openWindow.document.close();
    }

    showDoughnutChart(n = 1) {
        var dataSet = JSON.parse(this.chartData);
        var keys = Object.keys(dataSet[0]);
        var keysLenght = keys.length;
        var dataLength = dataSet.length;
        var column = [];

        if (n > keysLenght)
            return alert("超出試算表的欄位範圍");

        for (var i = 0; i < dataLength; i++)
            column.push(dataSet[i][keys[n - 1]]);

        var width = screen.width / 2;
        var height = screen.height;

        var openWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');

        openWindow.document.write(`
            <head>
                <title>圖表擴充功能</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            </head>
            <body>
                <canvas id="myChart" style="width:100%;"></canvas>
                <script>
        `);

        openWindow.document.write(`var label = [`);
        for (var i = 0; i < column.length; i++)
            openWindow.document.write(`'${column[i]}',`);
        openWindow.document.write(`];`);

        openWindow.document.write(`var color = [`);
        for (var i = 0; i < column.length; i++)
            openWindow.document.write(`'${this.colorTable[i % 7][0]}',`);
        openWindow.document.write(`];`);

        openWindow.document.write(`var data = { labels:label, datasets:[`);
        for (var i = n; i < keys.length; i++) {
            var label = keys[i];
            var data = [];
            for (var j = 0; j < dataLength; j++)
                data.push(dataSet[j][keys[i]]);

            openWindow.document.write(`{ label: '${label}',`);

            openWindow.document.write(`data:[`);
            for (var l = 0; l < data.length; l++)
                openWindow.document.write(`'${data[l].replace(/([,*=!:${}()|[\]/\\])/g, '')}',`);
            openWindow.document.write(`],`);

            openWindow.document.write(`backgroundColor:color,},`);
        }
        openWindow.document.write(`]};`);

        openWindow.document.write(`
            var config = { 
                type: "doughnut",
                data: data,
                options: {
                    responsive: true,
                    plugins: { 
                        legend: { position: "top" },
                        title: { 
                            display:true,
                            text: '${this.chartTitle}',
                            font: { size: 16 ,weight: "bold" }
                        },
                        legend:{ 
                            labels: {
                                font: { size:16 ,weight: "bold" }
                            },
                        },
                    },
                    animation:{ duration:0, }
                },
            };
            var myChart = new Chart(document.getElementById("myChart"), config);
            </script></body>
        `);

        openWindow.document.close();
    }

    showRadarChart(n = 1) {
        var dataSet = JSON.parse(this.chartData);
        var keys = Object.keys(dataSet[0]);
        var keysLenght = keys.length;
        var dataLength = dataSet.length;
        var column = [];

        if (n > keysLenght)
            return alert("超出試算表的欄位範圍");

        for (var i = 0; i < dataLength; i++)
            column.push(dataSet[i][keys[n - 1]]);

        var width = screen.width / 2;
        var height = screen.height;

        var openWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');

        openWindow.document.write(`
            <head>
                <title>圖表擴充功能</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            </head>
            <body>
                <canvas id="myChart" style="width:100%;"></canvas>
                <script>
        `);

        openWindow.document.write(`var label = [`);
        for (var i = 0; i < column.length; i++)
            openWindow.document.write(`'${column[i]}',`);
        openWindow.document.write(`];`);

        openWindow.document.write(`var data = { labels:label, datasets:[`);
        for (var i = n; i < keys.length; i++) {
            var label = keys[i];
            var data = [];
            for (var j = 0; j < dataLength; j++)
                data.push(dataSet[j][keys[i]]);

            openWindow.document.write(`{ label:'${label}',`);
            openWindow.document.write(`backgroundColor:'${this.colorTable[(i - 1) % 7][0]}',`);
            openWindow.document.write(`borderColor:'${this.colorTable[(i - 1) % 7][1]}',`);

            openWindow.document.write(`data:[`);
            for (var k = 0; k < data.length; k++)
                openWindow.document.write(`'${data[k].replace(/([,*=!:${}()|[\]/\\])/g, '')}',`);
            openWindow.document.write(`]`);

            openWindow.document.write(`},`);
        }
        openWindow.document.write(`]};`);

        openWindow.document.write(`
            var config = { 
                type: "radar",
                data: data,
                options: {
                    responsive: true,
                    plugins: { 
                        legend: { position: "top" },
                        title: { 
                            display:true,
                            text: '${this.chartTitle}',
                            font: { size: 16 ,weight: "bold" }
                        },
                        legend:{ 
                            labels: {
                                font: { size:16 ,weight: "bold" }
                            },
                        },
                    },
                    animation:{ duration:0, }
                },
            };
            var myChart = new Chart(document.getElementById("myChart"), config);
            </script></body>
        `);

        openWindow.document.close();
    }

    calculateTheStartOfTheMonth() {
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth();

        var firstDay = new Date(y, m, 1);
        var y = firstDay.getFullYear();
        var m = (firstDay.getMonth() + 1).toString().padStart(2, '0');
        var d = firstDay.getDate().toString().padStart(2, '0');

        var theStartDate = y + "-" + m + "-" + d;

        return theStartDate;
    }

    calculateTheEndOfTheMonth() {
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth();

        var lastDay = new Date(y, m + 1, 0);
        var y = lastDay.getFullYear();
        var m = (lastDay.getMonth() + 1).toString().padStart(2, '0');
        var d = lastDay.getDate().toString().padStart(2, '0');

        var theEndDate = y + "-" + m + "-" + d;

        return theEndDate;
    }

    setDate(args) {
        this.startDate = args.start;
        this.endDate = args.end;
    }

    showGanttChart(args) {
        this.chartData = args.data;

        var dataSet = JSON.parse(this.chartData);

        var keys = Object.keys(dataSet[0]);
        var dataLength = dataSet.length;
        var column = [];

        for (var i = 0; i < dataLength; i++)
            column.push(dataSet[i][keys[0]]);

        var width = screen.width / 2;
        var height = screen.height / 2;

        var openWindow = window.open('', '圖表擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, location=no, status=no');
        openWindow.document.write(`
            <head>
                <title>圖表擴充功能</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
            </head>
            <body>
                <canvas id="myChart"></canvas>
                <script>
                    var data = {
                        datasets: [{
                            label: '',
        `);

        openWindow.document.write(`data: [`);
        for (var i = 0; i < column.length; i++) {
            var name = dataSet[i]["名稱"];
            var startDate = dataSet[i]["開始日期"];
            var endDate = dataSet[i]["結束日期"];
            openWindow.document.write(`{ x: ['${startDate}', '${endDate}'], y: '${name}' },`);
        }
        openWindow.document.write(`],`);

        openWindow.document.write(`backgroundColor: [`);
        for (var i = 0; i < column.length; i++)
            openWindow.document.write(`'${this.colorTable[i % 7][0]}',`);
        openWindow.document.write(`],`);

        openWindow.document.write(`borderColor: [`);
        for (var i = 0; i < column.length; i++)
            openWindow.document.write(`'${this.colorTable[i % 7][1]}',`);
        openWindow.document.write(`],`);

        openWindow.document.write(`
                    borderWidth: 2,
                    borderSkipped: false,
                    barPercentage: 0.4,
                    hoverBorderRadius: 0,
                }]
            };
        `);

        openWindow.document.write(`
            var config = {
                type: 'bar',
                data,
                options: {
                    responsive: true,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: '日期',
                                font: { size: 16, weight: 'bold' },
                            },
                            ticks: { font: { size: 14 } },
                            type: 'time',
                            time: { unit: 'day', displayFormats: { day: 'MM-dd' } },
                            min: '${this.startDate}',
                            max: '${this.endDate}',
                        },
                        y: {
                            title: {
                                display: true,
                                text: '名稱',
                                font: { size: 16, weight: 'bold' },
                            },
                            ticks: { font: { size: 14 } },
                        },
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: "${this.chartTitle}",
                            font: { size: 16 },
                            padding: { bottom: -20, }
                        },
                        legend: { labels: { boxWidth: 0, }, },
                    },
                },
            };
        `);

        openWindow.document.write(`var myChart = new Chart(document.getElementById('myChart'), config);</script></body></html>`);

        openWindow.document.close();
    }
}
module.exports = chart;
