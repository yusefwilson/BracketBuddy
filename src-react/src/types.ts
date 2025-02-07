enum Gender {
    Male,
    Female,
    Mixed
}

enum AgeGroup {
    Junior,
    Senior,
    Master,
    Grandmaster,
    SeniorGrandmaster,
}

enum Hand {
    Right,
    Left,
}

class Match {

    static nextId: number = 0

    id: number // in ascending numerical order, starting from 0, indicating order that matches should be played in. this ensures that matches must be created in the order they are to be played
    competitor0Name?: string
    competitor1Name?: string // if undefined and competitor0 not undefined, competitor0 gets a bye, winner will also be set to 0 on creation if match is bye
    winner?: number // 0 for competitor0, 1 for competitor, -1 or undefined for TBD
    bye?: boolean

    winnerChild?: Match
    loserChild?: Match

    constructor(competitor0Name?: string, competitor1Name?: string, winner?: number, bye?: boolean, winnerChild?: Match, loserChild?: Match) {
        this.id = Match.nextId++;
        this.competitor0Name = competitor0Name;
        this.competitor1Name = competitor1Name;
        this.winner = winner;
        this.bye = bye;
        this.winnerChild = winnerChild;
        this.loserChild = loserChild;
    }

    static createBye(competitorName: string) {

        // create new bye match
        return new Match(competitorName, undefined, 0, true);
    }

    // parentWinner = true means that the competitorName is the winner of the parent match, loser otherwise
    static createLinkedBye(parent: Match, parentWinner: boolean) {

        // create new bye match
        let bye = Match.createBye(parentWinner ? parent.getWinner() : parent.getLoser() as string);

        // link parent to child
        if (parentWinner) {
            parent.winnerChild = bye;
        }
        else {
            parent.loserChild = bye;
        }

        return bye;
    }

    static createLinkedMatch(parent0: Match, parent0Winner: boolean, parent1: Match, parent1Winner: boolean) {

        // create new match
        let newMatch = new Match(parent0Winner ? parent0.getWinner() : parent0.getLoser(), parent1Winner ? parent1.getWinner() : parent1.getLoser(), undefined, false);

        // link parents to child
        if (parent0Winner) {
            parent0.winnerChild = newMatch;
        }
        else {
            parent0.loserChild = newMatch;
        }

        if (parent1Winner) {
            parent1.winnerChild = newMatch;
        }
        else {
            parent1.loserChild = newMatch;
        }

        return newMatch;
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

    createNextWinnerSide() {

        // array of matches for the next round
        let nextWinnerSide: Match[] = [];

        // array of current matches we are examining from the winner side, never more than length 2
        let currentWinnerMatches: Match[] = [];

        // loop through winner side matches, creating new matches as needed and adding child references to the current matches
        for (let i = 0; i < this.winnerSide.length; i++) {

            if (currentWinnerMatches.length === 2) {

                console.log('creating new linked match with ' + currentWinnerMatches[0].getWinner() + ' and ' + currentWinnerMatches[1].getWinner());

                // create new linked match
                nextWinnerSide.push(Match.createLinkedMatch(currentWinnerMatches[0], true, currentWinnerMatches[1], true));

                // reset to zero matches
                currentWinnerMatches = [];
                console.log('resetting current matches');
            }

            currentWinnerMatches.push(this.winnerSide[i]);

            console.log('adding ', this.winnerSide[i], ' to current matches');
        }

        // if there were an odd number of matches, the last match will be a bye
        if (currentWinnerMatches.length === 1) {
            nextWinnerSide.push(Match.createLinkedBye(currentWinnerMatches[0], true));
        }

        // otherwise, if there are 2 matches left, create a normal match
        else if (currentWinnerMatches.length === 2) {
            nextWinnerSide.push(Match.createLinkedMatch(currentWinnerMatches[0], true, currentWinnerMatches[1], true));
        }

        return nextWinnerSide;
    }

    createNextLoserSide() {

        // array of matches for the next round
        let nextLoserSide: Match[] = [];

        // array of current matches we are examining from the loser side, never more than length 2
        let currentWinnerMatches: Match[] = [];

        // first, losers from winner side
        for (let i = 0; i < this.winnerSide.length; i++) {

            // byes have no real losers, so we skip them
            if (this.winnerSide[i].isBye()) {
                continue;
            }

            if (currentWinnerMatches.length === 2) {

                // create new linked match
                nextLoserSide.push(Match.createLinkedMatch(currentWinnerMatches[0], false, currentWinnerMatches[1], false));

                // reset to zero matches
                currentWinnerMatches = [];
            }

            currentWinnerMatches.push(this.winnerSide[i]);
        }

        // if there are 2 matches left in currentWinnerMatches, create a normal match. 1 left edge case is handled later in loop
        if (currentWinnerMatches.length === 2) {
            nextLoserSide.push(Match.createLinkedMatch(currentWinnerMatches[0], false, currentWinnerMatches[1], false));
        }

        // now, winners from loser side
        let currentLoserMatches: Match[] = [];

        for (let i = 0; i < this.loserSide.length; i++) {

            // edge case where there were an odd amount of losers from winner side and >= 1 winner from loser side
            if (currentWinnerMatches.length === 1 && currentLoserMatches.length === 1) {
                nextLoserSide.push(Match.createLinkedMatch(currentWinnerMatches[0], false, currentLoserMatches[0], true));
                currentWinnerMatches = [];
                currentLoserMatches = [];
            }

            if (currentLoserMatches.length === 2) {

                // create new linked match
                nextLoserSide.push(Match.createLinkedMatch(currentLoserMatches[0], true, currentLoserMatches[1], true));

                // reset to zero matches
                currentLoserMatches = [];
            }

            currentLoserMatches.push(this.loserSide[i]);
        }

        // if there is a match left in currentLoserMatches, its winner receives a bye in the next round
        if (currentLoserMatches.length === 1) {
            nextLoserSide.push(Match.createLinkedBye(currentLoserMatches[0], true));
        }

        // otherwise, if there are 2 matches left, create a normal match
        else if (currentLoserMatches.length === 2) {
            nextLoserSide.push(Match.createLinkedMatch(currentLoserMatches[0], true, currentLoserMatches[1], true));
        }

        return nextLoserSide;
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

export { Bracket, Match, Round, Gender, AgeGroup, Hand };