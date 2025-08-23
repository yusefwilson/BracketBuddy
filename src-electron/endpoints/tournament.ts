import { readFile, writeFile, readdir, rename } from 'fs/promises';
import * as path from 'node:path';

import Tournament from '../lib/Tournament.js';
import { SAVE_DIR, SAVE_FILE_NAME } from '../constants.js';

/* TOURNAMENT */

const load_all_tournaments = async (_: Electron.IpcMainInvokeEvent): Promise<Tournament[]> => {
    const files = await readdir(SAVE_DIR);
    const tournaments = [];
    for (const file of files) {
        if (file.endsWith('.json') && file !== SAVE_FILE_NAME) {
            const tournament = await readFile(path.join(SAVE_DIR, file), 'utf-8');
            tournaments.push(tournament);
        }
    }

    const deserializedTournaments = [];

    // go through each tournament and deserialize it
    for (const tournamentData of tournaments) {
        deserializedTournaments.push(Tournament.deserialize(tournamentData));
    }

    return deserializedTournaments;
}

const save_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, serializedTournamentData: string): Promise<void> => {
    const filePath = path.join(SAVE_DIR, tournamentId + '.json');
    await writeFile(filePath, serializedTournamentData, 'utf-8');
    console.log('Saved tournament ' + tournamentId + ' to file ' + filePath);
}

const delete_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string): Promise<void> => {
    const filePath = path.join(SAVE_DIR, tournamentId + '.json');
    // just rename file so that it's ignored by load-all-tournaments and can be recovered if absolutely necessary
    await rename(filePath, filePath + '.deleted');
    console.log('Deleted tournament ' + tournamentId);
}

const load_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string): Promise<Tournament> => {
    const filePath = path.join(SAVE_DIR, tournamentId + '.json');
    const tournamentData = await readFile(filePath, 'utf-8');

    const tournament = Tournament.deserialize(tournamentData);

    return tournament;
}

export {
    load_all_tournaments,
    save_tournament,
    delete_tournament,
    load_tournament
}