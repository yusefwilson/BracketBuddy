import { BracketDTO } from './BracketDTO';
import { MatchDTO } from './MatchDTO';

/* MATH */
function greatestPowerOf2LessThanOrEqualTo(n: number): number {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
}

function isPowerOfTwo(n: number) { return n > 0 && (n & (n - 1)) === 0; };

/* POSITIONAL LOGIC */
const HORIZONTAL_GAP = 225;
const INITIAL_VERTICAL_GAP = 100;
const EXTRA_VERTICAL_OFFSET = 25;

const WINNER_HORIZONTAL_OFFSET = 12;
const WINNER_VERTICAL_OFFSET = 12;
const LOSER_HORIZONTAL_OFFSET = 12;
const LOSER_VERTICAL_OFFSET = 12;

type MatchAndPosition = { match: MatchDTO, x: number, y: number };

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

const calculateInitialRoundsMatchPositions = (bracket: BracketDTO, side: 'winner' | 'loser', horizontal_offset: number, vertical_offset: number): MatchAndPosition[][] => {
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

    numberOfCompetitors = side === 'winner' ? (bracket?.competitorNames.length || 0) : ((bracket?.winnersBracket[0].length || 0) + (bracket?.winnersBracket[1].length || 0));


    // calculate initial rounds positions (if power of 2, only one round, if not power of 2, two rounds)
    if (!isPowerOfTwo(numberOfCompetitors)) {
        matches.push(subBracket[0].map((match, index) => {
            let [x, y] = calculateMatchPosition(0, index, true, horizontal_offset, vertical_offset);
            return { match, x, y };
        }));
        matches.push(subBracket[1].map((match, index) => {
            let [x, y] = calculateMatchPosition(1, index, false, horizontal_offset, vertical_offset);
            return { match, x, y };
        }));
    }
    else {
        matches.push(subBracket[0].map((match, index) => {
            let [x, y] = calculateMatchPosition(0, index, false, horizontal_offset, vertical_offset);
            return { match, x, y };
        }));
    }

    return matches;
}

const calculateMatchPositionsFromParentAverages = (previousRoundMatches: MatchAndPosition[], matches: MatchDTO[], roundIndex: number) => {
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

const calculateMatchPositionsFromParentStaggered = (previousRoundMatches: MatchAndPosition[], matches: MatchDTO[], roundIndex: number) => {
    return matches.map((match, index) => {
        const correspondingMatch = previousRoundMatches[index];
        if (!correspondingMatch) {
            console.warn(`Corresponding match not found for round index ${roundIndex} and match index ${index} in previous round array ${previousRoundMatches}`);
            return { match, x: 0, y: 0 }; // fallback
        }

        const [x, y] = calculateMatchPositionFromSingleParent(roundIndex, previousRoundMatches.length !== 1, correspondingMatch.y, LOSER_HORIZONTAL_OFFSET);
        return { match, x, y };
    });
}

const calculateAllMatchPositions = (bracket: BracketDTO): { winnerMatches: MatchAndPosition[], loserMatches: MatchAndPosition[], final: MatchAndPosition, finalRematch: MatchAndPosition, WINNERS_BOTTOM: number, LAST_WINNER_Y: number, WINNERS_RIGHTMOST: number } => {

    let winnerMatches: MatchAndPosition[] = [], loserMatches: MatchAndPosition[] = [], WINNERS_BOTTOM = 0, LAST_WINNER_Y = 0, WINNERS_RIGHTMOST = 0;

    if (bracket.competitorNames && bracket.competitorNames.length >= 2) {
        // {match, x, y}[][]
        const winnerRounds = calculateInitialRoundsMatchPositions(bracket as BracketDTO, 'winner', WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET);
        const initialWinnerMatches = winnerRounds.slice();

        // iteratively calculate the positions of the rest of the matches by referencing and taking averages of the heights of their parents
        for (
            let roundIndex = isPowerOfTwo(bracket.competitorNames.length) ? 1 : 2;
            roundIndex < (bracket.winnersBracket.length || 0);
            roundIndex++
        ) {
            const previousRound = winnerRounds[roundIndex - 1];

            if (!previousRound || previousRound.length === 0) {
                console.warn(`No matches found for round index ${roundIndex - 1}`);
                continue;
            }
            const nextRound = calculateMatchPositionsFromParentAverages(previousRound, bracket.winnersBracket[roundIndex] || [], roundIndex);

            winnerRounds.push(nextRound);
        }

        // flatten the winnerMatches array
        winnerMatches = winnerRounds.flat();
        // find max y value (lowest point) to use as reference point for losers bracket
        // find max x value (rightmost point) to use as reference point for the finals matches
        WINNERS_BOTTOM = Math.max(...winnerMatches.map((m) => m?.y || 0)) + 100;
        WINNERS_RIGHTMOST = Math.max(...winnerMatches.map((m) => m?.x || 0));
        LAST_WINNER_Y = winnerMatches[winnerMatches.length - 1]?.y || 0;

        // **** RENDER LOSERS BRACKET ****
        // {match, x, y}[][]
        const loserRounds = calculateInitialRoundsMatchPositions(
            bracket as BracketDTO,
            'loser',
            LOSER_HORIZONTAL_OFFSET,
            WINNERS_BOTTOM + LOSER_VERTICAL_OFFSET
        );
        const initialLoserRounds = loserRounds.slice();

        // figure out whether match numbers stay constant or halve on even rounds based on index-1 match numbers
        let halving: boolean;
        if (initialWinnerMatches[initialWinnerMatches.length - 1]?.length === initialLoserRounds[initialLoserRounds.length - 1]?.length || isPowerOfTwo(bracket.competitorNames.length)) {
            halving = true;
        } else {
            halving = false;
        }

        for (let roundIndex = loserRounds.length === 1 ? 1 : 2; roundIndex < (bracket.losersBracket.length || 0); roundIndex++) {
            const previousRoundMatches = loserRounds[roundIndex - 1];
            // if previous round somehow didn't exist or is empty
            if (!previousRoundMatches || previousRoundMatches.length === 0) continue;

            const nextRound = halving
                ? calculateMatchPositionsFromParentAverages(previousRoundMatches, bracket.losersBracket[roundIndex] || [], roundIndex)
                : calculateMatchPositionsFromParentStaggered(previousRoundMatches, bracket.losersBracket[roundIndex] || [], roundIndex);

            loserRounds.push(nextRound);
            halving = !halving;
        }

        loserMatches = loserRounds.flat();
    }

    const final = {
        match: bracket.final,
        x: WINNERS_RIGHTMOST + HORIZONTAL_GAP,
        y: LAST_WINNER_Y,
    } as MatchAndPosition;

    const finalRematch = {
        match: bracket.finalRematch,
        x: WINNERS_RIGHTMOST + 2 * HORIZONTAL_GAP,
        y: LAST_WINNER_Y,
    } as MatchAndPosition;

    return { winnerMatches, loserMatches, final, finalRematch, WINNERS_BOTTOM, LAST_WINNER_Y, WINNERS_RIGHTMOST };
}

const dateToLocalTimezoneString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export {
    greatestPowerOf2LessThanOrEqualTo, isPowerOfTwo,
    calculateAllMatchPositions,
    WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET, LOSER_HORIZONTAL_OFFSET, LOSER_VERTICAL_OFFSET, HORIZONTAL_GAP,
    INITIAL_VERTICAL_GAP, EXTRA_VERTICAL_OFFSET,
    dateToLocalTimezoneString
};

export type { MatchAndPosition };