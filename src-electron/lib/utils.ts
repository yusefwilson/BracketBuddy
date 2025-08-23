/* MATH */
function greatestPowerOf2LessThanOrEqualTo(n: number): number {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
}

function isPowerOfTwo(n: number) { return n > 0 && (n & (n - 1)) === 0; };

const getSaveData = async (): Promise<Record<string, any>> => {
    const data = await window.electron.getSaveData();
    return data;
}

const saveKeyValue = async (key: string, value: any): Promise<void> => {
    await window.electron.saveKeyValue(key, value);
}

import { Tournament as ExternalBracket } from 'tournament-organizer/components';
import { LoadableTournamentValues } from 'tournament-organizer/interfaces';

function getLoadableTournamentValues(externalBracket: ExternalBracket): LoadableTournamentValues {
    console.log('getting loadable tournament values for external bracket: ', externalBracket);
    // TODO: actually get loadable tournament values from external bracket
    return {} as LoadableTournamentValues;
}

import { Match } from 'tournament-organizer/components';
import { MatchDTO } from '../../src-shared/MatchDTO';

function toMatchDTO(match: Match): MatchDTO {
    return {
        id: match.id,
        name: `Round ${match.round} - Match ${match.match}`,
        nextMatchId: match.path?.win ?? null,
        nextLooserMatchId: match.path?.loss ?? null,
        startTime: null, // not available in Match, so default to null (or inject externally)
        state: match.active ? 'SCORE_DONE' : 'DONE', // simplistic mapping; adjust as needed
        participants: [
            {
                id: match.player1.id,
                resultText: match.player1.win > match.player2.win ? 'WON' : 'LOST',
                isWinner: match.player1.win > match.player2.win,
                status: match.active ? 'PLAYED' : null,
                name: match.player1.id, // replace with real name lookup if available
            },
            {
                id: match.player2.id,
                resultText: match.player2.win > match.player1.win ? 'WON' : 'LOST',
                isWinner: match.player2.win > match.player1.win,
                status: match.active ? 'PLAYED' : null,
                name: match.player2.id, // replace with real name lookup if available
            },
        ],
    };
}

export {
    greatestPowerOf2LessThanOrEqualTo, isPowerOfTwo,
    getSaveData, saveKeyValue,
    toMatchDTO, getLoadableTournamentValues,
};