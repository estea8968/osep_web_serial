const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

var KoleksiItemset = require('simple-apriori/KoleksiItemset')
var Itemset = require('simple-apriori/Itemset.js')
var Apriori = require('simple-apriori/Apriori')

var DecisionTree = require('decision-tree')

const menuIconURI = null;
const blockIconURI = null;

const defaultId = 'default';
let theLocale = null;

class dataMining {
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

        this.dataset;
        this.featureColumn = [];
        this.targetPredictionColumn;
        this.PredictionColumn = {};
        this.predicted = "";
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
            id: 'dataMining',
            name: msg.title[theLocale],
            color1: '#320A37',
            color2: '#320A37',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'setUpTheDataset',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        dataset: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.dataset[theLocale]
                        },
                    },
                    text: msg.setUpDataset[theLocale]
                },
                {
                    opcode: 'setFeatureColumns',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        column: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.column[theLocale]
                        },
                    },
                    text: msg.setFeatureColumns[theLocale]
                },
                {
                    opcode: 'setTargetPredictionColumn',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        column: {
                            type: ArgumentType.STRING,
                            defaultValue: msg.column[theLocale]
                        },
                    },
                    text: msg.setTargetPredictionColumn[theLocale]
                },
                {
                    opcode: 'trainDecisionTreeModel',
                    blockType: BlockType.COMMAND,
                    text: msg.trainDecisionTreeModel[theLocale]
                },
                {
                    opcode: 'visualizeDecisionTree',
                    blockType: BlockType.COMMAND,
                    text: msg.visualizeDecisionTree[theLocale]
                },
            ],
        };
    }

    setUpTheDataset(args) {
        this.dataset = args.dataset;
        this.featureColumn = [];
    }

    setFeatureColumns(args) {
        this.featureColumn = this.featureColumn.concat(args.column);
    }

    setTargetPredictionColumn(args) {
        this.targetPredictionColumn = args.column;
    }

    trainDecisionTreeModel(args) {
        var class_name = this.targetPredictionColumn;
        var features = this.featureColumn;
        var training_data = JSON.parse(this.dataset);

        this.dt = new DecisionTree(class_name, features);
        this.dt.train(training_data);

        var treeJson = this.dt.toJSON();
        this.treeJsonmodel = treeJson.model;

        this.PredictionColumn = {};

        console.log(this.treeJsonmodel);
    }

    visualizeDecisionTree(args) {
        var width = screen.width / 2;
        var height = screen.height / 2;
        var dataMiningWindow = window.open('', '資料探勘擴充功能', 'width=' + width + ', height=' + height + ', toolbar=no, scrollbars=no, menubar=no, name=no, status=no');

        var treeJsonmodel = JSON.stringify(this.treeJsonmodel);

        dataMiningWindow.document.write(`
        <html>

        <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"
                integrity="sha512-M7nHCiNUOwFt6Us3r8alutZLm9qMt4s9951uo8jqO4UwJ1hziseL6O3ndFyigx6+LREfZqnhHxYjKRJ8ZQ69DQ=="
                crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        </head>

        <body>

            <script>

                var data = ${treeJsonmodel};
                function buildTreeWithRoot(rootNode) {
                    var treeData = [];
                    var root = { name: rootNode.name, type: rootNode.type, val: undefined, depth: 0, parent: null };
                    treeData.push(root);

                    function buildTree(node, parent, depth) {
                        if (node.vals) {
                            node.vals.forEach(function (child) {
                                var newNode = { name: child.name, type: child.type, val: child.child.val, depth: depth, parent: parent };
                                treeData.push(newNode);
                                if (child.child.vals) {
                                    buildTree(child.child, newNode, depth + 1);
                                }
                            });
                        }
                    }

                    buildTree(rootNode, root, 1);
                    return treeData;
                }

                var treeData = buildTreeWithRoot(data);
                console.log(treeData);

                var width = 600;
                var height = 400;
                var margin = { left: 100, right: 50, top: 100, bottom: 0 };

                var svg = d3.select('body').append('svg').attr('width', '100%').attr('height', '100%');
                var chartGroup = svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

                var treeLayout = d3.tree().size([width - 100, height - 100]);

                var root = d3.stratify()
                    .id(function (d) { return d.name; })
                    .parentId(function (d) { return d.parent ? d.parent.name : null; })
                    (treeData);

                var tree = treeLayout(root);

                var links = chartGroup.selectAll(".link")
                    .data(tree.links())
                    .enter().append("line")
                    .attr("class", "link")
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                var nodes = chartGroup.selectAll(".node")
                    .data(tree.descendants())
                    .enter().append("circle")
                    .attr("class", "node")
                    .attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; })
                    .attr("r", 10);

                var labels = chartGroup.selectAll(".label")
                    .data(tree.descendants())
                    .enter().append("text")
                    .attr("class", "label")
                    .attr("x", function (d, i) {
                        if (i == 0) {
                            return d.x - 10;
                        } else {
                            return d.x - 30;
                        }
                    })
                    .attr("y", function (d, i) {
                        if (i == 0) {
                            return d.y - 20;
                        } else {
                            return d.y + 20;
                        }
                    })
                    .text(function (d) {
                        if (d.data.val != undefined) {
                            return d.data.name + '(' + d.data.val + ')';
                        } else {
                            return d.data.name;
                        }
                    });

            </script>
        </body>

        </html>
        `);
    }
}
module.exports = dataMining;
