import { Tournament as ExternalBracket, Match } from 'tournament-organizer/components';

import { getLoadableExternalBracketValues, toMatchDTO, toRenderableBracket } from './utils.js';
import Tournament from './Tournament.js';

import { BracketDTO } from '../../src-shared/BracketDTO.js';
import { Gender, Hand, ExperienceLevel } from '../../src-shared/types.js';

class Bracket {

    id: string

    tournament: Tournament

    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: number // in lbs, -1 for no limit

    competitorNames: string[]

    externalBracket: ExternalBracket

    final: Match
    finalRematch: Match

    nextMatchId: number

    constructor(tournament: Tournament, gender: Gender = 'Male', experienceLevel: ExperienceLevel = 'Amateur', hand: Hand = 'Left', weightLimit: number = 0, competitorNames: string[] = []) {

        this.id = tournament?.id + gender + experienceLevel + hand + weightLimit.toString();

        // assign everything except subBrackets
        this.tournament = tournament;
        this.gender = gender;
        this.experienceLevel = experienceLevel;
        this.hand = hand;
        this.weightLimit = weightLimit;

        this.competitorNames = competitorNames;

        const id = gender + experienceLevel + hand + weightLimit;
        const name = gender + ' ' + experienceLevel + ' ' + hand + ' ' + weightLimit;
        this.externalBracket = new ExternalBracket(id, name);

        // TODO: TEMPORARY, NEEDS TO BE REPLACED WITH PROPER INITIALIZATION.
        this.final = new Match(id, 0, 0);
        this.finalRematch = new Match(id, 0, 0);

        this.nextMatchId = 1;
    }

    setCompetitorNames(competitorNames: string[]) {

        //console.log('setting competitor names');

        this.competitorNames = competitorNames;

        // reinitialize bracket
        this.initialize();
    }

    //TODO: does this function need a harder reset rather than just calling .start()?

    // create the initial bracket structure
    initialize() {
        // TODO: replace external bracket competitors with competitorNames
        this.externalBracket.players;
        this.externalBracket.start();
    }

    findMatchById(id: string): Match | undefined {

        // loop through all rounds and matches to find the match with the given id
        let matches = this.getMatches();
        for (let match of matches) {
            if (match.id === id) {
                return match;
            }
        }

        // check final and final rematch
        if (this.final && this.final.id === id) {
            return this.final;
        }
        if (this.finalRematch && this.finalRematch.id === id) {
            return this.finalRematch;
        }

        return undefined;
    }

    // return matches sorted by id
    getMatches(): Match[] {
        return this.externalBracket.matches;
    }

    print() {
        console.log(`Bracket with gender ${this.gender}, age group ${this.experienceLevel}, hand ${this.hand}, and weight limit ${this.weightLimit} lbs:`);

        console.log('Winners Bracket:');

        console.log('Losers Bracket:');
    }

    serialize() {
        return {
            gender: this.gender,
            experienceLevel: this.experienceLevel,
            hand: this.hand,
            weightLimit: this.weightLimit,
            competitorNames: this.competitorNames,
            final: this.final,
            finalRematch: this.finalRematch,
            nextMatchId: this.nextMatchId,
            externalBracketData: getLoadableExternalBracketValues(this.externalBracket), // TODO: figure out how to get LoadableTournamentValues
        };
    }

    static deserialize(data: any, tournament: Tournament): Bracket {
        const bracket = new Bracket(
            tournament,
            data.gender,
            data.experienceLevel,
            data.hand,
            data.weightLimit,
            data.competitorNames
        );

        // Restore external bracket from LoadableTournamentValues
        tournament.manager.reloadTournament(data.externalBracketData);

        bracket.final = data.final;
        bracket.finalRematch = data.finalRematch;
        bracket.nextMatchId = data.nextMatchId;

        return bracket;
    }

