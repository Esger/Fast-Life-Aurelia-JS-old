import {
    inject
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class StatsCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.speed = 0;
    }

    addListeners() {
        this.ea.subscribe('speed', response => {
            this.speed = response.speed;
        });
    }

    attached() {
        this.addListeners();
    }

}