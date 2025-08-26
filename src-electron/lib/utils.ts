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

import { Tournament as ExternalBracket, Match, Player } from 'tournament-organizer/components';
import { LoadableTournamentValues, PlayerValues, MatchValues } from 'tournament-organizer/interfaces';
/**
 * Convert a Player class instance into a plain PlayerValues object.
 */
function serializePlayer(player: Player): PlayerValues {
    return {
        id: player.id,
        name: player.name,
        active: player.active,
        value: player.value,
        matches: player.matches.map(m => ({
            id: m.id,
            opponent: m.opponent,
            pairUpDown: m.pairUpDown ?? false,
            seating: m.seating ?? null,
            bye: m.bye ?? false,
            win: m.win ?? 0,
            loss: m.loss ?? 0,
            draw: m.draw ?? 0,
        })),
        meta: { ...player.meta },
    };
}

/**
 * Convert a Match class instance into a plain MatchValues object.
 */
function serializeMatch(match: Match): MatchValues {
    return {
        id: match.id,
        round: match.round,
        match: match.match,
        active: match.active,
        bye: match.bye,
        player1: { ...match.player1 },
        player2: { ...match.player2 },
        path: { ...match.path },
        meta: { ...match.meta },
    };
}

/**
 * Convert a Tournament class instance into a plain LoadableTournamentValues object.
 */
function getLoadableExternalBracketValues(tournament: ExternalBracket): LoadableTournamentValues {
    return {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        round: tournament.round,
        seating: tournament.seating,
        sorting: tournament.sorting,
        scoring: { ...tournament.scoring },
        stageOne: { ...tournament.stageOne },
        stageTwo: { ...tournament.stageTwo },
        meta: { ...tournament.meta },
        players: tournament.players.map(p => serializePlayer(p)),
        matches: tournament.matches.map(m => serializeMatch(m)),
    };
}

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
    toMatchDTO, getLoadableExternalBracketValues,
};