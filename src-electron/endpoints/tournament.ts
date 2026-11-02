import { readFile, writeFile, readdir, rename } from 'fs/promises';
import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dialog, app, BrowserWindow } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import type {
    CreateTournamentInput,
    DeleteTournamentInput,
    AddBracketsToTournamentInput,
    RemoveBracketFromTournamentInput,
    ExportToAERSInput,
    ExportTournamentInput,
    ExportToPDFInput,
    ApiResponse
} from '../../src-shared/types.js';
import { successResponse, errorResponse } from '../../src-shared/utils.js';

import Tournament from '../lib/classes/Tournament.js';
import Bracket from '../lib/classes/Bracket.js';
import DoubleEliminationBracket from '../lib/classes/DoubleEliminationBracket.js';
import RoundRobinBracket from '../lib/classes/RoundRobinBracket.js';

import { SAVE_DIR, SAVE_FILE_NAME } from '../constants.js';
import { save_data_to_file, load_file } from './misc.js';
import { bracketsAreEqual } from '../lib/utils.js';

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

const delete_tournament = async (_: Electron.IpcMainInvokeEvent, input: DeleteTournamentInput): Promise<ApiResponse<string>> => {
    try {
        const { tournamentId } = input;

        const filePath = path.join(SAVE_DIR, tournamentId + '.json');
        await rename(filePath, filePath + '.deleted');

        console.log('Deleted tournament ' + tournamentId);
        return successResponse('success');

    } catch (error) {
        console.error('Error deleting tournament:', error);
        return errorResponse('Failed to delete tournament. Please try again.');
    }
};

const add_brackets_to_tournament = async (_: Electron.IpcMainInvokeEvent, input: AddBracketsToTournamentInput): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const { tournamentId, brackets } = input;
        const tournament = await load_tournament(_, tournamentId);

        // check if any brackets already exist in the tournament
        for (const bracket of brackets) {
            if (tournament.brackets.find(b => bracketsAreEqual(b, bracket))) {
                return errorResponse('At least one of the brackets being added already exists in the tournament.');
            }
        }

        for (const bracketData of brackets) {
            const { type, gender, experienceLevel, hand, weightLimit, competitorNames } = bracketData;

            let bracket: Bracket;
            switch (type ?? 'DoubleEliminationBracket') {
                case 'DoubleEliminationBracket':
                    bracket = new DoubleEliminationBracket(tournament, gender, experienceLevel, hand, weightLimit);
                    break;
                case 'RoundRobinBracket':
                    bracket = new RoundRobinBracket(tournament, gender, experienceLevel, hand, weightLimit);
                    break;
                default:
                    return errorResponse(`Bracket type "${type}" is not supported yet.`);
            }

            competitorNames.forEach(competitorName => bracket.addCompetitor(competitorName));
            await tournament.addBracket(bracket);
        }

        console.log('Added bracket to tournament ' + tournamentId);
        await save_tournament(_, tournament);

        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error adding bracket:', error);
        const message = error instanceof Error ? error.message : 'Failed to add bracket. Please try again.';
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

const export_to_AERS = async (_: Electron.IpcMainInvokeEvent, input: ExportToAERSInput): Promise<ApiResponse<{ canceled: boolean; filePath?: string }>> => {
    try {
        const { tournamentId } = input;
        const tournament = await load_tournament(_, tournamentId);

        // AERS' winner-per-match CSV format can't represent round robin scoring
        if (tournament.brackets.some(b => b.type === 'RoundRobinBracket')) {
            return errorResponse('AERS export is unavailable for tournaments with round-robin brackets.');
        }

        console.log('Exporting tournament ' + tournamentId + ' to AERS');
        const convertedAERSData = tournament.convertToAERS();
        return await save_data_to_file(_, `${tournament.name} - AERS.csv`, convertedAERSData);
    } catch (error) {
        console.error('Error exporting to AERS:', error);
        return errorResponse('Failed to export tournament. Please try again.');
    }
};

const open_report_window = async (tournamentId: string): Promise<BrowserWindow> => {
    const preloadPath = path.join(__dirname, '..', 'preload.js');
    const win = new BrowserWindow({
        width: 816, height: 1056, show: false,
        webPreferences: { preload: preloadPath },
    });

    if (app.isPackaged) {
        await win.loadFile(
            path.join(process.resourcesPath, 'build-react/index.html'),
            { hash: `/report/${tournamentId}` }
        );
    } else {
        await win.loadURL(`http://localhost:5173/#/report/${tournamentId}`);
    }

    // Poll until ReportPage signals it has finished rendering
    await new Promise<void>((resolve) => {
        const poll = async () => {
            const ready = await win.webContents
                .executeJavaScript('!!window.__reportReady')
                .catch(() => false);
            if (ready) resolve();
            else setTimeout(poll, 50);
        };
        poll();
    });

    return win;
};

