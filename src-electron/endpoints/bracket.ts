import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import type {
    UpdateBracketInput,
    AddCompetitorToBracketInput,
    RemoveCompetitorFromBracketInput,
    RandomizeCompetitorsInput,
    EnterRoundRobinResultInput,
    ResetRoundRobinMatchInput,
    ApiResponse
} from '../../src-shared/types.js';
import { successResponse, errorResponse } from '../../src-shared/utils.js';

import RoundRobinBracket from '../lib/RoundRobinBracket.js';
import { load_tournament, save_tournament } from './tournament.js';

// update a match in a bracket with the specified status
const update_bracket = async (_: Electron.IpcMainInvokeEvent, input: UpdateBracketInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId, matchId, status } = input;

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        bracket.updateMatchById(matchId, status);
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error updating bracket:', error);
        return errorResponse('Failed to update match result. Please try again.');
    }
};

// enter point scores for a round robin match (winner is auto-derived; no draws)
const enter_round_robin_result = async (_: Electron.IpcMainInvokeEvent, input: EnterRoundRobinResultInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId, matchId, player1Score, player2Score } = input;

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        if (bracket.type !== 'RoundRobinBracket') {
            return errorResponse('Scores can only be entered for round robin brackets.');
        }

        (bracket as RoundRobinBracket).updateMatchScore(matchId, player1Score, player2Score);
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error entering round robin result:', error);
        const message = error instanceof Error ? error.message : 'Failed to enter result. Please try again.';
        return errorResponse(message);
    }
};

// clear a round robin match's result back to undecided
const reset_round_robin_result = async (_: Electron.IpcMainInvokeEvent, input: ResetRoundRobinMatchInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId, matchId } = input;

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        if (bracket.type !== 'RoundRobinBracket') {
            return errorResponse('Scores can only be reset for round robin brackets.');
        }

        (bracket as RoundRobinBracket).resetMatch(matchId);
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error resetting round robin result:', error);
        const message = error instanceof Error ? error.message : 'Failed to reset result. Please try again.';
        return errorResponse(message);
    }
};

// add a competitor to a bracket
const add_competitor_to_bracket = async (_: Electron.IpcMainInvokeEvent, input: AddCompetitorToBracketInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId, competitorName } = input;

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        bracket.addCompetitor(competitorName);
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error adding competitor:', error);
        const message = error instanceof Error ? error.message : 'Failed to add competitor. Please try again.';

        return errorResponse(message);
    }
};

// remove a competitor from a bracket
const remove_competitor_from_bracket = async (_: Electron.IpcMainInvokeEvent, input: RemoveCompetitorFromBracketInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId, competitorName } = input;

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        bracket.removeCompetitor(competitorName);
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error removing competitor:', error);
        return errorResponse('Failed to remove competitor. Please try again.');
    }
};

// randomize the competitors in a bracket
const randomize_competitors = async (_: Electron.IpcMainInvokeEvent, input: RandomizeCompetitorsInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId } = input;

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        bracket.randomizeCompetitors();

        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error randomizing competitors:', error);
        return errorResponse('Failed to randomize competitors. Please try again.');
    }
};

export {
    update_bracket,
    enter_round_robin_result,
    reset_round_robin_result,
    add_competitor_to_bracket,
    remove_competitor_from_bracket,
    randomize_competitors,
};
