import { readFile, writeFile, readdir, rename } from 'fs/promises';
import * as path from 'node:path';

import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import type {
    CreateTournamentInput,
    DeleteTournamentInput,
    AddBracketsToTournamentInput,
    RemoveBracketFromTournamentInput,
    ConvertToAERSInput,
    ApiResponse
} from '../../src-shared/types.js';
import { successResponse, errorResponse } from '../../src-shared/utils.js';

import Tournament from '../lib/Tournament.js';
import Bracket from '../lib/Bracket.js';

import { SAVE_DIR, SAVE_FILE_NAME } from '../constants.js';

const load_all_tournaments = async (_: Electron.IpcMainInvokeEvent): Promise<ApiResponse<TournamentDTO[]>> => {
    try {
        console.log('loading all tournaments');
        const files = await readdir(SAVE_DIR);
        const tournaments = [];
        for (const file of files) {
            if (file.endsWith('.json') && file !== SAVE_FILE_NAME) {
                const tournament = await readFile(path.join(SAVE_DIR, file), 'utf-8');
                tournaments.push(tournament);
            }
        }

        const deserializedTournaments = [];
        for (const tournamentData of tournaments) {
            const tournament = Tournament.deserialize(tournamentData);
            deserializedTournaments.push(tournament.toDTO());
        }

        return successResponse(deserializedTournaments);
    } catch (error) {
        console.error('Error loading tournaments:', error);
        return errorResponse('Failed to load tournaments. Please try again.');
    }
};

const create_tournament = async (_: Electron.IpcMainInvokeEvent, input: CreateTournamentInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { name, date } = input;
        const tournament = new Tournament(name, date);
        console.log('about to save tournament ' + tournament.id);
        await save_tournament(_, tournament);
        console.log('Created tournament ' + tournament.id);
        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error creating tournament:', error);
        return errorResponse('Failed to create tournament. Please try again.');
    }
};

const delete_tournament = async (_: Electron.IpcMainInvokeEvent, input: DeleteTournamentInput): Promise<ApiResponse<void>> => {
    try {
        const { tournamentId } = input;
        const filePath = path.join(SAVE_DIR, tournamentId + '.json');
        await rename(filePath, filePath + '.deleted');
        console.log('Deleted tournament ' + tournamentId);
        return successResponse(undefined);
    } catch (error) {
        console.error('Error deleting tournament:', error);
        return errorResponse('Failed to delete tournament. Please try again.');
    }
};

const add_brackets_to_tournament = async (_: Electron.IpcMainInvokeEvent, input: AddBracketsToTournamentInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, brackets } = input;
        const tournament = await load_tournament(_, tournamentId);

        for (const bracketData of brackets) {
            const { gender, experienceLevel, hand, weightLimit, competitorNames } = bracketData;
            const bracket = new Bracket(tournament, gender, experienceLevel, hand, weightLimit);
            competitorNames.forEach(competitorName => bracket.addCompetitor(competitorName));
            await tournament.addBracket(bracket);
        }

        console.log('Added bracket to tournament ' + tournamentId);
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error adding bracket:', error);
        const message = error instanceof Error ? error.message : 'Failed to add bracket. Please try again.';

        if (message.includes('already exists')) {
            return errorResponse('A bracket with these properties already exists in this tournament.');
        }
        return errorResponse(message);
    }
};

const remove_bracket_from_tournament = async (_: Electron.IpcMainInvokeEvent, input: RemoveBracketFromTournamentInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, bracketId } = input;
        const tournament = await load_tournament(_, tournamentId);
        await tournament.removeBracket(bracketId);
        await save_tournament(_, tournament);

        console.log('Removed bracket from tournament ' + tournamentId);
        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error removing bracket:', error);
        return errorResponse('Failed to remove bracket. Please try again.');
    }
};

const convert_to_AERS = async (_: Electron.IpcMainInvokeEvent, input: ConvertToAERSInput): Promise<ApiResponse<string>> => {
    try {
        const { tournamentId } = input;
        const tournament = await load_tournament(_, tournamentId);
        console.log('Exporting tournament ' + tournamentId + ' to AERS');
        return successResponse(tournament.exportToAERS());
    } catch (error) {
        console.error('Error exporting to AERS:', error);
        return errorResponse('Failed to export tournament. Please try again.');
    }
};

const load_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string): Promise<Tournament> => {
    const filePath = path.join(SAVE_DIR, tournamentId + '.json');
    const tournamentData = await readFile(filePath, 'utf-8');
    return Tournament.deserialize(tournamentData);
};

const save_tournament = async (_: Electron.IpcMainInvokeEvent, tournament: Tournament): Promise<void> => {
    const tournamentId = tournament.id;
    const serializedTournamentData = tournament.serialize();
    const filePath = path.join(SAVE_DIR, tournamentId + '.json');
    console.log('saving tournament ' + tournamentId + ' to file ' + filePath);
    await writeFile(filePath, serializedTournamentData, 'utf-8');
    console.log('Saved tournament ' + tournamentId + ' to file ' + filePath);
};

export {
    load_all_tournaments,
    create_tournament,
    delete_tournament,
    add_brackets_to_tournament,
    remove_bracket_from_tournament,
    load_tournament,
    save_tournament,
    convert_to_AERS
};
