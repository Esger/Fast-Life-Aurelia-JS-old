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
        this.liferules = [];
        this.selectedPreset = 5;
        this.presets = [
            { rule: "125/36", name: "2&times;2" },
            { rule: "34/34", name: "34 Life" },
            { rule: "1358/357", name: "Amoeba" },
            { rule: "4567/345", name: "Assimilation" },
            { rule: "235678/378", name: "Coagulations" },
            { rule: "23/3", name: "Conway&rsquo;s Life" },
            { rule: "45678/3", name: "Coral" },
            { rule: "34678/3678", name: "Day &amp; Night" },
            { rule: "5678/35678", name: "Diamoeba" },
            { rule: "012345678/3", name: "Flakes" },
            { rule: "1/1", name: "Gnarl" },
            { rule: "23/36", name: "High Life" },
            // { rule: "34678/0123478/2", name: "Inverse Life" }, 
            { rule: "5/345", name: "Long Life" },
            { rule: "12345/3", name: "Maze" },
            { rule: "1234/3", name: "Mazectric" },
            { rule: "245/368", name: "Move" },
            { rule: "238/357", name: "Pseudo Life" },
            { rule: "1357/1357", name: "Replicator" },
            { rule: "/2", name: "Seeds" },
            { rule: "/234", name: "Serviettes" },
            { rule: "235678/3678", name: "Stains" },
            { rule: "2345/45678", name: "Walled Cities" },
        ];
        this.setPreset();
    }

    setPreset() {
        let rules = this.presets[this.selectedPreset].rule.split('/');
        let stayRules = rules[0];
        let newRules = rules[1];
        let i = 0;
        for (let i = 0; i < 9; i++) {
            this.liferules[i] = newRules.includes(i);
            this.liferules[i + 10] = stayRules.includes(i);
        }
        this.publishRules(false);
    }

    publishRules(init) {
        this.ea.publish('lifeRules', {
            liferules: this.liferules,
            init: init
        });
    }

    setRules(i) {
        this.liferules[i] = !this.liferules[i];
        this.publishRules(false);
    }

    attached() {
        this.publishRules(true);
    }

}