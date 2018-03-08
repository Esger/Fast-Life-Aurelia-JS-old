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
    }

    clear() {
        this.ea.publish('clear');
    }
    stop() {
        this.ea.publish('stop');
    }
    step() {
        this.ea.publish('step');
    }
    start() {
        this.ea.publish('start');
    }
    toggleTrails() {
        this.ea.publish('toggleTrails', this.trails);
    }

}