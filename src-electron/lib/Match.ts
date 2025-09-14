import { MatchDTO } from "../../src-shared/MatchDTO";
import util from 'util';

class Match {

    __class: string = 'Match'

    round: number
    match: number
    player1: string | null
    player2: string | null
    winner: number // 1 if player1 won, 2 if player2 won, -1 if it is undetermined
    win?: {
        round: number,
        match: number,
        slot: 1 | 2
    }
    loss?: {
        round: number,
        match: number,
        slot: 1 | 2
    }
    winChild?: Match
    lossChild?: Match
    slot1Parent?: Match
    slot1PreviouslyWinner?: boolean
    slot2Parent?: Match
    slot2PreviouslyWinner?: boolean

    constructor(round: number = -1, match: number = -1, player1: string | null = null, player2: string | null = null, winner: number = -1,
        win?: {
            round: number,
            match: number,
            slot: 1 | 2
        },
        loss?: {
            round: number,
            match: number,
            slot: 1 | 2
        }) {
        this.round = round;
        this.match = match;
        this.player1 = player1;
        this.player2 = player2;
        this.winner = winner;
        this.win = win;
        this.loss = loss;
    }

    getWinnerPretty() {
        if (this.winner === -1 || this.winner === undefined) {
            return 'Winner of match ' + this.match + ' in round ' + this.round;
        }

        // if winner is set to 0 or 1, then the corresponding competitor name is definitely not undefined
        return (this.winner === 0 ? this.player1 : this.player2) as string;
    }

    getWinnerReal() {
        if (this.winner === -1 || this.winner === undefined) {
            return undefined;
        }

        return this.winner;
    }

    getLoser() {
        if (this.winner === -1 || this.winner === undefined) {
            return 'Loser of match ' + this.match + ' in round ' + this.round;
        }
        return this.winner === 0 ? this.player2 : this.player1;
    }

    toDTO(): MatchDTO {
        return {
            round: this.round,
            match: this.match,
            player1: this.player1,
            player2: this.player2,
            winner: this.winner,
            win: this.win,
            loss: this.loss,
        };
    }

    updatePlayer(player: string, slot: 1 | 2) {
        if (slot === 1) {
            this.player1 = player;
        }
        else if (slot === 2) {
            this.player2 = player;
        }
        else {
            throw new Error('Slot must be 1 or 2');
        }
    }

    toPrintable(): any {
        const formatLink = (link?: { round: number; match: number; slot: 1 | 2 }) =>
            link ? `Match ${link.round}-${link.match} (slot ${link.slot})` : 'null';

        return {
            round: this.round,
            match: this.match,
            player1: this.player1,
            player2: this.player2,
            winner: this.winner,
            win: formatLink(this.win),
            loss: formatLink(this.loss),
            slot1Parent: this.slot1Parent ? `Match ${this.slot1Parent.round}-${this.slot1Parent.match}` : null,
            slot2Parent: this.slot2Parent ? `Match ${this.slot2Parent.round}-${this.slot2Parent.match}` : null,
            winChild: this.winChild ? `Match ${this.winChild.round}-${this.winChild.match}` : null,
            lossChild: this.lossChild ? `Match ${this.lossChild.round}-${this.lossChild.match}` : null,
            slot1PreviouslyWinner: this.slot1PreviouslyWinner,
            slot2PreviouslyWinner: this.slot2PreviouslyWinner
        };
    }

    [util.inspect.custom](): any {
        return this.toPrintable();
    }
}

export default Match;