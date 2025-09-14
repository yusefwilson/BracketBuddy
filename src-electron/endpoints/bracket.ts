import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import { load_tournament, save_tournament } from './tournament.js';

const update_bracket = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, bracketId: string, matchId: string, player1Won: boolean): Promise<TournamentDTO> => {

    console.log('tournamentId: ', tournamentId);
    console.log('bracketId: ', bracketId);
    console.log('matchId: ', matchId);
    console.log('player1Won: ', player1Won);

    // load tournament and bracket
    const tournament = await load_tournament(_, tournamentId);
    console.log('all brackets: ', tournament.getAllBrackets().map(b => b.id));

    const bracket = tournament.getBracket(bracketId);
    console.log('bracket: ', bracket);

    if (!bracket) {
        throw new Error('Bracket not found');
    }

    bracket.updateMatch(matchId, player1Won);

    await save_tournament(_, tournament);

    return tournament.toDTO();
}

const add_competitor_to_bracket = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, bracketId: string, competitorName: string): Promise<TournamentDTO> => {
    // console.log('adding competitor to bracket');
    // console.log('tournamentId: ', tournamentId);
    // console.log('bracketId: ', bracketId);
    // console.log('competitorName: ', competitorName);

    const tournament = await load_tournament(_, tournamentId);
    const bracket = tournament.getBracket(bracketId);

    if (!bracket) {
        throw new Error('Bracket not found');
    }

    bracket.addCompetitor(competitorName);

    await save_tournament(_, tournament);

    return tournament.toDTO();
}

const remove_competitor_from_bracket = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, bracketId: string, competitorName: string): Promise<TournamentDTO> => {
    // console.log('removing competitor from bracket');
    // console.log('tournamentId: ', tournamentId);
    // console.log('bracketId: ', bracketId);
    // console.log('competitorName: ', competitorName);

    const tournament = await load_tournament(_, tournamentId);
    const bracket = tournament.getBracket(bracketId);

    if (!bracket) {
        throw new Error('Bracket not found');
    }

    bracket.removeCompetitor(competitorName);

    await save_tournament(_, tournament);

    return tournament.toDTO();
}

const start_bracket = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, bracketId: string): Promise<TournamentDTO> => {

    console.log('starting bracket');
    console.log('tournamentId: ', tournamentId);
    console.log('bracketId: ', bracketId);

    const tournament = await load_tournament(_, tournamentId);
    const bracket = tournament.getBracket(bracketId);

    if (!bracket) {
        throw new Error('Bracket not found');
    }

    bracket.initialize();

    console.log('bracket is now: ', bracket);
    console.log('bracketDTO is now: ', bracket.toDTO());

    await save_tournament(_, tournament);

    return tournament.toDTO();
}


export {
    update_bracket,
    add_competitor_to_bracket,
    remove_competitor_from_bracket,
    start_bracket
}