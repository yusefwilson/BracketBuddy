import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import type {
    UpdateBracketInput,
    AddCompetitorToBracketInput,
    RemoveCompetitorFromBracketInput,
    RandomizeCompetitorsInput,
    ApiResponse
} from '../../src-shared/types.js';
import { successResponse, errorResponse } from '../../src-shared/utils.js';

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
    add_competitor_to_bracket,
    remove_competitor_from_bracket,
    randomize_competitors,
};
