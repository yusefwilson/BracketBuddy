import Match from './Match';
import Bracket from './Bracket';
import { greatestPowerOf2LessThanOrEqualTo } from './utils';
import { validateLinkFunctionMapping, InitialRoundMapping, InitialWinnerMatchCoordinates } from './utils';

class Round {

    __class: string = 'Round'

    bracket: Bracket
    matches: Match[]
    winnerRound: boolean

    constructor(bracket: Bracket = new Bracket(), matches: Match[] = [], winnerRound: boolean = false) {
        this.bracket = bracket;
        this.matches = matches;
        this.winnerRound = winnerRound;
    }

    // only called when competitorNames.length === 2^n
    static createInitialWinnerRound(bracket: Bracket, competitorNames: string[]): Round {
        //console.log('in createInitialWinnerRound***********************');
        // array of matches for the round
        let matches: Match[] = [];

        // create matches for the round
        for (let i = 0; i < competitorNames.length; i += 2) {
            matches.push(Match.createUnlinkedMatch(bracket.nextMatchId++, competitorNames[i], competitorNames[i + 1]));
        }

        let newRound = new Round(bracket, matches, true);
        //console.log('*****returning round: ', newRound, ' from createInitialWinnerRound*****');
        return newRound;
    }

    // returns [winner round 0, winner round 1], or [winner round 1] if there are no byes in round 0
    static createInitialWinnerRounds(bracket: Bracket, competitorNames: string[]): Round[] {

        // find greatest power of 2 less than or equal to number of competitors
        const greatestPowerOf2 = greatestPowerOf2LessThanOrEqualTo(competitorNames.length);
        const numberOfRoundZeroMatches = competitorNames.length - greatestPowerOf2;

        //console.log('in createInitialWinnerRounds***********************');

        //console.log('greatestPowerOf2: ', greatestPowerOf2);
        //console.log('competitorNames.length: ', competitorNames.length);
        //console.log('numberOfRoundZeroMatches: ', numberOfRoundZeroMatches);


        // we don't need a 2^n - k round 0 if there are no byes
        if (numberOfRoundZeroMatches === 0) {
            //console.log('creating only 1 initial winner round as the number of competitors is already a power of 2');
            return [Round.createInitialWinnerRound(bracket, competitorNames)];
        }

        // split competitors into round 0 and round 1
        const roundZeroCompetitorNames = competitorNames.slice(0, numberOfRoundZeroMatches * 2);
        //console.log('roundZeroCompetitorNames: ', roundZeroCompetitorNames);
        const roundOneCompetitorNames = competitorNames.slice(numberOfRoundZeroMatches * 2);
        //console.log('roundOneCompetitorNames: ', roundOneCompetitorNames);

        const roundZeroMatches: Match[] = [];

        // create matches for round 0
        for (let i = 0; i < numberOfRoundZeroMatches; i++) {
            let newMatch = Match.createUnlinkedMatch(bracket.nextMatchId++, roundZeroCompetitorNames.shift() as string, roundZeroCompetitorNames.shift() as string)
            roundZeroMatches.push(newMatch);
        }

        // create round 0
        const roundZero = new Round(bracket, roundZeroMatches, true);

        const roundZeroMatchesCopy = roundZeroMatches.slice();
        const roundZeroMatchesCopyLength = roundZeroMatchesCopy.length;

        // create linked matches for round 1
        let roundOneMatches: Match[] = [];

        // for each match in round 0, link it to a competitor in round 1 as long as there are any
        for (let i = 0; i < roundZeroMatchesCopyLength && roundOneCompetitorNames.length > 0; i++) {
            let newMatch = Match.createHalfLinkedMatch(bracket.nextMatchId++, roundZeroMatchesCopy.shift() as Match, true, roundOneCompetitorNames.shift() as string);
            roundOneMatches.push(newMatch);
        }

        //console.log('after creating half linked matches, roundZeroMatchesCopy is ', roundZeroMatchesCopy);

        // now, there are either some elements left in roundOneCompetitorNames, or there are some matches left in roundZeroMatches
        if (roundOneCompetitorNames.length === 0) {
            for (let i = 0; i < roundZeroMatchesCopy.length; i += 2) {
                let newMatch = Match.createLinkedMatch(bracket.nextMatchId++, roundZeroMatchesCopy[i], true, roundZeroMatchesCopy[i + 1], true);
                roundOneMatches.push(newMatch);
            }
        }

        //console.log('finished creating linked matches for round 1. roundOneCompetitorNames: ', roundOneCompetitorNames);

        if (roundOneCompetitorNames.length > 0) {
            for (let i = 0; i < roundOneCompetitorNames.length; i += 2) {
                let newMatch = Match.createUnlinkedMatch(bracket.nextMatchId++, roundOneCompetitorNames[i], roundOneCompetitorNames[i + 1])
                roundOneMatches.push(newMatch);
            }
        }

        const roundOne = new Round(bracket, roundOneMatches, true);

        //console.log('*****returning rounds: ', roundZero, roundOne, ' from createInitialWinnerRounds*****');

        return [roundZero, roundOne];
    }