const load_one_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string): Promise<ApiResponse<TournamentDTO>> => {
    try {
        const tournament = await load_tournament(_, tournamentId);
        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error loading tournament:', error);
        return errorResponse('Failed to load tournament. Please try again.');
    }
};

const export_to_pdf = async (_: Electron.IpcMainInvokeEvent, input: ExportToPDFInput): Promise<ApiResponse<{ canceled: boolean; filePath?: string }>> => {
    try {
        const { tournamentId } = input;
        const tournament = await load_tournament(_, tournamentId);

        const win = await open_report_window(tournamentId);
        const pdfData = await win.webContents.printToPDF({
            pageSize: 'Letter',
            printBackground: false,
            margins: { marginType: 'default' },
        });
        win.destroy();

        const { filePath, canceled } = await dialog.showSaveDialog({
            defaultPath: `${tournament.name}.pdf`,
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
        });

        if (canceled || !filePath) return successResponse({ canceled: true });

        await writeFile(filePath, pdfData);
        console.log('Exported tournament ' + tournamentId + ' to PDF');
        return successResponse({ canceled: false, filePath });
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        return errorResponse('Failed to export tournament as PDF. Please try again.');
    }
};

const export_to_jpg = async (_: Electron.IpcMainInvokeEvent, input: ExportToPDFInput): Promise<ApiResponse<{ canceled: boolean; filePath?: string }>> => {
    try {
        const { tournamentId } = input;
        const tournament = await load_tournament(_, tournamentId);

        const win = await open_report_window(tournamentId);
        const scrollHeight: number = await win.webContents.executeJavaScript(
            'document.documentElement.scrollHeight'
        );
        win.setContentSize(816, Math.min(scrollHeight, 32000));
        await new Promise(r => setTimeout(r, 150));

        const captured = await win.webContents.capturePage();
        win.destroy();

        const jpegBuffer = captured.toJPEG(90);

        const { filePath, canceled } = await dialog.showSaveDialog({
            defaultPath: `${tournament.name}.jpg`,
            filters: [{ name: 'JPEG Images', extensions: ['jpg', 'jpeg'] }],
        });

        if (canceled || !filePath) return successResponse({ canceled: true });

        await writeFile(filePath, jpegBuffer);
        console.log('Exported tournament ' + tournamentId + ' to JPEG');
        return successResponse({ canceled: false, filePath });
    } catch (error) {
        console.error('Error exporting to JPEG:', error);
        return errorResponse('Failed to export tournament as JPEG. Please try again.');
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

const export_tournament = async (_: Electron.IpcMainInvokeEvent, input: ExportTournamentInput): Promise<ApiResponse<{ canceled: boolean; filePath?: string }>> => {
    try {
        const { tournamentId } = input;
        const tournament = await load_tournament(_, tournamentId);
        const serializedData = tournament.serialize();

        return await save_data_to_file(_, `${tournament.name}.bb`, serializedData);
    } catch (error) {
        console.error('Error exporting tournament:', error);
        return errorResponse(error instanceof Error ? error.message : 'Failed to export tournament');
    }
};

const import_tournament = async (_: Electron.IpcMainInvokeEvent): Promise<ApiResponse<TournamentDTO | null>> => {
    try {
        const loadResult = await load_file(_, 'bb');

        if (!loadResult.success || !loadResult.data) {
            return errorResponse('Failed to load tournament files');
        }

        if (loadResult.data.canceled) {
            return successResponse(null); // User canceled
        }

        const tournament = Tournament.deserialize(loadResult.data.data!);

        // Save the imported tournament to the internal storage
        await save_tournament(_, tournament);

        console.log('Imported tournament ' + tournament.id);
        return successResponse(tournament.toDTO());
    } catch (error) {
        console.error('Error importing tournament:', error);
        return errorResponse(error instanceof Error ? error.message : 'Failed to import tournament');
    }
};

export {
    load_all_tournaments,
    load_one_tournament,
    create_tournament,
    delete_tournament,
    add_brackets_to_tournament,
    remove_bracket_from_tournament,
    load_tournament,
    save_tournament,
    export_to_AERS,
    export_to_pdf,
    export_to_jpg,
    export_tournament,
    import_tournament
};
