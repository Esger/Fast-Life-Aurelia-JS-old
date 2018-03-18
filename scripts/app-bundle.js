define('app',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var App = exports.App = function App() {
        _classCallCheck(this, App);
    };
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    longStackTraces: _environment2.default.debug,
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('resources/elements/controls',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ControlsCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var ControlsCustomElement = exports.ControlsCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function ControlsCustomElement(eventAggregator) {
            _classCallCheck(this, ControlsCustomElement);

            this.ea = eventAggregator;
            this.startPulsor = true;
            this.clearPulsor = false;
            this.timeOut = 0;
            this.addListeners();
        }

        ControlsCustomElement.prototype.clear = function clear() {
            this.ea.publish('clear');
            this.clearPulsor = false;
            this.startPulsor = true;
        };

        ControlsCustomElement.prototype.stop = function stop() {
            this.ea.publish('stop');
        };

        ControlsCustomElement.prototype.step = function step() {
            this.ea.publish('step');
            this.startPulsor = false;
        };

        ControlsCustomElement.prototype.start = function start() {
            this.ea.publish('start');
            this.startPulsor = false;
        };

        ControlsCustomElement.prototype.fillRandom = function fillRandom() {
            this.ea.publish('fillRandom');
        };

        ControlsCustomElement.prototype.setTimeoutInterval = function setTimeoutInterval() {
            this.ea.publish('timeoutInterval', this.timeOut);
        };

        ControlsCustomElement.prototype.addListeners = function addListeners() {
            var _this = this;

            this.ea.subscribe('cellSize', function (response) {
                _this.clearPulsor = true;
            });
        };

        return ControlsCustomElement;
    }()) || _class);
});
define('resources/elements/life',['exports', 'aurelia-framework', 'aurelia-event-aggregator', 'resources/services/life-worker-service'], function (exports, _aureliaFramework, _aureliaEventAggregator, _lifeWorkerService) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.LifeCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var _dec, _class;

    var LifeCustomElement = exports.LifeCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator, _lifeWorkerService.LifeWorkerService), _dec(_class = function () {
        function LifeCustomElement(eventAggregator, lifeWorkerService) {
            _classCallCheck(this, LifeCustomElement);

            this.statusUpdateHandle = null;

            this.ea = eventAggregator;
            this.lfWs = lifeWorkerService;
            this.cellSize = 2;
            this.cellsAlive = 0;
            this.liferules = [];
            this.speedInterval = 0;
            this.trails = true;
            this.running = false;
            this.opacity = 1 - this.trails * 0.9;
            this.cellCounts = [];
            this.lastMean = 0;
            this.stableCountDown = 20;
            this.grid = false;
        }

        LifeCustomElement.prototype.showStats = function showStats() {
            var speed = this.lifeSteps - this.prevSteps;
            this.prevSteps = this.lifeSteps;
            this.ea.publish('stats', {
                cellCount: this.cellsAlive,
                generations: this.lifeSteps,
                speed: speed * 2
            });
        };

        LifeCustomElement.prototype.clearSpace = function clearSpace() {
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };

        LifeCustomElement.prototype.animateStep = function animateStep() {
            var _this = this;

            this.drawCells();
            if (this.running && !this.stable) {
                setTimeout(function () {
                    _this.animateStep();
                }, this.speedInterval);
            } else {
                this.stop();
            }
        };

        LifeCustomElement.prototype.drawCells = function drawCells() {
            var cells = this.lfWs.cells;
            var cellSize = this.cellSize;
            var offScreen = this.ctxOffscreen;
            if (cells) {
                offScreen.fillStyle = "rgba(255, 255, 255, " + this.opacity + ")";
                offScreen.fillRect(0, 0, this.canvas.width, this.canvas.height);
                if (this.grid) {
                    this.drawgrid();
                }

                offScreen.fillStyle = "rgba(128, 128, 0, 1)";
                var i = cells.length - 1;
                while (i >= 0) {
                    var cell = cells[i];i -= 1;
                    offScreen.fillRect(cell[0] * cellSize, cell[1] * cellSize, cellSize, cellSize);
                }

                this.ctx.drawImage(this.offScreenCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
                this.cellsAlive = cells.length;
                this.lifeSteps += 1;
            }
        };

        LifeCustomElement.prototype.redraw = function redraw() {};

        LifeCustomElement.prototype.addCell = function addCell(event) {
            var mouseX = event.offsetX ? event.offsetX : event.pageX - this.offsetLeft;
            var realX = Math.floor(mouseX / this.cellSize);
            var mouseY = event.offsetY ? event.offsetY : event.pageY - this.offsetTop;
            var realY = Math.floor(mouseY / this.cellSize);
            this.ctx.fillStyle = "#d4d4d4";
            this.ctx.fillRect(realX * this.cellSize, realY * this.cellSize, this.cellSize, this.cellSize);
            this.lfWs.addCell([realX, realY]);
            console.log(realX, realY);
        };

        LifeCustomElement.prototype.drawgrid = function drawgrid(onScreen) {
            var offScreen = this.ctxOffscreen;
            var cellSize = Math.max(this.cellSize, 4);
            var margin = 4;
            var maxX = this.canvas.width - cellSize;
            var maxY = this.canvas.height - cellSize;
            var step = cellSize * 2;
            offScreen.fillStyle = "rgba(128, 128, 128, 0.1)";
            var y = margin;
            var oddStep = 0;
            for (; y < maxY; y += cellSize) {
                var x = margin + oddStep;
                oddStep = (oddStep + cellSize) % step;
                for (; x < maxX; x += step) {
                    offScreen.fillRect(x, y, cellSize, cellSize);
                }
            }
            if (onScreen) {
                this.ctx.drawImage(this.offScreenCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
            }
        };

        LifeCustomElement.prototype.initLife = function initLife() {
            this.opacity = 1 - this.trails * 0.9;
            this.canvas = document.getElementById('life');
            this.ctx = this.canvas.getContext('2d');
            this.canvasWidth = this.canvas.width;
            this.canvasHeight = this.canvas.height;
            this.offScreenCanvas = document.createElement('canvas');
            this.offScreenCanvas.width = this.canvasWidth;
            this.offScreenCanvas.height = this.canvasHeight;
            this.ctxOffscreen = this.offScreenCanvas.getContext('2d');
            this.setSpaceSize();
            this.resetSteps();
            this.lfWs.init(this.spaceWidth, this.spaceHeight, this.liferules);
        };

        LifeCustomElement.prototype.setSpaceSize = function setSpaceSize() {
            this.spaceWidth = Math.floor(this.canvasWidth / this.cellSize);
            this.spaceHeight = Math.floor(this.canvasHeight / this.cellSize);
        };

        LifeCustomElement.prototype.resetSteps = function resetSteps() {
            this.lifeSteps = 0;
            this.prevSteps = 0;
        };

        LifeCustomElement.prototype.slowDown = function slowDown() {
            this.speedInterval = 500;
        };

        LifeCustomElement.prototype.fullSpeed = function fullSpeed() {
            this.speedInterval = 0;
        };

        LifeCustomElement.prototype.clear = function clear() {
            this.stop();
            this.clearSpace();
            this.resetSteps();
            this.lfWs.clear();
        };

        LifeCustomElement.prototype.stop = function stop() {
            this.running = false;
            if (this.statusUpdateHandle) {
                clearInterval(this.statusUpdateHandle);
                this.statusUpdateHandle = null;
            }
        };

        LifeCustomElement.prototype.start = function start() {
            var _this2 = this;

            this.running = true;
            this.animateStep();
            this.statusUpdateHandle = setInterval(function () {
                _this2.showStats();
            }, 500);
        };

        LifeCustomElement.prototype.addListeners = function addListeners() {
            var _this3 = this;

            this.ea.subscribe('clear', function () {
                _this3.clear();
            });
            this.ea.subscribe('stop', function () {
                _this3.stop();
            });
            this.ea.subscribe('start', function () {
                _this3.start();
            });
            this.ea.subscribe('step', function () {
                _this3.lfWs.fillRandom();
            });
            this.ea.subscribe('fillRandom', function () {
                _this3.drawCells();
            });
            this.ea.subscribe('timeoutInterval', function (response) {
                _this3.speedInterval = response;
            });
            this.ea.subscribeOnce('dataReady', function () {
                _this3.drawCells();
            });
            this.ea.subscribe('toggleTrails', function () {
                _this3.trails = !_this3.trails;
                _this3.opacity = 1 - _this3.trails * 0.9;
            });
            this.ea.subscribe('toggleGrid', function () {
                _this3.grid = !_this3.grid;
                if (_this3.grid) {
                    _this3.drawgrid(true);
                }
            });
            this.ea.subscribe('cellSize', function (response) {
                _this3.cellSize = response;

                _this3.setSpaceSize();
                _this3.lfWs.resize(_this3.spaceWidth, _this3.spaceHeight);
                _this3.drawCells();
            });
            this.ea.subscribe('lifeRules', function (response) {
                _this3.liferules = response.liferules;
                if (response.init) {
                    _this3.initLife();
                } else {
                    _this3.lfWs.changeRules(_this3.liferules);
                }
            });
        };

        LifeCustomElement.prototype.attached = function attached() {
            this.addListeners();
        };

        _createClass(LifeCustomElement, [{
            key: 'meanOver100Gens',
            get: function get() {
                this.cellCounts.push(this.cellsAlive);
                this.cellCounts = this.cellCounts.slice(-100);
                var average = function average(arr) {
                    return arr.reduce(function (p, c) {
                        return p + c;
                    }, 0) / arr.length;
                };
                return average(this.cellCounts);
            }
        }, {
            key: 'stable',
            get: function get() {
                if (Math.abs(this.meanOver100Gens - this.cellsAlive) < 7) {
                    this.stableCountDown -= 1;
                } else {
                    this.stableCountDown = 20;
                }
                return this.stableCountDown <= 0;
            }
        }]);

        return LifeCustomElement;
    }()) || _class);
});
define('resources/elements/main',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var MainCustomElement = exports.MainCustomElement = function MainCustomElement() {
        _classCallCheck(this, MainCustomElement);
    };
});
define('resources/elements/settings',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.SettingsCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var _dec, _class;

    var SettingsCustomElement = exports.SettingsCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function SettingsCustomElement(eventAggregator) {
            _classCallCheck(this, SettingsCustomElement);

            this.ea = eventAggregator;
            this.liferules = [];
            this.selectedPreset = 6;
            this.presets = [{ rule: undefined, name: '' }, { rule: "125/36", name: "2&times;2" }, { rule: "34/34", name: "34 Life" }, { rule: "1358/357", name: "Amoeba" }, { rule: "4567/345", name: "Assimilation" }, { rule: "235678/378", name: "Coagulations" }, { rule: "23/3", name: "Conway&rsquo;s Life" }, { rule: "45678/3", name: "Coral" }, { rule: "34678/3678", name: "Day &amp; Night" }, { rule: "5678/35678", name: "Diamoeba" }, { rule: "012345678/3", name: "Flakes" }, { rule: "1/1", name: "Gnarl" }, { rule: "23/36", name: "High Life" }, { rule: "5/345", name: "Long Life" }, { rule: "12345/3", name: "Maze" }, { rule: "1234/3", name: "Mazectric" }, { rule: "245/368", name: "Move" }, { rule: "238/357", name: "Pseudo Life" }, { rule: "1357/1357", name: "Replicator" }, { rule: "/2", name: "Seeds" }, { rule: "/234", name: "Serviettes" }, { rule: "235678/3678", name: "Stains" }, { rule: "2345/45678", name: "Walled Cities" }];
            this.grid = false;
            this.trails = true;
            this.cellSizeExp = 1;
            this.minCellSize = 0;
            this.maxCellSize = 5;
            this.setPreset();
        }

        SettingsCustomElement.prototype.toggleTrails = function toggleTrails() {
            this.ea.publish('toggleTrails', this.trails);
        };

        SettingsCustomElement.prototype.toggleGrid = function toggleGrid() {
            this.ea.publish('toggleGrid', this.grid);
        };

        SettingsCustomElement.prototype.setCellSize = function setCellSize() {
            this.ea.publish('cellSize', this.cellSize);
        };

        SettingsCustomElement.prototype.setPreset = function setPreset() {
            if (this.selectedPreset > 0) {
                var rulesSet = this.presets[this.selectedPreset].rule.split('/');
                var stayRulesString = rulesSet[0];
                var newRulesString = rulesSet[1];
                var newRules = [];
                var i = 0;
                for (var _i = 0; _i < 9; _i++) {
                    newRules[_i] = newRulesString.includes(_i);
                    newRules[_i + 10] = stayRulesString.includes(_i);
                }
                this.liferules = newRules;
                this.publishRules(false);
            }
        };

        SettingsCustomElement.prototype.publishRules = function publishRules(init) {
            this.ea.publish('lifeRules', {
                liferules: this.liferules,
                init: init
            });
        };

        SettingsCustomElement.prototype.compareToPresets = function compareToPresets() {
            var newRules = this.liferules.slice(0, 9);
            var stayRules = this.liferules.slice(10, 19);
            var trueIndexesString = function trueIndexesString(rule, index) {
                return rule ? index : '';
            };
            var stayRulesString = stayRules.map(trueIndexesString).join('');
            var newRulesString = newRules.map(trueIndexesString).join('');
            var rulesString = stayRulesString + '/' + newRulesString;
            var findRulesString = function findRulesString(preset) {
                return preset.rule == rulesString;
            };
            var index = this.presets.findIndex(findRulesString);
            this.selectedPreset = index > -1 ? index : undefined;
        };

        SettingsCustomElement.prototype.setRules = function setRules(i) {
            this.liferules[i] = !this.liferules[i];
            this.compareToPresets();
            this.publishRules(false);
        };

        SettingsCustomElement.prototype.attached = function attached() {
            this.publishRules(true);
        };

        _createClass(SettingsCustomElement, [{
            key: 'cellSize',
            get: function get() {
                return Math.pow(2, this.cellSizeExp);
            }
        }]);

        return SettingsCustomElement;
    }()) || _class);
});
define('resources/elements/stats',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.StatsCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var StatsCustomElement = exports.StatsCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function StatsCustomElement(eventAggregator) {
            _classCallCheck(this, StatsCustomElement);

            this.ea = eventAggregator;
            this.speed = 0;
            this.cellCount = 0;
            this.generations = 0;
        }

        StatsCustomElement.prototype.addListeners = function addListeners() {
            var _this = this;

            this.ea.subscribe('stats', function (response) {
                _this.cellCount = response.cellCount;
                _this.generations = response.generations;
                _this.speed = response.speed;
            });
        };

        StatsCustomElement.prototype.attached = function attached() {
            this.addListeners();
        };

        return StatsCustomElement;
    }()) || _class);
});
define('resources/elements/story',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var StoryCustomElement = exports.StoryCustomElement = function StoryCustomElement() {
    _classCallCheck(this, StoryCustomElement);
  };
});
define('resources/elements/tabs',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.TabsCustomElement = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _dec, _class;

    var TabsCustomElement = exports.TabsCustomElement = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function TabsCustomElement(eventAggregator) {
            _classCallCheck(this, TabsCustomElement);

            this.tabs = [{
                title: 'Life Rules',
                active: true
            }, {
                title: 'Story',
                active: false
            }];
        }

        TabsCustomElement.prototype.activateTab = function activateTab(i) {
            var tabs = this.tabs.slice();
            tabs.forEach(function (tab) {
                tab.active = false;
            });
            tabs[i].active = true;
            this.tabs = tabs;
        };

        return TabsCustomElement;
    }()) || _class);
});
define('resources/services/life-worker-service',['exports', 'aurelia-framework', 'aurelia-event-aggregator'], function (exports, _aureliaFramework, _aureliaEventAggregator) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.LifeWorkerService = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var _dec, _class;

    var LifeWorkerService = exports.LifeWorkerService = (_dec = (0, _aureliaFramework.inject)(_aureliaEventAggregator.EventAggregator), _dec(_class = function () {
        function LifeWorkerService(eventAggregator) {
            _classCallCheck(this, LifeWorkerService);

            this.ea = eventAggregator;

            this._emptyBuffer = [[], []];
            this._fillSlotIndex = 0;
            this._getSlotIndex = 0;
            this._maxIndex = 9;
        }

        LifeWorkerService.prototype.emptyBuffer = function emptyBuffer() {
            this._buffer = this._emptyBuffer.slice();
        };

        LifeWorkerService.prototype.init = function init(w, h, liferules) {
            var _this = this;

            this.wrkr = new Worker('./assets/life-worker.js');
            this._fillSlotIndex = 0;
            this.emptyBuffer();
            this.wrkr.onmessage = function (e) {
                if (e.data && e.data.cells.length) {
                    _this._buffer[_this._fillSlotIndex] = e.data.cells;
                    _this._fillSlotIndex = 1 - _this._fillSlotIndex;
                    _this.ea.publish('dataReady');
                }
            };
            this._buffer = this._emptyBuffer.slice();
            var workerData = {
                message: 'initialize',
                w: w,
                h: h,
                liferules: liferules
            };
            this.wrkr.postMessage(workerData);
            this._getSlotIndex = 0;
            this.getGeneration();
        };

        LifeWorkerService.prototype.resize = function resize(w, h) {
            var inArea = function inArea(cell) {
                return cell[0] <= w && cell[1] <= h;
            };
            this._buffer[0] = this._buffer[0].filter(inArea);
            this._buffer[1] = this._buffer[1].filter(inArea);
            var workerData = {
                message: 'resize',
                w: w,
                h: h
            };
            this.wrkr.postMessage(workerData);
            this.addCell();
        };

        LifeWorkerService.prototype.clear = function clear() {
            this.emptyBuffer();
            var workerData = {
                message: 'clear'
            };
            this.wrkr.postMessage(workerData);
        };

        LifeWorkerService.prototype.fillRandom = function fillRandom() {
            var workerData = {
                message: 'fillRandom'
            };
            this.wrkr.postMessage(workerData);
        };

        LifeWorkerService.prototype.changeRules = function changeRules(rules) {
            var workerData = {
                message: 'rules',
                rules: rules
            };
            this.wrkr.postMessage(workerData);
        };

        LifeWorkerService.prototype.addCell = function addCell(xy) {
            var cells = this._buffer[this._getSlotIndex];
            var workerData = {
                message: 'setCells',
                cells: cells
            };
            this.wrkr.postMessage(workerData);
            if (xy) {
                workerData = {
                    message: 'addCell',
                    cell: xy
                };
                this.wrkr.postMessage(workerData);
            }
        };

        LifeWorkerService.prototype.getGeneration = function getGeneration() {
            var workerData = {
                message: 'resume'
            };
            this.wrkr.postMessage(workerData);
        };

        _createClass(LifeWorkerService, [{
            key: 'cells',
            get: function get() {
                var i = this._getSlotIndex;
                this._getSlotIndex = 1 - this._getSlotIndex;
                this.getGeneration();
                return this._buffer[i];
            }
        }]);

        return LifeWorkerService;
    }()) || _class);
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/main\"></require>\n    <main></main>\n</template>"; });
define('text!resources/elements/controls.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/stats\"></require>\n    <life-controls>\n        <a href=\"#\"\n           class=\"clearbutton\"\n           class.bind=\"clearPulsor ? 'pulsor' : ''\"\n           title=\"Clear\"\n           click.delegate=\"clear()\"></a>\n        <a href=\"#\"\n           class=\"stopbutton\"\n           title=\"Stop\"\n           click.delegate=\"stop()\"></a>\n        <a href=\"#\"\n           class=\"stepbutton\"\n           title=\"Step\"\n           click.delegate=\"step()\"></a>\n        <a href=\"#\"\n           class=\"startbutton\"\n           class.bind=\"startPulsor ? 'pulsor' : ''\"\n           title=\"Start\"\n           click.delegate=\"start()\"></a>\n        <a href=\"#\"\n           class=\"randombutton\"\n           title=\"Fill randomly\"\n           click.delegate=\"fillRandom()\"></a>\n        <input type=\"range\"\n               min.one-time=\"0\"\n               max.one-time=\"500\"\n               step=\"50\"\n               value.bind=\"timeOut\"\n               change.delegate=\"setTimeoutInterval()\">\n        <output value.bind=\"'interval: ' + timeOut\"></output>\n\n    </life-controls>\n    <stats></stats>\n</template>"; });
define('text!app.css', ['module'], function(module) { module.exports = "/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n*/\na,\nabbr,\nacronym,\naddress,\napplet,\narticle,\naside,\naudio,\nb,\nbig,\nblockquote,\nbody,\ncanvas,\ncaption,\ncenter,\ncite,\ncode,\ndd,\ndel,\ndetails,\ndfn,\ndiv,\ndl,\ndt,\nem,\nembed,\nfieldset,\nfigcaption,\nfigure,\nfooter,\nform,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nheader,\nhgroup,\nhtml,\ni,\niframe,\nimg,\nins,\nkbd,\nlabel,\nlegend,\nli,\nmark,\nmenu,\nnav,\nobject,\nol,\noutput,\np,\npre,\nq,\nruby,\ns,\nsamp,\nsection,\nsmall,\nspan,\nstrike,\nstrong,\nsub,\nsummary,\nsup,\ntable,\ntbody,\ntd,\ntfoot,\nth,\nthead,\ntime,\ntr,\ntt,\nu,\nul,\nvar,\nvideo {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font: inherit;\n  vertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmenu,\nnav,\nsection {\n  display: block;\n}\nbody {\n  height: 100vh;\n  display: flex;\n  justify-content: space-around;\n  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n"; });
define('text!resources/elements/life.html', ['module'], function(module) { module.exports = "<template>\n    <canvas id=\"life\"\n            width=\"750\"\n            height=\"464\"\n            click.delegate=\"addCell($event)\"\n            mouseenter.trigger=\"slowDown()\"\n            mouseleave.trigger=\"fullSpeed()\">\n    </canvas>\n</template>"; });
define('text!resources/elements/controls.css', ['module'], function(module) { module.exports = "controls {\n  display: flex;\n  justify-content: space-between;\n  margin-bottom: 36px;\n}\ncontrols life-controls {\n  display: flex;\n  justify-content: flex-start;\n  align-items: center;\n}\ncontrols life-controls a {\n  width: 24px;\n  height: 21px;\n  margin-right: 2px;\n  background-color: transparent;\n}\ncontrols life-controls [class*='button'] {\n  margin-right: 10px;\n}\ncontrols life-controls [type='range'] {\n  margin: 0;\n}\ncontrols life-controls .clearbutton {\n  width: 20px;\n  height: 20px;\n  border-radius: 2px;\n  box-sizing: border-box;\n  border: 2px solid #8a8a00;\n}\ncontrols life-controls .clearbutton.pulsor::before {\n  content: '';\n  display: block;\n  width: calc(100% + 4px);\n  height: calc(100% + 4px);\n  margin: -3px;\n  border: 1px solid whitesmoke;\n  border-radius: 3px;\n}\ncontrols life-controls .clearbutton:hover {\n  border-color: whitesmoke;\n}\ncontrols life-controls .startbutton {\n  position: relative;\n  width: 33px;\n}\ncontrols life-controls .startbutton::after,\ncontrols life-controls .startbutton::before {\n  content: '';\n  display: block;\n  position: absolute;\n  left: 0;\n  top: 0;\n  width: 0;\n  height: 0;\n  border-style: solid;\n  border-width: 10px 0 10px 17.3px;\n  border-color: transparent transparent transparent #8a8a00;\n}\ncontrols life-controls .startbutton::after {\n  right: 0;\n  left: auto;\n}\ncontrols life-controls .startbutton:hover::after,\ncontrols life-controls .startbutton:hover::before {\n  border-left-color: whitesmoke;\n}\ncontrols life-controls .stopbutton {\n  width: 20px;\n  height: 20px;\n  border-radius: 2px;\n  box-sizing: border-box;\n  border: 2px solid #8a8a00;\n  background-color: #8a8a00;\n}\ncontrols life-controls .stopbutton:hover {\n  border-color: whitesmoke;\n  background-color: whitesmoke;\n}\ncontrols life-controls .stepbutton {\n  width: 0;\n  height: 0;\n  border-style: solid;\n  border-width: 10px 0 10px 17.3px;\n  border-color: transparent transparent transparent #8a8a00;\n}\ncontrols life-controls .stepbutton:hover {\n  border-left-color: whitesmoke;\n}\ncontrols life-controls .randombutton {\n  width: 20px;\n  height: 20px;\n  border-radius: 2px;\n  background-image: url(\"random-button.svg\");\n}\ncontrols life-controls .randombutton:hover {\n  background-position: -20px 0;\n}\ncontrols life-controls .trails {\n  margin-left: 20px;\n}\ncontrols life-controls .pulsor:not(:hover),\ncontrols life-controls .pulsor:not(:hover)::after,\ncontrols life-controls .pulsor:not(:hover)::before {\n  box-shadow: 0 0 30px whitesmoke;\n  -animation: pulsate 1s infinite alternate;\n}\n@-webkit-keyframes pulsate {\n  from {\n    box-shadow: 0 0 10px rgba(255, 255, 255, 0);\n  }\n  to {\n    box-shadow: 0 0 20px #ffffff;\n  }\n}\n@keyframes pulsate {\n  from {\n    box-shadow: 0 0 10px rgba(255, 255, 255, 0);\n  }\n  to {\n    box-shadow: 0 0 20px #ffffff;\n  }\n}\n"; });
define('text!resources/elements/main.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/life\"></require>\n    <require from=\"resources/elements/controls\"></require>\n    <require from=\"resources/elements/tabs\"></require>\n    <h1>Fast Life | AureliaJS<a href=\"/\">ashWare</a></h1>\n    <life></life>\n    <controls></controls>\n    <tabs></tabs>\n</template>"; });
define('text!resources/elements/life.css', ['module'], function(module) { module.exports = "life {\n  display: block;\n  margin: 18px 0;\n  background-color: white;\n  height: 464px;\n}\n"; });
define('text!resources/elements/settings.html', ['module'], function(module) { module.exports = "<template>\n\n    <tab-content class=\"lifeRules\">\n        <row-labels>\n            <p title=\"Preset life rules\">Presets</p>\n        </row-labels>\n        <life-rules>\n            <select change.delegate=\"setPreset()\"\n                    value.bind=\"selectedPreset\"> \n                <option repeat.for=\"preset of presets\"  \n                    model.bind=\"$index\" \n                    innerhtml.one-time=\"preset.name\"> \n                </option> \n            </select>\n        </life-rules>\n    </tab-content>\n\n    <tab-content class=\"lifeRules\">\n        <row-labels>\n            <p title=\"Neighbour count to stay alive\">New</p>\n            <p title=\"Neighbour count to come alive\">Stay</p>\n        </row-labels>\n        <life-rules>\n            <life-rule repeat.for=\"rule of liferules\"\n                       if.bind=\"$index !== 9\">\n                <input type=\"checkbox\"\n                       checked.bind=\"rule\"\n                       id.one-time=\"'rule_'+$index\"\n                       change.delegate=\"setRules($index)\">\n                <label for.one-time=\"'rule_'+$index\">${$index % 10}</label>\n            </life-rule>\n        </life-rules>\n    </tab-content>\n\n    <tab-content class=\"lifeRules\">\n        <row-labels>\n            <p title=\"Change cell size and toggle trails\">Cell size</p>\n        </row-labels>\n        <life-rules>\n            <input type=\"range\"\n                   title=\"cell size ${cellSize}\"\n                   min.one-time=\"minCellSize\"\n                   max.one-time=\"maxCellSize\"\n                   value.bind=\"cellSizeExp\"\n                   change.delegate=\"setCellSize()\"\n                   focus.delegate=\"stop()\">\n            <output value.bind=\"cellSize\"></output>\n            <input id=\"trails\"\n                   type=\"checkbox\"\n                   checked.bind=\"trails\"\n                   change.delegate=\"toggleTrails()\" />\n            <label for=\"trails\"> Trails</label>\n            <input id=\"grid\"\n                   type=\"checkbox\"\n                   checked.bind=\"grid\"\n                   change.delegate=\"toggleGrid()\" />\n            <label for=\"grid\"> Grid</label>\n\n        </life-rules>\n    </tab-content>\n\n</template>"; });
define('text!resources/elements/main.css', ['module'], function(module) { module.exports = "main {\n  display: block;\n  width: 750px;\n  padding: 50px;\n  background-color: #dd0;\n  color: #333;\n}\nh1 {\n  font-weight: bold;\n  font-size: 24px;\n  line-height: 24px;\n  display: flex;\n  justify-content: space-between;\n}\nh1 a {\n  font-weight: lighter;\n}\na {\n  color: #333;\n}\nlabel {\n  font-size: 14px;\n}\ninput + output {\n  margin-left: 5px;\n}\n[type=checkbox] {\n  display: none;\n}\n[type=checkbox] + label {\n  display: flex;\n  font-weight: bold;\n  color: #dd0;\n  background-color: #8a8a00;\n  height: 21px;\n  line-height: 21px;\n  padding: 0 20px 0 10px;\n  border-radius: 2px;\n  margin-right: 15px;\n  cursor: pointer;\n}\n[type=checkbox] + label::before {\n  content: '\\2713';\n  flex: 1 0 15px;\n  padding-top: 1px;\n  opacity: 0;\n}\n[type=checkbox] + label::after {\n  content: '';\n  flex: 0 0 1px;\n  opacity: 0;\n}\n[type=checkbox]:checked + label {\n  color: whitesmoke;\n}\n[type=checkbox]:checked + label::after,\n[type=checkbox]:checked + label::before {\n  opacity: 1;\n}\n[type=range] {\n  margin: -10px 0 0;\n}\n[type=range] + output {\n  margin: 0 15px 0 10px;\n}\n"; });
define('text!resources/elements/stats.html', ['module'], function(module) { module.exports = "<template>\n    <p>generations: ${generations} | cells: ${cellCount} | ${speed} gen/s</p>\n</template>"; });
define('text!resources/elements/settings.css', ['module'], function(module) { module.exports = "life-rules {\n  display: flex;\n  flex-wrap: wrap;\n}\nlife-rules [type=checkbox] + label {\n  min-width: 30px;\n  padding: 0 10px;\n}\nrow-labels p {\n  text-align: right;\n  padding-right: 20px;\n}\nlife-rule,\nrow-labels p {\n  margin-bottom: 10px;\n}\n.lifeRules {\n  display: flex;\n}\n.lifeRules row-labels {\n  flex: 0 0 100px;\n}\n.lifeRules row-labels p {\n  line-height: 20px;\n  font-size: 14px;\n  letter-spacing: 1px;\n  text-transform: uppercase;\n}\n"; });
define('text!resources/elements/stats.css', ['module'], function(module) { module.exports = ""; });
define('text!resources/elements/story.html', ['module'], function(module) { module.exports = "<template>\n    <h2>Pushing Aurelia JS to speed</h2>\n    <p>Conway's Game Of Life has been a vehicle to learn new things to me for many years; here I&rsquo;m experimenting to see if Aurelia can match a <a href=\"/graylife\"\n           target=\"_blank\">Vanilla js version</a> &mdash; It does. Take look at <a href=\"https://nl.wikipedia.org/wiki/Game_of_Life\"\n           target=\"_blank\">this wikipedia page for a description of GOL</a></p>\n    <p>The modular nature of Aurelia invited me to enhance the UI / layout as well.</p>\n    <h2>Features</h2>\n    <ul>\n        <li>Easy buttons to experiment with the rules</li>\n        <li>Rule presets that sync with your own settings if there&rsquo;s a match</li>\n        <li>Optional &lsquo;trails&rsquo; to smooth things out</li>\n        <li>Slow life with slider or hover over the canvas</li>\n        <li>Grid for drawing life cells more precisely</li>\n        <li>Web-worker for computing of life generations</li>\n        <li>Heavy computing stos automatically when Life get's stable</li>\n    </ul>\n    <p>Don't hesitate to check out my other games and projects at <a href=\"/\"\n           target=\"_blank\">ashWare.nl</a></p>\n</template>"; });
define('text!resources/elements/story.css', ['module'], function(module) { module.exports = "h2 {\n  font-weight: bold;\n  margin: 20px 0 10px;\n}\np {\n  line-height: 20px;\n}\nul {\n  margin: 0 0 20px 20px;\n}\n"; });
define('text!resources/elements/tabs.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/settings\"></require>\n    <require from=\"resources/elements/story\"></require>\n    <tab-buttons>\n        <tab-button repeat.for=\"tab of tabs\"\n                    click.delegate=\"activateTab($index)\"\n                    class.bind=\"tab.active ? 'active' : ''\">${tab.title}</tab-button>\n    </tab-buttons>\n    <tab-contents>\n        <settings if.bind=\"tabs[0].active\"></settings>\n        <story if.bind=\"tabs[1].active\"></story>\n    </tab-contents>\n</template>"; });
define('text!resources/elements/tabs.css', ['module'], function(module) { module.exports = "tabs {\n  display: block;\n}\ntab-buttons {\n  display: flex;\n  margin-bottom: -2px;\n}\ntab-button {\n  padding: 2px 10px 0;\n  border: 2px solid #8a8a00;\n  border-radius: 3px;\n  box-shadow: inset 0 -4px 10px 0 rgba(4, 4, 4, 0.5);\n  transition: all .3s;\n}\ntab-button.active {\n  border-bottom-color: #dd0;\n  box-shadow: none;\n  font-weight: bold;\n}\ntab-button + tab-button {\n  margin-left: 5px;\n}\ntab-contents {\n  display: block;\n  border: 2px solid #8a8a00;\n  border-radius: 0 3px 3px 3px;\n  padding: 20px 10px 10px;\n  transition: all .3s;\n}\n"; });
//# sourceMappingURL=app-bundle.js.map