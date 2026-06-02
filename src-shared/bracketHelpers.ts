import { DoubleEliminationBracketDTO } from './DoubleEliminationBracketDTO';

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