    // only called when initialWinnerRound.length === 2^n
    static createInitialLoserRound(intialWinnerRounds: Round[]): Round {
        //console.log('in createInitialLoserRound*********************** with initialWinnerRounds: ', intialWinnerRounds);
        const bracket = intialWinnerRounds[0].bracket;

        // congrlomerate all matches from first 2 rounds
        const allWinnerMatches = intialWinnerRounds.length === 1 ? intialWinnerRounds[0].matches : intialWinnerRounds[0].matches.concat(intialWinnerRounds[1].matches);
        const allWinnerMatchesCopy = allWinnerMatches.slice();
        const allWinnerMatchesCopyLength = allWinnerMatchesCopy.length;

        // array of matches for the round
        let matches: Match[] = [];

        // create matches for the round
        for (let i = 0; i < allWinnerMatchesCopyLength; i += 2) {
            matches.push(Match.createLinkedMatch(bracket.nextMatchId++, allWinnerMatchesCopy.shift() as Match, false, allWinnerMatchesCopy.shift() as Match, false));
        }

        return new Round(bracket, matches, false);
    }

    // construct map of prohibited rematches from initialWinnerRounds
    // const allWinnerMatches = initialWinnerRounds[0].matches.concat(initialWinnerRounds[1].matches);
    // const prohibitedRematches: Record<string, boolean> = {};
    // for (let i = 0; i < allWinnerMatches.length; i++) {
    //     const prohibitedMatchKey = `${allWinnerMatches[i].competitor0Name}-${allWinnerMatches[i].competitor1Name}`;
    //     prohibitedRematches[prohibitedMatchKey] = true;
    // }

