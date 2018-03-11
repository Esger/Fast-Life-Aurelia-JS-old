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
        this.pulsor = true;
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

}