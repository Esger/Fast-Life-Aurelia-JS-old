var conway = {
    gogogo: null,
    cellsAlive: 0, // Number of cells alive
    fillRatio: 20, // Percentage of available cells that will be set alive initially (20)
    newLifeCells: [],
    liferules: [],
    liveCells: [], // Array with x,y coordinates of living cells
    numberCells: 0, // Number of available cells
    spaceHeight: 0,
    spaceWidth: 0,
    speed: 0,
    startnumberLivecells: 0,
    lifeSteps: 0, // Number of iterations / steps done
    prevSteps: 0,
    walkers: [],

    ignite: function (w, h, rules, cells) {
        this.spaceWidth = w;
        this.spaceHeight = h;
        this.liferules = rules;
        this.numberCells = this.spaceWidth * this.spaceHeight;
        this.startnumberLivecells = this.numberCells * this.fillRatio / 100;
        this.cellsAlive = this.startnumberLivecells;
        this.liveCells = [];
        this.newLifeCells = [];
        this.neighbours = [];
        this.liveCells = cells || this.fillRandom();
    },

    // Put new pair of values in array
    celXY: function (x, y) {
        let cell = {
            x: x,
            y: y
        };
        return cell;
    },

    // Fill livecells with random cellxy's
    fillRandom: function () {
        // let self = this;
        const count = conway.startnumberLivecells;
        let i = 0;
        let cells = [];
        for (; i < count; i += 1) {
            cells[i] = conway.celXY(Math.floor(Math.random() * conway.spaceWidth), Math.floor(Math.random() * conway.spaceHeight));
        }
        return cells;
    },

    // Set all neighbours to zero
    zeroNeighbours: function () {
        // let self = this;
        const count = conway.numberCells;
        let i = 0;
        for (; i < count; i += 1) {
            conway.neighbours[i] = 0;
        }
    },

    // Tell neighbours around livecells they have a neighbour
    countNeighbours: function () {
        // let self = this;
        const count = conway.liveCells.length;
        const maxNeighbour = 2;
        let i = 0;
        for (; i < count; i += 1) {
            let thisx = conway.liveCells[i].x;
            let thisy = conway.liveCells[i].y;
            let dy = -1;
            for (; dy < maxNeighbour; dy += 1) {
                let dx = -1;
                for (; dx < maxNeighbour; dx += 1) {
                    conway.neighbours[((thisy + dy) * conway.spaceWidth + thisx + dx + conway.numberCells) % conway.numberCells] += 1;
                }
            }
            conway.neighbours[thisy * conway.spaceWidth + thisx] += 9;
        }
    },

    // Evaluate neighbourscounts for new livecells
    evalNeighbours: function () {
        // let self = this;

        function livecell() {
            let y = Math.floor(i / conway.spaceWidth);
            let x = i - (y * conway.spaceWidth);
            conway.liveCells.push(conway.celXY(x, y));
        }

        this.liveCells = [];
        const count = this.numberCells;
        let i = 0;
        for (; i < count; i += 1) {
            if (this.liferules[this.neighbours[i]]) {
                livecell();
            }
        }
    },

    addNewLifeCells: function () {
        // let self = this;
        if (conway.newLifeCells.length) {
            conway.liveCells = conway.liveCells.concat(conway.newLifeCells);
            conway.newLifeCells = [];
        }
    },

    sendScreen: function () {
        // let self = this;
        let workerData = {
            message: 'newGeneration',
            cells: conway.liveCells
        };
        postMessage(workerData);
    },

    // Animation function
    bugLifeStep: function () {
        conway.lifeSteps += 1;
        // conway.addNewLifeCells();
        conway.zeroNeighbours();
        conway.countNeighbours();
        conway.evalNeighbours();
        conway.sendScreen();
    },

    burst: function () {
        this.gogogo = setInterval(this.bugLifeStep);
    },

};

onmessage = function (e) {
    if (e && e.data && e.data.message) {
        let message = e.data.message;
        let data = e.data;
        switch (message) {
            case 'start':
                conway.ignite(data.w, data.h, data.rules, data.cells);
                conway.burst();
                break;
            default:
        }
    }
};