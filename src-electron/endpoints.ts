import fs from 'fs';
import { SAVE_DIR, SAVE_FILE_NAME, SAVE_FILE_PATH } from './constants';
import * as path from 'node:path';

/* TOURNAMENT */

const load_all_tournaments = async (_: Electron.IpcMainInvokeEvent) => {
    const files = await fs.promises.readdir(SAVE_DIR);
    const tournaments = [];
    for (const file of files) {
        if (file.endsWith('.json') && file !== SAVE_FILE_NAME) {
            const tournament = await fs.promises.readFile(path.join(SAVE_DIR, file), 'utf-8');
            tournaments.push(tournament);
        }
    }
    return tournaments;
}

const save_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentName: string, serializedTournamentData: string) => {
    const filePath = path.join(SAVE_DIR, tournamentName + '.json');
    await fs.promises.writeFile(filePath, serializedTournamentData, 'utf-8');
    console.log('Saved tournament ' + tournamentName + ' to file ' + filePath);
}

const delete_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentName: string) => {
    const filePath = path.join(SAVE_DIR, tournamentName + '.json');
    // just rename file so that it's ignored by load-all-tournaments and can be recovered if absolutely necessary
    await fs.promises.rename(filePath, filePath + '.deleted');
    console.log('Deleted tournament ' + tournamentName);
}


/* MISC */

const get_save_data = async (_: Electron.IpcMainInvokeEvent) => {
    const data = await fs.promises.readFile(SAVE_FILE_PATH, 'utf-8');
    return JSON.parse(data);
}

const save_key_value = async (_: Electron.IpcMainInvokeEvent, key: string, value: any) => {
    const data = await fs.promises.readFile(SAVE_FILE_PATH, 'utf-8');
    console.log('data: ', data);
    const parsedData = JSON.parse(data);
    parsedData[key] = value;
    await fs.promises.writeFile(SAVE_FILE_PATH, JSON.stringify(parsedData));
    return parsedData;
}

const get_constants = async (_: Electron.IpcMainInvokeEvent) => {
    return {
        SAVE_FILE_NAME
    };
}

const ensure_save_environment = () => {

    // create save directory if it doesn't exist
    if (!fs.existsSync(SAVE_DIR)) {
        fs.mkdirSync(SAVE_DIR, { recursive: true });
        console.log('Created save directory at:', SAVE_DIR);
    }

    // create save file if it doesn't exist
    if (!fs.existsSync(SAVE_FILE_PATH)) {
        fs.writeFileSync(SAVE_FILE_PATH, '{}', 'utf-8');
        console.log('Created empty save file:', SAVE_FILE_PATH);
    }
};

export {
    load_all_tournaments,
    save_tournament,
    delete_tournament,
    get_save_data,
    save_key_value,
    get_constants,
    ensure_save_environment
}