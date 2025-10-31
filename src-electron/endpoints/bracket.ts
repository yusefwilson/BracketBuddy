import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import { load_tournament, save_tournament } from './tournament.js';
import { successResponse, errorResponse } from '../../src-shared/types.js';
import type {
    UpdateBracketInput,
    AddCompetitorToBracketInput,
    RemoveCompetitorFromBracketInput,
    StartBracketInput,
    RandomizeCompetitorsInput,
    ApiResponse
} from '../../src-shared/types.js';

const update_bracket = async (_: Electron.IpcMainInvokeEvent, input: UpdateBracketInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId, matchId, winner } = input;

        console.log('tournamentId: ', tournamentId);
        console.log('bracketId: ', bracketId);
        console.log('matchId: ', matchId);
        console.log('winner: ', winner);

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        if (!bracket) return errorResponse('Bracket not found. It may have been deleted.');

        bracket.updateMatchById(matchId, winner);
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error updating bracket:', error);
        return errorResponse('Failed to update match result. Please try again.');
    }
};

const add_competitor_to_bracket = async (_: Electron.IpcMainInvokeEvent, input: AddCompetitorToBracketInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId, competitorName } = input;

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        if (!bracket) return errorResponse('Bracket not found. It may have been deleted.');

        bracket.addCompetitor(competitorName);
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error adding competitor:', error);
        const message = error instanceof Error ? error.message : 'Failed to add competitor. Please try again.';

        if (message.includes('already exists')) {
            return errorResponse('This competitor is already in this bracket.');
        }
        return errorResponse(message);
    }
};

const remove_competitor_from_bracket = async (_: Electron.IpcMainInvokeEvent, input: RemoveCompetitorFromBracketInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId, competitorName } = input;

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        if (!bracket) return errorResponse('Bracket not found. It may have been deleted.');

        bracket.removeCompetitor(competitorName);
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error removing competitor:', error);
        return errorResponse('Failed to remove competitor. Please try again.');
    }
};

const start_bracket = async (_: Electron.IpcMainInvokeEvent, input: StartBracketInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId } = input;

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        if (!bracket) return errorResponse('Bracket not found. It may have been deleted.');

        bracket.initialize();
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error starting bracket:', error);
        return errorResponse('Failed to start bracket. Please try again.');
    }
};

const randomize_competitors = async (_: Electron.IpcMainInvokeEvent, input: RandomizeCompetitorsInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId } = input;

        const tournament = await load_tournament(_, tournamentId);
        const bracket = tournament.getBracket(bracketId);

        if (!bracket) return errorResponse('Bracket not found. It may have been deleted.');

        bracket.randomizeCompetitors();
        bracket.initialize();
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
    start_bracket,
    randomize_competitors,
};
