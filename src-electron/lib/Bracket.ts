import { serialize, deserialize, prepareMatches, } from './utils';
import { Gender, Hand, ExperienceLevel } from '../../src-shared/types';
import Match from './Match';
import Tournament from './Tournament';
import { BracketDTO } from '../../src-shared/BracketDTO';

class Bracket {

    __class: string = 'Bracket'

    tournament: Tournament | null

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

    constructor(tournament: Tournament | null = null, gender: Gender = 'Male', experienceLevel: ExperienceLevel = 'Amateur', hand: Hand = 'Left', weightLimit: number = 0, competitorNames: string[] = []) {

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

    updateMatch(round: number, match: number, winner: number) {

        let initialMatch = this.findMatchByRoundAndIndex(round, match);

        // if winner is 1 or 2, then update winner of the match, and traverse through dependent matches to update their winners
        if (winner === 1 || winner === 2) {

            let currentMatch = initialMatch;
            currentMatch.winner = winner;
            // assert string type because is currentWinner is 1 or 2, there better be 2 players lol
            let currentWinner: string | undefined = (currentMatch.winner === 1 ? currentMatch.player1 : currentMatch.player2) as string;
            let currentLoser: string | undefined = undefined; // should be unnecessary for the first update, and then should be set if necessary
            let currentWinDestination = currentMatch.win;
            let currentLossDestination = undefined;

            // update winner trajectory
            while (currentWinDestination || currentLossDestination) {

                // update player of winDestination. if that match is done, keep updating, otherwise stop.
                if (currentWinDestination) {

                    const { round: nextMatchRound, match: nextMatchIndex, slot: nextMatchSlot } = currentWinDestination;
                    const nextMatch = this.findMatchByRoundAndIndex(nextMatchRound, nextMatchIndex);
                    nextMatch.updatePlayer(currentWinner, nextMatchSlot);

                    currentWinDestination = nextMatch.win;

                    // if the match has a winner, and there is a winDestination, then keep going
                    if ((nextMatch.winner !== -1) && (nextMatch.winner)) {
                        currentWinDestination = nextMatch.win;
                        currentWinner = (nextMatch.winner === 1 ? nextMatch.player1 : nextMatch.player2) as string;
                        currentLoser = (nextMatch.winner === 1 ? nextMatch.player2 : nextMatch.player1) as string;
                    }
                }
            }

            currentMatch = initialMatch;
            currentWinner = undefined;
            currentLoser = (currentMatch.winner === 1 ? currentMatch.player2 : currentMatch.player1) as string;
            currentWinDestination = undefined;
            currentLossDestination = currentMatch.loss;

            // update loser trajectory
            while (currentLossDestination || currentWinDestination) {
                if (currentLossDestination) {

                    const { round: nextMatchRound, match: nextMatchIndex, slot: nextMatchSlot } = currentLossDestination;
                    const nextMatch = this.findMatchByRoundAndIndex(nextMatchRound, nextMatchIndex);
                    nextMatch.updatePlayer(currentLoser, nextMatchSlot);

                    currentLossDestination = nextMatch.win;

                    // if the match has a winner, and there is a winDestination, then keep going
                    if ((nextMatch.winner !== -1) && (nextMatch.winner)) {
                        currentLossDestination = nextMatch.win;
                        currentWinner = (nextMatch.winner === 1 ? nextMatch.player1 : nextMatch.player2) as string;
                        currentLoser = (nextMatch.winner === 1 ? nextMatch.player2 : nextMatch.player1) as string;
                    }
                }
            }
        }
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