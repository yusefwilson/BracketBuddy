import { BracketDTO } from './BracketDTO';
import { DoubleEliminationBracketDTO } from './DoubleEliminationBracketDTO';
import { RoundRobinBracketDTO } from './RoundRobinBracketDTO';

/**
 * Checks if a bracket has started (i.e., any match has been completed or marked)
 */
export function isBracketStarted(bracket: DoubleEliminationBracketDTO): boolean {
    // Check if any matches in winners bracket have a non-UNDECIDED status
    for (const round of bracket.winnersBracket) {
        for (const match of round) {
            if (match.status !== 'UNDECIDED') {
                return true;
            }
        }
    }

    // Check if any matches in losers bracket have a non-UNDECIDED status
    for (const round of bracket.losersBracket) {
        for (const match of round) {
            if (match.status !== 'UNDECIDED') {
                return true;
            }
        }
    }

    // Check final match
    if (bracket.final && bracket.final.status !== 'UNDECIDED') {
        return true;
    }

    // Check final rematch
    if (bracket.finalRematch && bracket.finalRematch.status !== 'UNDECIDED') {
        return true;
    }

    return false;
}

/**
 * Checks if a round robin bracket has started (i.e., any match has a result entered)
 */
export function isRoundRobinBracketStarted(bracket: RoundRobinBracketDTO): boolean {
    for (const round of bracket.rounds) {
        for (const match of round) {
            if (match.status !== 'UNDECIDED') {
                return true;
            }
        }
    }

    return false;
}

/**
 * Type-dispatching "has this bracket started?" check usable on any BracketDTO.
 */
export function isAnyBracketStarted(bracket: BracketDTO): boolean {
    switch (bracket.type) {
        case 'RoundRobinBracket':
            return isRoundRobinBracketStarted(bracket as RoundRobinBracketDTO);
        case 'DoubleEliminationBracket':
            return isBracketStarted(bracket as DoubleEliminationBracketDTO);
        default:
            return false;
    }
}

/**
 * Whether a bracket has reached its conclusion.
 * - Round robin: every scheduled match has a result.
 * - Double elimination: a champion has been determined (firstPlace resolved) — the
 *   final rematch is only played when needed, so "champion determined" is the right
 *   notion of done rather than "every match decided".
 */
export function isBracketComplete(bracket: BracketDTO): boolean {
    switch (bracket.type) {
        case 'RoundRobinBracket': {
            const roundRobin = bracket as RoundRobinBracketDTO;
            return roundRobin.rounds.length > 0
                && roundRobin.rounds.every(round => round.every(match => match.status !== 'UNDECIDED'));
        }
        case 'DoubleEliminationBracket':
            return bracket.firstPlace !== undefined;
        default:
            return false;
    }
}
