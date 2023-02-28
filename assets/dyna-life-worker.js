// Plain JS object - no Aurelia
var conway = {
    gogogo: null,
    cellsAlive: 0, // Number of cells alive
    fillRatio: 0.2, // Percentage of available cells that will be set alive initially (20%)
    liferules: [],
    numberCells: 0, // Number of available cells
    spaceHeight: 0,
    spaceWidth: 0,
    startnumberLivecells: 0,
    lifeSteps: 0, // Number of iterations / steps done

    fillZero: function () {
        const cellCount = conway.spaceWidth * conway.spaceHeight;
        const neighbourCount = 0;
        const rulesSum = 0;
        const flatCells = []; // one dimensional array with the cells to count the neighbours
        let y = 0;
        for (; y < cellCount; y += 1) {
            flatCells.push([neighbourCount, rulesSum, rulesSum]);
        }
        return flatCells;
    },

    init: function (w, h, liferules) {
        conway.setSize(w, h);
        conway.liferules = liferules;
        conway.neighbours = conway.fillZero();
    },

    setSize: function (w, h) {
        conway.spaceWidth = w;
        conway.spaceHeight = h;
        conway.numberCells = conway.spaceWidth * conway.spaceHeight;
        conway.startnumberLivecells = conway.numberCells * conway.fillRatio;
        conway.cellsAlive = conway.startnumberLivecells;
    },

    fillRandom: function () {
        let cells = [];
        let y = 0;
        for (; y < conway.spaceHeight; y += 1) {
            let x = 0;
            for (; x < conway.spaceWidth; x += 1) {
                if (Math.random() < conway.fillRatio) {
                    let green = Math.round(Math.random() * 255);
                    let blue = Math.round(Math.random() * 255);
                    cells.push([x, y, green, blue]);
                }
            }
        }
        return cells;
    },

    setCells: function (cells) {
        conway.liveCells = cells;
    },

    zeroNeighbours: function () {
        const count = conway.numberCells;

        let i = 0;
        for (; i < count; i += 1) {
            conway.neighbours[i] = [0, 0, 0];
        }
    },

    cumulateRules: function (neighbourIndex, stayRules, newRules) {
        const neighbour = conway.neighbours[neighbourIndex];
        const rules = [stayRules, newRules];
        const cumulatedRules = [neighbour[0], neighbour[0]];
        let j = 0;
        for (; j < 2; j++) {
            let cumulator = 1;
            // each digit of cumulatedRules cumulates ruleBits
            // in order to apply rules to each digit to generate new ruleDigits from
            // whoooaaa -> count bits of surrounding rules into one number in which each
            // digit represents a bitcount
            let i = 0;
            for (; i < 9; i++) {
                if (rules[j] % 2 == 1) {
                    cumulatedRules[j] += cumulator;
                }
                cumulator *= 10;
                rules[j] = Math.floor(rules[j] / 2);
            }
        }
    },

    // Tell neighbours around livecells they have a neighbour
    // And pass their rules in a rulesSum
    // TODO: maybe apply neighbour liferules bitwise to calculate new liferules
    // So the liferules define the inheritance of rules!
    updateNeighbours: function () {
        const count = conway.liveCells.length;
        const maxNeighbour = 2;
        const rowLength = conway.spaceWidth;
        const cellCount = conway.numberCells;

        let i = 0;
        for (; i < count; i += 1) {
            const cell = conway.liveCells[i];
            const x = cell[0];
            const y = cell[1];
            const stayRules = cell[2];
            const newRules = cell[3];
            let dy = -rowLength;
            for (; dy <= rowLength; dy += rowLength) {
                const yEff = y * rowLength + dy;
                let dx = -1;
                for (; dx < maxNeighbour; dx += 1) {
                    let neighbourIndex = (yEff + x + dx + cellCount) % cellCount;
                    conway.neighbours[neighbourIndex][0] += 1; // +1 neighbour
                    cumulateRules(neighbourIndex, stayRules);
                    cumulateRules(neighbourIndex, newRules);
                }
            }
            conway.neighbours[y * rowLength + x][0] += 9; // for self is alive
        }
    },

    // convert rounded number to array of booleans for each bit
    toBoolArray: function (number) {
        const boolArray = [];
        let i = 0;
        for (; i < 9; i++) {
            const bool = number % 2 == 1;
            number = Math.floor(number / 2);
            boolArray.push(bool);
        }
        boolArray.push(false); // we want an array of 10 bools
        return boolArray;
    },

    // Evaluate neighbourscounts for new livecells
    // And calc new averaged rules for them
    // TODO: try calc new rules, then store them for next round, use current rules now
    evalNeighbours: function () {
        const count = conway.numberCells;
        const rowLength = conway.spaceWidth;
        conway.liveCells.length = 0;

        let i = 0;
        for (; i < count; i += 1) {
            const neighbourCount = conway.neighbours[i][0];
            const stayRules = Math.round(conway.neighbours[i][1] / neighbourCount); // average
            const newRules = Math.round(conway.neighbours[i][2] / neighbourCount);
            const allRules = conway.toBoolArray(stayRules).concat(conway.toBoolArray(newRules));
            allRules[10] = false;
            allRules[11] = false;
            allRules[12] = false;
            if (allRules[neighbourCount]) {
                let y = Math.floor(i / rowLength);
                let x = i % rowLength;
                conway.liveCells.push([x, y, stayRules, newRules]);
            }
        }
    },

    sendScreen: function (message) {
        let workerData = {
            message: message,
            cells: conway.liveCells
        };
        postMessage(workerData);
    },

    step: function () {
        conway.zeroNeighbours();
        conway.updateNeighbours();
        conway.evalNeighbours();
        conway.sendScreen('generation');
        conway.lifeSteps += 1;
    }

};

onmessage = function (e) {
    if (e && e.data && e.data.message) {
        let message = e.data.message;
        let data = e.data;
        console.log(message);
        switch (message) {
            case 'initialize':
                conway.init(data.w, data.h, data.liferules);
                break;
            case 'setSize':
                conway.setSize(data.w, data.h);
                conway.sendScreen('setSize');
                break;
            case 'addCell':
                conway.addCell(data.cell);
                conway.sendScreen('addCell');
                break;
            case 'fillRandom':
                conway.liveCells = conway.fillRandom();
                conway.sendScreen('fillRandom');
                break;
            case 'setCells':
                conway.setCells(data.cells);
                conway.sendScreen('setCells');
                break;
            case 'step':
                conway.step();
                break;
            case 'rules':
                conway.liferules = data.rules;
                break;
            case 'clear':
                conway.liveCells.length = 0;
                conway.neighbours = conway.fillZero();
                conway.sendScreen('clear');
                break;
            default:
        }
    }
};