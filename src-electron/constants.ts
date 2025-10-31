import * as path from 'node:path';

import { app } from 'electron';

const SAVE_DIR = app.getPath('userData');
const SAVE_FILE_NAME = 'BB_SAVE_FILE.json';
const SAVE_FILE_PATH = path.join(SAVE_DIR, SAVE_FILE_NAME);

export {
    SAVE_DIR,
    SAVE_FILE_NAME,
    SAVE_FILE_PATH
}