    toDTO(): BracketDTO {
        console.log('about to set started to ', this.externalBracket.status === 'setup', ' because status = ', this.externalBracket.status);
        return {
            id: this.id,

            tournamentId: this.tournament?.id,

            gender: this.gender,
            experienceLevel: this.experienceLevel,
            hand: this.hand,
            weightLimit: this.weightLimit, // in lbs, -1 for no limit

            competitorNames: this.competitorNames,

            started: this.externalBracket.status !== 'setup',
            

            renderableBracket: toRenderableBracket(this.externalBracket),

            final: toMatchDTO(this.final),
            finalRematch: toMatchDTO(this.finalRematch),
        };
    }

    updateMatch(matchId: string, player1Won: boolean) {
        const match = this.findMatchById(matchId);
        if (!match) {
            throw new Error('Match not found');
        }

        let player1Wins = 0, player2Wins = 0;

        if (player1Won) {
            player1Wins++;
        }
        else {
            player2Wins++;
        }

        this.externalBracket.enterResult(matchId, player1Wins, player2Wins);
    }

    addCompetitor(competitorName: string) {
        this.competitorNames.push(competitorName);

        //TODO: check if this status check is actually what we need to do

        // if bracket is already in progress, reinitialize
        if (this.externalBracket.status !== 'setup') {
            this.initialize();
        }
    }

    removeCompetitor(competitorName: string) {
        this.competitorNames = this.competitorNames.filter(name => name !== competitorName);

        //TODO: check if this status check is actually what we need to do

        // if bracket is already in progress, reinitialize
        if (this.externalBracket.status !== 'setup') {
            this.initialize();
        }
    }

    // canGetWinnerFromFinal(): boolean {
    //     return this.final?.winner !== -1 && this.final?.winner !== undefined && this.final?.getWinnerPretty() === this.winnersBracket[this.winnersBracket.length - 1].matches[0].getWinnerPretty()
    // }

    // canGetWinnerFromFinalRematch(): boolean {
    //     return this.finalRematch?.winner !== -1 && this.finalRematch?.winner !== undefined;
    // }

    // getFirstPlace(): string | undefined {
    //     // if the final rematch has taken place, then the first place is the winner of the final rematch
    //     if (this.canGetWinnerFromFinalRematch()) {
    //         return this.finalRematch?.getWinnerPretty();
    //     }
    //     // if the final rematch has not taken place, and the final has, and the winner of the final is the winner of the last winnners bracket match
    //     if (this.canGetWinnerFromFinal()) {
    //         return this.final?.getWinnerPretty();
    //     }
    //     return undefined;
    // }

    // getSecondPlace(): string | undefined {
    //     if (this.canGetWinnerFromFinalRematch()) {
    //         return this.finalRematch?.getLoser();
    //     }
    //     if (this.canGetWinnerFromFinal()) {
    //         return this.final?.getLoser();
    //     }
    //     return undefined;
    // }

    // getThirdPlace(): string | undefined {
    //     const lastMatchBeforeFinal = this.findMatchById(this.nextMatchId - 3);
    //     if (lastMatchBeforeFinal?.winner !== -1 && lastMatchBeforeFinal?.winner !== undefined) {
    //         return lastMatchBeforeFinal?.getLoser();
    //     }
    //     return undefined;
    // }

    // getLowestIdUnfilledMatch(): number | undefined {
    //     let matches = this.getMatches().sort((a, b) => a.id - b.id);
    //     for (let match of matches) {
    //         if (match.winner === -1 || match.winner === undefined) {
    //             return match.id;
    //         }
    //     }
    // }

    // finalRematchNeeded(): boolean {
    //     let winnersBracketFinal = this.winnersBracket[this.winnersBracket.length - 1].matches[0];
    //     if (winnersBracketFinal.getWinnerPretty() === this.final?.getWinnerPretty()) {
    //         return false;
    //     }
    //     else if (this.final?.winner === -1 || this.final?.winner === undefined) {
    //         return false;
    //     }
    //     return true;
    // }
}

export default Bracket;