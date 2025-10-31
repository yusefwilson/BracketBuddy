import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { SAVE_DIR, SAVE_FILE_NAME, SAVE_FILE_PATH } from '../constants.js';
import type { SaveKeyValueInput, ApiResponse } from '../../src-shared/types.js';
import { successResponse, errorResponse } from '../../src-shared/types.js';
import { shell, dialog } from 'electron';

/* MISC */

const get_save_data = async (_: Electron.IpcMainInvokeEvent): Promise<ApiResponse<Record<string, any>>> => {
    try {
        const data = await readFile(SAVE_FILE_PATH, 'utf-8');
        return successResponse(JSON.parse(data));
    } catch (error) {
        console.error('Error reading save data:', error);
        return errorResponse(error instanceof Error ? error.message : 'Failed to read save data');
    }
};

const save_key_value = async (_: Electron.IpcMainInvokeEvent, input: SaveKeyValueInput): Promise<ApiResponse<Record<string, any>>> => {
    try {
        const { key, value } = input;

        const data = await readFile(SAVE_FILE_PATH, 'utf-8');
        const parsedData = JSON.parse(data);
        parsedData[key] = value;
        await writeFile(SAVE_FILE_PATH, JSON.stringify(parsedData));

        return successResponse(parsedData);
    } catch (error) {
        console.error('Error saving key-value:', error);
        return errorResponse(error instanceof Error ? error.message : 'Failed to save key-value pair');
    }
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


const save_csv = async (_: Electron.IpcMainInvokeEvent, filename: string, data: string): Promise<ApiResponse<{ canceled: boolean; filePath?: string }>> => {
    try {
        const { filePath, canceled } = await dialog.showSaveDialog({
            title: 'Save CSV File',
            defaultPath: `${filename || 'export'}.csv`,
            filters: [
                { name: 'CSV Files', extensions: ['csv'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        });

        if (canceled || !filePath) {
            return successResponse({ canceled: true });
        }

        console.log('about to write file: ', filePath, 'with data: ', data);
        await writeFile(filePath, data, 'utf-8');
        console.log('just wrote file: ', filePath);
        return successResponse({ canceled: false, filePath });
    } catch (error) {
        console.error('Error saving CSV:', error);
        return errorResponse(error instanceof Error ? error.message : 'Failed to save CSV file');
    }
};

export { save_csv };

export {
    get_save_data,
    save_key_value,
    get_constants,
    ensure_save_environment,
    open_url
};
