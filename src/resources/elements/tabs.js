import {
    inject
} from 'aurelia-framework';
import {
    EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)

export class TabsCustomElement {

    constructor(eventAggregator) {
        this.ea = eventAggregator;
        this.liferules = [
            false, false, false, true, false, false, false, false, false, false,
            false, false, true, true, false, false, false, false, false
        ];
    }
    setRules(i) {
        this.liferules[i] = !this.liferules[i];
        this.ea.publish('lifeRules', this.liferules);
    }
}