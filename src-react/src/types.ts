enum Gender {
    Male = 'Male',
    Female = 'Female',
    Mixed = 'Mixed'
}

enum AgeGroup {
    Junior = 'Junior',
    Senior = 'Senior',
    Master = 'Master',
    Grandmaster = 'Grandmaster',
    SeniorGrandmaster = 'Senior Grandmaster',
}

enum Hand {
    Right = 'Right',
    Left = 'Left',
}

class Match {
    static nextId: number = 0
    id: number // in ascending numerical order, starting from 0, indicating order that matches should be played in. this ensures that matches must be created in the order they are to be played
    competitor0Name?: string
    competitor1Name?: string // if undefined and competitor0 not undefined, competitor0 gets a bye, winner will also be set to 0 on creation if match is bye
    winner?: number // 0 for competitor0, 1 for competitor, -1 or undefined for TBD
    bye?: boolean


    constructor(competitor0Name?: string, competitor1Name?: string, winner?: number, bye?: boolean) {
        this.id = Match.nextId++;
        this.competitor0Name = competitor0Name;
        this.competitor1Name = competitor1Name;
        this.winner = winner;
        this.bye = bye;
    }

    isBye() {
        return this.bye ? true : false; //might seem tautological, but this is to prevent undefined from being returned
    }

    getWinner() {
        if (this.winner === -1 || this.winner === undefined) {
            return 'Winner of match ' + this.id;
        }

        // if winner is set to 0 or 1, then the corresponding competitor name is definitely not undefined
        return (this.winner === 0 ? this.competitor0Name : this.competitor1Name) as string;
    }

    getLoser() {
        if (this.isBye()) {
            return undefined;
        }
        else if (this.winner === -1 || this.winner === undefined) {
            return 'Loser of match ' + this.id;
        }
        return this.winner === 0 ? this.competitor1Name : this.competitor0Name;
    }
}

class Round {
    winnerSide: Match[]
    loserSide: Match[]

    constructor(winnerSide: Match[], loserSide: Match[]) {
        this.winnerSide = winnerSide;
        this.loserSide = loserSide;
    }

    collectWinners() {
        return this.winnerSide.map(match => match.getWinner());
    }

    collectLosers() {
        const losersFromWinnerSide = this.winnerSide.map(match => match.getLoser()).filter(loser => loser !== undefined); //filter out undefined losers (byes)
        const winnersFromLoserSide = this.loserSide.map(match => match.getWinner());
        return losersFromWinnerSide.concat(winnersFromLoserSide);
    }
}

class Bracket {
    gender: Gender
    ageGroup: AgeGroup
    hand: Hand
    weightLimit: number // in lbs, -1 for no limit
    rounds: Round[]

    constructor(gender: Gender, ageGroup: AgeGroup, hand: Hand, weightLimit: number, rounds: Round[]) {
        this.gender = gender;
        this.ageGroup = ageGroup;
        this.hand = hand;
        this.weightLimit = weightLimit;
        this.rounds = rounds;
    }
}

export type { Gender, AgeGroup, Hand };
export { Bracket, Match, Round };