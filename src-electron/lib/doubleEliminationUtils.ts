/* Double-elimination match generation: pairing, win/loss linking, splitting into
   winners/losers brackets, final + final-rematch extraction, and match numbering. */

import { DoubleElimination } from 'tournament-pairings';

import { ExternalMatch } from '../../src-shared/types.js';

import Match from './classes/Match.js';
import { createInternalMatch, putMatchesIntoMatrix, numberMatchesSequentially } from './matchUtils.js';
import { isPowerOfTwo } from './utils.js';

function prepareMatches(competitorNames: string[]): { winnersBracket: Match[][], losersBracket: Match[][], final: Match, finalRematch: Match } {

    console.log('in prepareMatches with competitorNames: ', competitorNames);

    if (competitorNames.length < 2) {
        throw new Error('Bracket must have at least 2 cometitors');
    }

    if (competitorNames.length == 2 || competitorNames.length == 3) {
        return prepareMatchesForSpecialLowNumbers(competitorNames);
    }

    // generate pairings using external library
    const matches = DoubleElimination(competitorNames) as ExternalMatch[];
    //console.log('1. matches', matches);

    // convert to internal matches
    const convertedMatches = convertExternalMatchesToInternalMatches(matches);
    //console.log('2. convertedMatches', convertedMatches);

    // link matches
    linkMatches(convertedMatches);
    //console.log('3. linked matches', convertedMatches);

    // separate into winnersBracket and losersBracket
    const { winnersBracket, losersBracket } = separateBrackets(convertedMatches);
    //console.log('4. separated brackets. winnersBracket: ', winnersBracket, 'losersBracket: ', losersBracket);

    // separate final from winners bracket and add final rematch
    const { final, finalRematch } = separateFinalsFromBrackets(winnersBracket, losersBracket);
    //console.log('5. final, finalRematch', final, finalRematch);

    // number matches
    numberMatches(competitorNames.length, winnersBracket, losersBracket, final, finalRematch);
    //console.log('6. after numbering, winnersBracket: ', winnersBracket, 'losersBracket: ', losersBracket, 'final: ', final, 'finalRematch: ', finalRematch);

    // group parent matches together in winner round 1 and loser round 1. Necessary since child matches are rendered in the middle of the two parent matches
    winnersBracket[1] = groupParentMatches(winnersBracket[1]);
    losersBracket[1] = groupParentMatches(losersBracket[1]);

    console.log('7. after grouping parent matches, winnersBracket round 1: ', winnersBracket[1], 'losersBracket round 1: ', losersBracket[1]);

    return { winnersBracket, losersBracket, final, finalRematch };
}

// helper functions

//
const groupParentMatches = (matches: Match[]) => {
    const parentMap = new Map<Match, Match[]>();

    for (const parent of matches) {
        // only interested in the winChild here, because the lossChild is non-existent or in a different bracket
        const child = parent.winChild;

        if (!child) continue;

        if (!parentMap.has(child)) {
            parentMap.set(child, []);
        }

        parentMap.get(child)!.push(parent);
    }

    let groupedMatches: Match[] = [];

    for (const [child, parents] of parentMap.entries()) {
        groupedMatches = groupedMatches.concat(parents);
    }

    return groupedMatches;
}

