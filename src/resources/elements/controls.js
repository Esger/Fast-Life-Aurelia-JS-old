import {
    inject
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class ControlsCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.trails = true;
        this.pulsor = true;
        this.cellSizeExp = 1;
        this.minCellSize = 0;
        this.maxCellSize = 5;
    }

    get cellSize() {
        return Math.pow(2, this.cellSizeExp);
    }

    clear() {
        this.ea.publish('clear');
    }
    stop() {
        this.ea.publish('stop');
    }
    step() {
        this.ea.publish('step');
        this.pulsor = false;
    }
    start() {
        this.ea.publish('start');
        this.pulsor = false;
    }
    toggleTrails() {
        this.ea.publish('toggleTrails', this.trails);
    }
    setCellSize() {
        this.ea.publish('cellSize', this.cellSize);
    }

}