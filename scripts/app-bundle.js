define('app',['exports'], function (exports) {
  'use strict';

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

    this.message = 'Hello World!';
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
            this.trails = true;
        }

        ControlsCustomElement.prototype.clear = function clear() {
            this.ea.publish('clear');
        };

        ControlsCustomElement.prototype.stop = function stop() {
            this.ea.publish('stop');
        };

        ControlsCustomElement.prototype.step = function step() {
            this.ea.publish('step');
        };

        ControlsCustomElement.prototype.start = function start() {
            this.ea.publish('start');
        };

        ControlsCustomElement.prototype.toggleTrails = function toggleTrails() {
            this.ea.publish('toggleTrails', this.trails);
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

            this.ea = eventAggregator;
            this.lfWs = lifeWorkerService;
            this.cellSize = 2;
            this.cellsAlive = 0;
            this.trails = true;
            this.speedHandle = null;
            this.running = false;
            this.opacity = 1 - this.trails * 0.9;
            this.cellCounts = [];
            this.lastMean = 0;
            this.stableCountDown = 20;
        }

        LifeCustomElement.prototype.countGenerations = function countGenerations() {
            this.speed = this.lifeSteps - this.prevSteps;
            this.prevSteps = this.lifeSteps;
            this.ea.publish('stats', {
                cellCount: this.cellsAlive,
                generations: this.lifeSteps,
                speed: this.speed * 2,
                stackSize: this.lfWs.stackSize
            });
        };

        LifeCustomElement.prototype.clearSpace = function clearSpace() {
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };

        LifeCustomElement.prototype.animateStep = function animateStep() {
            var _this = this;

            this.drawFromStack();
            if (this.running && !this.stable) {
                setTimeout(function () {
                    _this.animateStep();
                });
            }
        };

        LifeCustomElement.prototype.drawFromStack = function drawFromStack() {
            var cells = this.lfWs.cells;
            var cellSize = this.cellSize;
            var offScreen = this.ctxOffscreen;
            if (cells) {
                offScreen.fillStyle = "rgba(255, 255, 255, " + this.opacity + ")";
                offScreen.fillRect(0, 0, this.canvas.width, this.canvas.height);

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

            this.liferules = [false, false, false, true, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false];
            this.lifeSteps = 0;
            this.prevSteps = 0;
            this.lfWs.init(this.spaceWidth, this.spaceHeight, this.liferules, this.cellSize);
            clearInterval(this.speedHandle);
            this.speedHandle = setInterval(function () {
                _this2.countGenerations();
            }, 500);
        };

        LifeCustomElement.prototype.addListeners = function addListeners() {
            var _this3 = this;

            this.ea.subscribe('clear', function () {
                _this3.running = false;
                _this3.initLife();
                _this3.clearSpace();
            });
            this.ea.subscribe('stop', function () {
                _this3.running = false;
            });
            this.ea.subscribe('start', function () {
                _this3.running = true;
                _this3.animateStep();
            });
            this.ea.subscribe('step', function () {
                _this3.drawFromStack();
            });
            this.ea.subscribe('toggleTrails', function () {
                _this3.trails = !_this3.trails;
                _this3.opacity = 1 - _this3.trails * 0.9;
            });
        };

        LifeCustomElement.prototype.attached = function attached() {
            this.initLife();
            this.addListeners();
        };

        _createClass(LifeCustomElement, [{
            key: 'meanOver20Gens',
            get: function get() {
                this.cellCounts.push(this.cellsAlive);
                this.cellCounts = this.cellCounts.slice(-10);
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
                if (Math.abs(this.meanOver20Gens - this.cellsAlive) < 7) {
                    this.stableCountDown -= 1;
                } else {
                    this.stableCountDown = 20;
                }
                return this.stableCountDown == 0;
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
            var _this = this;

            _classCallCheck(this, LifeWorkerService);

            this.ea = eventAggregator;

            this._roundStack = [[], [], [], [], [], [], [], [], [], []];
            this.fillSlotPointer = 0;
            this.maxIndex = 9;
            this.started = false;
            this.wrkr = new Worker('./assets/life-worker.js');
            this.wrkr.onmessage = function (e) {
                if (e.data && e.data.message == 'newGeneration') {
                    _this._roundStack[_this.fillSlotPointer] = e.data.cells;
                    _this.fillSlotPointer = (_this.fillSlotPointer + 1) % _this._roundStack.length;
                }
            };
        }

        LifeWorkerService.prototype.init = function init(w, h, rules, cellSize, cells) {
            this.rules = rules;
            this.cellSize = cellSize;
            var workerData = {
                message: 'start',
                w: w,
                h: h,
                rules: rules,
                generations: this._roundStack.length - 1,
                cells: cells
            };
            this.getSlotPointer = 0;
            this.wrkr.postMessage(workerData);
        };

        LifeWorkerService.prototype.getBatch = function getBatch(cells) {
            var workerData = {
                message: 'resume',
                rules: this.rules,
                generations: 1,
                cells: cells
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
define('text!resources/elements/controls.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/stats\"></require>\n    <life-controls>\n        <a href=\"#\"\n           class=\"clearbutton\"\n           title=\"Clear\"\n           click.delegate=\"clear()\"></a>\n        <a href=\"#\"\n           class=\"stopbutton\"\n           title=\"Stop\"\n           click.delegate=\"stop()\"></a>\n        <a href=\"#\"\n           class=\"stepbutton\"\n           title=\"Step\"\n           click.delegate=\"step()\"></a>\n        <a href=\"#\"\n           class=\"startbutton\"\n           title=\"Start\"\n           click.delegate=\"start()\"></a>\n        <input class=\"trails\"\n               id=\"trails\"\n               type=\"checkbox\"\n               checked.bind=\"trails\"\n               change.delegate=\"toggleTrails()\" />\n        <label for=\"trails\"> Trails</label>\n    </life-controls>\n    <stats></stats>\n</template>"; });
define('text!resources/elements/life.html', ['module'], function(module) { module.exports = "<template>\n    <canvas id=\"life\"\n            width=\"750\"\n            height=\"464\">\n    </canvas>\n</template>"; });
define('text!resources/elements/main.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/life\"></require>\n    <require from=\"resources/elements/controls\"></require>\n    <h1>Fast Life | AureliaJS | by <a href=\"/\">ashWare</a></h1>\n    <life></life>\n    <controls></controls>\n</template>"; });
define('text!resources/elements/stats.html', ['module'], function(module) { module.exports = "<template>\n    <p>generations: ${generations} | cells: ${cellCount} | ${speed} gen/s</p>\n</template>"; });
//# sourceMappingURL=app-bundle.js.map