// brute force matches creation for <= 3 competitors
const prepareMatchesForSpecialLowNumbers = (competitorNames: string[]): { winnersBracket: Match[][], losersBracket: Match[][], final: Match, finalRematch: Match } => {

    if (competitorNames.length === 2) {
        const match1 = new Match('1-1', 1, 1, 1, competitorNames[0], competitorNames[1], 'UNDECIDED',
            { round: 2, match: 1, slot: 1 }, { round: 2, match: 1, slot: 2 });

        const final = new Match('2-1', 2, 2, 1, null, null, 'UNDECIDED',
            { round: 3, match: 1, slot: 1 }, { round: 3, match: 1, slot: 2 });

        const finalRematch = new Match('3-1', 3, 3, 1, null, null, 'UNDECIDED');

        // set up parent child links
        finalRematch.slot1Parent = final;
        finalRematch.slot1PreviouslyWinner = true;
        finalRematch.slot2Parent = final;
        finalRematch.slot2PreviouslyWinner = false;
        final.winChild = finalRematch;
        final.lossChild = finalRematch;

        final.slot1Parent = match1;
        final.slot1PreviouslyWinner = true;
        final.slot2Parent = match1;
        final.slot2PreviouslyWinner = false;
        match1.winChild = final;
        match1.lossChild = final;

        return { winnersBracket: [[match1]], losersBracket: [], final, finalRematch };
    }

    else if (competitorNames.length === 3) {
        const match1 = new Match('1-1', 1, 1, 1, competitorNames[0], competitorNames[1], 'UNDECIDED',
            { round: 2, match: 1, slot: 1 }, { round: 4, match: 1, slot: 1 });

        const match2 = new Match('2-1', 2, 2, 1, competitorNames[2], null, 'UNDECIDED',
            { round: 3, match: 1, slot: 1 }, { round: 4, match: 1, slot: 2 });

        const match3 = new Match('4-1', 3, 4, 1, null, null, 'UNDECIDED',
            { round: 3, match: 1, slot: 2 });

        const final = new Match('3-1', 4, 3, 1, null, null, 'UNDECIDED',
            { round: 5, match: 1, slot: 1 }, { round: 5, match: 1, slot: 2 });

        const finalRematch = new Match('5-1', 5, 5, 1, null, null, 'UNDECIDED');

        // set up parent child links
        finalRematch.slot1Parent = final;
        finalRematch.slot1PreviouslyWinner = true;
        finalRematch.slot2Parent = final;
        finalRematch.slot2PreviouslyWinner = false;
        final.winChild = finalRematch;
        final.lossChild = finalRematch;

        final.slot1Parent = match2;
        final.slot1PreviouslyWinner = true;
        final.slot2Parent = match3;
        final.slot2PreviouslyWinner = true;
        match2.winChild = final;
        match3.winChild = final;

        match3.slot1Parent = match1;
        match3.slot1PreviouslyWinner = false;
        match3.slot2Parent = match2;
        match3.slot2PreviouslyWinner = false;
        match1.lossChild = match3;
        match2.lossChild = match3;

        match2.slot2Parent = match1;
        match2.slot2PreviouslyWinner = true;
        match1.winChild = match2;


        return { winnersBracket: [[match1], [match2]], losersBracket: [[match3]], final, finalRematch };
    }

    throw new Error('Invalid number of competitors: ' + competitorNames.length);
}

// function to convert tournament-pairings output to the internal Match class
const convertExternalMatchesToInternalMatches = (matches: ExternalMatch[]): Match[] => {

    const convertedMatches = [];

    const occupiedDestinations = new Set<string>();

    // fill occupiedDestinations with any players already in the bracket
    for (let match of matches) {
        if (match.player1) {
            occupiedDestinations.add(`${match.round}-${match.match}`);
        }
        if (match.player2) {
            occupiedDestinations.add(`${match.round}-${match.match}`);
        }
    }

    for (let match of matches) {

        let winSlot: 1 | 2 | undefined, lossSlot: 1 | 2 | undefined;

        if (match.win) {
            const matchWinDestination = `${match.win.round}-${match.win.match}`;

            // if the win pointer has not been seen, slot is 1
            if (occupiedDestinations.has(matchWinDestination)) {
                winSlot = 2;
            }

            // if the win pointer has been seen, slot is 2
            else {
                winSlot = 1;
                occupiedDestinations.add(matchWinDestination);
            }
        }

        if (match.loss) {
            const matchLossDestination = `${match.loss.round}-${match.loss.match}`;

            // if the loss pointer has not been seen, slot is 1
            if (occupiedDestinations.has(matchLossDestination)) {
                lossSlot = 2;
            }

            // if the loss pointer has been seen, slot is 2
            else {
                lossSlot = 1;
                occupiedDestinations.add(matchLossDestination);
            }
        }

        // TODO: match number should be -1 for now, but should be replaced with the actual match number later
        const convertedMatch = createInternalMatch(match, winSlot, lossSlot);
        convertedMatches.push(convertedMatch);
    }
    return convertedMatches;
}

// previousMatchStack is a list of matches who contain a competitor that competed in the last round. It is ordered in decreasing time since the competitor competed.
const numberMatchesRespectingParentOrder = (round: Match[], currentMatchNumber: number, matchesFromLastRound: Match[], side: 'winner' | 'loser', lossChildParentsFromPreviousRound: Match[] = []): number => {

    //console.log('in numberMatchesRespectingParentOrder with round: ', round);
    // Map child -> parents
    const parentMap = new Map<Match, Match[]>();

    for (const parent of matchesFromLastRound) {

        // if we're in the winners bracket, we care about the winChild, cause the lossChild goes to the losers bracket
        // if we're in the losers bracket, we care about the winChild, cause there is no lossChild
        const child = parent.winChild;

        if (!child) continue;

        if (!parentMap.has(child)) {
            parentMap.set(child, []);
        }

        parentMap.get(child)!.push(parent);
    }

    for (const parent of lossChildParentsFromPreviousRound) {
        const child = parent.lossChild;

        if (!child) continue;

        if (!parentMap.has(child)) {
            parentMap.set(child, []);
        }

        parentMap.get(child)!.push(parent);
    }

    // split matches into ones that are children of previous round and ones that aren't
    const matchesWithoutPreviousRoundParents: Match[] = [];
    const matchesWithPreviousRoundParents: Match[] = [];

    for (const match of round) {
        if (parentMap.has(match)) {
            matchesWithPreviousRoundParents.push(match);
        } else {
            matchesWithoutPreviousRoundParents.push(match);
        }
    }

    // Number matches that have no parent first (since they have no competitor that needs rest, or at least their competitors don't need as much rest as matches with parents from previous round)
    for (const match of matchesWithoutPreviousRoundParents) {
        match.number = currentMatchNumber++;
    }

    // Sort matches based on parent age (older parents are first, since their competitors need less rest)
    matchesWithPreviousRoundParents.sort((a, b) => {

        const parentsA = parentMap.get(a)!;
        const parentsB = parentMap.get(b)!;

        // const earliestParentA = Math.min(...parentsA.map(p => p.number));
        // const earliestParentB = Math.min(...parentsB.map(p => p.number));

        // we want the latest parent to be last, because that parent is the one that needs the most rest
        const latestParentA = Math.max(...parentsA.map(p => p.number));
        const latestParentB = Math.max(...parentsB.map(p => p.number));

        return latestParentA - latestParentB;

        //return earliestParentA - earliestParentB;
    });

    // Number them
    for (const match of matchesWithPreviousRoundParents) {
        match.number = currentMatchNumber++;
    }

    return currentMatchNumber;
};

