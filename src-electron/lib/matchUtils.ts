/* Shared helpers for adapting tournament-pairings output into our internal Match
   class, plus generic round/match indexing and numbering. Usable by any bracket
   format (double elimination, round robin, single elimination, ...). */

import { ExternalMatch } from '../../src-shared/types.js';

import Match from './Match.js';

// create an internal Match from a tournament-pairings ExternalMatch and its slot
// information. win/loss coordinates are only attached when the external match has
// them, so formats without win/loss pointers (e.g. round robin) work unchanged.
const createInternalMatch = (match: ExternalMatch, winSlot: 1 | 2 | undefined, lossSlot: 1 | 2 | undefined): Match => {

    let win, loss;

    // assert 1 | 2 type, because if match.win or match.loss exist, then winSlot and lossSlot must be 1 | 2 respectively
    if (match.win) {
        win = { round: match.win.round, match: match.win.match, slot: winSlot as 1 | 2 };
    }
    if (match.loss) {
        loss = { round: match.loss.round, match: match.loss.match, slot: lossSlot as 1 | 2 };
    }

    const id = match.round + '-' + match.match;

    return new Match(id, -1, match.round, match.match, match.player1, match.player2, 'UNDECIDED', win, loss);
}

// organize matches into a 2-dimensional array for easy access by round and match
const putMatchesIntoMatrix = (matches: Match[]): Match[][] => {
    // find amount of rounds and matches
    let maxRound = 0;
    let maxMatch = 0;
    for (let match of matches) {
        if (match.round > maxRound) {
            maxRound = match.round;
        }
        if (match.match > maxMatch) {
            maxMatch = match.match;
        }
    }

    // store Match objects in a 2-dimensional array for easy access by round and match
    const matchesMatrix: Match[][] = Array.from({ length: maxRound + 1 }, () => Array(maxMatch + 1).fill(null));
    for (let match of matches) {
        matchesMatrix[match.round][match.match] = match;
    }

    return matchesMatrix;
}

const numberMatchesSequentially = (round: Match[], currentMatchNumber: number): number => {
    round.forEach(match => match.number = currentMatchNumber++);
    return currentMatchNumber;
}

export {
    createInternalMatch,
    putMatchesIntoMatrix,
    numberMatchesSequentially
}
