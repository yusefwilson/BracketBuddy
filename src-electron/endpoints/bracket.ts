import { load_tournament, save_tournament } from './tournament.js';
import { Gender, Hand, ExperienceLevel } from 'src-electron/lib/types.js';
import Bracket from 'src-electron/lib/Bracket.js';

/* TOURNAMENT */

const add_bracket_to_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string,
    gender: Gender,
    experienceLevel: ExperienceLevel,
    hand: Hand,
    weightLimit: number, // in lbs, -1 for no limit
    competitorNames: string[]
) => {

    const tournament = await load_tournament(_, tournamentId);

    const bracket = new Bracket(tournament, gender, experienceLevel, hand, weightLimit, competitorNames);
    tournament.addBracket(bracket);

    console.log('Added bracket to tournament ' + tournamentId);

    await save_tournament(_, tournamentId, tournament.serialize());

    return tournament.serializeForFrontend(); // this should actually be a tournament
}

const remove_bracket_from_tournament = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, bracketId: string) => {

    const tournament = await load_tournament(_, tournamentId);

    tournament.removeBracket(bracketId);

    await save_tournament(_, tournamentId, tournament.serialize());

    console.log('Removed bracket from tournament ' + tournamentId);

    return tournament.serializeForFrontend();
}

export {
    add_bracket_to_tournament,
    remove_bracket_from_tournament
}