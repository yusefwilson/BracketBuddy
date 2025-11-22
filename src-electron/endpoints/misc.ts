import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

import { shell, dialog } from 'electron';

import type { SaveKeyValueInput, ApiResponse } from '../../src-shared/types.js';
import { successResponse, errorResponse } from '../../src-shared/utils.js';

import { SAVE_DIR, SAVE_FILE_NAME, SAVE_FILE_PATH } from '../constants.js';

// scan save file for requested keys
const get_saved_value = async (_: Electron.IpcMainInvokeEvent, key: string): Promise<ApiResponse<any>> => {
    try {
        const data = await readFile(SAVE_FILE_PATH, 'utf-8');
        const parsedData = JSON.parse(data);

        return successResponse(parsedData[key]);
    } catch (error) {
        console.error('Error reading saved value:', error);
        return errorResponse(error instanceof Error ? error.message : 'Failed to read saved value');
    }
};

// save key-value pair to save file
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

// get constants
const get_constants = async (_: Electron.IpcMainInvokeEvent) => {
    return {
        SAVE_FILE_NAME,
    };
};

// open url in default browser
const open_url = async (_: Electron.IpcMainInvokeEvent, url: string) => {
    await shell.openExternal(url);
};

// open file dialog to save file
const save_file = async (_: Electron.IpcMainInvokeEvent, filename: string, data: string): Promise<ApiResponse<{ canceled: boolean; filePath?: string }>> => {
    try {
        const { filePath, canceled } = await dialog.showSaveDialog({
            defaultPath: filename || 'export',
        });

        if (canceled || !filePath) {
            return successResponse({ canceled: true });
        }

        await writeFile(filePath, data, 'utf-8');

        return successResponse({ canceled: false, filePath });
    } catch (error) {
        console.error('Error saving file:', error);
        return errorResponse(error instanceof Error ? error.message : 'Failed to save file');
    }
};

// open file dialog to load file
const load_file = async (_: Electron.IpcMainInvokeEvent, fileExtension: string): Promise<ApiResponse<{ canceled: boolean; data?: string; filePath?: string }>> => {
    try {
        const { filePaths, canceled } = await dialog.showOpenDialog({
            filters: [
                { name: 'Files', extensions: [fileExtension] },
                { name: 'All Files', extensions: ['*'] },
            ],
            properties: ['openFile'],
        });

        if (canceled || !filePaths || filePaths.length === 0) {
            return successResponse({ canceled: true });
        }

        const filePath = filePaths[0];
        const data = await readFile(filePath, 'utf-8');
        return successResponse({ canceled: false, data, filePath });
    } catch (error) {
        console.error('Error loading file:', error);
        return errorResponse(error instanceof Error ? error.message : 'Failed to load file');
    }
};

// get zoom level
const get_zoom_level = async (event: Electron.IpcMainInvokeEvent): Promise<ApiResponse<number>> => {
    try {
        const zoomFactor = event.sender.getZoomFactor();
        // Convert zoom factor to percentage (1.0 = 100%)
        const zoomPercent = Math.round(zoomFactor * 100);
        return successResponse(zoomPercent);
    } catch (error) {
        console.error('Error getting zoom level:', error);
        return errorResponse(error instanceof Error ? error.message : 'Failed to get zoom level');
    }
};

// set zoom level
const set_zoom_level = async (event: Electron.IpcMainInvokeEvent, zoomPercent: number): Promise<ApiResponse<void>> => {
    try {
        // Convert percentage to zoom factor (100% = 1.0)
        const zoomFactor = zoomPercent / 100;
        event.sender.setZoomFactor(zoomFactor);

        // Also save to persistent storage
        const data = await readFile(SAVE_FILE_PATH, 'utf-8');
        const parsedData = JSON.parse(data);
        parsedData.zoomLevel = zoomPercent;
        await writeFile(SAVE_FILE_PATH, JSON.stringify(parsedData));

        return successResponse(undefined);
    } catch (error) {
        console.error('Error setting zoom level:', error);
        return errorResponse(error instanceof Error ? error.message : 'Failed to set zoom level');
    }
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


export { save_file, load_file, get_zoom_level, set_zoom_level };

export {
    get_saved_value,
    save_key_value,
    get_constants,
    ensure_save_environment,
    open_url
};
