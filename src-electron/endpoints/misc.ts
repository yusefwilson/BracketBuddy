import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { SAVE_DIR, SAVE_FILE_NAME, SAVE_FILE_PATH } from '../constants.js';
import type { SaveKeyValueInput } from '../../src-shared/types.js';
import { shell, dialog } from 'electron';

/* MISC */

const get_save_data = async (_: Electron.IpcMainInvokeEvent) => {
    const data = await readFile(SAVE_FILE_PATH, 'utf-8');
    return JSON.parse(data);
};

const save_key_value = async (_: Electron.IpcMainInvokeEvent, input: SaveKeyValueInput) => {
    const { key, value } = input;

    const data = await readFile(SAVE_FILE_PATH, 'utf-8');
    const parsedData = JSON.parse(data);
    parsedData[key] = value;
    await writeFile(SAVE_FILE_PATH, JSON.stringify(parsedData));

    return parsedData;
};

const get_constants = async (_: Electron.IpcMainInvokeEvent) => {
    return {
        SAVE_FILE_NAME,
    };
};

const ensure_save_environment = () => {
    // create save directory if it doesn't exist
    if (!existsSync(SAVE_DIR)) {
        mkdirSync(SAVE_DIR, { recursive: true });
        console.log('Created save directory at:', SAVE_DIR);
    }

    // create save file if it doesn't exist
    if (!existsSync(SAVE_FILE_PATH)) {
        writeFileSync(SAVE_FILE_PATH, '{}', 'utf-8');
        console.log('Created empty save file:', SAVE_FILE_PATH);
    }
};

const open_url = async (_: Electron.IpcMainInvokeEvent, url: string) => {
    await shell.openExternal(url);
};


const save_csv = async (_: Electron.IpcMainInvokeEvent, filename: string, data: string) => {

    const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Save CSV File',
        defaultPath: `${filename || 'export'}.csv`,
        filters: [
            { name: 'CSV Files', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    });

    if (canceled || !filePath) return { canceled: true };

    console.log('about to write file: ', filePath, 'with data: ', data);
    await writeFile(filePath, data, 'utf-8');
    console.log('just wrote file: ', filePath);
    return { canceled: false, filePath };
};

export { save_csv };

export {
    get_save_data,
    save_key_value,
    get_constants,
    ensure_save_environment,
    open_url
};
