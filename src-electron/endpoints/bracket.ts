import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import { load_tournament, save_tournament } from './tournament.js';

const update_bracket = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, bracketId: string, matchId: string, winner: number): Promise<TournamentDTO> => {

    console.log('tournamentId: ', tournamentId);
    console.log('bracketId: ', bracketId);
    console.log('matchId: ', matchId);
    console.log('winner: ', winner);

    // load tournament and bracket
    const tournament = await load_tournament(_, tournamentId);

    const bracket = tournament.getBracket(bracketId);

    if (!bracket) {
        throw new Error('Bracket not found');
    }

    bracket.updateMatchById(matchId, winner);

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

const randomize_competitors = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, bracketId: string): Promise<TournamentDTO> => {
    console.log('randomizing competitors');
    console.log('tournamentId: ', tournamentId);
    console.log('bracketId: ', bracketId);

    const tournament = await load_tournament(_, tournamentId);
    const bracket = tournament.getBracket(bracketId);

    if (!bracket) {
        throw new Error('Bracket not found');
    }

    bracket.randomizeCompetitors();

    await save_tournament(_, tournament);

    return tournament.toDTO();
}


export {
    update_bracket,
    add_competitor_to_bracket,
    remove_competitor_from_bracket,
    start_bracket,
    randomize_competitors
}