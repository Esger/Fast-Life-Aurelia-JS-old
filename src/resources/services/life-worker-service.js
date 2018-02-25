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
        this.stackCheckHandle = null;
        this.stackLowCheckHandle = null;
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
        let workerData = {
            message: 'start',
            w: w,
            h: h,
            rules: rules,
            generations: 5 * this.cellSize,
            cells: cells
        };
        this.wrkr.postMessage(workerData);
    }

    keepStack() {
        let minStackSize = 5 * this.cellSize;
        this.stackCheckHandle = setInterval(() => {
            if (this._lifeStack.length < minStackSize) {
                console.log('getBatch');
                this.getBatch();
                clearInterval(this.stackCheckHandle);
            }
        });
    }

    stop() {
        let workerData = {
            message: 'stop',
        };
        this.wrkr.postMessage(workerData);
    }

    getBatch(cells) {
        let workerData = {
            message: 'resume',
            rules: this.rules,
            generations: 5 * this.cellSize,
            cells: cells
        };
        this.wrkr.postMessage(workerData);
    }

}
