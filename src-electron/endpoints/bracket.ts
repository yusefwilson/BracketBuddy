import { TournamentDTO } from '../../src-shared/TournamentDTO.js';
import { load_tournament } from './tournament.js';

const update_bracket = async (_: Electron.IpcMainInvokeEvent, tournamentId: string, bracketId: string, matchId: string, player1Won: boolean): Promise<TournamentDTO> => {

    console.log('tournamentId: ', tournamentId);
    console.log('bracketId: ', bracketId);
    console.log('matchId: ', matchId);
    console.log('player1Won: ', player1Won);

    // load tournament and bracket
    const tournament = await load_tournament(_, tournamentId);
    console.log('all brackets: ', tournament.getAllBrackets().map(b => b.id));

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