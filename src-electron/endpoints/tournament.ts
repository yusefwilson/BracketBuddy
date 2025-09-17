import { readFile, writeFile, readdir, rename } from 'fs/promises';
import * as path from 'node:path';

import Tournament from '../lib/Tournament.js';
import Bracket from '../lib/Bracket.js';
import { SAVE_DIR, SAVE_FILE_NAME } from '../constants.js';

import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import { Gender, Hand, ExperienceLevel } from '../../src-shared/types.js';

/* TOURNAMENT */

const load_all_tournaments = async (_: Electron.IpcMainInvokeEvent): Promise<TournamentDTO[]> => {
    console.log('loading all tournaments');
    const files = await readdir(SAVE_DIR);
    const tournaments = [];
    for (const file of files) {
        if (file.endsWith('.json') && file !== SAVE_FILE_NAME) {
            const tournament = await readFile(path.join(SAVE_DIR, file), 'utf-8');
            tournaments.push(tournament);
        }
    }

    // console.log('tournaments: ', tournaments);

    const deserializedTournaments = [];

    // go through each tournament and deserialize it
    for (const tournamentData of tournaments) {
        const tournament = Tournament.deserialize(tournamentData);
        // console.log('winnersBracket: ', tournament.brackets[0].winnersBracket);
        // console.log('losersBracket: ', tournament.brackets[0].losersBracket);
        deserializedTournaments.push(tournament.toDTO());
    }

    // console.log('deserialized tournaments: ', deserializedTournaments);

    return deserializedTournaments;
}

const create_tournament = async (_: Electron.IpcMainInvokeEvent, name: string, date: Date): Promise<TournamentDTO> => {
    const tournament = new Tournament(name, date);
    console.log('about to save tournament ' + tournament.id);
    await save_tournament(_, tournament);
    console.log('Created tournament ' + tournament.id);
    return tournament.toDTO();
}

const delete_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string): Promise<void> => {
    const filePath = path.join(SAVE_DIR, tournamentId + '.json');
    // just rename file so that it's ignored by load-all-tournaments and can be recovered if absolutely necessary
    await rename(filePath, filePath + '.deleted');
    console.log('Deleted tournament ' + tournamentId);
}

const add_bracket_to_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string,
    gender: Gender,
    experienceLevel: ExperienceLevel,
    hand: Hand,
    weightLimit: number, // in lbs, -1 for no limit
    competitorNames: string[]
) => {

    const tournament = await load_tournament(_, tournamentId);

    // manually add competitors here to sync competitorNames and externalBracket.players - ugly
    const bracket = new Bracket(tournament, gender, experienceLevel, hand, weightLimit);
    competitorNames.forEach(competitorName => bracket.addCompetitor(competitorName));
    tournament.addBracket(bracket);

    console.log('Added bracket to tournament ' + tournamentId);

    await save_tournament(_, tournament);

    return tournament.toDTO();
}

const remove_bracket_from_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, bracketId: string): Promise<TournamentDTO> => {

    const tournament = await load_tournament(_, tournamentId);

    tournament.removeBracket(bracketId);

    await save_tournament(_, tournament);

    console.log('Removed bracket from tournament ' + tournamentId);

    return tournament.toDTO();
}


/* HELPER FUNCTIONS */

const load_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string): Promise<Tournament> => {
    const filePath = path.join(SAVE_DIR, tournamentId + '.json');
    const tournamentData = await readFile(filePath, 'utf-8');

    const tournament = Tournament.deserialize(tournamentData);

    return tournament;
}

const save_tournament = async (_: Electron.IpcMainInvokeEvent, tournament: Tournament): Promise<void> => {

    const tournamentId = tournament.id;
    const serializedTournamentData = tournament.serialize();

    const filePath = path.join(SAVE_DIR, tournamentId + '.json');
    console.log('saving tournament ' + tournamentId + ' to file ' + filePath);
    await writeFile(filePath, serializedTournamentData, 'utf-8');
    console.log('Saved tournament ' + tournamentId + ' to file ' + filePath);
}

export {
    load_all_tournaments,
    create_tournament,
    delete_tournament,
    add_bracket_to_tournament,
    remove_bracket_from_tournament,

    load_tournament,
    save_tournament
}