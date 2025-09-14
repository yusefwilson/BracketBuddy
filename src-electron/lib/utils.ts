/* MATH */
function greatestPowerOf2LessThanOrEqualTo(n: number): number {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
}

function isPowerOfTwo(n: number) { return n > 0 && (n & (n - 1)) === 0; };

/* SAVE DATA */
async function getSaveData(): Promise<Record<string, any>> {
    const data = await window.electron.getSaveData();
    return data;
}

async function saveKeyValue(key: string, value: any): Promise<void> {
    await window.electron.saveKeyValue(key, value);
}

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

import Match from './Match';
import { DoubleElimination } from 'tournament-pairings';
import { ExternalMatch } from '../../src-shared/types';

function prepareMatches(competitorNames: string[]): { winnersBracket: Match[][], losersBracket: Match[][] } {
    // generate pairings using external library
    const matches = DoubleElimination(competitorNames, 0) as ExternalMatch[];
    // convert to internal matches
    const convertedMatches = convertExternalMatchesToInternalMatches(matches);
    // link matches
    linkMatches(convertedMatches);
    // separate into winnersBracket and losersBracket
    return separateBrackets(convertedMatches);
}

// helper functions

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

    return new Match(match.round, match.match, match.player1, match.player2, -1, win, loss);
}

// function to convert tournament-pairings output to the internal Match class
const convertExternalMatchesToInternalMatches = (matches: ExternalMatch[]): Match[] => {

    const convertedMatches = [];

    const seenDestinations = new Set<string>();

    for (let match of matches) {

        let winSlot: 1 | 2 | undefined, lossSlot: 1 | 2 | undefined;

        if (match.win) {
            const matchWinDestination = `${match.win.round}-${match.win.match}`;

            // if the win pointer has not been seen, slot is 1
            if (seenDestinations.has(matchWinDestination)) {
                winSlot = 2;
            }

            // if the win pointer has been seen, slot is 2
            else {
                winSlot = 1;
                seenDestinations.add(matchWinDestination);
            }
        }

        if (match.loss) {
            const matchLossDestination = `${match.loss.round}-${match.loss.match}`;

            // if the loss pointer has not been seen, slot is 1
            if (seenDestinations.has(matchLossDestination)) {
                lossSlot = 2;
            }

            // if the loss pointer has been seen, slot is 2
            else {
                lossSlot = 1;
                seenDestinations.add(matchLossDestination);
            }
        }

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
    const winnersBracket: Match[][] = [];
    const losersBracket: Match[][] = [];

    // Helper: ensure the round array exists
    const ensureRound = (arr: Match[][], round: number) => {
        while (arr.length <= round) arr.push([]);
    };

    // Precompute which matches are in losers bracket
    const matchIsLoser = new Map<string, boolean>();
    for (const m of matches) {
        matchIsLoser.set(`${m.round}-${m.match}`, false);
    }
    for (const m of matches) {
        if (m.loss) {
            matchIsLoser.set(`${m.loss.round}-${m.loss.match}`, true);
        }
    }

    for (const m of matches) {
        const target = matchIsLoser.get(`${m.round}-${m.match}`) ? losersBracket : winnersBracket;
        ensureRound(target, m.round);
        target[m.round][m.match] = m;
    }

    return { winnersBracket, losersBracket };
}

export {
    greatestPowerOf2LessThanOrEqualTo, isPowerOfTwo,
    getSaveData, saveKeyValue,
    serialize, deserialize,
    prepareMatches
}