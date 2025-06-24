import { parse, stringify } from 'flatted';
import Match from '../lib/Match';
import Bracket from '../lib/Bracket';

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

/* POSITIONAL LOGIC */
const HORIZONTAL_GAP = 225;
const INITIAL_VERTICAL_GAP = 100;
const EXTRA_VERTICAL_OFFSET = 25;

const WINNER_HORIZONTAL_OFFSET = 25;
const WINNER_VERTICAL_OFFSET = 25;
const LOSER_HORIZONTAL_OFFSET = 25;
const LOSER_VERTICAL_OFFSET = 25;

type MatchAndPosition = { match: Match, x: number, y: number };

// given information about a round, calculate where on the screen the match should be placed.
const calculateMatchPosition = (roundIndex: number, matchIndex: number, staggered: boolean, horizontal_offset: number, vertical_offset: number): number[] => {

    let x = roundIndex * HORIZONTAL_GAP + horizontal_offset;
    let y = matchIndex * INITIAL_VERTICAL_GAP + vertical_offset + (staggered ? EXTRA_VERTICAL_OFFSET : 0);
    return [x, y];
}

const calculateMatchPositionFromParents = (roundIndex: number, parentMatch0Height: number, parentMatch1Height: number, horizontal_offset: number): number[] => {
    let x = roundIndex * HORIZONTAL_GAP + horizontal_offset;
    let y = (parentMatch0Height + parentMatch1Height) / 2;
    return [x, y];
}

const calculateMatchPositionFromSingleParent = (roundIndex: number, staggered: boolean, parentMatchHeight: number, horizontal_offset: number): number[] => {
    let x = roundIndex * HORIZONTAL_GAP + horizontal_offset;
    let y = parentMatchHeight + (staggered ? EXTRA_VERTICAL_OFFSET : 0);
    return [x, y];
}

const calculateInitialRoundsMatchPositions = (bracket: Bracket, side: 'winner' | 'loser', horizontal_offset: number, vertical_offset: number): MatchAndPosition[][] => {
    const matches = [];
    let numberOfCompetitors, subBracket;

    // console.log('in calculateInitialRoundsMatchPositions with bracket: ', bracket);
    // console.log('calculating initial rounds match positions for side: ', side);
    // console.log('winnersBracket: ', bracket?.winnersBracket);
    // console.log('losersBracket: ', bracket?.losersBracket);

    subBracket = side === 'winner' ? bracket?.winnersBracket : bracket?.losersBracket;

    if (!subBracket || subBracket.length === 0) {
        console.warn(`No subBracket found for side: ${side}`);
        return [];
    }

    numberOfCompetitors = side === 'winner' ? (bracket?.competitorNames.length || 0) : ((bracket?.winnersBracket[0].matches.length || 0) + (bracket?.winnersBracket[1].matches.length || 0));


    // calculate initial rounds positions (if power of 2, only one round, if not power of 2, two rounds)
    if (!isPowerOfTwo(numberOfCompetitors)) {
        matches.push(subBracket[0].matches.map((match, index) => {
            let [x, y] = calculateMatchPosition(0, index, true, horizontal_offset, vertical_offset);
            return { match, x, y };
        }));
        matches.push(subBracket[1].matches.map((match, index) => {
            let [x, y] = calculateMatchPosition(1, index, false, horizontal_offset, vertical_offset);
            return { match, x, y };
        }));
    }
    else {
        matches.push(subBracket[0].matches.map((match, index) => {
            let [x, y] = calculateMatchPosition(0, index, false, horizontal_offset, vertical_offset);
            return { match, x, y };
        }));
    }

    return matches;
}

const calculateMatchPositionsFromParentAverages = (previousRoundMatches: MatchAndPosition[], matches: Match[], roundIndex: number) => {
    return matches.map((match, index) => {

        // edge case when there is one parent
        if (previousRoundMatches.length === 1) {
            const parentMatch = previousRoundMatches[0];
            const [x, y] = calculateMatchPositionFromParents(roundIndex, parentMatch.y, parentMatch.y, WINNER_HORIZONTAL_OFFSET);
            return { match, x, y };
        }

        // find parent matches using winnerMatches last round
        const parentMatch0 = previousRoundMatches[index * 2];
        const parentMatch1 = previousRoundMatches[index * 2 + 1];

        if (!parentMatch0 || !parentMatch1) {
            console.warn(`Parent matches not found for round index ${roundIndex} and match index ${index}`);
            return { match, x: 0, y: 0 }; // fallback
        }

        const [x, y] = calculateMatchPositionFromParents(roundIndex, parentMatch0.y, parentMatch1.y, WINNER_HORIZONTAL_OFFSET);
        return { match, x, y };
    });
}

const calculateMatchPositionsFromParentStaggered = (previousRoundMatches: MatchAndPosition[], matches: Match[], roundIndex: number) => {
    return matches.map((match, index) => {
        const correspondingMatch = previousRoundMatches[index];
        if (!correspondingMatch) {
            console.warn(`Corresponding match not found for round index ${roundIndex} and match index ${index} in previous round array ${previousRoundMatches}`);
            return { match, x: 0, y: 0 }; // fallback
        }

        const [x, y] = calculateMatchPositionFromSingleParent(roundIndex, true, correspondingMatch.y, LOSER_HORIZONTAL_OFFSET);
        return { match, x, y };
    });
}

const getSaveData = async (): Promise<Record<string, any>> => {
    const data = await window.electron.getSaveData();
    return data;
}

const saveKeyValue = async (key: string, value: any): Promise<void> => {
    await window.electron.saveKeyValue(key, value);
}

export {
    greatestPowerOf2LessThanOrEqualTo, isPowerOfTwo,
    serialize, deserialize,
    calculateMatchPosition, calculateMatchPositionFromParents, calculateMatchPositionFromSingleParent, calculateInitialRoundsMatchPositions, calculateMatchPositionsFromParentAverages, calculateMatchPositionsFromParentStaggered,
    getSaveData, saveKeyValue,
    HORIZONTAL_GAP, INITIAL_VERTICAL_GAP, EXTRA_VERTICAL_OFFSET,
    WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET, LOSER_HORIZONTAL_OFFSET, LOSER_VERTICAL_OFFSET,
};

export type { MatchAndPosition };