import { serialize, deserialize, prepareMatches, } from './utils.js';
import { Gender, Hand, ExperienceLevel } from '../../src-shared/types.js';
import Match from './Match.js';
import Tournament from './Tournament.js';
import { BracketDTO } from '../../src-shared/BracketDTO.js';

class Bracket {

    __class: string = 'Bracket'

    tournament: Tournament

    id: string

    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: number // in lbs, -1 for no limit

    started: boolean

    competitorNames: string[]

    winnersBracket: Match[][]
    losersBracket: Match[][]

    final: Match | null
    finalRematch: Match | null

    constructor(tournament: Tournament = new Tournament(), gender: Gender = 'Male', experienceLevel: ExperienceLevel = 'Amateur', hand: Hand = 'Left', weightLimit: number = 0, competitorNames: string[] = []) {

        // tournament.id-gender-experienceLevel-hand-weightLimit
        this.id = tournament?.id + [gender, experienceLevel, hand, weightLimit].join('-');

        this.tournament = tournament;
        this.gender = gender;
        this.experienceLevel = experienceLevel;
        this.hand = hand;
        this.weightLimit = weightLimit;

        this.competitorNames = competitorNames;

        this.winnersBracket = [];
        this.losersBracket = [];

        this.final = null;
        this.finalRematch = null;

        this.started = false;
    }

    // create the initial bracket structure
    initialize() {

        // if there is only one competitor, there is no need to create a bracket
        if (this.competitorNames.length <= 1) {
            return;
        }

        // if there are two competitors, then create a bracket with a single winner round, final, and final rematch
        if (this.competitorNames.length === 2) {
            //  might need special logic heres
        }

        const { winnersBracket, losersBracket } = prepareMatches(this.competitorNames);

        this.winnersBracket = winnersBracket;
        this.losersBracket = losersBracket;

        // now, create finals. this is the winner of the last match of the losers bracket vs the winner of the last match of the winners bracket.
        const finalsMatch = this.winnersBracket[this.winnersBracket.length - 1][0];
        this.final = finalsMatch;

        // TODO: get final rematch here - prepareMatches should probably create this? will require some caveats probably
        this.finalRematch = null;

        this.started = true;
    }

    setCompetitorNames(competitorNames: string[]) {

        //console.log('setting competitor names');

        this.competitorNames = competitorNames;

        // reinitialize bracket if it was already started
        if (this.started) {
            this.initialize();
        }
    }

    addCompetitor(competitorName: string) {
        // prevent duplicate competitors

        if (this.competitorNames.includes(competitorName)) {
            throw new Error('Competitor already exists!');
        }
        this.setCompetitorNames([...this.competitorNames, competitorName]);
    }

    removeCompetitor(competitorName: string) {
        this.setCompetitorNames(this.competitorNames.filter(c => c !== competitorName));
    }

    updateMatchByRoundAndIndex(round: number, match: number, winner: number) {
        const matchToBeUpdated = this.findMatchByRoundAndIndex(round, match);
        matchToBeUpdated.updateWinner(winner);
    }

    updateMatchById(matchId: string, winner: number) {
        const matchToBeUpdated = this.findMatchById(matchId);
        matchToBeUpdated.updateWinner(winner);
    }

    findMatchById(matchId: string): Match {
        const match = this.getMatches().find(match => match.id === matchId);
        if (!match) {
            throw new Error('Match not found');
        }
        return match;
    }

    findMatchByRoundAndIndex(round: number, index: number): Match {

        // loop through all rounds and matches to find the match with the given id
        let matches = this.getMatches();
        for (let match of matches) {
            if (match.round === round && match.match === index) {
                return match;
            }
        }

        throw new Error('Match with round: ' + round + ' and index: ' + index + ' not found');
    }

    // return matches flattened and in no particular order
    getMatches(): Match[] {

        let matches: Match[] = [];

        matches = matches.concat(this.winnersBracket.flat());
        matches = matches.concat(this.losersBracket.flat());

        return matches;
    }

    print() {
        console.log(`Bracket with gender ${this.gender}, age group ${this.experienceLevel}, hand ${this.hand}, and weight limit ${this.weightLimit} lbs:`);

        console.log('Winners Bracket:');
        this.winnersBracket.forEach((round, i) => {
            console.log(`Round ${i + 1}:`);
            round.forEach(match => {
                console.log(`Match ${match.match}: ${match.player1} vs ${match.player2}`);
            });
        });

        console.log('Losers Bracket:');
        this.losersBracket.forEach((round, i) => {
            console.log(`Round ${i + 1}:`);
            round.forEach(match => {
                console.log(`Match ${match.match}: ${match.player1} vs ${match.player2}`);
            });
        });
    }

    serialize(): string {
        return serialize(this);
    }

    static deserialize(serialized: string): Bracket {
        return deserialize(serialized, { Tournament, Bracket, Match });
    }

    toDTO(): BracketDTO {
        return {
            id: this.id,
            tournamentId: this.tournament.id,
            gender: this.gender,
            experienceLevel: this.experienceLevel,
            hand: this.hand,
            weightLimit: this.weightLimit,
            competitorNames: this.competitorNames,
            winnersBracket: this.winnersBracket.map(round => round.map(match => match.toDTO())),
            losersBracket: this.losersBracket.map(round => round.map(match => match.toDTO())),
            started: this.started,
            final: this.final ? this.final.toDTO() : null,
            finalRematch: this.finalRematch ? this.finalRematch.toDTO() : null,
            currentMatchNumber: 1,
            finalRematchNeeded: false,
        };
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
    //     const lastMatchBeforeFinal = this.findMatchByRoundAndIndex(this.nextMatchId - 3);
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