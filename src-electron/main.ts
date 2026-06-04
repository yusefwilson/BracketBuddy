import { check } from './installation.js';
// Wait for installation to complete, exit early if app is being uninstalled or is obsolete
if (!(await check())) {
    process.exit(0);
}

import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { app, BrowserWindow, ipcMain } from 'electron';

import { load_all_tournaments, load_one_tournament, create_tournament, delete_tournament, add_brackets_to_tournament, remove_bracket_from_tournament, export_to_AERS, export_to_pdf, export_to_jpg, export_tournament, import_tournament } from './endpoints/tournament.js';
import { add_competitor_to_bracket, remove_competitor_from_bracket, update_bracket, randomize_competitors, enter_round_robin_result, reset_round_robin_result } from './endpoints/bracket.js';
import { ensure_save_environment, get_saved_value, save_key_value, get_constants, open_url, save_data_to_file, load_file, get_zoom_level, set_zoom_level } from './endpoints/misc.js';
import { readFile } from 'fs/promises';
import { SAVE_FILE_PATH } from './constants.js';

const waitForDevServer = (url: string, timeout = 30000): Promise<void> => {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const tryConnect = () => {
            fetch(url, { signal: AbortSignal.timeout(1000) })
                .then(() => resolve())
                .catch(() => {
                    if (Date.now() - start > timeout) {
                        reject(new Error(`Dev server at ${url} did not start within ${timeout}ms`));
                    } else {
                        setTimeout(tryConnect, 500);
                    }
                });
        };
        tryConnect();
    });
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;

const create_window = async () => {

    console.log('preload path: ' + path.join(__dirname, 'preload.js'))
    mainWindow = new BrowserWindow({
        width: 1800,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), //keep in mind all paths like this are relative to the main.js file
        },
        title: 'BracketBuddy',
        icon: path.join(
            process.resourcesPath,
            'assets',
            process.platform === 'win32' ? 'icon.ico' : 'icon.icns'
        ),
        frame: false,
        titleBarStyle: 'hidden'
    });

    const window = mainWindow;

    if (app.isPackaged) {
        // Try MSI / Squirrel / unpacked locations
        await window.loadFile(path.join(process.resourcesPath, 'build-react/index.html'));
    }
    else {
        try {
            console.log('loading dev server');
            await waitForDevServer('http://localhost:5173');
            await window.loadURL('http://localhost:5173');
        }
        catch (e) {
            console.log('Error loading dev server:', e);
        }
    }

    // Load and apply saved zoom level
    try {
        const data = await readFile(SAVE_FILE_PATH, 'utf-8');
        const parsedData = JSON.parse(data);
        if (parsedData.zoomLevel !== undefined) {
            const zoomFactor = parsedData.zoomLevel / 100;
            window.webContents.setZoomFactor(zoomFactor);
        }
    } catch (error) {
        console.log('Could not load saved zoom level:', error);
    }
}

// tournament
ipcMain.handle('load-all-tournaments', load_all_tournaments);
ipcMain.handle('create-tournament', create_tournament);
ipcMain.handle('delete-tournament', delete_tournament);
ipcMain.handle('add-brackets-to-tournament', add_brackets_to_tournament);
ipcMain.handle('remove-bracket-from-tournament', remove_bracket_from_tournament);
ipcMain.handle('export-tournament', export_tournament);
ipcMain.handle('import-tournament', import_tournament);
ipcMain.handle('export-to-AERS', export_to_AERS);
ipcMain.handle('export-to-pdf', export_to_pdf);
ipcMain.handle('export-to-jpg', export_to_jpg);
ipcMain.handle('load-tournament', load_one_tournament);

// bracket
ipcMain.handle('update-bracket', update_bracket);
ipcMain.handle('enter-round-robin-result', enter_round_robin_result);
ipcMain.handle('reset-round-robin-result', reset_round_robin_result);
ipcMain.handle('add-competitor-to-bracket', add_competitor_to_bracket);
ipcMain.handle('remove-competitor-from-bracket', remove_competitor_from_bracket);
ipcMain.handle('randomize-competitors', randomize_competitors);

// misc
ipcMain.handle('get-saved-value', get_saved_value);
ipcMain.handle('save-key-value', save_key_value);
ipcMain.handle('get-constants', get_constants);
ipcMain.handle('open-url', open_url);
ipcMain.handle('save-file', save_data_to_file);
ipcMain.handle('load-file', load_file);
ipcMain.handle('get-zoom-level', get_zoom_level);
ipcMain.handle('set-zoom-level', set_zoom_level);

// window controls
ipcMain.handle('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.handle('window-close', () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
});

const main = async () => {
    await app.whenReady();
    ensure_save_environment();
    create_window();
}

console.log('Starting BracketBuddy')

main();