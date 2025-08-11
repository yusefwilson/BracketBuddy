import { app } from 'electron';
import * as path from 'node:path';

const DEV = true;
const SAVE_DIR = app.getPath('userData');
const SAVE_FILE_NAME = 'BB_SAVE_FILE.json';
const SAVE_FILE_PATH = path.join(SAVE_DIR, SAVE_FILE_NAME);

export {
    DEV,
    SAVE_DIR,
    SAVE_FILE_NAME,
    SAVE_FILE_PATH
}