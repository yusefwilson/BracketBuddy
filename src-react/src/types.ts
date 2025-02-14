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

    id: number // in ascending numerical order, starting from 0, indicating order that matches should be played in. this ensures that matches must be created in the order they are to be played
    competitor0Name?: string
    competitor1Name?: string // if undefined and competitor0 not undefined, competitor0 gets a bye, winner will also be set to 0 on creation if match is bye
    winner?: number // 0 for competitor0, 1 for competitor, -1 or undefined for TBD
    bye?: boolean

    winnerChild?: Match
    loserChild?: Match

    competitor0Parent?: Match
    competitor1Parent?: Match
    competitor0PreviouslyWinner?: boolean
    competitor1PreviouslyWinner?: boolean

    constructor(id: number, competitor0Name?: string, competitor1Name?: string, winner?: number, bye?: boolean, winnerChild?: Match, loserChild?: Match,
        competitor0Parent?: Match, competitor1Parent?: Match, competitor0PreviouslyWinner?: boolean, competitor1PreviouslyWinner?: boolean
    ) {
        this.id = id;
        this.competitor0Name = competitor0Name;
        this.competitor1Name = competitor1Name;
        this.winner = winner;
        this.bye = bye;
        this.winnerChild = winnerChild;
        this.loserChild = loserChild;
        this.competitor0Parent = competitor0Parent;
        this.competitor1Parent = competitor1Parent;
        this.competitor0PreviouslyWinner = competitor0PreviouslyWinner;
        this.competitor1PreviouslyWinner = competitor1PreviouslyWinner;
    }

    static createBye(id: number, competitorName: string) {

        // create new bye match
        return new Match(id, competitorName, undefined, 0, true);
    }

    // parentWinner = true means that the competitorName is the winner of the parent match, loser otherwise
    static createLinkedBye(id: number, parent: Match, parentWinner: boolean) {

        // create new bye match
        let bye = Match.createBye(id, parentWinner ? parent.getWinner() : parent.getLoser() as string);

        // link parent to child
        if (parentWinner) {
            parent.winnerChild = bye;
        }
        else {
            parent.loserChild = bye;
        }

        bye.competitor0Parent = parent;
        bye.competitor0PreviouslyWinner = parentWinner;

        return bye;
    }

    static createLinkedMatch(id: number, parent0: Match, parent0Winner: boolean, parent1: Match, parent1Winner: boolean) {

        // create new match
        let newMatch = new Match(id, parent0Winner ? parent0.getWinner() : parent0.getLoser(), parent1Winner ? parent1.getWinner() : parent1.getLoser(), undefined, false);

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

        // link child to parents
        newMatch.competitor0Parent = parent0;
        newMatch.competitor1Parent = parent1;
        newMatch.competitor0PreviouslyWinner = parent0Winner;
        newMatch.competitor1PreviouslyWinner = parent1Winner;

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

    // update the winner of this match and then trigger a recursive update of all children matches' competitor names
    updateWinner(winner: number) {
        this.winner = winner;

        if (this.winnerChild) {
            console.log('updating winner child which has id ' + this.winnerChild.id);
            this.winnerChild.updateNames();
        }

        if (this.loserChild) {
            console.log('updating loser child which has id ' + this.loserChild.id);
            this.loserChild.updateNames();
        }
    }

    // update the winner of this match and all its children recursively
    updateNames() {

        if (this.competitor0Parent) {
            this.competitor0Name = this.competitor0PreviouslyWinner ? this.competitor0Parent.getWinner() : this.competitor0Parent.getLoser();
        }
        if (this.competitor1Parent) {
            this.competitor1Name = this.competitor1PreviouslyWinner ? this.competitor1Parent.getWinner() : this.competitor1Parent.getLoser();
        }

        console.log('updated names for match ' + this.id + ' to ' + this.competitor0Name + ' and ' + this.competitor1Name);

        if (this.winnerChild) {
            this.winnerChild.updateNames();
        }
        if (this.loserChild) {
            this.loserChild.updateNames();
        }
    }
}

class Round {

    bracket: Bracket
    winnerSide: Match[]
    loserSide: Match[]

    constructor(bracket: Bracket, winnerSide: Match[], loserSide: Match[]) {
        this.bracket = bracket;
        this.winnerSide = winnerSide;
        this.loserSide = loserSide;
    }

    static generateInitialRound(bracket: Bracket, competitorNames: string[]): Round {
        // generate the initial round
        let winnerSide: Match[] = [];

        for (let i = 0; i < competitorNames.length; i += 2) {

            // if there is only one competitor left, add a bye
            if (i + 1 >= competitorNames.length) {
                winnerSide.push(Match.createBye(bracket.nextMatchId++, competitorNames[i]));
                break;
            }

            const newMatch = new Match(bracket.nextMatchId++, competitorNames[i], competitorNames[i + 1], undefined);

            winnerSide.push(newMatch);
        }

        const loserSide: Match[] = [];
        return new Round(bracket, winnerSide, loserSide);
    }

