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
        this.fillRatio = 20;
        this.trails = true;
        this.speedHandle = null;
        this.opacity = this.trails * 1 * 0.5;
    }

    countGenerations() {
        this.speed = this.lifeSteps - this.prevSteps;
        this.prevSteps = this.lifeSteps;
        this.ea.publish('stats', {
            cellCount: this.cellsAlive,
            generations: this.lifeSteps,
            speed: this.speed * 2,
            stackSize: this.lfWs.stackSize
        });
    }

    clearSpace() {
        this.ctx.fillStyle = "rgb(255, 255, 255)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
        setTimeout(() => { this.drawFromStack(); }, 0);
    }

    initLife() {
        this.opacity = this.trails * 1 * 0.2;
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
            false, false, false, true, false, false, false, false, false,
            false, false, true, true, false, false, false, false, false
        ];
        this.changeIndicators = [3, 10, 11, 14, 16, 17, 18];
        this.lifeSteps = 0; // Number of iterations / steps done
        this.prevSteps = 0;
        this.lfWs.init(this.spaceWidth, this.spaceHeight, this.liferules, this.cellSize);
        this.drawFromStack();
        this.speedHandle = setInterval(() => { this.countGenerations(); }, 500);
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
        this.ea.subscribe('toggleTrails', () => {
            this.trails = !this.trails;
        });
    }

    attached() {
        this.addListeners();
    }


}