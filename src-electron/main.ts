import { app, BrowserWindow, ipcMain } from 'electron';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { load_all_tournaments, save_tournament, delete_tournament } from './endpoints/tournament.js';
import { ensure_save_environment, get_save_data, save_key_value, get_constants } from './endpoints/misc.js';

import { DEV } from './constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const create_window = async () => {

    console.log('preload path: ' + path.join(__dirname, 'preload.js'))
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js') //keep in mind all paths like this are relative to the main.js file, which is currently in ./dist
        }
    });

    if (DEV) {
        try {
            await window.loadURL('http://localhost:5173');
        }
        catch (e) {
            console.log('Error loading dev server:', e);
            console.log('hi')
        }
    }
    else {
        await window.loadFile('../src-react/dist/index.html');
    }
}

ipcMain.handle('load-all-tournaments', load_all_tournaments);
ipcMain.handle('save-tournament', save_tournament);
ipcMain.handle('delete-tournament', delete_tournament);
ipcMain.handle('get-save-data', get_save_data);
ipcMain.handle('save-key-value', save_key_value);
ipcMain.handle('get-constants', get_constants);

const main = async () => {
    await app.whenReady();
    ensure_save_environment();
    create_window();
}

main();