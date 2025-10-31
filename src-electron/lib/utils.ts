/* MATH */
function greatestPowerOf2LessThanOrEqualTo(n: number): number {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
}

function isPowerOfTwo(n: number) { return n > 0 && (n & (n - 1)) === 0; };

/* SERIALIZATION AND DESERIALIZATION */
import { parse, stringify } from 'flatted';

function rehydrate(data: any, classMap: Record<string, new () => any>, cache = new WeakMap()): any {

    // Handle Date objects differently than the custom classes
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(data)) {
        return new Date(data); // Convert ISO string to Date instance
    }

    // Handle null and non-objects
    if (data === null || typeof data !== 'object') return data;

    // Handle circular references
    if (cache.has(data)) return cache.get(data);

    // Handle classes
    if (data.__class && classMap[data.__class]) {
        const instance = new classMap[data.__class]();
        cache.set(data, instance);
        Object.keys(data).forEach((key) => {
            if (key !== '__class') {
                (instance as any)[key] = rehydrate(data[key], classMap, cache);
            }
        });
        return instance;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        const rehydratedArray = data.map((item) => rehydrate(item, classMap, cache));
        cache.set(data, rehydratedArray);
        return rehydratedArray;
    }

    const rehydratedObject = {} as any;
    cache.set(data, rehydratedObject);

    Object.keys(data).forEach((key) => {
        rehydratedObject[key] = rehydrate(data[key], classMap, cache);
    });

    return rehydratedObject;
}

function serialize(obj: any): string {
    return stringify(obj);
}

function deserialize(serialized: string, classMap: Record<string, new () => any>): any {

    const deserialized = parse(serialized);

    // now rehydrate object by changing all __class fields to their respective classes
    const rehydrated = rehydrate(deserialized, classMap);

    return rehydrated;
}

/* MATCHES */

import Match from './Match.js';
import { ExperienceLevel, ExternalMatch, WeightLimit } from '../../src-shared/types.js';
import { DoubleElimination } from 'tournament-pairings';

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
    console.log('1. matches', matches);

    // convert to internal matches
    const convertedMatches = convertExternalMatchesToInternalMatches(matches);
    console.log('2. convertedMatches', convertedMatches);

    // link matches
    linkMatches(convertedMatches);
    console.log('3. linked matches', convertedMatches);

    // separate into winnersBracket and losersBracket
    const { winnersBracket, losersBracket } = separateBrackets(convertedMatches);
    console.log('4. separated brackets. winnersBracjet: ', winnersBracket, 'losersBracket: ', losersBracket);

    // separate final from winners bracket and add final rematch
    const { final, finalRematch } = separateFinalsFromBrackets(winnersBracket, losersBracket);

    // number matches
    numberMatches(competitorNames.length, winnersBracket, losersBracket, final, finalRematch);

    return { winnersBracket, losersBracket, final, finalRematch };
}

// helper functions

// brute force matches creation for <= 3 competitors
const prepareMatchesForSpecialLowNumbers = (competitorNames: string[]): { winnersBracket: Match[][], losersBracket: Match[][], final: Match, finalRematch: Match } => {

    if (competitorNames.length === 2) {
        const match1 = new Match('1-1', 1, 1, 1, competitorNames[0], competitorNames[1], -1,
            { round: 2, match: 1, slot: 1 }, { round: 2, match: 1, slot: 2 });

        const final = new Match('2-1', 2, 2, 1, null, null, -1,
            { round: 3, match: 1, slot: 1 }, { round: 3, match: 1, slot: 2 });

        const finalRematch = new Match('3-1', 3, 3, 1, null, null, -1);

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
        const match1 = new Match('1-1', 1, 1, 1, competitorNames[0], competitorNames[1], -1,
            { round: 2, match: 1, slot: 1 }, { round: 4, match: 1, slot: 1 });

        const match2 = new Match('2-1', 2, 2, 1, competitorNames[2], null, -1,
            { round: 3, match: 1, slot: 1 }, { round: 4, match: 1, slot: 2 });

        const match3 = new Match('4-1', 3, 4, 1, null, null, -1,
            { round: 3, match: 1, slot: 2 });

        const final = new Match('3-1', 4, 3, 1, null, null, -1,
            { round: 5, match: 1, slot: 1 }, { round: 5, match: 1, slot: 2 });

        const finalRematch = new Match('5-1', 5, 5, 1, null, null, -1);

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

// function to create internal Match class objet from ExternalMatch object and slot information
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

    return new Match(id, -1, match.round, match.match, match.player1, match.player2, -1, win, loss);
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

// function to organize matches into a 2-dimensional array for easy access by round and match
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

const numberRound = (round: Match[], currentMatchNumber: number): number => {
    //console.log('numbering round: ', round);
    round.forEach(match => match.number = currentMatchNumber++);
    return currentMatchNumber;
}

const numberMatches = (numberOfCompetitors: number, winnersBracket: Match[][], losersBracket: Match[][], final: Match, finalRematch: Match): void => {

    console.log('numbering matches with numberOfCompetitors: ', numberOfCompetitors, 'winnersBracket: ', winnersBracket, 'losersBracket: ', losersBracket, 'final: ', final, 'finalRematch: ', finalRematch);

    let currentMatchNumber = 1, currentWinnerRound = 0, currentLoserRound = 0;

    // if power of 2, then first complete first winner round. otherwise, complete first 2 winner rounds
    currentMatchNumber = numberRound(winnersBracket[currentWinnerRound], currentMatchNumber);
    currentWinnerRound++;

    let numberOfInitialLoserMatches = winnersBracket[0].length;

    if (!isPowerOfTwo(numberOfCompetitors)) {
        currentMatchNumber = numberRound(winnersBracket[currentWinnerRound], currentMatchNumber);
        currentWinnerRound++;
        numberOfInitialLoserMatches += winnersBracket[1].length;
    }

    // if initial amount of losers is power of 2, then complete first loser round. otherwise, complete first 2 loser rounds
    currentMatchNumber = numberRound(losersBracket[currentLoserRound], currentMatchNumber);
    currentLoserRound++;

    if (!isPowerOfTwo(numberOfInitialLoserMatches)) {
        currentMatchNumber = numberRound(losersBracket[currentLoserRound], currentMatchNumber);
        currentLoserRound++;
    }

    // while current winner round size not equal to 1
    while (currentWinnerRound < winnersBracket.length) {

        // execute winner round
        currentMatchNumber = numberRound(winnersBracket[currentWinnerRound], currentMatchNumber);
        currentWinnerRound++;

        // execute 2 loser rounds (if they exist)
        if (currentLoserRound < losersBracket.length) {
            currentMatchNumber = numberRound(losersBracket[currentLoserRound], currentMatchNumber);
            currentLoserRound++;
        }
        if (currentLoserRound < losersBracket.length) {
            currentMatchNumber = numberRound(losersBracket[currentLoserRound], currentMatchNumber);
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

    const finalRematch = new Match(finalRematchId, finalRematchNumber, finalRematchRound, finalRematchMatch, null, null, -1);

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

/* SHUFFLE */
function shuffle<T>(array: T[]) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

export {
    greatestPowerOf2LessThanOrEqualTo, isPowerOfTwo,
    serialize, deserialize,
    prepareMatches,
    shuffle
}