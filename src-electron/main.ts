import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'node:path';
import fs from 'fs';

// so that the app reloads when the code changes in development
app.isPackaged || require('electron-reloader')(module);

const DEV = true;
const SAVE_DIR = app.getPath('userData');

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
        await window.loadURL('http://localhost:5173');
    }
    else {
        await window.loadFile('../src-react/dist/index.html');
    }
}

ipcMain.handle('read-file', async (_, filePath) => {
    const data = fs.promises.readFile(filePath, 'utf-8');
    return data;
});

ipcMain.handle('write-file', async (_, filePath, data) => {
    await fs.promises.writeFile(filePath, data, 'utf-8');
});

ipcMain.handle('load-all-tournaments', async (_) => {
    const files = await fs.promises.readdir(SAVE_DIR);
    const tournaments = [];
    for (const file of files) {
        if (file.endsWith('.json')) {
            const tournament = await fs.promises.readFile(path.join(SAVE_DIR, file), 'utf-8');
            tournaments.push(tournament);
        }
    }
    console.log('Loaded all tournaments: ');
    return tournaments;
});

ipcMain.handle('save-tournament', async (_, tournamentName, serializedTournamentData) => {
    const filePath = path.join(SAVE_DIR, tournamentName + '.json');
    await fs.promises.writeFile(filePath, serializedTournamentData, 'utf-8');
    console.log('Saved tournament ' + tournamentName + ' to file ' + filePath);
});

ipcMain.handle('delete-tournament', async (_, tournamentName) => {
    const filePath = path.join(SAVE_DIR, tournamentName + '.json');
    // just rename file so that it's ignored by load-all-tournaments and can be recovered if absolutely necessary
    await fs.promises.rename(filePath, filePath + '.deleted');
    console.log('Deleted tournament ' + tournamentName);
}
);

const main = async () => {
    await app.whenReady();
    create_window();
}

main();