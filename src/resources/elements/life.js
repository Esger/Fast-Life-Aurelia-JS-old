import {
    inject
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';
import { LifeWorkerService } from 'resources/services/life-worker-service';

@inject(EventAggregator, LifeWorkerService)
export class LifeCustomElement {

    statusUpdateHandle = null;

    // TODO try this https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
    constructor(eventAggregator, lifeWorkerService) {
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

    showStats() {
        let speed = this.lifeSteps - this.prevSteps;
        this.prevSteps = this.lifeSteps;
        this.ea.publish('stats', {
            cellCount: this.cellsAlive,
            generations: this.lifeSteps,
            speed: speed * 2
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
        this.drawCells();
        if (this.running && !this.stable) {
            setTimeout(() => { this.animateStep(); }, this.speedInterval);
        } else {
            this.stop();
        }
    }

    drawCells() {
        let cells = this.lfWs.cells;
        const cellSize = this.cellSize;
        const offScreen = this.ctxOffscreen;
        if (cells) {
            offScreen.fillStyle = "rgba(255, 255, 255, " + this.opacity + ")";
            offScreen.fillRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.grid) {
                this.drawgrid();
            }

            offScreen.fillStyle = "rgba(128, 128, 0, 1)";
            let i = cells.length - 1;
            while (i >= 0) {
                let cell = cells[i]; i -= 1;
                offScreen.fillRect(cell[0] * cellSize, cell[1] * cellSize, cellSize, cellSize);
            }

            this.ctx.drawImage(this.offScreenCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
            this.cellsAlive = cells.length;
            this.lifeSteps += 1;
        }
    }

    addCell(event) {
        let mouseX = (event.offsetX) ? event.offsetX : (event.pageX - this.offsetLeft);
        let realX = Math.floor(mouseX / this.cellSize);
        let mouseY = (event.offsetY) ? event.offsetY : (event.pageY - this.offsetTop);
        let realY = Math.floor(mouseY / this.cellSize);
        this.ctx.fillStyle = "#d4d4d4";
        this.ctx.fillRect(realX * this.cellSize, realY * this.cellSize, this.cellSize, this.cellSize);
        this.lfWs.addCell([realX, realY]);
        console.log(realX, realY);
    }

    drawgrid(onScreen) {
        const offScreen = this.ctxOffscreen;
        const cellSize = Math.max(this.cellSize, 4);
        const margin = 4;
        const maxX = this.canvas.width - cellSize;
        const maxY = this.canvas.height - cellSize;
        const step = cellSize * 2;
        offScreen.fillStyle = "rgba(128, 128, 128, 0.1)";
        let y = margin;
        let oddStep = 0;
        for (; y < maxY; y += cellSize) {
            let x = margin + oddStep;
            oddStep = (oddStep + cellSize) % step;
            for (; x < maxX; x += step) {
                offScreen.fillRect(x, y, cellSize, cellSize);
            }
        }
        if (onScreen) {
            this.ctx.drawImage(this.offScreenCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
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
        this.lifeSteps = 0; // Number of iterations / steps done
        this.prevSteps = 0;
        this.lfWs.init(this.spaceWidth, this.spaceHeight, this.liferules);
        this.stop();
        this.statusUpdateHandle = setInterval(() => { this.showStats(); }, 500);
    }

    slowDown() {
        this.speedInterval = 500;
    }

    fullSpeed() {
        this.speedInterval = 0;
    }

    clear() {
        this.running = false;
        this.stop();
        this.initLife();
        this.clearSpace();
    }

    stop() {
        this.running = false;
        if (this.statusUpdateHandle) {
            clearInterval(this.statusUpdateHandle);
            this.statusUpdateHandle = null;
        }
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
            this.drawCells();
        });
        this.ea.subscribe('timeoutInterval', response => {
            this.speedInterval = response;
        });
        this.ea.subscribeOnce('dataReady', () => {
            this.drawCells();
        });
        this.ea.subscribe('toggleTrails', () => {
            this.trails = !this.trails;
            this.opacity = 1 - this.trails * 0.9;
        });
        this.ea.subscribe('toggleGrid', () => {
            this.grid = !this.grid;
            if (this.grid) {
                this.drawgrid(true);
            }
        });
        this.ea.subscribe('cellSize', response => {
            this.cellSize = response;
            this.initLife();
        });
        this.ea.subscribe('lifeRules', response => {
            this.liferules = response.liferules;
            if (response.init) {
                this.initLife();
            } else {
                this.lfWs.changeRules(this.liferules);
            }
        });
    }

    attached() {
        this.addListeners();
    }


}