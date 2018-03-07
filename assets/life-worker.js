var conway = {
    gogogo: null,
    cellsAlive: 0, // Number of cells alive
    fillRatio: 0.2, // Percentage of available cells that will be set alive initially (20)
    // newLifeCells: [],
    liferules: [],
    // liferules : [
    //     false, false, false, true, false, false, false, false, false,
    //     false, false, true, true, false, false, false, false, false
    // ],
    birthIndicator: 3,
    deathIndicators: [9, 10, 13, 14, 15, 16, 17],
    numberCells: 0, // Number of available cells
    spaceHeight: 0,
    spaceWidth: 0,
    speed: 0,
    startnumberLivecells: 0,
    lifeSteps: 0, // Number of iterations / steps done
    prevSteps: 0,
    walkers: [],

    fillZero: function () {
        const cellCount = conway.spaceWidth * conway.spaceHeight;
        let flatCells = [];
        let y = 0;
        for (; y < cellCount; y += 1) {
            flatCells.push(0);
        }
        return flatCells;
    },

    ignite: function (w, h, rules, generations, cells) {
        conway.spaceWidth = w;
        conway.spaceHeight = h;
        conway.liferules = rules;
        conway.generations = generations;
        conway.numberCells = conway.spaceWidth * conway.spaceHeight;
        conway.startnumberLivecells = conway.numberCells * conway.fillRatio;
        conway.cellsAlive = conway.startnumberLivecells;
        // conway.newLifeCells = [];
        conway.neighbours = conway.fillZero();
        conway.liveCells = cells || conway.fillRandom();
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
        conway.sendStopAck();
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

    // Fill liveCells with random cellxy's
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

    // Set all neighbours to zero
    zeroNeighbours: function () {

        const count = conway.numberCells;
        let i = 0;
        for (; i < count; i += 1) {
            conway.neighbours[i] = 0;
        }
    },

    // Tell neighbours around livecells they have a neighbour
    updateNeighbours: function () {

        const count = conway.liveCells.length;
        const maxNeighbour = 2;
        const rowLength = conway.spaceWidth;
        const cellCount = conway.numberCells;

        let i = 0;
        for (; i < count; i += 1) {
            let thisx = conway.liveCells[i].x;
            let thisy = conway.liveCells[i].y;
            let dy = -rowLength;
            for (; dy <= rowLength; dy += rowLength) {
                let yEff = thisy * rowLength + dy;
                let dx = -1;
                for (; dx < maxNeighbour; dx += 1) {
                    conway.neighbours[(yEff + thisx + dx + cellCount) % cellCount] += 1;
                }
            }
            conway.neighbours[thisy * rowLength + thisx] += 9;
        }
    },

    // Evaluate neighbourscounts for new livecells
    evalNeighbours: function () {
        const count = conway.numberCells;
        const rowLength = conway.spaceWidth;
        conway.liveCells = [];

        let i = 0;
        for (; i < count; i += 1) {
            if (conway.liferules[conway.neighbours[i]]) {
                let y = Math.floor(i / rowLength);
                let x = i % rowLength;
                // let x = i - (y * rowLength);
                conway.liveCells.push(conway.celXY(x, y));
            }
        }
    },

    sendScreen: function () {
        let workerData = {
            message: 'newGeneration',
            cells: conway.liveCells
        };
        postMessage(workerData);
    },

    sendReady: function () {
        let workerData = {
            message: 'ready',
        };
        postMessage(workerData);
    },

    sendStopAck: function () {
        let workerData = {
            message: 'stopAck',
        };
        postMessage(workerData);
    },

    // Animation function
    bugLifeStep: function () {
        if (conway.lifeSteps < conway.generations) {
            conway.zeroNeighbours();
            conway.updateNeighbours();
            conway.evalNeighbours();
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