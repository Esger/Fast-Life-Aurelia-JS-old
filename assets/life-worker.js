var conway = {
    gogogo: null,
    cellsAlive: 0, // Number of cells alive
    fillRatio: 0.2, // Percentage of available cells that will be set alive initially (20)
    newLifeCells: [],
    liferules: [],
    // liferules : [
    //     false, false, false, true, false, false, false, false, false,
    //     false, false, true, true, false, false, false, false, false
    // ],
    birthIndicator: 3,
    deathIndicators: [9, 10, 13, 14, 15, 16, 17],
    changedCells: [], // Array with x,y coordinates of living cells
    numberCells: 0, // Number of available cells
    spaceHeight: 0,
    spaceWidth: 0,
    speed: 0,
    startnumberLivecells: 0,
    lifeSteps: 0, // Number of iterations / steps done
    prevSteps: 0,
    walkers: [],

    fillZero: function () {
        let rows = [];
        let y = 0;
        for (; y < conway.spaceHeight; y += 1) {
            let cells = [];
            let x = 0;
            for (; x < conway.spaceWidth; x += 1) {
                cells.push(0);
            }
            rows.push(cells);
        }
        return rows;
    },

    ignite: function (w, h, rules, generations, cells) {
        conway.spaceWidth = w;
        conway.spaceHeight = h;
        conway.liferules = rules;
        conway.generations = generations;
        conway.numberCells = conway.spaceWidth * conway.spaceHeight;
        conway.startnumberLivecells = conway.numberCells * conway.fillRatio;
        conway.cellsAlive = conway.startnumberLivecells;
        conway.changedCells = [];
        conway.newLifeCells = [];
        conway.neighbours = conway.fillZero();
        conway.changedCells = cells || conway.fillRandom();
        conway.sendScreen();
    },

    resume: function (rules, generations, cells) {
        conway.generations = generations || 10;
        conway.lifeSteps = 0;
        conway.rules = rules || [];
        conway.cells = cells || [];
    },

    stop: function () {
        clearInterval(conway.gogogo);
    },

    // Put new pair of values in array
    celXY: function (x, y, a) {
        let cell = {
            x: x,
            y: y,
            alive: a
        };
        return cell;
    },

    // Fill changedCells with random cellxy's
    fillRandom: function () {
        let cells = [];
        let y = 0;
        for (; y < conway.spaceHeight; y += 1) {
            let x = 0;
            for (; x < conway.spaceWidth; x += 1) {
                if (Math.random() < conway.fillRatio) {
                    cells.push(conway.celXY(x, y, true));
                }
            }
        }
        return cells;
    },

    // Tell neighbours around changedCells they have changed +1 / -1
    // only update counts around changed cells !
    updateNeighbours: function () {
        const count = conway.changedCells.length;
        const maxNeighbour = 2;
        let i = 0;
        for (; i < count; i += 1) {
            let thisx = conway.changedCells[i].x;
            let thisy = conway.changedCells[i].y;
            let dLife = (conway.changedCells[i].alive * 1 == 1) ? 1 : -1;
            let dSelf = dLife * 8;
            let dy = -1;
            for (; dy < maxNeighbour; dy += 1) {
                let yEff = thisy + dy;
                let dx = -1;
                for (; dx < maxNeighbour; dx += 1) {
                    conway.neighbours[(yEff + conway.spaceHeight) % conway.spaceHeight][(thisx + dx + conway.spaceWidth) % conway.spaceWidth] += dLife;
                }
            }
            conway.neighbours[thisy][thisx] += dSelf;
        }
    },

    evalChangedNeighbours: function () {
        let dies = function (indicatorValue) {
            return (indicatorValue == neighbourCount);
        };
        conway.changedCells = [];
        let neighbourCount;

        let y = 0;
        for (; y < conway.spaceHeight; y += 1) {
            let x = 0;
            for (; x < conway.spaceWidth; x += 1) {
                neighbourCount = conway.neighbours[y][x];
                if (neighbourCount == conway.birthIndicator) {
                    conway.changedCells.push(conway.celXY(x, y, true));
                }
                let dead = conway.deathIndicators.some(dies);
                if (dead) {
                    conway.changedCells.push(conway.celXY(x, y, false));
                }
            }
        }
    },

    sendScreen: function () {
        let workerData = {
            message: 'newGeneration',
            cells: conway.changedCells
        };
        postMessage(workerData);
    },

    sendReady: function () {
        let workerData = {
            message: 'ready',
        };
        postMessage(workerData);
    },

    // Animation function
    bugLifeStep: function () {
        if (conway.lifeSteps < conway.generations) {
            conway.updateNeighbours();
            conway.evalChangedNeighbours();
            conway.sendScreen();
            // console.log('steps ', conway.lifeSteps);
        } else {
            clearInterval(conway.gogogo);
            conway.sendReady();
            // console.log('ready ');
        }
        conway.lifeSteps += 1;
        // conway.addNewLifeCells();
    },

    burst: function () {
        conway.gogogo = setInterval(conway.bugLifeStep);
    },

};

onmessage = function (e) {
    if (e && e.data && e.data.message) {
        let message = e.data.message;
        let data = e.data;
        switch (message) {
            case 'start':
                conway.ignite(data.w, data.h, data.rules, data.generations, data.cells);
                conway.burst();
                break;
            case 'stop':
                conway.stop();
                break;
            case 'resume':
                conway.resume(data.rules, data.generations, data.cells);
                conway.burst();
                break;
            default:
        }
    }
};