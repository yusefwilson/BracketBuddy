import { serialize, deserialize, prepareMatches, shuffle } from './utils.js';

import Match from './Match.js';
import Tournament from './Tournament.js';

import { BracketDTO } from '../../src-shared/BracketDTO.js';
import { Gender, Hand, ExperienceLevel, WeightLimit } from '../../src-shared/types.js';

class Bracket {

    __class: string = 'Bracket'

    tournament: Tournament

    id: string

    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: WeightLimit

    competitorNames: string[]

    winnersBracket: Match[][]
    losersBracket: Match[][]

    final: Match | null
    finalRematch: Match | null

    constructor(tournament: Tournament = new Tournament(), gender: Gender = 'Male', experienceLevel: ExperienceLevel = 'Amateur', hand: Hand = 'Left', weightLimit: WeightLimit = 0, competitorNames: string[] = []) {

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
    }

    // create the initial bracket structure
    initialize() {

        // if there is only one competitor, there is no need to create a bracket
        if (this.competitorNames.length <= 1) {
            this.winnersBracket = [];
            this.losersBracket = [];
            this.final = null;
            this.finalRematch = null;
            return;
        }

        console.log('about to initialize bracket with competitor names: ', this.competitorNames);

        const { winnersBracket, losersBracket, final, finalRematch } = prepareMatches(this.competitorNames);

        this.winnersBracket = winnersBracket;
        this.losersBracket = losersBracket;
        this.final = final;
        this.finalRematch = finalRematch;
    }

    setCompetitorNames(competitorNames: string[]) {

        //console.log('setting competitor names');
        this.competitorNames = competitorNames;

        // reinitialize bracket
        this.initialize();
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

    randomizeCompetitors() {
        shuffle(this.competitorNames);
    }

    updateMatchById(matchId: string, winner: number) {
        const matchToBeUpdated = this.findMatchById(matchId);
        matchToBeUpdated.updateWinner(winner);
    }

    findMatchById(matchId: string): Match {
        const matches = this.getMatches();
        const match = matches.find(match => match.id === matchId);
        if (!match) {
            throw new Error('Match not found');
        }
        return match;
    }

    findMatchByNumber(number: number): Match {

        // loop through all rounds and matches to find the match with the given id
        let matches = this.getMatches();
        for (let match of matches) {
            if (match.number === number) {
                return match;
            }
        }

        throw new Error('Match with number: ' + number + ' not found');
    }

    // return matches flattened and in no particular order
    getMatches(): Match[] {

        let matches: Match[] = [];

        matches = matches.concat(this.winnersBracket.flat());
        matches = matches.concat(this.losersBracket.flat());

        // add final and final rematch
        if (this.final) {
            matches.push(this.final);
        }
        if (this.finalRematch) {
            matches.push(this.finalRematch);
        }

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

    canGetWinnerFromFinal(): boolean {
        if (!this.final) {
            return false;
        }
        const winnersBracketFinal = this.winnersBracket[this.winnersBracket.length - 1][0];
        // return true if winner of final is winner of winners bracket final too
        return this.final.isDecided() && this.final.getWinningPlayer() === winnersBracketFinal.getWinningPlayer();
    }

    getFirstPlace(): string | undefined {

        if (!this.final) {
            return undefined;
        }
        // if the final rematch has not taken place, and the final has, and the winner of the final is the winner of the last winnners bracket match
        if (this.canGetWinnerFromFinal()) {
            return this.final.getWinningPlayer();
        }

        if (!this.finalRematch) {
            return undefined;
        }

        // if the final rematch has taken place, then the first place is the winner of the final rematch
        if (this.finalRematch.isDecided()) {
            return this.finalRematch.getWinningPlayer();
        }

        // if cannot get winner from final, and final rematch has not taken place, return undefined
        return undefined;
    }

    getSecondPlace(): string | undefined {

        if (this.canGetWinnerFromFinal()) {
            return this.final?.getLosingPlayer();
        }

        if (this.finalRematch?.isDecided()) {
            return this.finalRematch?.getLosingPlayer();
        }

        return undefined;
    }

    getThirdPlace(): string | undefined {

        if (!this.finalRematch) {
            return undefined;
        }

        if (this.competitorNames.length === 2) {
            return undefined;
        }

        const losersBracketFinal = this.losersBracket[this.losersBracket.length - 1][0];

        if (losersBracketFinal.isDecided()) {
            return losersBracketFinal.getLosingPlayer();
        }

        return undefined;
    }

    getLowestUnfilledMatchNumber(): number {
        const matches = this.getMatches();

        if (matches.length === 0) {
            return -1;
        }

        const sortedMatches = matches.sort((a, b) => a.number - b.number);
        for (let match of sortedMatches) {
            if (match.winner === -1) {
                return match.number;
            }
        }

        //TODO: what should really go here?
        // if no match unfilled, return largest number
        return matches[matches.length - 1].number;

    }

    finalRematchNeeded(): boolean {

        // if final is not decided, final rematch not needed
        if (!this.final?.isDecided()) {
            console.log('returning false because final is not decided');
            return false;
        }

        // if winners bracket final is not decided, final rematch not needed
        const winnersBracketFinal = this.winnersBracket[this.winnersBracket.length - 1][0];
        if (!winnersBracketFinal.isDecided()) {
            console.log('returning false because winners bracket final is not decided');
            return false;
        }

        // if winner of final came from winners bracket, final rematch not needed
        const winnersBracketFinalWinner = winnersBracketFinal.getWinningPlayer();
        const finalWinner = this.final?.getWinningPlayer();

        console.log('returning ', winnersBracketFinalWinner !== finalWinner, ' because winners bracket final winner is ', winnersBracketFinalWinner, ', and final winner is ', finalWinner);

        return winnersBracketFinalWinner !== finalWinner;
    }

    toDTO(): BracketDTO {

        const DTO = {
            id: this.id,
            tournamentId: this.tournament.id,
            gender: this.gender,
            experienceLevel: this.experienceLevel,
            hand: this.hand,
            weightLimit: this.weightLimit,
            competitorNames: this.competitorNames,
            winnersBracket: this.winnersBracket.map(round => round.map(match => match.toDTO())),
            losersBracket: this.losersBracket.map(round => round.map(match => match.toDTO())),
            final: this.final ? this.final.toDTO() : null,
            finalRematch: this.finalRematch ? this.finalRematch.toDTO() : null,
            currentMatchNumber: this.getLowestUnfilledMatchNumber(),
            finalRematchNeeded: this.finalRematchNeeded(),
            firstPlace: this.getFirstPlace(),
            secondPlace: this.getSecondPlace(),
            thirdPlace: this.getThirdPlace(),
        };

        return DTO;
    }
}

export default Bracket;