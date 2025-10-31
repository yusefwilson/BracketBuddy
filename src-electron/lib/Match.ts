import util from 'util';

import { MatchDTO } from '../../src-shared/MatchDTO.js';
import { SlotCoordinates } from '../../src-shared/types.js';

class Match {

    __class: string = 'Match'

    id: string
    number: number
    round: number
    match: number
    player1: string | null
    player2: string | null
    winner: number // 1 if player1 won, 2 if player2 won, -1 if it is undecided
    win?: SlotCoordinates
    loss?: SlotCoordinates
    winChild?: Match
    lossChild?: Match
    slot1Parent?: Match
    slot1PreviouslyWinner?: boolean
    slot2Parent?: Match
    slot2PreviouslyWinner?: boolean

    constructor(id: string = '', number: number = -1, round: number = -1, match: number = -1, player1: string | null = null, player2: string | null = null,
        winner: number = -1, win?: SlotCoordinates, loss?: SlotCoordinates) {

        this.id = id;
        this.number = number;
        this.round = round;
        this.match = match;
        this.player1 = player1;
        this.player2 = player2;
        this.winner = winner;
        this.win = win;
        this.loss = loss;
    }

    // for now, a match can only be decided if it has been filled
    isDecided() {
        return this.winner !== -1 && this.player1 !== null && this.player2 !== null;
    }

    getGenericWinner() {
        return 'Winner of ' + this.number;
    }

    getGenericLoser() {
        return 'Loser of ' + this.number;
    }

    getWinningPlayer() {
        // if the match has not been filled or determined, then throw an error
        if (!this.isDecided()) {
            throw new Error('Match ' + this.id + ' is undecided: ');
        }

        // assert that player1 and player2 are not null because we passed isDecided() check
        return this.winner === 1 ? this.player1 as string : this.player2 as string;
    }

    getLosingPlayer() {
        // if the match has not been filled or determined, then throw an error
        if (!this.isDecided()) {
            throw new Error('Match ' + this.id + ' is undecided: ');
        }
        // assert that player1 and player2 are not null because we passed isDecided() check
        return this.winner === 1 ? this.player2 as string : this.player1 as string;
    }

    getWinner() {
        return this.winner;
    }

    toDTO(): MatchDTO {
        let slot1GenericName = '', slot2GenericName = '';
        if (this.slot1Parent) {
            slot1GenericName = this.slot1PreviouslyWinner ? this.slot1Parent.getGenericWinner() : this.slot1Parent.getGenericLoser();
        }
        if (this.slot2Parent) {
            slot2GenericName = this.slot2PreviouslyWinner ? this.slot2Parent.getGenericWinner() : this.slot2Parent.getGenericLoser();
        }
        return {
            id: this.id,
            round: this.round,
            match: this.match,
            number: this.number,
            player1: this.player1,
            player2: this.player2,
            winner: this.winner,
            win: this.win,
            loss: this.loss,
            slot1GenericName: slot1GenericName,
            slot2GenericName: slot2GenericName,
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

    // update the winner of this match and then trigger a recursive update of all children matches' player names
    updateWinner(winner: number) {

        console.log('updating winner of match ' + this.id + ' to ' + winner);

        // winner must be -1, 1, or 2
        if (winner !== -1 && winner !== 1 && winner !== 2) {
            throw new Error('Winner must be -1, 1, or 2');
        }

        // make sure that winner can only be updated if match is filled
        if (this.player1 === null || this.player2 === null) {
            throw new Error('Match cannot be updated because it is not filled');
        }

        console.log('updating winner of match ' + this.id + ' to ' + winner);
        this.winner = winner;

        if (this.winChild) {
            //console.log('updating winner child which has id ' + this.winnerChild.id);
            this.winChild.updatePlayers();
        }

        if (this.lossChild) {
            //console.log('updating loser child which has id ' + this.loserChild.id);
            this.lossChild.updatePlayers();
        }
    }

    // update the players of the current match if and only if the parent matches have been decided
    updatePlayers() {

        console.log('updating players of match ' + this.id);
        console.log('slot1Parent: ', this.slot1Parent?.id);
        console.log('slot2Parent: ', this.slot2Parent?.id);
        console.log('slot1Parent.isDecided(): ', this.slot1Parent?.isDecided());
        console.log('slot2Parent.isDecided(): ', this.slot2Parent?.isDecided());

        // if the parent match exists and has been decided, update the player of this match
        if (this.slot1Parent && this.slot1Parent.isDecided()) {
            console.log('updating player1 of match ' + this.id + ' because parent match ' + this.slot1Parent.id + ' isDecided(): ' + this.slot1Parent.isDecided());
            this.player1 = this.slot1PreviouslyWinner ? this.slot1Parent.getWinningPlayer() : this.slot1Parent.getLosingPlayer();
        }
        if (this.slot2Parent && this.slot2Parent.isDecided()) {
            console.log('updating player1 of match ' + this.id + ' because parent match ' + this.slot2Parent.id + ' isDecided(): ' + this.slot2Parent.isDecided());
            this.player2 = this.slot2PreviouslyWinner ? this.slot2Parent.getWinningPlayer() : this.slot2Parent.getLosingPlayer();
        }

        // if the parent match exist and has not been decided, then make the player of this match null
        if (this.slot1Parent && !this.slot1Parent.isDecided()) {
            this.winner = -1;
            this.player1 = null;
        }
        if (this.slot2Parent && !this.slot2Parent.isDecided()) {
            this.winner = -1;
            this.player2 = null;
        }

        if (this.winChild) {
            this.winChild.updatePlayers();
        }
        if (this.lossChild) {
            this.lossChild.updatePlayers();
        }
    }

    toPrintable(): any {
        const formatLink = (link?: { round: number; match: number; slot: 1 | 2 }) =>
            link ? `Match ${link.round}-${link.match} (slot ${link.slot})` : 'null';

        return {
            round: this.round,
            match: this.match,
            number: this.number,
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