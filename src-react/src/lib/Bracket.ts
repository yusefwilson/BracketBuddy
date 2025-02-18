import Match from './Match';
import Round from './Round';
import { Gender, AgeGroup, Hand } from './types';

class Bracket {
    gender: Gender
    ageGroup: AgeGroup
    hand: Hand
    weightLimit: number // in lbs, -1 for no limit
    winnersBracket: Round[]
    losersBracket: Round[]

    nextMatchId: number

    constructor(gender: Gender, ageGroup: AgeGroup, hand: Hand, weightLimit: number, competitorNames: string[]) {

        // assign everything except rounds
        this.gender = gender;
        this.ageGroup = ageGroup;
        this.hand = hand;
        this.weightLimit = weightLimit;
        this.nextMatchId = 0;

        // generate rounds
        this.winnersBracket = Round.createInitialWinnerRounds(this, competitorNames);
        this.losersBracket = Round.createInitialLoserRounds(this.winnersBracket);

        // TODO: need to figure what order to generate matches and then generate them using createNext functions in Round class
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
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}

export default Bracket;