import { parse, stringify } from 'flatted';
import { deepSerialize, deepDeserialize } from './utils';

import Tournament from './Tournament';
import Match from './Match';
import Round from './Round';
import { Gender, Hand, ExperienceLevel } from './types';

class Bracket {
    gender: Gender
    experienceLevel: ExperienceLevel
    hand: Hand
    weightLimit: number // in lbs, -1 for no limit
    winnersBracket: Round[]
    losersBracket: Round[]

    nextMatchId: number

    constructor(gender: Gender, experienceLevel: ExperienceLevel, hand: Hand, weightLimit: number, competitorNames: string[]) {

        // assign everything except rounds
        this.gender = gender;
        this.experienceLevel = experienceLevel;
        this.hand = hand;
        this.weightLimit = weightLimit;
        this.nextMatchId = 1;

        // generate rounds
        this.winnersBracket = Round.createInitialWinnerRounds(this, competitorNames);
        this.losersBracket = Round.createInitialLoserRounds(this.winnersBracket);

        // create the rest of the bracket
        let currentWinnerRound = this.winnersBracket[this.winnersBracket.length - 1];
        let currentLoserRound = this.losersBracket[this.losersBracket.length - 1];

        while (currentWinnerRound.matches.length > 1) {

            // first, process a winner round
            currentWinnerRound = currentWinnerRound.createNextWinnerRound();
            this.winnersBracket.push(currentWinnerRound);

            // now, process loser bracket until the amount of matches in both brackets is the same
            while (currentLoserRound.matches.length !== currentWinnerRound.matches.length) {
                // create loser round from previous loser round
                currentLoserRound = currentLoserRound.createNextLoserRound(undefined);
                this.losersBracket.push(currentLoserRound);
            }

            // now, the current loser round and winner round have the same amount of matches, so we create a loser round from the loser and winner round
            currentLoserRound = currentLoserRound.createNextLoserRound(currentWinnerRound);
            this.losersBracket.push(currentLoserRound);
        }

        // now, create finals. this is the winner of the last match of the losers bracket vs the winner of the last match of the winners bracket.

        const finalsMatch = Match.createLinkedMatch(this.nextMatchId++, currentWinnerRound.matches[0], true, currentLoserRound.matches[0], true);
        const finalsRound = new Round(this, [finalsMatch], true);
        this.winnersBracket.push(finalsRound);
        // now, create grand final (finals rematch if the guy from the loser's bracket wins)
        //const grandFinalsMatch = 
    }

    findMatchById(id: number): Match | undefined {

        // loop through all rounds and matches to find the match with the given id
        for (let round of this.winnersBracket) {
            for (let match of round.matches) {
                if (match.id === id) {
                    return match;
                }
            }
        }

        for (let round of this.losersBracket) {
            for (let match of round.matches) {
                if (match.id === id) {
                    return match;
                }
            }
        }

        return undefined;
    }

    // TODO: hacky, look to replace. currently used to update reference of Bracket to trigger useState refresh.
    markUpdated(): Bracket {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this) as Bracket;
    }

    print() {
        console.log(`Bracket with gender ${this.gender}, age group ${this.experienceLevel}, hand ${this.hand}, and weight limit ${this.weightLimit} lbs:`);

        console.log('Winners Bracket:');
        this.winnersBracket.forEach((round, i) => {
            console.log(`Round ${i + 1}:`);
            round.matches.forEach(match => {
                console.log(`Match ${match.id}: ${match.competitor0Name} vs ${match.competitor1Name}`);
            });
        });

        console.log('Losers Bracket:');
        this.losersBracket.forEach((round, i) => {
            console.log(`Round ${i + 1}:`);
            round.matches.forEach(match => {
                console.log(`Match ${match.id}: ${match.competitor0Name} vs ${match.competitor1Name}`);
            });
        });
    }

    serialize(): string {
        return stringify(deepSerialize(this));
    }

    static deserialize(serialized: string): Bracket {
        return deepDeserialize(parse(serialized), { Tournament, Bracket, Round, Match, Date }) as Bracket;
    }
}

export default Bracket;