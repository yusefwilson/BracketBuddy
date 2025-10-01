import fs from 'fs';
import os from 'os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
var spawn = require('child_process').spawn;
var cmd = process.argv[1];
var target = path.basename(process.execPath);

function log(msg: string) {
    const logDir = path.join(os.homedir(), "BracketBuddy");
    const logFile = path.join(logDir, "install.log");

    // ensure directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
}

function run(args: any, done: any) {
    var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
    spawn(updateExe, args, {
        detached: true
    }).on('close', done);
};

export const check = () => {
    log('App starting...');
    log('Process argv: ' + process.argv.join(' '));
    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated' || cmd === '--squirrel-firstrun') {
        log('Creating shortcut...');
        run(['--createShortcut=' + target + ''], () => {
            log('Shortcut created, app continues running');
        });
    }
}