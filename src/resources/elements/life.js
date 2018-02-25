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
        this.cellSize = 1;
        this.cellsAlive = 0;
        this.fillRatio = 20;
        this.trails = true;
        this.speedHandle = null;
    }

    countGenerations() {
        this.speed = this.lifeSteps - this.prevSteps;
        this.prevSteps = this.lifeSteps;
        this.ea.publish('stats', {
            speed: this.speed,
            stackSize: this.lfWs.stackSize
        });
    }

    clearSpace() {
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // TODO draw on second canvas, then put that on the visible canvas
    drawCells(cells) {
        this.ctxOffscreen.fillStyle = "rgb(128, 128, 0)";
        const count = cells.length;
        let i = 0;
        for (; i < count; i += 1) {
            this.ctxOffscreen.fillRect(cells[i].x * this.cellSize, cells[i].y * this.cellSize, this.cellSize, this.cellSize);
        }
        this.ctx.drawImage(this.offScreenCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
        this.cellsAlive = cells.length;
    }

    fadeCells() {
        let opacity = this.trails * 1 * 0.5;
        this.ctxOffscreen.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
        this.ctxOffscreen.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawFromStack() {
        let cells = this.lfWs.cells;
        if (cells) {
            this.lifeSteps += 1;
            this.fadeCells();
            this.drawCells(cells);
        }
        setTimeout(() => { this.drawFromStack(); });
    }

    initLife() {
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
        this.prevSteps = 0;
        this.lfWs.init(this.spaceWidth, this.spaceHeight, this.liferules, this.cellSize);
        this.drawFromStack();
        this.speedHandle = setInterval(() => { this.countGenerations(); }, 1000);
    }

    addListeners() {
        this.ea.subscribe('startRandom', () => {
            this.initLife();
        });
        this.ea.subscribe('stop', () => {
            this.lfWs.stop();
        });
        this.ea.subscribe('step', () => {
            this.lfWs.getBatch();
        });
    }

    attached() {
        this.addListeners();
    }


}