const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

class Chart {
    constructor(runtime) {
        this.runtime = runtime;
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension('chart', this);

        // Bind methods and initialize properties
        [this.onmessage, this.onclose, this.write].forEach(m => (this[m.name] = m.bind(this)));
        this.reporter = null;

        this.locale = formatMessage.setup().locale === 'zh-tw' ? 'zh-tw' : 'en';
        this.chartData = "";
        this.chartTitle = "圖表標題";
        this.X_axisTitle = "X軸標題";
        this.Y_axisTitle = "Y軸標題";

        // Date settings
        const now = new Date();
        this.startDate = this._formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
        this.endDate = this._formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        // Radar chart settings
        this.radarChartRangeMin = 0;
        this.radarChartRangeMax = 5;
        this.hasSetRadarRange = false;

        // Color settings
        this.colorTable = [
            ["rgba(255, 26, 104, 0.3)", "rgba(255, 26, 104, 0.8)"],
            ["rgba(54, 162, 235, 0.3)", "rgba(54, 162, 235, 0.8)"],
            ["rgba(255, 206, 86, 0.3)", "rgba(255, 206, 86, 0.8)"],
            ["rgba(75, 192, 192, 0.3)", "rgba(75, 192, 192, 0.8)"],
            ["rgba(153, 102, 255, 0.3)", "rgba(153, 102, 255, 0.81)"],
            ["rgba(255, 159, 64, 0.3)", "rgba(255, 159, 64, 0.8)"],
            ["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.8)"]
        ];
    }

