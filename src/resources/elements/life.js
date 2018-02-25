import {
    inject,
    bindable
} from 'aurelia-framework';
// import {
//     EventAggregator
// } from 'aurelia-event-aggregator';

// @inject(EventAggregator)


import { LifeWorkerService } from 'resources/services/life-worker-service';

@inject(LifeWorkerService)
export class LifeCustomElement {

    // TODO try this https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
    constructor(lifeWorkerService) {
        this.lfWs = lifeWorkerService;
        this.cellSize = 1;
        this.cellsAlive = 0;
        this.fillRatio = 20;
        this.trails = true;
    }

    calcSpeed() {
        this.speed = this.lifeSteps - this.prevSteps;
        this.prevSteps = this.lifeSteps;
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
            this.fadeCells();
            this.drawCells(cells);
        }
        requestAnimationFrame(() => { this.drawFromStack(); });
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
        let generations = 500;
        this.lfWs.init(this.spaceWidth, this.spaceHeight, this.liferules, generations);
        requestAnimationFrame(() => { this.drawFromStack(); });
    }

    attached() {
        // this.initLife();
    }


}