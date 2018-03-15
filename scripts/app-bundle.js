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
                    offScreen.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
                }

                this.ctx.drawImage(this.offScreenCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
                this.cellsAlive = cells.length;
                this.lifeSteps += 1;
            }
        };

        LifeCustomElement.prototype.addCell = function addCell(event) {
            var mouseX = event.offsetX ? event.offsetX : event.pageX - this.offsetLeft;
            var realX = Math.floor(mouseX / this.cellSize);
            var mouseY = event.offsetY ? event.offsetY : event.pageY - this.offsetTop;
            var realY = Math.floor(mouseY / this.cellSize);
            console.log(realX, realY);
        };

        LifeCustomElement.prototype.drawgrid = function drawgrid(onScreen) {
            var offScreen = this.ctxOffscreen;
            var cellSize = Math.max(this.cellSize, 4);
            offScreen.lineWidth = 1;
            offScreen.strokeStyle = "#f2f2f2";
            var xy = cellSize;
            for (; xy < this.canvas.width; xy += cellSize) {
                offScreen.beginPath();
                offScreen.moveTo(0, xy - 0.5);
                offScreen.lineTo(this.canvas.width, xy - 0.5);
                offScreen.stroke();
                offScreen.closePath();

                offScreen.beginPath();
                offScreen.moveTo(xy - 0.5, 0);
                offScreen.lineTo(xy - 0.5, this.canvas.height);
                offScreen.stroke();
                offScreen.closePath();
            }
            if (onScreen) {
                this.ctx.drawImage(this.offScreenCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
            }
        };

        LifeCustomElement.prototype.initLife = function initLife() {
            var _this2 = this;

            this.opacity = 1 - this.trails * 0.9;
            this.canvas = document.getElementById('life');
            this.ctx = this.canvas.getContext('2d');
            this.canvasWidth = this.canvas.width;
            this.canvasHeight = this.canvas.height;
            this.spaceWidth = Math.floor(this.canvasWidth / this.cellSize);
            this.spaceHeight = Math.floor(this.canvasHeight / this.cellSize);

            this.offScreenCanvas = document.createElement('canvas');
            this.offScreenCanvas.width = this.canvasWidth;
            this.offScreenCanvas.height = this.canvasHeight;
            this.ctxOffscreen = this.offScreenCanvas.getContext('2d');
            this.lifeSteps = 0;
            this.prevSteps = 0;
            this.lfWs.init(this.spaceWidth, this.spaceHeight, this.liferules);
            this.stop();
            this.statusUpdateHandle = setInterval(function () {
                _this2.showStats();
            }, 500);
        };

        LifeCustomElement.prototype.slowDown = function slowDown() {
            this.speedInterval = 500;
        };

        LifeCustomElement.prototype.fullSpeed = function fullSpeed() {
            this.speedInterval = 0;
        };

        LifeCustomElement.prototype.clear = function clear() {
            this.running = false;
            this.stop();
            this.initLife();
            this.clearSpace();
        };

        LifeCustomElement.prototype.stop = function stop() {
            this.running = false;
            if (this.statusUpdateHandle) {
                clearInterval(this.statusUpdateHandle);
                this.statusUpdateHandle = null;
            }
        };

        LifeCustomElement.prototype.start = function start() {
            this.running = true;
            this.animateStep();
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
                _this3.initLife();
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
            this.stackSize = 0;
            this.cellCount = 0;
            this.generations = 0;
        }

        StatsCustomElement.prototype.addListeners = function addListeners() {
            var _this = this;

            this.ea.subscribe('stats', function (response) {
                _this.cellCount = response.cellCount;
                _this.generations = response.generations;
                _this.speed = response.speed;
                _this.stackSize = response.stackSize;
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

            this.emptyStack = [[], [], [], [], [], [], [], [], [], []];
            this._roundStack = this.emptyStack.slice();
            this.fillSlotPointer = 0;
            this.maxIndex = 9;
            this.started = false;
        }

        LifeWorkerService.prototype.init = function init(w, h, liferules) {
            var _this = this;

            if (this.wrkr) {
                this.wrkr.terminate();
            }
            this.wrkr = new Worker('./assets/life-worker.js');
            this.fillSlotPointer = 0;
            this.wrkr.onmessage = function (e) {
                if (e.data && e.data.message == 'newGeneration') {
                    _this._roundStack[_this.fillSlotPointer] = e.data.cells;
                    _this.fillSlotPointer = (_this.fillSlotPointer + 1) % _this._roundStack.length;
                }
            };
            this._roundStack = this.emptyStack.slice();
            var workerData = {
                message: 'initialize',
                w: w,
                h: h,
                liferules: liferules
            };
            this.wrkr.postMessage(workerData);
            this.getSlotPointer = 0;
            this._roundStack.forEach(function (slot) {
                _this.wrkr.postMessage({ message: 'resume' });
            });
        };

        LifeWorkerService.prototype.changeRules = function changeRules(rules) {
            var workerData = {
                message: 'rules',
                rules: rules
            };
            this.wrkr.postMessage(workerData);
        };

        LifeWorkerService.prototype.getBatch = function getBatch(cells) {
            var workerData = {
                message: 'resume'
            };
            this.wrkr.postMessage(workerData);
        };

        _createClass(LifeWorkerService, [{
            key: 'cells',
            get: function get() {
                var _this2 = this;

                var pointer = this.getSlotPointer;
                this.getSlotPointer = (this.getSlotPointer + 1) % this._roundStack.length;
                if (this.started) {
                    var emptySlotPointer = pointer == 0 ? this.maxIndex : pointer - 1;
                    setTimeout(function () {
                        _this2.getBatch();
                    });
                }
                this.started = true;
                return this._roundStack[pointer];
            }
        }, {
            key: 'stackSize',
            get: function get() {
                return this._roundStack.length;
            }
        }]);

        return LifeWorkerService;
    }()) || _class);
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/main\"></require>\n    <main></main>\n</template>"; });
define('text!resources/elements/controls.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/stats\"></require>\n    <life-controls>\n        <a href=\"#\"\n           class=\"clearbutton\"\n           class.bind=\"clearPulsor ? 'pulsor' : ''\"\n           title=\"Clear\"\n           click.delegate=\"clear()\"></a>\n        <a href=\"#\"\n           class=\"stopbutton\"\n           title=\"Stop\"\n           click.delegate=\"stop()\"></a>\n        <a href=\"#\"\n           class=\"stepbutton\"\n           title=\"Step\"\n           click.delegate=\"step()\"></a>\n        <a href=\"#\"\n           class=\"startbutton\"\n           class.bind=\"startPulsor ? 'pulsor' : ''\"\n           title=\"Start\"\n           click.delegate=\"start()\"></a>\n    </life-controls>\n    <stats></stats>\n</template>"; });
define('text!resources/elements/life.html', ['module'], function(module) { module.exports = "<template>\n    <canvas id=\"life\"\n            width=\"750\"\n            height=\"464\"\n            click.delegate=\"addCell($event)\"\n            mouseenter.trigger=\"slowDown()\"\n            mouseleave.trigger=\"fullSpeed()\">\n    </canvas>\n</template>"; });
define('text!resources/elements/main.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/life\"></require>\n    <require from=\"resources/elements/controls\"></require>\n    <require from=\"resources/elements/tabs\"></require>\n    <h1>Fast Life | AureliaJS<a href=\"/\">ashWare</a></h1>\n    <life></life>\n    <controls></controls>\n    <tabs></tabs>\n</template>"; });
define('text!resources/elements/settings.html', ['module'], function(module) { module.exports = "<template>\n\n    <tab-content class=\"lifeRules\">\n        <row-labels>\n            <p title=\"Preset life rules\">Presets</p>\n        </row-labels>\n        <life-rules>\n            <select change.delegate=\"setPreset()\"\n                    value.bind=\"selectedPreset\"> \n                <option repeat.for=\"preset of presets\"  \n                    model.bind=\"$index\" \n                    innerhtml.one-time=\"preset.name\"> \n                </option> \n            </select>\n        </life-rules>\n    </tab-content>\n\n    <tab-content class=\"lifeRules\">\n        <row-labels>\n            <p title=\"Neighbour count to stay alive\">New</p>\n            <p title=\"Neighbour count to come alive\">Stay</p>\n        </row-labels>\n        <life-rules>\n            <life-rule repeat.for=\"rule of liferules\"\n                       if.bind=\"$index !== 9\">\n                <input type=\"checkbox\"\n                       checked.bind=\"rule\"\n                       id.one-time=\"'rule_'+$index\"\n                       change.delegate=\"setRules($index)\">\n                <label for.one-time=\"'rule_'+$index\">${$index % 10}</label>\n            </life-rule>\n        </life-rules>\n    </tab-content>\n\n    <tab-content class=\"lifeRules\">\n        <row-labels>\n            <p title=\"Change cell size and toggle trails\">Cell size</p>\n        </row-labels>\n        <life-rules>\n            <input type=\"range\"\n                   title=\"cell size ${cellSize}\"\n                   min.one-time=\"minCellSize\"\n                   max.one-time=\"maxCellSize\"\n                   value.bind=\"cellSizeExp\"\n                   change.delegate=\"setCellSize()\"\n                   focus.delegate=\"stop()\">\n            <output value.bind=\"cellSize\"></output>\n            <input id=\"trails\"\n                   type=\"checkbox\"\n                   checked.bind=\"trails\"\n                   change.delegate=\"toggleTrails()\" />\n            <label for=\"trails\"> Trails</label>\n            <input id=\"grid\"\n                   type=\"checkbox\"\n                   checked.bind=\"grid\"\n                   change.delegate=\"toggleGrid()\" />\n            <label for=\"grid\"> Grid</label>\n\n        </life-rules>\n    </tab-content>\n\n</template>"; });
define('text!resources/elements/stats.html', ['module'], function(module) { module.exports = "<template>\n    <p>generations: ${generations} | cells: ${cellCount} | ${speed} gen/s</p>\n</template>"; });
define('text!resources/elements/story.html', ['module'], function(module) { module.exports = "<template>\n    <h2>Pushing Aurelia JS to speed</h2>\n    <p>Conway's Game Of Life has been a vehicle to learn new things to me for many years; here I&rsquo;m experimenting to see if Aurelia can match a <a href=\"/graylife\"\n           target=\"_blank\">Vanilla js version</a> &mdash; It does. Take look at <a href=\"https://nl.wikipedia.org/wiki/Game_of_Life\"\n           target=\"_blank\">this wikipedia page for a description of GOL</a></p>\n    <p>The modular nature of Aurelia invited me to enhance the UI / layout as well.</p>\n    <h2>Features</h2>\n    <ul>\n        <li>Easy buttons to experiment with the rules</li>\n        <li>Rule presets that sync with your own settings if there&rsquo;s a match</li>\n        <li>Optional &lsquo;trails&rsquo; to smooth things out</li>\n        <li>Slow life when hovering over the canvas</li>\n        <li>Web-worker for computing of life generations</li>\n        <li>Heavy computing stos automatically when Life get's stable</li>\n    </ul>\n    <p>Don't hesitate to check out my other games and projects at <a href=\"/\"\n           target=\"_blank\">ashWare.nl</a></p>\n</template>"; });
define('text!resources/elements/tabs.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/settings\"></require>\n    <require from=\"resources/elements/story\"></require>\n    <tab-buttons>\n        <tab-button repeat.for=\"tab of tabs\"\n                    click.delegate=\"activateTab($index)\"\n                    class.bind=\"tab.active ? 'active' : ''\">${tab.title}</tab-button>\n    </tab-buttons>\n    <tab-contents>\n        <settings if.bind=\"tabs[0].active\"></settings>\n        <story if.bind=\"tabs[1].active\"></story>\n    </tab-contents>\n</template>"; });
//# sourceMappingURL=app-bundle.js.map