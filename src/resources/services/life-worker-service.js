import {
    inject,
    bindable
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class LifeWorkerService {

    constructor(eventAggregator) {
        this.ea = eventAggregator;

        this._lifeStack = [];
        this.batchMultiplier = 5;
        this.stackCheckHandle = null;
        this.stackLowCheckHandle = null;
        this.stopHandle = null;
        this.wrkr = new Worker('./assets/life-worker.js');
        this.wrkr.onmessage = (e) => {
            if (e.data) {
                let message = e.data.message;
                switch (message) {
                    case 'newGeneration':
                        // push Generation on stack
                        this._lifeStack.push(e.data.cells);
                        break;
                    case 'ready':
                        this.keepStack();
                        break;
                    case 'stopAck':
                        clearInterval(this.stopHandle);
                        break;
                    default:
                        break;
                }
            }
            // this.ea.publish('newGeneration', e.data);
        };
    }

    get cells() {
        return this._lifeStack.shift();
    }

    get stackSize() {
        return this._lifeStack.length;
    }

    init(w, h, rules, cellSize, cells) {
        this.rules = rules;
        this.cellSize = cellSize;
        this.batchSize = this.batchMultiplier * this.cellSize;
        let workerData = {
            message: 'start',
            w: w,
            h: h,
            rules: rules,
            generations: this.batchSize,
            cells: cells
        };
        this.wrkr.postMessage(workerData);
    }

    keepStack() {
        let minStackSize = this.batchSize;
        this.stackCheckHandle = setInterval(() => {
            if (this.stackSize < this.batchSize) {
                console.log('getBatch');
                this.getBatch();
                clearInterval(this.stackCheckHandle);
            }
        }, 100);
    }

    stop() {
        let workerData = {
            message: 'stop',
        };
        this.stopHandle = setInterval(() => {
            this.wrkr.postMessage(workerData);
        }, 10);
    }

    getBatch(cells) {
        let workerData = {
            message: 'resume',
            rules: this.rules,
            generations: this.batchSize,
            cells: cells
        };
        this.wrkr.postMessage(workerData);
    }

}
