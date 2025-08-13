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

export interface TO_Match {
    id: string;
    round: number;
    match: number;
    active: boolean;
    bye: boolean;
    player1: {
        id: string;
        win: number;
        loss: number;
        draw: number;
    };
    player2: {
        id: string;
        win: number;
        loss: number;
        draw: number;
    };
    path: {
        win: string | null;
        loss: string | null;
    };
    meta: Record<string, any>;
}

function getLoadableTournamentValues(externalBracket: ExternalBracket): LoadableTournamentValues {
    console.log('getting loadable tournament values for external bracket: ', externalBracket);
    return {} as LoadableTournamentValues;
}

import { Match as G_Loot_Match } from '@g-loot/react-tournament-brackets';

function convertToGlootMatch(toMatch: TO_Match): G_Loot_Match {
    return {
        id: toMatch.id,
        name: 'Match ' + toMatch.id,
        nextMatchId: toMatch.path.win,
        nextLooserMatchId: toMatch.path.loss,
        tournamentRoundText: 'what is this?',
        startTime: Date.now().toString(),
        state: 'DONE',
        participants: [{
            id: toMatch.player1.id,
            resultText: 'example result text',
            isWinner: toMatch.player1.win > toMatch.player2.win,
            status: null,
            name: 'Name of ' + toMatch.player1.id,
        },
        {
            id: toMatch.player2.id,
            resultText: 'example result text',
            isWinner: toMatch.player2.win >= toMatch.player1.win, // TECHNICALLY THE POINTS SHOULD NEVER BE EQUAL IF THE MATCH IS DONE
            status: null,
            name: 'Name of ' + toMatch.player1.id,
        }
        ],
    };
}

export {
    greatestPowerOf2LessThanOrEqualTo, isPowerOfTwo,
    getSaveData, saveKeyValue,
    convertToGlootMatch, getLoadableTournamentValues,
};