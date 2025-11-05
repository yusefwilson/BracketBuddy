import fs from 'fs';
import os from 'os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
var spawn = require('child_process').spawn;
var cmd = process.argv[1];
var target = path.basename(process.execPath);

function log(msg: string) {
    const logDir = path.join(os.homedir(), 'BracketBuddy');
    const logFile = path.join(logDir, 'install.log');

    // ensure directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
}

function run(args: any): Promise<void> {
    return new Promise((resolve) => {
        var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
        spawn(updateExe, args, {
            detached: true
        }).on('close', () => resolve());
    });
};

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const check = async (): Promise<boolean> => {
    log('App starting...');
    log('Process argv: ' + process.argv.join(' '));

    // Handle uninstall - prevent app from launching
    if (cmd === '--squirrel-uninstall') {
        log('Uninstalling - removing shortcuts and exiting...');
        await run(['--removeShortcut=' + target + '']);
        log('Shortcuts removed');
        return false;
    }

    // Handle install - create shortcuts (shows installer gif) and exit without launching app
    if (cmd === '--squirrel-install') {
        log('Install event - creating shortcuts...');
        await run(['--createShortcut=' + target + '']);
        log('Shortcuts created, waiting 5 seconds...');
        await sleep(5000);
        log('Wait complete, exiting without launching app...');
        return false;
    }

    // Handle update - create shortcuts (shows installer gif) and exit without launching app
    if (cmd === '--squirrel-updated') {
        log('Update event - creating shortcuts...');
        await run(['--createShortcut=' + target + '']);
        log('Shortcuts created, waiting 5 seconds...');
        await sleep(5000);
        log('Wait complete, exiting without launching app...');
        return false;
    }

    // Handle obsolete (being replaced by newer version) - prevent app from launching
    if (cmd === '--squirrel-obsolete') {
        log('App obsolete - exiting...');
        return false;
    }

    // Handle first run - launch app (shortcuts already created during install)
    if (cmd === '--squirrel-firstrun') {
        log('First run - launching app...');
    }

    return true;
}