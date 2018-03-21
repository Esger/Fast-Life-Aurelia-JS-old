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

        this._emptyBuffer = [[], []];
        this._fillSlotIndex = 0;
        this._getSlotIndex = 0;
        this._maxIndex = 9;
    }

    get cells() {
        let i = this._getSlotIndex;
        this._getSlotIndex = 1 - this._getSlotIndex;
        this.getGeneration(); // send request for new generation
        return this._buffer[i];
    }

    emptyBuffer() {
        this._buffer = this._emptyBuffer.slice();
        this._fillSlotIndex = 0;
        this._getSlotIndex = 0;
    }

    init(w, h, liferules) {
        this.wrkr = new Worker('./assets/life-worker.js');
        this._fillSlotIndex = 0;
        this.emptyBuffer();
        this.wrkr.onmessage = (e) => {
            // receive cells array and store it in the stack at the previous generation
            if (e.data && e.data.cells.length) {
                this._buffer[this._fillSlotIndex] = e.data.cells;
                this._fillSlotIndex = 1 - this._fillSlotIndex;
                this.ea.publish('dataReady');
            }
        };
        this._buffer = this._emptyBuffer.slice();
        let workerData = {
            message: 'initialize',
            w: w,
            h: h,
            liferules: liferules
        };
        this.wrkr.postMessage(workerData);
        this._getSlotIndex = 0;
        this.getGeneration();
    }

    resize(w, h) {
        let inArea = cell => {
            return (cell[0] <= w) && (cell[1] <= h);
        };
        this._buffer[0] = this._buffer[0].filter(inArea);
        this._buffer[1] = this._buffer[1].filter(inArea);
        let workerData = {
            message: 'setSize',
            w: w,
            h: h
        };
        this.wrkr.postMessage(workerData);
    }

    clear() {
        this.emptyBuffer();
        let workerData = {
            message: 'clear',
        };
        this.wrkr.postMessage(workerData);
    }

    fillRandom() {
        this.clear();
        let workerData = {
            message: 'fillRandom',
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
        let cells = this._buffer[this._getSlotIndex];
        let workerData = {
            message: 'setCells',
            cells: cells
        };
        this.wrkr.postMessage(workerData);
        if (xy) {
            workerData = {
                message: 'addCell',
                cell: xy
            };
            this.wrkr.postMessage(workerData);
        }
    }

    getGeneration() {
        let workerData = {
            message: 'resume'
        };
        this.wrkr.postMessage(workerData);
    }

}
