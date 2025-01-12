import { app, BrowserWindow } from 'electron';
import * as path from 'node:path';

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

const main = async () => {
    await app.whenReady();
    create_window();
}

main();