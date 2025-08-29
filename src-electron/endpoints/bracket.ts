import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import { load_tournament } from './tournament.js';

const update_bracket = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, bracketId: string, matchId: string, player1Won: boolean): Promise<TournamentDTO> => {

    // load tournament and bracket
    const tournament = await load_tournament(_, tournamentId);
    const bracket = tournament.getBracket(bracketId);

    if (!bracket) {
        throw new Error('Bracket not found');
    }

    bracket.updateMatch(matchId, player1Won);

    return tournament.toDTO();
}


export {
    update_bracket
}