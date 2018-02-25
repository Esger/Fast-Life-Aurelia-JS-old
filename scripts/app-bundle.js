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
define('resources/elements/life',['exports', 'aurelia-framework', 'resources/services/life-worker-service'], function (exports, _aureliaFramework, _lifeWorkerService) {
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

    var _dec, _class;

    var LifeCustomElement = exports.LifeCustomElement = (_dec = (0, _aureliaFramework.inject)(_lifeWorkerService.LifeWorkerService), _dec(_class = function () {
        function LifeCustomElement(lifeWorkerService) {
            _classCallCheck(this, LifeCustomElement);

            this.lfWs = lifeWorkerService;
            this.cellSize = 2;
            this.cellsAlive = 0;
            this.fillRatio = 20;
            this.trails = true;
        }

        LifeCustomElement.prototype.calcSpeed = function calcSpeed() {
            this.speed = this.lifeSteps - this.prevSteps;
            this.prevSteps = this.lifeSteps;
        };

        LifeCustomElement.prototype.clearSpace = function clearSpace() {
            this.ctx.fillStyle = "rgb(255, 255, 255)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };

        LifeCustomElement.prototype.drawCells = function drawCells(cells) {
            this.ctx.fillStyle = "rgb(128, 128, 0)";
            var count = cells.length;
            var i = 0;
            for (; i < count; i += 1) {
                this.ctx.fillRect(cells[i].x * this.cellSize, cells[i].y * this.cellSize, this.cellSize, this.cellSize);
            }
            this.cellsAlive = cells.length;
        };

        LifeCustomElement.prototype.fadeCells = function fadeCells() {
            var opacity = this.trails * 1 * 0.5;
            this.ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };

        LifeCustomElement.prototype.drawFromStack = function drawFromStack() {
            var _this = this;

            var cells = this.lfWs.cells;
            if (cells) {
                this.fadeCells();
                this.drawCells(cells);
            }
            requestAnimationFrame(function () {
                _this.drawFromStack();
            });
        };

        LifeCustomElement.prototype.initLife = function initLife() {
            var _this2 = this;

            this.canvas = document.getElementById('life');
            this.ctx = this.canvas.getContext('2d');
            this.canvasWidth = this.canvas.width;
            this.canvasHeight = this.canvas.height;
            this.spaceWidth = Math.floor(this.canvasWidth / this.cellSize);
            this.spaceHeight = Math.floor(this.canvasHeight / this.cellSize);
            this.liferules = [false, false, false, true, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false];
            this.lifeSteps = 0;
            this.prevSteps = 0;
            this.lfWs.init(this.spaceWidth, this.spaceHeight, this.liferules);
            requestAnimationFrame(function () {
                _this2.drawFromStack();
            });
        };

        LifeCustomElement.prototype.attached = function attached() {
            this.initLife();
        };

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

            this._lifeStack = [];
            this.wrkr = new Worker('./assets/life-worker.js');
            this.wrkr.onmessage = function (e) {
                if (e.data && e.data.cells) {
                    _this._lifeStack.push(e.data.cells);
                }
            };
        }

        LifeWorkerService.prototype.init = function init(w, h, rules, cells) {
            var workerData = {
                message: 'start',
                w: w,
                h: h,
                rules: rules,
                cells: cells
            };
            this.wrkr.postMessage(workerData);
        };

        _createClass(LifeWorkerService, [{
            key: 'cells',
            get: function get() {
                return this._lifeStack.shift();
            }
        }]);

        return LifeWorkerService;
    }()) || _class);
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/main\"></require>\n    <main></main>\n</template>"; });
define('text!resources/elements/life.html', ['module'], function(module) { module.exports = "<template>\n    <canvas id=\"life\"\n            width=\"750\"\n            height=\"464\">\n    </canvas>\n</template>"; });
define('text!resources/elements/main.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"resources/elements/life\"></require>\n    <h1>Fast Life</h1>\n    <life></life>\n</template>"; });
//# sourceMappingURL=app-bundle.js.map