    createNextWinnerSide() {

        // array of matches for the next round
        let nextWinnerSide: Match[] = [];

        // array of current matches we are examining from the winner side, never more than length 2
        let currentWinnerMatches: Match[] = [];

        // loop through winner side matches, creating new matches as needed and adding child references to the current matches
        for (let i = 0; i < this.winnerSide.length; i++) {

            if (currentWinnerMatches.length === 2) {

                // create new linked match
                nextWinnerSide.push(Match.createLinkedMatch(this.bracket.nextMatchId++, currentWinnerMatches[0], true, currentWinnerMatches[1], true));

                // reset to zero matches
                currentWinnerMatches = [];
                console.log('resetting current matches');
            }

            currentWinnerMatches.push(this.winnerSide[i]);
        }

        // if there were an odd number of matches, the last match will be a bye
        if (currentWinnerMatches.length === 1) {
            nextWinnerSide.push(Match.createLinkedBye(this.bracket.nextMatchId++, currentWinnerMatches[0], true));
        }

        // otherwise, if there are 2 matches left, create a normal match
        else if (currentWinnerMatches.length === 2) {
            nextWinnerSide.push(Match.createLinkedMatch(this.bracket.nextMatchId++, currentWinnerMatches[0], true, currentWinnerMatches[1], true));
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
                nextLoserSide.push(Match.createLinkedMatch(this.bracket.nextMatchId++, currentWinnerMatches[0], false, currentWinnerMatches[1], false));

                // reset to zero matches
                currentWinnerMatches = [];
            }

            currentWinnerMatches.push(this.winnerSide[i]);
        }

        // if there are 2 matches left in currentWinnerMatches, create a normal match. 1 left edge case is handled later in loop
        if (currentWinnerMatches.length === 2) {
            nextLoserSide.push(Match.createLinkedMatch(this.bracket.nextMatchId++, currentWinnerMatches[0], false, currentWinnerMatches[1], false));
        }

        // now, winners from loser side
        let currentLoserMatches: Match[] = [];

        for (let i = 0; i < this.loserSide.length; i++) {

            // edge case where there were an odd amount of losers from winner side and >= 1 winner from loser side
            if (currentWinnerMatches.length === 1 && currentLoserMatches.length === 1) {
                nextLoserSide.push(Match.createLinkedMatch(this.bracket.nextMatchId++, currentWinnerMatches[0], false, currentLoserMatches[0], true));
                currentWinnerMatches = [];
                currentLoserMatches = [];
            }

            if (currentLoserMatches.length === 2) {

                // create new linked match
                nextLoserSide.push(Match.createLinkedMatch(this.bracket.nextMatchId++, currentLoserMatches[0], true, currentLoserMatches[1], true));

                // reset to zero matches
                currentLoserMatches = [];
            }

            currentLoserMatches.push(this.loserSide[i]);
        }

        // if there is a match left in currentLoserMatches, its winner receives a bye in the next round
        if (currentLoserMatches.length === 1) {
            nextLoserSide.push(Match.createLinkedBye(this.bracket.nextMatchId++, currentLoserMatches[0], true));
        }

        // otherwise, if there are 2 matches left, create a normal match
        else if (currentLoserMatches.length === 2) {
            nextLoserSide.push(Match.createLinkedMatch(this.bracket.nextMatchId++, currentLoserMatches[0], true, currentLoserMatches[1], true));
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

    nextMatchId: number = 0

    constructor(gender: Gender, ageGroup: AgeGroup, hand: Hand, weightLimit: number, competitorNames: string[]) {

        // assign everything except rounds
        this.gender = gender;
        this.ageGroup = ageGroup;
        this.hand = hand;
        this.weightLimit = weightLimit;

        // generate rounds
        const initialRound = Round.generateInitialRound(this, competitorNames);
        const rounds = [initialRound];
        let previousRound = initialRound;

        // generate the rest of the rounds with end condition: there is only 1 match in the winner side and the loser side is empty
        while (previousRound.winnerSide.length > 1 || previousRound.loserSide.length > 0) {

            let nextRound: Round;

            // special case: there was only 1 bye match in the winners side and only 1 match on the losers side: this is the semifinal, which means the new round will only have 1 match in the winners side, with the winner of the bye match and the winner of the losers match
            if (previousRound.winnerSide.length === 1 && previousRound.loserSide.length === 1) {

                const lastWinnerSide = [Match.createLinkedMatch(this.nextMatchId++, previousRound.winnerSide[0], true, previousRound.loserSide[0], true)];
                nextRound = new Round(this, lastWinnerSide, []);
                rounds.push(nextRound);

                break;
            }

            // normal case: create the next round using inbuilt round functions
            const winnerSide = previousRound.createNextWinnerSide();
            const loserSide = previousRound.createNextLoserSide();

            nextRound = new Round(this, winnerSide, loserSide);
            rounds.push(nextRound);

            previousRound = nextRound;
        }

        // add rounds to bracket
        this.rounds = rounds;
    }

    findMatchById(id: number): Match | undefined {

        for (let i = 0; i < this.rounds.length; i++) {
            for (let j = 0; j < this.rounds[i].winnerSide.length; j++) {
                if (this.rounds[i].winnerSide[j].id === id) {
                    return this.rounds[i].winnerSide[j];
                }
            }
            for (let j = 0; j < this.rounds[i].loserSide.length; j++) {
                if (this.rounds[i].loserSide[j].id === id) {
                    return this.rounds[i].loserSide[j];
                }
            }
        }

        return undefined;
    }

    // hacky, look to replace
    markUpdated(): Bracket {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}

export { Bracket, Match, Round, Gender, AgeGroup, Hand };