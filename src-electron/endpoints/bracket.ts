import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import { load_tournament, save_tournament } from './tournament.js';
import type {
    UpdateBracketInput,
    AddCompetitorToBracketInput,
    RemoveCompetitorFromBracketInput,
    StartBracketInput,
    RandomizeCompetitorsInput,
} from '../../src-shared/types.js';

const update_bracket = async (_: Electron.IpcMainInvokeEvent, input: UpdateBracketInput): Promise<TournamentDTO> => {
    const { tournamentId, bracketId, matchId, winner } = input;

    console.log('tournamentId: ', tournamentId);
    console.log('bracketId: ', bracketId);
    console.log('matchId: ', matchId);
    console.log('winner: ', winner);

    const tournament = await load_tournament(_, tournamentId);
    const bracket = tournament.getBracket(bracketId);

    if (!bracket) throw new Error('Bracket not found');

    bracket.updateMatchById(matchId, winner);
    await save_tournament(_, tournament);

    return tournament.toDTO();
};

const add_competitor_to_bracket = async (_: Electron.IpcMainInvokeEvent, input: AddCompetitorToBracketInput): Promise<TournamentDTO> => {
    const { tournamentId, bracketId, competitorName } = input;

    const tournament = await load_tournament(_, tournamentId);
    const bracket = tournament.getBracket(bracketId);

    if (!bracket) throw new Error('Bracket not found');

    bracket.addCompetitor(competitorName);
    await save_tournament(_, tournament);

    return tournament.toDTO();
};

const remove_competitor_from_bracket = async (_: Electron.IpcMainInvokeEvent, input: RemoveCompetitorFromBracketInput): Promise<TournamentDTO> => {
    const { tournamentId, bracketId, competitorName } = input;

    const tournament = await load_tournament(_, tournamentId);
    const bracket = tournament.getBracket(bracketId);

    if (!bracket) throw new Error('Bracket not found');

    bracket.removeCompetitor(competitorName);
    await save_tournament(_, tournament);

    return tournament.toDTO();
};

const start_bracket = async (_: Electron.IpcMainInvokeEvent, input: StartBracketInput): Promise<TournamentDTO> => {
    const { tournamentId, bracketId } = input;

    const tournament = await load_tournament(_, tournamentId);
    const bracket = tournament.getBracket(bracketId);

    if (!bracket) throw new Error('Bracket not found');

    bracket.initialize();
    await save_tournament(_, tournament);

    return tournament.toDTO();
};

const randomize_competitors = async (_: Electron.IpcMainInvokeEvent, input: RandomizeCompetitorsInput): Promise<TournamentDTO> => {
    const { tournamentId, bracketId } = input;

    const tournament = await load_tournament(_, tournamentId);
    const bracket = tournament.getBracket(bracketId);

    if (!bracket) throw new Error('Bracket not found');

    bracket.randomizeCompetitors();
    bracket.initialize();
    await save_tournament(_, tournament);

    return tournament.toDTO();
};

export {
    update_bracket,
    add_competitor_to_bracket,
    remove_competitor_from_bracket,
    start_bracket,
    randomize_competitors,
};
