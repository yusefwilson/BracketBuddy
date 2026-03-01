import { readFile, writeFile, readdir, rename } from 'fs/promises';
import { PassThrough } from 'stream';
import * as path from 'node:path';

import { dialog, app } from 'electron';
import PDFDocument from 'pdfkit';

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

import Tournament from '../lib/Tournament.js';
import Bracket from '../lib/Bracket.js';

import { SAVE_DIR, SAVE_FILE_NAME } from '../constants.js';
import { save_file, load_file } from './misc.js';
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
        console.log('Exporting tournament ' + tournamentId + ' to AERS');
        const convertedAERSData = tournament.convertToAERS();
        return await save_file(_, `${tournament.name} - AERS.csv`, convertedAERSData);
    } catch (error) {
        console.error('Error exporting to AERS:', error);
        return errorResponse('Failed to export tournament. Please try again.');
    }
};

const export_to_pdf = async (_: Electron.IpcMainInvokeEvent, input: ExportToPDFInput): Promise<ApiResponse<{ canceled: boolean; filePath?: string }>> => {
    try {
        const { tournamentId } = input;
        const tournament = await load_tournament(_, tournamentId);

        // Build PDF entirely in memory first — no file is created until generation succeeds
        const doc = new PDFDocument({ margin: 40 });
        const buffer = new PassThrough();
        const chunks: Buffer[] = [];

        doc.pipe(buffer);

        const totalEntries = tournament.brackets.reduce((sum, b) => sum + b.competitorNames.length, 0);
        const uniqueCompetitors = new Set(tournament.brackets.flatMap(b => b.competitorNames)).size;

        // "Generated by BracketBuddy" branding in top-right corner
        const logoPath = app.isPackaged
            ? path.join(process.resourcesPath, 'assets', 'logo.png')
            : path.join(process.cwd(), 'assets', 'logo.png');
        const logoSize = 18;
        const brandingY = 10;
        const labelText = 'Generated by BracketBuddy';
        const labelWidth = 122;
        const logoX = doc.page.width - doc.page.margins.right - logoSize;
        const labelX = logoX - 4 - labelWidth;
        try {
            const logoBuffer = await readFile(logoPath);
            doc.image(logoBuffer, logoX, brandingY, { width: logoSize, height: logoSize });
        } catch { /* logo unavailable */ }
        doc.fontSize(8).font('Helvetica').fillColor('#aaaaaa')
            .text(labelText, labelX, brandingY + 5, { width: labelWidth, align: 'right', lineBreak: false });

        // Header
        const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#000000')
            .text(tournament.name, doc.page.margins.left, doc.page.margins.top, { align: 'center', width: contentWidth });
        doc.fontSize(11).font('Helvetica').fillColor('#555555')
            .text(tournament.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), { align: 'center', width: contentWidth });
        doc.moveDown(1);

        // Tournament summary
        doc.fontSize(11).font('Helvetica').fillColor('#000000')
            .text(`Classes: ${tournament.brackets.length}`)
            .text(`Unique competitors: ${uniqueCompetitors}`)
            .text(`Total entries: ${totalEntries}`);
        doc.moveDown(1.5);

        // Per-class results
        for (const bracket of tournament.brackets) {
            const weightLabel = bracket.weightLimit === 'Superheavyweight' ? 'Superheavyweight' : `${bracket.weightLimit} lbs`;
            const bracketTitle = `${bracket.gender} ${bracket.experienceLevel} — ${weightLabel} — ${bracket.hand} Hand`;

            doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text(bracketTitle);
            doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke('#aaaaaa');
            doc.moveDown(0.4);

            doc.fontSize(10).font('Helvetica').fillColor('#555555').text(`Entries: ${bracket.competitorNames.length}`);
            doc.moveDown(0.3);

            const first = bracket.getFirstPlace();
            const second = bracket.getSecondPlace();
            const third = bracket.getThirdPlace();
            doc.fontSize(10).font('Helvetica').fillColor('#333333')
                .text(`1st: ${first ?? '—'}`)
                .text(`2nd: ${second ?? '—'}`)
                .text(`3rd: ${third ?? '—'}`);

            doc.moveDown(1);
        }

        doc.end();

        // add event listeners that store chunks of streamed data, and concatenate all chunks at end
        // this must happen after the stream logic is completed, because otherwise the 'end' event is never sent and the Promise never resolves.
        const pdfData = await new Promise<Buffer>((resolve, reject) => {
            buffer.on('data', (chunk) => chunks.push(chunk));
            buffer.on('end', () => resolve(Buffer.concat(chunks)));
            buffer.on('error', reject);
        });

        // PDF is fully built — now show the dialog and write atomically
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

        return await save_file(_, `${tournament.name}.bb`, serializedData);
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
    create_tournament,
    delete_tournament,
    add_brackets_to_tournament,
    remove_bracket_from_tournament,
    load_tournament,
    save_tournament,
    export_to_AERS,
    export_to_pdf,
    export_tournament,
    import_tournament
};
