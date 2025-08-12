import fs from 'fs';
import { SAVE_DIR, SAVE_FILE_NAME, SAVE_FILE_PATH } from './constants.js';
import * as path from 'node:path';

/* TOURNAMENT */

const load_all_tournaments = async (_: Electron.IpcMainInvokeEvent) => {
    const files = await fs.promises.readdir(SAVE_DIR);
    const tournaments = [];
    for (const file of files) {
        if (file.endsWith('.json') && file !== SAVE_FILE_NAME) {
            const tournament = await fs.promises.readFile(path.join(SAVE_DIR, file), 'utf-8');
            tournaments.push(tournament);
        }
    }
    return tournaments;
}

const save_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentName: string, serializedTournamentData: string) => {
    const filePath = path.join(SAVE_DIR, tournamentName + '.json');
    await fs.promises.writeFile(filePath, serializedTournamentData, 'utf-8');
    console.log('Saved tournament ' + tournamentName + ' to file ' + filePath);
}

const delete_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentName: string) => {
    const filePath = path.join(SAVE_DIR, tournamentName + '.json');
    // just rename file so that it's ignored by load-all-tournaments and can be recovered if absolutely necessary
    await fs.promises.rename(filePath, filePath + '.deleted');
    console.log('Deleted tournament ' + tournamentName);
}

import { Player } from 'tournament-organizer/components';
import { SettableTournamentValues } from 'tournament-organizer/interfaces';
import Manager from 'tournament-organizer';

const create_example_bracket = async () => {

    const players = [new Player('player1', 'player1'), new Player('player2', 'player2'), new Player('player3', 'player3'), new Player('player4', 'player4')];
    const tournamentValues: SettableTournamentValues = {
        matches: [],
        name: 'test',
        players: players,
        //round?: number,
        scoring: {
            bestOf: 1,
            //bye?: number;
            //draw?: number;
            //loss?: number;
            //     tiebreaks?: (
            //         | "median buchholz"
            //         | "solkoff"
            //         | "sonneborn berger"
            //         | "cumulative"
            //         | "versus"
            //         | "game win percentage"
            //         | "opponent game win percentage"
            //         | "opponent match win percentage"
            //         | "opponent opponent match win percentage")[];
            //     win?: number;
        },
        //seating?: boolean;
        //sorting?: "none" | "ascending" | "descending";
        stageOne: {
            //consolation?: boolean;
            format: "double-elimination",
            //initialRound?: number;
            //maxPlayers?: number;
            //rounds?: number;
        },
        stageTwo: {
            advance: {
                method: "points",
                //value?: number;
            },
            //consolation?: boolean;
            format: "double-elimination"
        },
        // status?:
        //     | "setup"
        //     | "stage-one"
        //     | "stage-two"
        //     | "complete";
    };
    const manager = new Manager();
    const tournament = manager.createTournament('test tournament', tournamentValues)
    tournament.start();
}

/* MISC */

const get_save_data = async (_: Electron.IpcMainInvokeEvent) => {
    const data = await fs.promises.readFile(SAVE_FILE_PATH, 'utf-8');
    return JSON.parse(data);
}

const save_key_value = async (_: Electron.IpcMainInvokeEvent, key: string, value: any) => {
    const data = await fs.promises.readFile(SAVE_FILE_PATH, 'utf-8');
    console.log('data: ', data);
    const parsedData = JSON.parse(data);
    parsedData[key] = value;
    await fs.promises.writeFile(SAVE_FILE_PATH, JSON.stringify(parsedData));
    return parsedData;
}

const get_constants = async (_: Electron.IpcMainInvokeEvent) => {
    return {
        SAVE_FILE_NAME
    };
}

const ensure_save_environment = () => {

    // create save directory if it doesn't exist
    if (!fs.existsSync(SAVE_DIR)) {
        fs.mkdirSync(SAVE_DIR, { recursive: true });
        console.log('Created save directory at:', SAVE_DIR);
    }

    // create save file if it doesn't exist
    if (!fs.existsSync(SAVE_FILE_PATH)) {
        fs.writeFileSync(SAVE_FILE_PATH, '{}', 'utf-8');
        console.log('Created empty save file:', SAVE_FILE_PATH);
    }
};

export {
    load_all_tournaments,
    save_tournament,
    delete_tournament,
    get_save_data,
    save_key_value,
    get_constants,
    ensure_save_environment
}