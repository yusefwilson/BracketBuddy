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

function greatestPowerOf2LessThanOrEqualTo(n: number): number {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
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

    constructor(id: number, competitor0Name?: string, competitor1Name?: string, winner?: number, winnerChild?: Match, loserChild?: Match,
        competitor0Parent?: Match, competitor1Parent?: Match, competitor0PreviouslyWinner?: boolean, competitor1PreviouslyWinner?: boolean
    ) {
        this.id = id;
        this.competitor0Name = competitor0Name;
        this.competitor1Name = competitor1Name;
        this.winner = winner;
        this.winnerChild = winnerChild;
        this.loserChild = loserChild;
        this.competitor0Parent = competitor0Parent;
        this.competitor1Parent = competitor1Parent;
        this.competitor0PreviouslyWinner = competitor0PreviouslyWinner;
        this.competitor1PreviouslyWinner = competitor1PreviouslyWinner;
    }

    static createLinkedMatch(id: number, parent0: Match, parent0Winner: boolean, parent1: Match, parent1Winner: boolean) {

        // create new match
        let newMatch = new Match(id, parent0Winner ? parent0.getWinner() : parent0.getLoser(), parent1Winner ? parent1.getWinner() : parent1.getLoser(), undefined);

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

    static createHalfLinkedMatch(id: number, parent0: Match, parent0Winner: boolean, competitor1Name: string) {

        // create new match
        let newMatch = new Match(id, parent0Winner ? parent0.getWinner() : parent0.getLoser(), competitor1Name, undefined);

        // link parents to child
        if (parent0Winner) {
            parent0.winnerChild = newMatch;
        }
        else {
            parent0.loserChild = newMatch;
        }

        // link child to parents
        newMatch.competitor0Parent = parent0;

        return newMatch;
    }

    static createUnlinkedMatch(id: number, competitor0Name: string, competitor1Name: string) {

        // create new match
        return new Match(id, competitor0Name, competitor1Name);
    }

    getWinner() {
        if (this.winner === -1 || this.winner === undefined) {
            return 'Winner of match ' + this.id;
        }

        // if winner is set to 0 or 1, then the corresponding competitor name is definitely not undefined
        return (this.winner === 0 ? this.competitor0Name : this.competitor1Name) as string;
    }

    getLoser() {
        if (this.winner === -1 || this.winner === undefined) {
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
    matches: Match[]
    winnerRound: boolean

    constructor(bracket: Bracket, matches: Match[], winnerRound: boolean) {
        this.bracket = bracket;
        this.matches = matches;
        this.winnerRound = winnerRound;
    }

    // only called when competitorNames.length === 2^n
    static createInitialWinnerRound(bracket: Bracket, competitorNames: string[]): Round {

        // array of matches for the round
        let matches: Match[] = [];

        // create matches for the round
        for (let i = 0; i < competitorNames.length; i += 2) {
            matches.push(Match.createUnlinkedMatch(bracket.nextMatchId++, competitorNames[i], competitorNames[i + 1]));
        }

        return new Round(bracket, matches, true);
    }

    // returns [winner round 0, winner round 1], or [winner round 1] if there are no byes in round 0
    static createInitialWinnerRounds(bracket: Bracket, competitorNames: string[]): Round[] {

        // find greatest power of 2 less than or equal to number of competitors
        const greatestPowerOf2 = greatestPowerOf2LessThanOrEqualTo(competitorNames.length);
        const numberOfRoundZeroMatches = competitorNames.length - greatestPowerOf2;

        // we don't need a 2^n - k round 0 if there are no byes
        if (numberOfRoundZeroMatches === 0) {
            return [Round.createInitialWinnerRound(bracket, competitorNames)];
        }

        // split competitors into round 0 and round 1
        const round0CompetitorNames = competitorNames.slice(0, numberOfRoundZeroMatches * 2);
        const round1CompetitorNames = competitorNames.slice(numberOfRoundZeroMatches * 2);

        let round0Matches: Match[] = [];

        // create matches for round 0
        for (let i = 0; i < numberOfRoundZeroMatches; i += 2) {
            round0Matches.push(Match.createUnlinkedMatch(bracket.nextMatchId++, round0CompetitorNames[i], round0CompetitorNames[i + 1]));
        }

        // create round 0
        const round0 = new Round(bracket, round0Matches, true);

        // create linked matches for round 1
        let round1Matches: Match[] = [];

        // for each match in round 0, link it to a competitor in round 1 as long as there are any
        for (let i = 0; i < round0Matches.length && round1CompetitorNames.length > 0; i++) {
            let newMatch = Match.createHalfLinkedMatch(bracket.nextMatchId++, round0Matches[i], true, round1CompetitorNames.shift() as string);
            round1Matches.push(newMatch);
        }

        // now, there are either some elements left in round1CompetitorNames, or there are some matches left in round0Matches
        if (round1CompetitorNames.length === 0) {
            for (let i = 0; i < round0Matches.length; i += 2) {
                round1Matches.push(Match.createLinkedMatch(bracket.nextMatchId++, round0Matches[i], true, round0Matches[i + 1], true));
            }
        }

        if (round1CompetitorNames.length > 0) {
            for (let i = 0; i < round1CompetitorNames.length; i += 2) {
                round1Matches.push(Match.createUnlinkedMatch(bracket.nextMatchId++, round1CompetitorNames[i], round1CompetitorNames[i + 1]));
            }
        }

        const round1 = new Round(bracket, round1Matches, true);

        return [round0, round1];
    }

    // only called when initialWinnerRound.length === 2^n
    static createInitialLoserRound(intialWinnerRound: Round): Round {

        const bracket = intialWinnerRound.bracket;

        // array of matches for the round
        let matches: Match[] = [];

        // create matches for the round
        for (let i = 0; i < intialWinnerRound.matches.length; i += 2) {
            matches.push(Match.createLinkedMatch(bracket.nextMatchId++, intialWinnerRound.matches[i], false, intialWinnerRound.matches[i + 1], false));
        }

        return new Round(bracket, matches, false);
    }

    static createInitialLoserRounds(initialWinnerRounds: Round[]): Round[] {

        const numCompetitors = initialWinnerRounds[0].matches.length * 2 + initialWinnerRounds[1].matches.length;
        const greatestPowerOf2 = greatestPowerOf2LessThanOrEqualTo(numCompetitors);
        const numberOfRoundZeroMatches = numCompetitors - greatestPowerOf2;

        // if we don't need any round zero matches, then we just create the first loser round
        if (numberOfRoundZeroMatches === 0) {
            return [Round.createInitialLoserRound(initialWinnerRounds[0])];
        }

        //  // otherwise, we need to perform the same 2^n - k split as we did for the initial winner rounds
        // conglomerate first 2 rounds for convenience
        const allWinnerMatches = initialWinnerRounds[0].matches.concat(initialWinnerRounds[1].matches);

        // get reference to bracket
        const bracket = initialWinnerRounds[0].bracket;

        // create matches for round 0. remove each winner match from the allWinnerMatches array as we use them
        const round0Matches: Match[] = [];
        for (let i = 0; i < numberOfRoundZeroMatches; i += 2) {
            round0Matches.push(Match.createLinkedMatch(bracket.nextMatchId++, allWinnerMatches.shift() as Match, true, allWinnerMatches.shift() as Match, true));
        }

        // create round 0
        const round0 = new Round(bracket, round0Matches, false);

        // create linked matches for round 1
        const round1Matches: Match[] = [];

        // for each match in round 0, link it to a match from allWinnerMatches as long as there are any
        for (let i = 0; i < round0Matches.length && allWinnerMatches.length > 0; i++) {
            let newMatch = Match.createLinkedMatch(bracket.nextMatchId++, round0Matches[i], true, allWinnerMatches.shift() as Match, false);
            round1Matches.push(newMatch);
        }

        // now, there are either some elements left in allWinnerMatches, or there are some matches left in round0Matches

        // if there are any matches left in round0Matches, link them up
        if (allWinnerMatches.length === 0) {
            for (let i = 0; i < round0Matches.length; i += 2) {
                round1Matches.push(Match.createLinkedMatch(bracket.nextMatchId++, round0Matches[i], true, round0Matches[i + 1], true));
            }
        }

        // if there are any matches left in allWinnerMatches, create new matches for them
        if (allWinnerMatches.length > 0) {
            for (let i = 0; i < allWinnerMatches.length; i += 2) {
                round1Matches.push(Match.createLinkedMatch(bracket.nextMatchId++, allWinnerMatches[i], false, allWinnerMatches[i + 1], false));
            }
        }

        const round1 = new Round(bracket, round1Matches, false);

        return [round0, round1];
    }

    // creates a round of matches composed of the winners of the matches of the given round
    static createMatchesFromWinners(round: Round): Match[] {

        // this can only be called with a round that has an even number of matches, as all bye handling should be done on round 0, which is not created from this method
        if (round.matches.length % 2 !== 0) {
            throw new Error('createNextWinnerSide can only be called on a Round that has an even number of matches');
        }

        // array of matches for the next round
        let matches: Match[] = [];

        // loop through winner side matches, creating new matches as needed and adding child references to the current matches
        for (let i = 0; i < round.matches.length; i += 2) {

            // create new linked match
            matches.push(Match.createLinkedMatch(round.bracket.nextMatchId++, round.matches[i], true, round.matches[i + 1], true));
        }

        return matches;
    }

    // creates a round of matches composed of the losers of the matches of the given winner round and the winners of the matches of the given loser round. 
    static createMatchesFromWinnersAndLosers(winnerRound: Round, loserRound: Round) {
        // this can only be called with 2 round of the exact same length, since winners of losers are pitted against losers of winners
        if (winnerRound.matches.length !== loserRound.matches.length) {
            throw new Error('createMatchesFromWinnersAndLosers can only be called on two Rounds of the same length');
        }

        // array of matches for the next round
        let matches: Match[] = [];

        // pair each winner of the loser round with the loser of the winner round
        for (let i = 0; i < winnerRound.matches.length; i += 2) {

            // create new linked match
            matches.push(Match.createLinkedMatch(winnerRound.bracket.nextMatchId++, winnerRound.matches[i], false, loserRound.matches[i], true));
        }

        return matches;
    }

    // creates a round of matches composed of the winners of the previous winner round. Can only be called on a winner round.
    createNextWinnerRound() {

        // this can only be called on a Round that is a winner round
        if (!this.winnerRound) {
            throw new Error('createNextWinnerRound can only be called on a Round that is a winner round');
        }

        // create and return the next round
        return new Round(this.bracket, Round.createMatchesFromWinners(this), true);
    }

    // creates a round of matches from the winners of the previous loser round, and also includes losers from the given winner round. Can only be called on a loser round.
    createNextLoserRound(winnerRound: Round | undefined) {

        if (this.winnerRound) {
            throw new Error('createNextLoserRound can only be called on a Round that is a loser round');
        }

        // if we are given the winnerRound argument, then we need to include losers from the given winnerRound
        if (winnerRound) {
            return new Round(this.bracket, Round.createMatchesFromWinnersAndLosers(winnerRound, this), false);
        }

        // otherwise, we simply generate the next round from the winners of the current loser round
        else {
            return new Round(this.bracket, Round.createMatchesFromWinners(this), false);
        }
    }
}

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
        let currentWinnerRound = this.winnersBracket[0];
        let currentLoserRound = this.losersBracket[0];

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

export { Bracket, Match, Round, Gender, AgeGroup, Hand };