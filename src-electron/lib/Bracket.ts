import { Gender, Hand, ExperienceLevel, WeightLimit, MatchStatus } from '../../src-shared/types.js';

import Match from './Match.js';
import Tournament from './Tournament.js';
import { serialize, deserialize, prepareMatches, shuffle } from './utils.js';
import { BracketDTO } from '../../src-shared/BracketDTO.js';

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
        this.setCompetitorNames(this.competitorNames); // ugly way to trigger bracket initialization
    }

    updateMatchById(matchId: string, status: MatchStatus) {
        const matchToBeUpdated = this.findMatchById(matchId);
        matchToBeUpdated.updateStatus(status);
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

    serialize(): string {
        return serialize(this);
    }

    static deserialize(serialized: string): Bracket {
        return deserialize(serialized, { Tournament, Bracket, Match });
    }

    toDTO(): BracketDTO {
        // implement in child class
        return {} as BracketDTO;
    }
}

export default Bracket;