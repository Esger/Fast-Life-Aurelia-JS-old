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

        this._emptyStack = [[], [], [], [], [], [], [], [], [], []];
        this._roundStack = this._emptyStack.slice();
        this._fillSlotIndex = 0;
        this._getSlotIndex = 0;
        this._maxIndex = 9;
        this._stackReady = false;
    }

    get cells() {
        this.fillStack();
        let i = this._getSlotIndex;
        this._getSlotIndex = (this._getSlotIndex + 1) % this._roundStack.length;
        setTimeout(() => { this.getGeneration(); });
        return this._roundStack[i];
    }

    init(w, h, liferules) {
        this.wrkr = new Worker('./assets/life-worker.js');
        this._fillSlotIndex = 0;
        this.wrkr.onmessage = (e) => {
            // receive cells array and store it in the stack at the previous generation
            if (e.data && e.data.cells.length) {
                this._roundStack[this._fillSlotIndex] = e.data.cells;
                this._fillSlotIndex = (this._fillSlotIndex + 1) % this._roundStack.length;
                this.ea.publish('dataReady');
            }
        };
        this._roundStack = this._emptyStack.slice();
        let workerData = {
            message: 'initialize',
            w: w,
            h: h,
            liferules: liferules
        };
        this.wrkr.postMessage(workerData);
        this._getSlotIndex = 0;
        this.fillStack();
    }

    fillStack() {
        if (!this._stackReady) {
            for (let i = 0; i < this._roundStack.length - 2; i++) {
                this.getGeneration();
            }
            this._stackReady = true;
        }
    }

    stop() {
        this._stackReady = false;
        let cells = this._roundStack[this._getSlotIndex];
        let workerData = {
            message: 'setCells',
            cells: cells
        };
        this.wrkr.postMessage(workerData);
    }

    clear() {
        let workerData = {
            message: 'clear',
        };
        this.wrkr.postMessage(workerData);
    }

    changeRules(rules) {
        let workerData = {
            message: 'rules',
            rules: rules
        };
        this.wrkr.postMessage(workerData);
    }

    addCell(xy) {
        let workerData = {
            message: 'addCell',
            cell: xy
        };
        this.wrkr.postMessage(workerData);
    }

    getGeneration() {
        let workerData = {
            message: 'resume'
        };
        this.wrkr.postMessage(workerData);
    }

}
