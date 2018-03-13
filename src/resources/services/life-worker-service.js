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

        this.emptyStack = [[], [], [], [], [], [], [], [], [], []];
        this._roundStack = this.emptyStack.slice();
        this.fillSlotPointer = 0;
        this.maxIndex = 9;
        this.started = false;
    }

    get cells() {
        let pointer = this.getSlotPointer;
        this.getSlotPointer = (this.getSlotPointer + 1) % this._roundStack.length;
        if (this.started) {
            let emptySlotPointer = (pointer == 0) ? this.maxIndex : pointer - 1;
            setTimeout(() => { this.getBatch(); });
        }
        this.started = true;
        return this._roundStack[pointer];
    }

    get stackSize() {
        return this._roundStack.length;
    }

    init(w, h, liferules) {
        if (this.wrkr) {
            this.wrkr.terminate();
        }
        this.wrkr = new Worker('./assets/life-worker.js');
        this.fillSlotPointer = 0;
        this.wrkr.onmessage = (e) => {
            if (e.data && e.data.message == 'newGeneration') {
                this._roundStack[this.fillSlotPointer] = e.data.cells;
                this.fillSlotPointer = (this.fillSlotPointer + 1) % this._roundStack.length;
            }
        };
        this._roundStack = this.emptyStack.slice();
        let workerData = {
            message: 'initialize',
            w: w,
            h: h,
            liferules: liferules
        };
        this.wrkr.postMessage(workerData);
        this.getSlotPointer = 0;
        this._roundStack.forEach(slot => {
            this.wrkr.postMessage({ message: 'resume' });
        });
    }

    changeRules(rules) {
        let workerData = {
            message: 'rules',
            rules: rules
        };
        this.wrkr.postMessage(workerData);
    }

    getBatch(cells) {
        let workerData = {
            message: 'resume'
        };
        this.wrkr.postMessage(workerData);
    }

}
