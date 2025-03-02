import Match from './Match';
import Bracket from './Bracket';
import { greatestPowerOf2LessThanOrEqualTo } from './utils';

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
        console.log('in createInitialWinnerRound***********************');
        // array of matches for the round
        let matches: Match[] = [];

        // create matches for the round
        for (let i = 0; i < competitorNames.length; i += 2) {
            matches.push(Match.createUnlinkedMatch(bracket.nextMatchId++, competitorNames[i], competitorNames[i + 1]));
        }

        let newRound = new Round(bracket, matches, true);
        console.log('*****returning round: ', newRound, ' from createInitialWinnerRound*****');
        return newRound;
    }

    // returns [winner round 0, winner round 1], or [winner round 1] if there are no byes in round 0
    static createInitialWinnerRounds(bracket: Bracket, competitorNames: string[]): Round[] {

        // find greatest power of 2 less than or equal to number of competitors
        const greatestPowerOf2 = greatestPowerOf2LessThanOrEqualTo(competitorNames.length);
        const numberOfRoundZeroMatches = competitorNames.length - greatestPowerOf2;

        console.log('in createInitialWinnerRounds***********************');

        console.log('greatestPowerOf2: ', greatestPowerOf2);
        console.log('competitorNames.length: ', competitorNames.length);
        console.log('numberOfRoundZeroMatches: ', numberOfRoundZeroMatches);


        // we don't need a 2^n - k round 0 if there are no byes
        if (numberOfRoundZeroMatches === 0) {
            console.log('creating only 1 initial winner round as the number of competitors is already a power of 2');
            return [Round.createInitialWinnerRound(bracket, competitorNames)];
        }

        // split competitors into round 0 and round 1
        const round0CompetitorNames = competitorNames.slice(0, numberOfRoundZeroMatches * 2);
        console.log('round0CompetitorNames: ', round0CompetitorNames);
        const round1CompetitorNames = competitorNames.slice(numberOfRoundZeroMatches * 2);
        console.log('round1CompetitorNames: ', round1CompetitorNames);

        const round0Matches: Match[] = [];

        // create matches for round 0
        for (let i = 0; i < numberOfRoundZeroMatches; i++) {
            let newMatch = Match.createUnlinkedMatch(bracket.nextMatchId++, round0CompetitorNames.shift() as string, round0CompetitorNames.shift() as string)
            round0Matches.push(newMatch);
        }

        // create round 0
        const round0 = new Round(bracket, round0Matches, true);

        const round0MatchesCopy = round0Matches.slice();
        const round0MatchesCopyLength = round0MatchesCopy.length;

        // create linked matches for round 1
        let round1Matches: Match[] = [];

        // for each match in round 0, link it to a competitor in round 1 as long as there are any
        for (let i = 0; i < round0MatchesCopyLength && round1CompetitorNames.length > 0; i++) {
            let newMatch = Match.createHalfLinkedMatch(bracket.nextMatchId++, round0MatchesCopy.shift() as Match, true, round1CompetitorNames.shift() as string);
            round1Matches.push(newMatch);
        }

        console.log('after creating half linked matches, round0MatchesCopy is ', round0MatchesCopy);

        // now, there are either some elements left in round1CompetitorNames, or there are some matches left in round0Matches
        if (round1CompetitorNames.length === 0) {
            for (let i = 0; i < round0MatchesCopy.length; i += 2) {
                let newMatch = Match.createLinkedMatch(bracket.nextMatchId++, round0MatchesCopy[i], true, round0MatchesCopy[i + 1], true);
                round1Matches.push(newMatch);
            }
        }

        console.log('finished creating linked matches for round 1. round1CompetitorNames: ', round1CompetitorNames);

        if (round1CompetitorNames.length > 0) {
            for (let i = 0; i < round1CompetitorNames.length; i += 2) {
                let newMatch = Match.createUnlinkedMatch(bracket.nextMatchId++, round1CompetitorNames[i], round1CompetitorNames[i + 1])
                round1Matches.push(newMatch);
            }
        }

        const round1 = new Round(bracket, round1Matches, true);

        console.log('*****returning rounds: ', round0, round1, ' from createInitialWinnerRounds*****');

        return [round0, round1];
    }

    // only called when initialWinnerRound.length === 2^n
    static createInitialLoserRound(intialWinnerRounds: Round[]): Round {
        console.log('in createInitialLoserRound*********************** with initialWinnerRounds: ', intialWinnerRounds);
        const bracket = intialWinnerRounds[0].bracket;

        // congrlomerate all matches from first 2 rounds
        const allWinnerMatches = intialWinnerRounds.length === 1 ? intialWinnerRounds[0].matches : intialWinnerRounds[0].matches.concat(intialWinnerRounds[1].matches);
        const allWinnerMatchesCopy = allWinnerMatches.slice();
        const allWinnerMatchesCopyLength = allWinnerMatchesCopy.length;

        // array of matches for the round
        let matches: Match[] = [];

        // create matches for the round
        for (let i = 0; i < allWinnerMatchesCopyLength; i+=2) {
            matches.push(Match.createLinkedMatch(bracket.nextMatchId++, allWinnerMatchesCopy.shift() as Match, false, allWinnerMatchesCopy.shift() as Match, false));
        }

        return new Round(bracket, matches, false);
    }

    static createInitialLoserRounds(initialWinnerRounds: Round[]): Round[] {

        let numCompetitors = 0;
        initialWinnerRounds.forEach(round => numCompetitors += round.matches.length);

        const greatestPowerOf2 = greatestPowerOf2LessThanOrEqualTo(numCompetitors);
        const numberOfRoundZeroMatches = numCompetitors - greatestPowerOf2;

        console.log('in createInitialLoserRounds***********************');
        console.log('numCompetitors: ', numCompetitors);
        console.log('greatestPowerOf2: ', greatestPowerOf2);
        console.log('numberOfRoundZeroMatches: ', numberOfRoundZeroMatches);

        // if we don't need any round zero matches, then we just create the first loser round
        if (numberOfRoundZeroMatches === 0) {
            console.log('creating only 1 initial loser round as the number of competitors is already a power of 2');
            return [Round.createInitialLoserRound(initialWinnerRounds)];
        }

        //  // otherwise, we need to perform the same 2^n - k split as we did for the initial winner rounds
        // conglomerate first 2 rounds for convenience
        const allWinnerMatches = initialWinnerRounds[0].matches.concat(initialWinnerRounds[1].matches);

        // get reference to bracket
        const bracket = initialWinnerRounds[0].bracket;

        // create matches for round 0. remove each match from the allWinnerMatches array as we use them
        const round0Matches: Match[] = [];
        for (let i = 0; i < numberOfRoundZeroMatches; i++) {
            let newMatch = Match.createLinkedMatch(bracket.nextMatchId++, allWinnerMatches.shift() as Match, false, allWinnerMatches.shift() as Match, false);
            round0Matches.push(newMatch);
        }

        // create round 0
        const round0 = new Round(bracket, round0Matches, false);

        // create linked matches for round 1
        const round1Matches: Match[] = [];

        // create copy of round zero matches so you don't mess with the original ones
        const round0MatchesCopy = round0Matches.slice();
        // cache length because we will be modifying the array
        const round0MatchesCopyLength = round0MatchesCopy.length;

        // for each match in round 0, link it to a match from allWinnerMatches as long as there are any
        for (let i = 0; i < round0MatchesCopyLength && allWinnerMatches.length > 0; i++) {
            let newMatch = Match.createLinkedMatch(bracket.nextMatchId++, round0MatchesCopy.shift() as Match, true, allWinnerMatches.shift() as Match, false);
            round1Matches.push(newMatch);
        }

        // now, there are either some elements left in allWinnerMatches, or there are some matches left in round0Matches

        // if there are any matches left in round0Matches, link them up
        if (round0MatchesCopy.length > 0) {
            for (let i = 0; i < round0Matches.length; i += 2) {
                let newMatch = Match.createLinkedMatch(bracket.nextMatchId++, round0MatchesCopy.shift() as Match, true, round0MatchesCopy.shift() as Match, true)
                round1Matches.push(newMatch);
            }
        }

        // if there are any matches left in allWinnerMatches, create new matches for them
        if (allWinnerMatches.length > 0) {
            console.log(' going inside if because there are winnermatches left: ', allWinnerMatches);
            for (let i = 0; i < allWinnerMatches.length; i += 2) {
                let newMatch = Match.createLinkedMatch(bracket.nextMatchId++, allWinnerMatches[i], false, allWinnerMatches[i + 1], false)
                round1Matches.push(newMatch);
            }
        }
        const round1 = new Round(bracket, round1Matches, false);

        console.log('*****returning rounds: ', round0, round1, ' from createInitialLoserRounds*****');

        return [round0, round1];
    }

    // creates a round of matches composed of the winners of the matches of the given round
    static createMatchesFromWinners(round: Round): Match[] {

        // this can only be called with a round that has an even number of matches, as all bye handling should be done on round 0, which is not created from this method
        if (round.matches.length % 2 !== 0) {
            throw new Error('createMatchesFromWinners can only be called on a Round that has an even number of matches. Received a Round with ' + round.matches.length + ' matches');
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

        console.log('in createMatchesFromWinnersAndLosers with winnerRound: ', winnerRound, ' and loserRound: ', loserRound);

        // array of matches for the next round
        let matches: Match[] = [];

        // pair each winner of the loser round with the loser of the winner round
        for (let i = 0; i < winnerRound.matches.length; i++) {

            console.log('about to create linked match with parent0 ', winnerRound.matches[i], ' and parent1 ', loserRound.matches[1]);
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
            console.log('about to create new loser round from winners of previous loser round and losers of given winner round')
            return new Round(this.bracket, Round.createMatchesFromWinnersAndLosers(winnerRound, this), false);
        }

        // otherwise, we simply generate the next round from the winners of the current loser round
        else {
            console.log('about to create new loser round from winners of previous loser round')
            return new Round(this.bracket, Round.createMatchesFromWinners(this), false);
        }
    }
}

export default Round;