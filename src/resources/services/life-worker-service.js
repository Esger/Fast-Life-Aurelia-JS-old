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
        this.wrkr = new Worker('./assets/life-worker.js');
        this.wrkr.onmessage = (e) => {
            // push Generation on stack
            if (e.data && e.data.cells) {
                this._lifeStack.push(e.data.cells);
            }
            // this.ea.publish('newGeneration', e.data);
        };
    }

    get cells() {
        return this._lifeStack.shift();
    }

    init(w, h, rules, cells) {
        let workerData = {
            message: 'start',
            w: w,
            h: h,
            rules: rules,
            cells: cells
        };
        this.wrkr.postMessage(workerData);
    }

    // getDirection(player, targetPositions) {
    //     this.mzWrkr.postMessage({
    //         message: 'getDirection',
    //         player: player,
    //         targetPositions: targetPositions
    //     });
    // }

}
