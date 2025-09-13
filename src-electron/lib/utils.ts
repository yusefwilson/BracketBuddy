/* MATH */
function greatestPowerOf2LessThanOrEqualTo(n: number): number {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
}

function isPowerOfTwo(n: number) { return n > 0 && (n & (n - 1)) === 0; };

const getSaveData = async (): Promise<Record<string, any>> => {
    const data = await window.electron.getSaveData();
    return data;
}

const saveKeyValue = async (key: string, value: any): Promise<void> => {
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

/* BRACKET */

// function to get tournament-pairings output ready for the internal data structure
// 1. convert all to internal Match class
// 2. separate brackets into winners and losers

function prepareMatches(competitorNames: string[]): { winnersBracket: Match[][], losersBracket: Match[][] } {
    const matches = DoubleElimination(competitorNames);
    const convertedMatches = matches.map(m => externalMatchToInternalMatch(m));
    return separateBrackets(convertedMatches);
}

import Match from './Match';
import { DoubleElimination } from 'tournament-pairings';
function separateBrackets(matches: Match[]): { winnersBracket: Match[][]; losersBracket: Match[][] } {
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

// functionality to convert tournament-pairings output to the internal Match class

type ExternalMatch = {
    round: number,
    match: number,
    player1: string | number | null,
    player2: string | number | null,
    win?: {
        round: number,
        match: number
    },
    loss?: {
        round: number,
        match: number
    }
}

function externalMatchToInternalMatch(match: ExternalMatch): Match {
    return new Match(match.round, match.match, match.player1, match.player2, -1, match.win, match.loss);
}


const names = ['a', 'b', 'c', 'd'];
const pairings = DoubleElimination(names);

console.log(pairings);


export {
    greatestPowerOf2LessThanOrEqualTo, isPowerOfTwo,
    getSaveData, saveKeyValue,
    serialize, deserialize,
    prepareMatches
}