/* Round robin match generation: build a single round-robin schedule via the
   tournament-pairings library, drop byes, and number matches sequentially. */

import { RoundRobin } from 'tournament-pairings';

import { ExternalMatch } from '../../src-shared/types.js';

import Match from './Match.js';
import { createInternalMatch, numberMatchesSequentially } from './matchUtils.js';

// generate the round robin schedule grouped into rounds (each inner array is one round)
function prepareRoundRobinMatches(competitorNames: string[]): Match[][] {

    if (competitorNames.length < 2) {
        throw new Error('Bracket must have at least 2 competitors');
    }

    // ordered: true keeps the competitor order we pass in; the bracket handles shuffling
    // itself via the inherited randomizeCompetitors().
    // NOTE: pass a copy — with ordered: true the library aliases this array and push()es a
    // null onto it for odd counts (the bye), which would otherwise corrupt competitorNames.
    const externalMatches = RoundRobin([...competitorNames], 1, true) as ExternalMatch[];

    // drop byes (a null player is inserted when there is an odd number of competitors)
    const realMatches = externalMatches.filter(m => m.player1 !== null && m.player2 !== null);

    // round robin matches have no win/loss pointers, so slots are undefined
    const internalMatches = realMatches.map(m => createInternalMatch(m, undefined, undefined));

    // group matches by round
    const roundsMap = new Map<number, Match[]>();
    for (const match of internalMatches) {
        if (!roundsMap.has(match.round)) {
            roundsMap.set(match.round, []);
        }
        roundsMap.get(match.round)!.push(match);
    }

    // sort rounds ascending and number matches sequentially across them
    const sortedRoundNumbers = [...roundsMap.keys()].sort((a, b) => a - b);
    const rounds: Match[][] = [];
    let currentMatchNumber = 1;
    for (const roundNumber of sortedRoundNumbers) {
        const round = roundsMap.get(roundNumber)!;
        currentMatchNumber = numberMatchesSequentially(round, currentMatchNumber);
        rounds.push(round);
    }

    return rounds;
}

export {
    prepareRoundRobinMatches
}
