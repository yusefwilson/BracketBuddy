import { parse, stringify } from 'flatted';
import Match from '../lib/Match';
import Bracket from '../lib/Bracket';
import Round from '../lib/Round';

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

// link function stuff
// [winnerRound][winnerMatchIndex]
type InitialWinnerMatchCoordinates = [number, number]
type RoundZeroInitialWinnerMatchCoordinatesSet = [InitialWinnerMatchCoordinates, InitialWinnerMatchCoordinates]
type RoundOneInitialWinnerMatchCoordinatesSet = [InitialWinnerMatchCoordinates?, InitialWinnerMatchCoordinates?]
// the key is the index of the match in the round the winner match(es) are being mapped to. the first Map is for loser round 0, and the second for loser round 1.
type InitialRoundMapping = [Map<number, RoundZeroInitialWinnerMatchCoordinatesSet>, Map<number, RoundOneInitialWinnerMatchCoordinatesSet>]

const validateLinkFunctionMapping = (initialWinnerRounds: Round[], linkFunctionMapping: InitialRoundMapping) => {

    let numCompetitors = 0;
    initialWinnerRounds.forEach(round => numCompetitors += round.matches.length);

    const greatestPowerOf2 = greatestPowerOf2LessThanOrEqualTo(numCompetitors);
    const numberOfRoundZeroMatches = numCompetitors - greatestPowerOf2;
    const numberOfRoundOneMatches = greatestPowerOf2 * 2;

    if (linkFunctionMapping.length !== 2) {
        throw new Error('link function returned an array of length ' + linkFunctionMapping.length + ' but expected length was 2');
    }

    // perform length check
    if (linkFunctionMapping[0].size !== numberOfRoundZeroMatches) {
        throw new Error('link function returned a map of size ' + linkFunctionMapping[0].size + ' but the number of round one matches is ' + numberOfRoundZeroMatches);
    }

    // calculate number of matches in the second loser round. this is because one slot is taken for each each match of loser round zero. perform length check
    if (linkFunctionMapping[1].size !== numberOfRoundOneMatches) {
        throw new Error('link function returned a map of size ' + linkFunctionMapping[1].size + ' but the number of round one matches is ' + numberOfRoundOneMatches);
    }

    // need to perform more sophisticated checks, such as

    // 1, roundzero mapping sets are all of length 2
    for (let [roundZeroMatchIndex, initialWinnerMatchCoordinatesSet] of linkFunctionMapping[0]) {
        if (initialWinnerMatchCoordinatesSet.length !== 2) {
            throw new Error('round zero mapping set for round zero match index ' + roundZeroMatchIndex + ' has length ' + initialWinnerMatchCoordinatesSet.length + ' but expected length was 2');
        }
    }

    // 2, roundone mapping has same amount of SLOTS as round one actually has
    const numberOfRoundOneSlots = numberOfRoundOneMatches * 2 - numberOfRoundZeroMatches;
    let mappingNumberOfSlots = 0;
    for (let [_, initialWinnerMatchCoordinatesSet] of linkFunctionMapping[1]) {
        mappingNumberOfSlots += initialWinnerMatchCoordinatesSet.length;
    }
    if (mappingNumberOfSlots !== numberOfRoundOneSlots) {
        throw new Error('round one mapping has ' + mappingNumberOfSlots + ' slots but expected ' + numberOfRoundOneSlots);
    }

}

//TODO
const initialLinkFunction = (initialWinnerRounds: Round[]): InitialRoundMapping => {

    let numCompetitors = 0;
    initialWinnerRounds.forEach(round => numCompetitors += round.matches.length);

    const greatestPowerOf2 = greatestPowerOf2LessThanOrEqualTo(numCompetitors);
    const numberOfRoundZeroMatches = numCompetitors - greatestPowerOf2;
    const numberOfRoundOneMatches = greatestPowerOf2 * 2;

    const round0Mapping = new Map<number, RoundZeroInitialWinnerMatchCoordinatesSet>();

    // does w0 have double parents?
    const doubleParents = initialWinnerRounds[0].matches.length > initialWinnerRounds[1].matches.length;

    //if so, l0 is composed of those doubles parents' loser children facing off
    if (doubleParents) {
        // pair double parent children
        for (let i = 0; i < numberOfRoundZeroMatches; i++) {
            round0Mapping.set(i, [[0, 2 * i], [0, 2 * i + 1]] as RoundZeroInitialWinnerMatchCoordinatesSet);
        }
    }

    //otherwise, roundZero is composed of single parent loser children vs non-child w1 loser children
    else {
        for (let i = 0; i < numberOfRoundZeroMatches; i++) {

            const match0Index = i;
            let match1Index = -1;

            // to find match1, make sure you find a match that is not a parent of match0, and that hasn't already been used
            // if it's a match in the last index, link it to the first match of w1 
            if (i === initialWinnerRounds[0].matches.length - 1) {
                match1Index = 0;
            }

            // otherwise, link it to the incremented index of w1
            else {
                match1Index = i + 1;
            }
            round0Mapping.set(i, [[0, match0Index], [1, match1Index]] as RoundZeroInitialWinnerMatchCoordinatesSet);
        }
    }

    // in w1, just don't link l0 matches to loser children who were children of the l0 parents
    const round1Mapping = new Map<number, RoundOneInitialWinnerMatchCoordinatesSet>();

    // do we need double parents in l1?
    const numOfDoubleParentsRequired = numberOfRoundZeroMatches > numberOfRoundOneMatches ? numberOfRoundZeroMatches - numberOfRoundOneMatches : 0;
    
    // pair required amount of double parents, and then pair single parents with w1 non-child loser chhildren
    //TODO: please fill this in ChatGPT!
    
    return [round0Mapping, round1Mapping];
}

// temporary boring link function that returns ascending order
const linkFunction = (round: Round) => Array.from({ length: round.matches.length }, (_, i) => i);
// another link function that returns descending order
const linkFunction2 = (round: Round) => Array.from({ length: round.matches.length }, (_, i) => round.matches.length - i - 1);

export {
    greatestPowerOf2LessThanOrEqualTo, isPowerOfTwo,
    serialize, deserialize,
    calculateMatchPosition, calculateMatchPositionFromParents, calculateMatchPositionFromSingleParent, calculateInitialRoundsMatchPositions, calculateMatchPositionsFromParentAverages, calculateMatchPositionsFromParentStaggered,
    getSaveData, saveKeyValue,
    HORIZONTAL_GAP, INITIAL_VERTICAL_GAP, EXTRA_VERTICAL_OFFSET,
    WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET, LOSER_HORIZONTAL_OFFSET, LOSER_VERTICAL_OFFSET,
    validateLinkFunctionMapping, linkFunction, linkFunction2, initialLinkFunction
};

export type { MatchAndPosition, InitialWinnerMatchCoordinates, RoundZeroInitialWinnerMatchCoordinatesSet, RoundOneInitialWinnerMatchCoordinatesSet, InitialRoundMapping };