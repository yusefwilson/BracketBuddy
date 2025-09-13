import { MatchDTO } from "../../src-shared/MatchDTO";

class Match {

    __class: string = 'Match'

    round: number
    match: number
    player1: string | number | null
    player2: string | number | null
    winner: number // 1 if player1 won, 0 if player2 won, -1 if it is undetermined
    win?: {
        round: number,
        match: number
    }
    loss?: {
        round: number,
        match: number
    }

    constructor(round: number = -1, match: number = -1, player1: string | number | null = null, player2: string | number | null = null, winner: number = -1,
        win?: {
            round: number,
            match: number
        },
        loss?: {
            round: number,
            match: number
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
}

export default Match;