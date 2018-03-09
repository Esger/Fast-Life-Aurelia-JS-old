import {
    inject
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { LifeWorkerService } from 'resources/services/life-worker-service';

@inject(EventAggregator, LifeWorkerService)
export class LifeCustomElement {

    // TODO try this https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
    constructor(eventAggregator, lifeWorkerService) {
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

    showStats() {
        this.speed = this.lifeSteps - this.prevSteps;
        this.prevSteps = this.lifeSteps;
        this.ea.publish('stats', {
            cellCount: this.cellsAlive,
            generations: this.lifeSteps,
            speed: this.speed * 2
        });
    }

    clearSpace() {
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    get meanOver100Gens() {
        this.cellCounts.push(this.cellsAlive);
        this.cellCounts = this.cellCounts.slice(-100);
        const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
        return average(this.cellCounts);
    }

    get stable() {
        if (Math.abs(this.meanOver100Gens - this.cellsAlive) < 7) {
            this.stableCountDown -= 1;
        } else {
            this.stableCountDown = 20;
        }
        return this.stableCountDown <= 0;
    }

    animateStep() {
        this.drawFromStack();
        if (this.running && !this.stable) {
            setTimeout(() => { this.animateStep(); });
        } else {
            this.stop();
        }
    }

    drawFromStack() {
        let cells = this.lfWs.cells;
        const cellSize = this.cellSize;
        const offScreen = this.ctxOffscreen;
        if (cells) {
            offScreen.fillStyle = "rgba(255, 255, 255, " + this.opacity + ")";
            offScreen.fillRect(0, 0, this.canvas.width, this.canvas.height);

            offScreen.fillStyle = "rgba(128, 128, 0, 1)";
            let i = cells.length - 1;
            while (i >= 0) {
                let cell = cells[i]; i -= 1;
                offScreen.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
            }
            this.ctx.drawImage(this.offScreenCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
            this.cellsAlive = cells.length;
            this.lifeSteps += 1;
        }
    }

    initLife() {
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

        this.liferules = [
            false, false, false, true, false, false, false, false, false, false,
            false, false, true, true, false, false, false, false, false
        ];
        this.lifeSteps = 0; // Number of iterations / steps done
        this.lfWs.init(this.spaceWidth, this.spaceHeight, this.liferules, this.cellSize);
        if (this.speedHandle) {
            clearInterval(this.speedHandle);
        }
        this.speedHandle = setInterval(() => { this.showStats(); }, 500);
    }

    clear() {
        this.running = false;
        this.initLife();
        this.clearSpace();
    }

    stop() {
        this.running = false;
        clearInterval(this.speedHandle);
        setTimeout(this.showStats, 500);
    }

    start() {
        this.running = true;
        this.animateStep();
    }

    addListeners() {
        this.ea.subscribe('clear', () => {
            this.clear();
        });
        this.ea.subscribe('stop', () => {
            this.stop();
        });
        this.ea.subscribe('start', () => {
            this.start();
        });
        this.ea.subscribe('step', () => {
            this.drawFromStack();
        });
        this.ea.subscribe('toggleTrails', () => {
            this.trails = !this.trails;
            this.opacity = 1 - this.trails * 0.9;
        });
        this.ea.subscribe('cellSize', response => {
            this.cellSize = response;
            this.stop();
            this.initLife();
            this.start();
        });
        this.ea.subscribe('lifeRules', response => {
            this.liferules = response;
            this.lfWs.changeRules(this.liferules);
        });
    }

    attached() {
        this.initLife();
        this.addListeners();
    }


}