    //TODO: add link function and maybe capability to prevent premature rematches independent of the link function
    static createInitialLoserRounds(initialWinnerRounds: Round[], linkFunction: (initialWinnerRounds: Round[]) => InitialRoundMapping): Round[] {

        // this is the number of competitors in the initial loser rounds
        let numCompetitors = 0;
        initialWinnerRounds.forEach(round => numCompetitors += round.matches.length);

        const greatestPowerOf2 = greatestPowerOf2LessThanOrEqualTo(numCompetitors);
        const numberOfRoundZeroMatches = numCompetitors - greatestPowerOf2;
        const numberOfRoundOneMatches = greatestPowerOf2 * 2;

        // if we don't need any round zero matches, then we just create the first loser round
        if (numberOfRoundZeroMatches === 0) {
            //console.log('creating only 1 initial loser round as the number of competitors is already a power of 2');
            return [Round.createInitialLoserRound(initialWinnerRounds)];
        }

        // get reference to bracket
        const bracket = initialWinnerRounds[0].bracket;

        // keep in mind that right now, the parent-child relationships of the initial lsoer rounds are fixed and link function agnostic.

        // perform length check.
        const linkFunctionMapping = linkFunction(initialWinnerRounds);

        validateLinkFunctionMapping(initialWinnerRounds, linkFunctionMapping);

        //TODO: more mapping validation to make sure the link function is not supplying a mapping that will fuck shit up (mapping two matches to the same slot or something)

        // apply link function mapping to first loser round
        const roundZeroMatches: Match[] = Array.from({ length: numberOfRoundZeroMatches }, () => ({} as Match));
        const roundZeroMapping = linkFunctionMapping[0];

        // numberOfRoundZeroSlots is guaranteed to be an even number so we won't lose matches here
        for (let [roundZeroMatchIndex, initialWinnerMatchCoordinatesSet] of roundZeroMapping) {

            const [firstMatchCoordinates, secondMatchCoordinates] = initialWinnerMatchCoordinatesSet;

            const firstMatchRound = firstMatchCoordinates[0];
            const firstMatchIndex = firstMatchCoordinates[1];

            const secondMatchRound = secondMatchCoordinates[0];
            const secondMatchIndex = secondMatchCoordinates[1];

            const firstMatch = initialWinnerRounds[firstMatchRound].matches[firstMatchIndex];
            const secondMatch = initialWinnerRounds[secondMatchRound].matches[secondMatchIndex];

            // create new linked match
            roundZeroMatches[roundZeroMatchIndex] = Match.createLinkedMatch(bracket.nextMatchId++, firstMatch, false, secondMatch, false);
        }

        // create round 0
        const roundZero = new Round(bracket, roundZeroMatches, false);

        // start creating round 1
        const roundOneMatches: Match[] = Array.from({ length: numberOfRoundOneMatches }, () => ({} as Match));;

        // get link function mapping
        const roundOneMapping = linkFunctionMapping[1];

        // make a copy of roundOneMatches
        const roundZeroMatchesCopy = roundZeroMatches.slice();

        // need to think about when a match in round one contains 0, 1 or  2 winners from the previous loser round.
        // it's important that link function mapping contains this data. should we in fact trust the link function mapping to just
        // encode this? that is, a match key maps to a set with 0, 1 or 2 winners?
        // upsides: localize that functionality in one place instead of worrying about it in two.
        // downsides: now this code can break if someone ever creates a fucked up link function.
        // conclusion: there should be a function that validates a link function mapping given an initial number of competitors,
        // and this function should be called before the link function is applied

        // assume link function input has been validated

        // TODO: go in ascending order
        for (let [roundOneMatchIndex, initialWinnerMatchCoordinatesSet] of roundOneMapping) {

            let firstMatch: Match, secondMatch: Match;

            if (initialWinnerMatchCoordinatesSet.length === 0) {
                if (roundZeroMatchesCopy.length < 2) {
                    throw new Error('round zero matches has fewer than 2 matches remaining, but trying to shift 2.');
                }
                firstMatch = roundZeroMatchesCopy.shift() as Match;
                secondMatch = roundZeroMatchesCopy.shift() as Match;
                roundOneMatches[roundOneMatchIndex] = Match.createLinkedMatch(bracket.nextMatchId++, firstMatch, true, secondMatch, true);
            }

            else if (initialWinnerMatchCoordinatesSet.length === 1) {
                if (roundZeroMatchesCopy.length < 1) {
                    throw new Error('round zero matches has fewer than 1 match remaining, but trying to shift 1.');
                }
                firstMatch = roundZeroMatchesCopy.shift() as Match;
                const coordinates = initialWinnerMatchCoordinatesSet[0] as InitialWinnerMatchCoordinates;
                secondMatch = initialWinnerRounds[coordinates[0]].matches[coordinates[1]];
                roundOneMatches[roundOneMatchIndex] = Match.createLinkedMatch(bracket.nextMatchId++, firstMatch, true, secondMatch, false);
            }

            else if (initialWinnerMatchCoordinatesSet.length === 2) {
                const firstMatchCoordinates = initialWinnerMatchCoordinatesSet[0] as InitialWinnerMatchCoordinates;
                const secondMatchCoordinates = initialWinnerMatchCoordinatesSet[1] as InitialWinnerMatchCoordinates;

                firstMatch = initialWinnerRounds[firstMatchCoordinates[0]].matches[firstMatchCoordinates[1]];
                secondMatch = initialWinnerRounds[secondMatchCoordinates[0]].matches[secondMatchCoordinates[1]];
                roundOneMatches[roundOneMatchIndex] = Match.createLinkedMatch(bracket.nextMatchId++, firstMatch, false, secondMatch, false);
            }
        }

        const roundOne = new Round(bracket, roundOneMatches, false);

        return [roundZero, roundOne];
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
    static createMatchesFromWinnersAndLosers(winnerRound: Round, loserRound: Round, linkFunction: (winnerRound: Round) => number[]): Match[] {
        // this can only be called with 2 round of the exact same length, since winners of losers are pitted against losers of winners
        if (winnerRound.matches.length !== loserRound.matches.length) {
            throw new Error('createMatchesFromWinnersAndLosers can only be called on two Rounds of the same length');
        }


        console.log('in createMatchesFromWinnersAndLosers with winnerRound: ', winnerRound, ' and loserRound: ', loserRound);
        let linkFunctionMapping = linkFunction(winnerRound);
        console.log('linkFunctionMapping: ', linkFunctionMapping);

        if (winnerRound.matches.length !== linkFunctionMapping.length) {
            throw new Error('link function returned an array of length ' + linkFunctionMapping.length + ' but the winner round has ' + winnerRound.matches.length + ' matches');
        }

        // use link function results to map matches to loser rounds

        // array of matches for the next round
        let matches: Match[] = Array.from({ length: winnerRound.matches.length }, () => ({} as Match));

        console.log('winnerRound.matches: ', winnerRound.matches);
        console.log('loserRound.matches: ', loserRound.matches);

        // pair each winner of the loser round with the loser of the winner round
        for (let i = 0; i < loserRound.matches.length; i++) {

            // find index of loser match which loser from winnersBracket needs to be mapped to. this is also the index of the loser match from the previous loser round that is also a parent
            let loserMatchDestinationIndex = linkFunctionMapping[i];

            console.log('about to create linked match with index: ', loserMatchDestinationIndex, ' with parent0 ', winnerRound.matches[loserMatchDestinationIndex], ' and parent1 ', loserRound.matches[i]);
            // create new linked match
            matches[loserMatchDestinationIndex] = Match.createLinkedMatch(winnerRound.bracket.nextMatchId++, winnerRound.matches[i], false, loserRound.matches[loserMatchDestinationIndex], true);
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
    createNextLoserRound(winnerRound: Round | undefined, linkFunction: (winnerRound: Round) => number[]): Round {

        console.log('in createNextLoserRound with winnerRound: ', winnerRound);

        if (this.winnerRound) {
            throw new Error('createNextLoserRound can only be called on a Round that is a loser round');
        }

        // if we are given the winnerRound argument, then we need to include losers from the given winnerRound
        if (winnerRound) {
            //console.log('about to create new loser round from winners of previous loser round and losers of given winner round')
            return new Round(this.bracket, Round.createMatchesFromWinnersAndLosers(winnerRound, this, linkFunction), false);
        }

        // otherwise, we simply generate the next round from the winners of the current loser round
        else {
            console.log('about to create new loser round from winners of previous loser round with argument: ', this)
            return new Round(this.bracket, Round.createMatchesFromWinners(this), false);
        }
    }
}

export default Round;