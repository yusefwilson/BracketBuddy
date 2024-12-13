import { app, BrowserWindow } from 'electron';

const create_window = async () => {

    const window = new BrowserWindow({
        width: 800,
        height: 600
    });

    await window.loadFile('../public/index.html');
}

const main = async () => {
    await app.whenReady();
    create_window();
}

main();