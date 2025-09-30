import fs from 'fs';
import path, { dirname } from 'node:path';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
var spawn = require('child_process').spawn;
import { app, BrowserWindow, ipcMain } from 'electron';
function log(msg: string) {
    const logDir = path.join("C:\\Users\\yusef", "BracketBuddy");
    const logFile = path.join(logDir, "install.log");

    // ensure directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
}

log('App starting...');
log('Process argv: ' + process.argv.join(' '));

var cmd = process.argv[1];
var target = path.basename(process.execPath);

var run = function (args: any, done: any) {
    var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
    spawn(updateExe, args, {
        detached: true
    }).on('close', done);
};

if (cmd === '--squirrel-install' || cmd === '--squirrel-updated' || cmd === '--squirrel-firstrun') {
    log('Creating shortcut...');
    run(['--createShortcut=' + target + ''], app.quit);
    //app.quit();
    //process.exit(0);
}

import { fileURLToPath } from 'node:url';
import { load_all_tournaments, create_tournament, delete_tournament, add_bracket_to_tournament, remove_bracket_from_tournament } from './endpoints/tournament.js';
import { add_competitor_to_bracket, remove_competitor_from_bracket, start_bracket, update_bracket } from './endpoints/bracket.js';
import { ensure_save_environment, get_save_data, save_key_value, get_constants } from './endpoints/misc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const create_window = async () => {

    console.log('preload path: ' + path.join(__dirname, 'preload.js'))
    const window = new BrowserWindow({
        width: 1800,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), //keep in mind all paths like this are relative to the main.js file
        },
        title: "BracketBuddy",
        icon: path.join(process.resourcesPath, "assets/icon.ico")
    });

    if (app.isPackaged) {
        // Try MSI / Squirrel / unpacked locations
        await window.loadFile(path.join(process.resourcesPath, "build-react/index.html"));
    }
    else {
        try {
            await window.loadURL('http://localhost:5173');
        }
        catch (e) {
            console.log('Error loading dev server:', e);
        }
    }
}

// tournament
ipcMain.handle('load-all-tournaments', load_all_tournaments);
ipcMain.handle('create-tournament', create_tournament);
ipcMain.handle('delete-tournament', delete_tournament);
ipcMain.handle('add-bracket-to-tournament', add_bracket_to_tournament);
ipcMain.handle('remove-bracket-from-tournament', remove_bracket_from_tournament);

// bracket
ipcMain.handle('update-bracket', update_bracket);
ipcMain.handle('add-competitor-to-bracket', add_competitor_to_bracket);
ipcMain.handle('remove-competitor-from-bracket', remove_competitor_from_bracket);
ipcMain.handle('start-bracket', start_bracket);

// misc
ipcMain.handle('get-save-data', get_save_data);
ipcMain.handle('save-key-value', save_key_value);
ipcMain.handle('get-constants', get_constants);

const main = async () => {
    await app.whenReady();
    ensure_save_environment();
    create_window();
}

console.log('Starting BracketBuddy')

main();