const numberMatches = (numberOfCompetitors: number, winnersBracket: Match[][], losersBracket: Match[][], final: Match, finalRematch: Match): void => {

    //console.log('numbering matches with numberOfCompetitors: ', numberOfCompetitors, 'winnersBracket: ', winnersBracket, 'losersBracket: ', losersBracket, 'final: ', final, 'finalRematch: ', finalRematch);

    let currentMatchNumber = 1, currentWinnerRound = 0, currentLoserRound = 0;

    // if power of 2, then first complete first winner round. otherwise, complete first 2 winner rounds
    currentMatchNumber = numberMatchesSequentially(winnersBracket[currentWinnerRound], currentMatchNumber); // needs to generate match stack
    currentWinnerRound++;

    let numberOfInitialLoserMatches = winnersBracket[0].length;

    if (!isPowerOfTwo(numberOfCompetitors)) {
        currentMatchNumber = numberMatchesRespectingParentOrder(winnersBracket[currentWinnerRound], currentMatchNumber, winnersBracket[currentWinnerRound - 1], 'winner');
        currentWinnerRound++;
        numberOfInitialLoserMatches += winnersBracket[1].length;
    }

    // if initial amount of losers is power of 2, then complete first loser round. otherwise, complete first 2 loser rounds
    const lossChildParentsFromPreviousRound = isPowerOfTwo(numberOfCompetitors) ? winnersBracket[0] : winnersBracket[0].concat(winnersBracket[1]);
    currentMatchNumber = numberMatchesRespectingParentOrder(losersBracket[currentLoserRound], currentMatchNumber, [], 'loser', lossChildParentsFromPreviousRound);
    currentLoserRound++;

    if (!isPowerOfTwo(numberOfInitialLoserMatches)) {
        // give second loser round the context of the initial winner rounds
        currentMatchNumber = numberMatchesRespectingParentOrder(losersBracket[currentLoserRound], currentMatchNumber, losersBracket[currentLoserRound - 1], 'loser', lossChildParentsFromPreviousRound);
        currentLoserRound++;
    }

    // while current winner round size not equal to 1
    while (currentWinnerRound < winnersBracket.length) {

        // execute winner round
        currentMatchNumber = numberMatchesRespectingParentOrder(winnersBracket[currentWinnerRound], currentMatchNumber, winnersBracket[currentWinnerRound - 1], 'winner');
        currentWinnerRound++;

        // execute 2 loser rounds (if they exist)
        if (currentLoserRound < losersBracket.length) {
            // the first loser round is linked to by the last winner round, so pass that round as the lossChildParentsFromPreviousRound
            currentMatchNumber = numberMatchesRespectingParentOrder(losersBracket[currentLoserRound], currentMatchNumber, losersBracket[currentLoserRound - 1], 'loser', winnersBracket[currentWinnerRound - 1]);
            currentLoserRound++;
        }
        if (currentLoserRound < losersBracket.length) {
            currentMatchNumber = numberMatchesRespectingParentOrder(losersBracket[currentLoserRound], currentMatchNumber, losersBracket[currentLoserRound - 1], 'loser');
            currentLoserRound++;
        }
    }

    // number final
    final.number = currentMatchNumber++;
    // number final rematch
    finalRematch.number = currentMatchNumber++;
}

