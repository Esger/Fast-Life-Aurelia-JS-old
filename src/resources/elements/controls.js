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
        this.trails = false;
    }

    clear() {
        this.ea.publish('clear');
    }
    continue() {
        this.ea.publish('continue');
    }
    random() {
        this.ea.publish('startRandom');
    }
    start() {
        this.ea.publish('start');
    }
    step() {
        this.ea.publish('step');
    }
    stop() {
        this.ea.publish('stop');
    }
    toggleTrails() {
        this.trails = !this.trails;
        this.ea.publish('toggleTrails', this.trails);
    }

}