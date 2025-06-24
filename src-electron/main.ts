import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'node:path';
import fs from 'fs';

// so that the app reloads when the code changes in development
app.isPackaged || require('electron-reloader')(module);

const DEV = true;
const SAVE_DIR = app.getPath('userData');
const SAVE_FILE_NAME = 'BB_SAVE_FILE.json';
const SAVE_FILE_PATH = path.join(SAVE_DIR, SAVE_FILE_NAME);

const ensure_save_environment = () => {

    // create save directory if it doesn't exist
    if (!fs.existsSync(SAVE_DIR)) {
        fs.mkdirSync(SAVE_DIR, { recursive: true });
        console.log('Created save directory at:', SAVE_DIR);
    }

    // create save file if it doesn't exist
    if (!fs.existsSync(SAVE_FILE_PATH)) {
        fs.writeFileSync(SAVE_FILE_PATH, '', 'utf-8');
        console.log('Created empty save file:', SAVE_FILE_PATH);
    }
};

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

ipcMain.handle('load-all-tournaments', async (_) => {
    const files = await fs.promises.readdir(SAVE_DIR);
    const tournaments = [];
    for (const file of files) {
        if (file.endsWith('.json') && file !== SAVE_FILE_NAME) {
            const tournament = await fs.promises.readFile(path.join(SAVE_DIR, file), 'utf-8');
            tournaments.push(tournament);
        }
    }
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

ipcMain.handle('get-save-data', async () => {
    const data = await fs.promises.readFile(SAVE_FILE_PATH, 'utf-8');
    return JSON.parse(data);
});

ipcMain.handle('save-key-value', async (_, key, value) => {
    const data = await fs.promises.readFile(SAVE_FILE_PATH, 'utf-8');
    const parsedData = JSON.parse(data);
    parsedData[key] = value;
    await fs.promises.writeFile(SAVE_FILE_PATH, JSON.stringify(parsedData));
    return parsedData;
});

ipcMain.handle('get-constants', async () => {
    return {
        SAVE_FILE_NAME
    };
});

const main = async () => {
    await app.whenReady();
    ensure_save_environment();
    create_window();
}

main();