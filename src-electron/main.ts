import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'node:path';
import fs from 'fs';

// so that the app reloads when the code changes in development
app.isPackaged || require('electron-reloader')(module);

const DEV = true;

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

ipcMain.handle('read-file', (_, filePath) => {
    const data = fs.readFileSync(filePath, 'utf-8');
    return data;
});

ipcMain.handle('write-file', async (_, filePath, data) => {
    await fs.promises.writeFile(filePath, data, 'utf-8');
});

const main = async () => {
    await app.whenReady();
    create_window();
}

main();