    getInfo() {
        return {
            id: 'chart',
            name: msg.title[this.locale],
            color1: '#83251B',
            color2: '#83251B',
            menuIconURI: null,
            blockIconURI: null,
            blocks: [
                {
                    opcode: 'showChartTitle',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        title: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.chartTitle[this.locale]
                        },
                    },
                    text: msg.showChartTitle[this.locale]
                },
                {
                    opcode: 'showAxisTitle',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X_axis: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.XAxis[this.locale]
                        },
                        Y_axis: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.YAxis[this.locale]
                        }
                    },
                    text: msg.showAxisTitle[this.locale]
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
                    text: msg.showChart2[this.locale]
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
                    text: msg.showChart[this.locale]
                },
                '---',
                {
                    opcode: 'setDate',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        start: {
                            type: ArgumentType.STRING,
                            defaultValue: this.startDate,
                        },
                        end: {
                            type: ArgumentType.STRING,
                            defaultValue: this.endDate,
                        },
                    },
                    text: msg.setDate[this.locale]
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
                    text: msg.showGanttChart[this.locale]
                },
                '---',
                {
                    opcode: 'setRadarChartRange',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        min: { type: ArgumentType.STRING, defaultValue: '0' },
                        max: { type: ArgumentType.STRING, defaultValue: '5' },
                    },
                    text: msg.radarChartRange[this.locale]
                },
            ],
            menus: {
                chartSelectField: {
                    acceptReporters: true,
                    items: [1, 2, 3, 4, 5].map(i => ({
                        text: msg[['lineChart', 'barChart', 'pieChart', 'donutChart', 'radarChart'][i - 1]][this.locale],
                        value: String(i)
                    }))
                },
            }
        };
    }

    onclose() {
        this.session = null;
    }

    write(data, parser = null) {
        if (this.session) {
            return new Promise(resolve => {
                if (parser) this.reporter = { parser, resolve };
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
            lines.forEach(line => {
                if (this.reporter) {
                    const { parser, resolve } = this.reporter;
                    resolve(parser(line));
                }
            });
        }
    }

    scan() {
        this.comm.getDeviceList().then(result => {
            this.runtime.emit(this.runtime.constructor.PERIPHERAL_LIST_UPDATE, result);
        });
    }

    // Block handlers
    showChartTitle(args) { this.chartTitle = args.title; }
    showAxisTitle(args) { this.X_axisTitle = args.X_axis; this.Y_axisTitle = args.Y_axis; }
    showChart(args) { this.chartData = args.data; this._renderChart(args.chart, 1); }
    showChart2(args) { this.chartData = args.data; this._renderChart(args.chart, args.n); }
    setDate(args) { this.startDate = args.start; this.endDate = args.end; }
    setRadarChartRange(args) {
        this.radarChartRangeMin = args.min;
        this.radarChartRangeMax = args.max;
        this.hasSetRadarRange = true;
    }

    // Chart rendering methods
    _renderChart(chartType, columnIndex) {
        const methods = {
            '1': () => this._renderXyChart('line', columnIndex),
            '2': () => this._renderXyChart('bar', columnIndex),
            '3': () => this._renderCircularChart('pie', columnIndex),
            '4': () => this._renderCircularChart('doughnut', columnIndex),
            '5': () => this._renderRadarChart(columnIndex)
        };

        if (methods[chartType]) methods[chartType]();
    }

    _renderXyChart(type, n) {
        const chartData = this._prepareChartData(n);
        if (!chartData) return;

        const win = this._createChartWindow();
        this._writeHtmlHeader(win);
        this._writeXyChartData(win, chartData, n);
        this._writeCommonChartConfig(win, type, 'data', { radius: 4, hoverRadius: 8 });
        win.document.close();
    }

    _renderCircularChart(type, n) {
        const chartData = this._prepareChartData(n);
        if (!chartData) return;

        const win = this._createChartWindow(screen.width / 2, screen.height);
        this._writeHtmlHeader(win);
        this._writePieChartData(win, chartData, n);
        this._writeCommonChartConfig(win, type, 'data');
        win.document.close();
    }

    _renderRadarChart(n) {
        const chartData = this._prepareChartData(n);
        if (!chartData) return;

        const win = this._createChartWindow(screen.width / 2, screen.height);
        this._writeHtmlHeader(win);
        this._writeXyChartData(win, chartData, n);

        const radarOptions = this.hasSetRadarRange ? {
            scales: `{
                r: {
                    angleLines: { display: false },
                    suggestedMin: '${this.radarChartRangeMin}',
                    suggestedMax: '${this.radarChartRangeMax}'
                }
            }`
        } : {};

        this._writeCommonChartConfig(win, 'radar', 'data', radarOptions);
        win.document.close();
    }

    showGanttChart(args) {
        this.chartData = args.data;
        const dataSet = JSON.parse(this.chartData);
        const keys = Object.keys(dataSet[0]);
        const column = dataSet.map(item => item[keys[0]]);

        const win = this._createChartWindow();

        win.document.write(`
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
                            data: [
                                ${column.map((_, i) => {
            const item = dataSet[i];
            return `{ x: ['${item["開始日期"]}', '${item["結束日期"]}'], y: '${item["名稱"]}' }`;
        }).join(',\n                                ')}
                            ],
                            backgroundColor: [${column.map((_, i) => `'${this.colorTable[i % 7][0]}'`).join(', ')}],
                            borderColor: [${column.map((_, i) => `'${this.colorTable[i % 7][1]}'`).join(', ')}],
                            borderWidth: 2,
                            borderSkipped: false,
                            barPercentage: 0.4,
                            hoverBorderRadius: 0,
                        }]
                    };
                    
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
                                    padding: { bottom: -20 }
                                },
                                legend: { labels: { boxWidth: 0 } }
                            },
                        },
                    };
                    
                    var myChart = new Chart(document.getElementById('myChart'), config);
                </script>
            </body>
        `);

        win.document.close();
    }

    // Helper methods
    _prepareChartData(n = 1) {
        try {
            const dataSet = JSON.parse(this.chartData);
            const keys = Object.keys(dataSet[0]);

            if (n > keys.length - 1) {
                alert("超出試算表的欄位範圍");
                return null;
            }

            return {
                dataSet,
                keys,
                dataLength: dataSet.length,
                column: dataSet.map(item => item[keys[n - 1]])
            };
        } catch (e) {
            alert("資料格式錯誤");
            return null;
        }
    }

    _formatDate(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    _sanitizeData(data) {
        return data.replace(/([,*=!:${}()|[\]/\\])/g, '');
    }

    _createChartWindow(width = screen.width / 2, height = screen.height / 2) {
        return window.open('', '圖表擴充功能',
            `width=${width}, height=${height}, toolbar=no, scrollbars=no, menubar=no, location=no, status=no`);
    }

    _writeHtmlHeader(win) {
        win.document.write(`
            <head>
                <title>圖表擴充功能</title>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            </head>
            <body>
                <canvas id="myChart" style="width:100%;"></canvas>
                <script>
        `);
    }

    _writeCommonChartConfig(win, type, data, additionalOptions = {}) {
        win.document.write(`
            var config = { 
                type: "${type}", 
                data: data, 
                options: { 
                    responsive: true,
                    plugins: { 
                        title: { 
                            display: true, 
                            text: '${this.chartTitle}', 
                            font: { size: 16, weight: "bold" }
                        }, 
                        legend: { 
                            labels: { font: { size: 16, weight: "bold" } },
                        },
                    },
        `);

        if (type === 'line' || type === 'bar') {
            win.document.write(`
                    scales: { 
                        x: { 
                            display: true, 
                            title: { display: true, text: '${this.X_axisTitle}', font: { size: 14, weight: "bold" } }, 
                            ticks: { font: { size: 14 } }
                        },
                        y: { 
                            display: true, 
                            title: { display: true, text: '${this.Y_axisTitle}', font: { size: 14, weight: "bold" } }, 
                            ticks: { font: { size: 14 } }
                        }
                    },
            `);
        }

        Object.entries(additionalOptions).forEach(([key, value]) => {
            win.document.write(`${key}: ${value},`);
        });

        win.document.write(`
                    animation: { duration: 0 }
                }
            };
            var myChart = new Chart(document.getElementById("myChart"), config);
            </script></body>
        `);
    }

    _writeXyChartData(win, chartData, n) {
        const { column, dataSet, keys, dataLength } = chartData;

        win.document.write(`
            var labels = [${column.map(item => `'${item}'`).join(', ')}];
            var data = { 
                labels: labels, 
                datasets: [
        `);

        for (let i = n; i < keys.length; i++) {
            const label = keys[i];
            const data = [];

            for (let j = 0; j < dataLength; j++) {
                data.push(dataSet[j][keys[i]]);
            }

            win.document.write(`
                    { 
                        label: '${label}',
                        backgroundColor: '${this.colorTable[(i - 1) % 7][0]}',
                        borderColor: '${this.colorTable[(i - 1) % 7][1]}',
                        data: [${data.map(item => `'${this._sanitizeData(item)}'`).join(', ')}]
                    },
            `);
        }

        win.document.write(`
                ]
            };
        `);
    }

    _writePieChartData(win, chartData, n) {
        const { column, dataSet, keys, dataLength } = chartData;

        win.document.write(`
            var label = [${column.map(item => `'${item}'`).join(', ')}];
            var color = [${column.map((_, i) => `'${this.colorTable[i % 7][0]}'`).join(', ')}];
            var data = { 
                labels: label, 
                datasets: [
        `);

        for (let i = n; i < keys.length; i++) {
            const label = keys[i];
            const data = [];

            for (let j = 0; j < dataLength; j++) {
                data.push(dataSet[j][keys[i]]);
            }

            win.document.write(`
                    { 
                        label: '${label}',
                        data: [${data.map(item => `'${this._sanitizeData(item)}'`).join(', ')}],
                        backgroundColor: color
                    },
            `);
        }

        win.document.write(`
                ]
            };
        `);
    }
}

module.exports = Chart;