const linkMatches = (matches: Match[]): void => {

    // index matches in 2-dimensional matrix
    const matchesMatrix = putMatchesIntoMatrix(matches);

    // loop through all matches. whenever there is a win or a loss, update children of current match, and parents of destination matches
    for (let round = 0; round < matchesMatrix.length; round++) {
        for (let index = 0; index < matchesMatrix[round].length; index++) {

            const match = matchesMatrix[round][index];

            if (!match) {
                continue;
            }

            // if there is a win pointer, update winChild and correct slot parent of winChild
            if (match.win) {

                // set win destination match
                const winChild = matchesMatrix[match.win.round][match.win.match];
                match.winChild = winChild

                // set this match as the parent of the win destination match
                if (match.win.slot === 1) {
                    winChild.slot1Parent = match;
                    winChild.slot1PreviouslyWinner = true;
                }
                else if (match.win.slot === 2) {
                    winChild.slot2Parent = match;
                    winChild.slot2PreviouslyWinner = true;
                }
            }

            // if there is a loss pointer, update lossChild and correct slot parent of lossChild
            if (match.loss) {

                // set loss destination match
                const lossChild = matchesMatrix[match.loss.round][match.loss.match];
                match.lossChild = lossChild;

                // set this match as the parent of the loss destination match
                if (match.loss.slot === 1) {
                    lossChild.slot1Parent = match;
                    lossChild.slot1PreviouslyWinner = false;
                }
                else if (match.loss.slot === 2) {
                    lossChild.slot2Parent = match;
                    lossChild.slot2PreviouslyWinner = false;
                }
            }
        }
    }
}

const separateBrackets = (matches: Match[]): { winnersBracket: Match[][]; losersBracket: Match[][] } => {
    let winnersBracket: Match[][] = [];
    let losersBracket: Match[][] = [];

    // Helper: ensure the round array exists
    const ensureRound = (arr: Match[][], round: number) => {
        while (arr.length <= round) arr.push([]);
    };

    // get all matches linked to by loss
    const loserBracketMatchIds = new Map<string, boolean>();
    for (const match of matches) {
        loserBracketMatchIds.set(`${match.round}-${match.match}`, false);
    }
    for (const match of matches) {
        if (match.loss) {
            loserBracketMatchIds.set(`${match.loss.round}-${match.loss.match}`, true);
        }
    }

    // get all matches that are pointed to by 2 win pointers, both of which are from losers bracket matches
    const matchesPointedToByLosersBracketWins = new Map<string, number>();
    for (const match of matches) {
        if (match.win) {
            const key = `${match.round}-${match.match}`;
            //console.log('key: ', key);
            if (loserBracketMatchIds.get(key)) {

                // get win child matchs
                const winKey = `${match.win.round}-${match.win.match}`;

                const currentValue = matchesPointedToByLosersBracketWins.get(winKey);

                if (currentValue) {
                    matchesPointedToByLosersBracketWins.set(winKey, currentValue + 1);
                    loserBracketMatchIds.set(winKey, true);
                }
                else {
                    matchesPointedToByLosersBracketWins.set(winKey, 1);
                }
            }
        }
    }

    for (const match of matches) {
        const target = loserBracketMatchIds.get(`${match.round}-${match.match}`) ? losersBracket : winnersBracket;
        ensureRound(target, match.round);
        target[match.round - 1][match.match - 1] = match; // because round and match indexing starts at 1
    }

    // clean up empty rounds TODO: should there be a better solution that doesn't require this?
    winnersBracket = winnersBracket.filter(round => round.length > 0);
    losersBracket = losersBracket.filter(round => round.length > 0);

    return { winnersBracket, losersBracket };
}

const separateFinalsFromBrackets = (winnersBracket: Match[][], losersBracket: Match[][]): { final: Match, finalRematch: Match } => {

    // extract finals (last 2 matches of winnersBracket)
    const finalRound = winnersBracket[winnersBracket.length - 1];
    const final = finalRound.pop();

    if (!final) {
        throw new Error('No final found');
    }

    // delete last round from winnersBracket, since it should now be empty
    winnersBracket.pop();

    // create final rematch
    const finalRematchRound = winnersBracket.length + losersBracket.length + 2;
    const finalRematchMatch = 1;
    const finalRematchId = `${finalRematchRound}-${finalRematchMatch}`;
    const finalRematchNumber = final.number + 1;

    const finalRematch = new Match(finalRematchId, finalRematchNumber, finalRematchRound, finalRematchMatch, null, null, 'UNDECIDED');

    // link finalRematch to final
    finalRematch.slot1Parent = final;
    finalRematch.slot1PreviouslyWinner = true;
    finalRematch.slot2Parent = final;
    finalRematch.slot2PreviouslyWinner = false;

    // link final to finalRematch
    final.winChild = finalRematch;
    final.lossChild = finalRematch;
    final.win = { round: finalRematchRound, match: finalRematchMatch, slot: 1 };
    final.loss = { round: finalRematchRound, match: finalRematchMatch, slot: 2 };

    return { final, finalRematch };
}

export {
    prepareMatches
}
