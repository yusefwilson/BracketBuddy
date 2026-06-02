import { Gender, Hand, ExperienceLevel, WeightLimit, MatchStatus, BracketType } from '../../src-shared/types.js';

import Match from './Match.js';
import Tournament from './Tournament.js';
import { serialize, shuffle } from './utils.js';
import { BracketDTO } from '../../src-shared/BracketDTO.js';

abstract class Bracket {

    __class: string = 'Bracket'

    abstract type: BracketType

    tournament: Tournament

    id: string

    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: WeightLimit

    competitorNames: string[]

    constructor(tournament: Tournament = new Tournament(), gender: Gender = 'Male', experienceLevel: ExperienceLevel = 'Amateur', hand: Hand = 'Left', weightLimit: WeightLimit = 0, competitorNames: string[] = []) {

        // tournament.id-gender-experienceLevel-hand-weightLimit
        this.id = tournament?.id + [gender, experienceLevel, hand, weightLimit].join('-');

        this.tournament = tournament;
        this.gender = gender;
        this.experienceLevel = experienceLevel;
        this.hand = hand;
        this.weightLimit = weightLimit;

        this.competitorNames = competitorNames;
    }

    // create the initial bracket structure from the current competitor names
    abstract initialize(): void;

    // return all matches flattened and in no particular order
    abstract getMatches(): Match[];

    abstract toDTO(): BracketDTO;

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

    // the lowest-numbered match that has not yet been decided (used for "current match" highlighting)
    getLowestUnfilledMatchNumber(): number {
        const matches = this.getMatches();

        if (matches.length === 0) {
            return -1;
        }

        const sortedMatches = matches.sort((a, b) => a.number - b.number);
        for (let match of sortedMatches) {
            if (match.status === 'UNDECIDED') {
                return match.number;
            }
        }

        //TODO: what should really go here?
        // if no match unfilled, return largest number
        return matches[matches.length - 1].number;
    }

    serialize(): string {
        return serialize(this);
    }
}

export default Bracket;
