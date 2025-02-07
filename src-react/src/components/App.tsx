import { Bracket, Round, Match, Gender, Hand, AgeGroup } from '../types';
import BracketView from './BracketView';

import { useState } from 'react';

export default function App() {

  const createBye = (competitorName: string): Match => {
    const newMatch = new Match(competitorName, undefined, 0, true);
    return newMatch;
  }

  const createSideFromCompetitorNames = (competitorNames: string[]): Match[] => {
    let side: Match[] = [];

    for (let i = 0; i < competitorNames.length; i += 2) {

      // if there is only one competitor left, add a bye
      if (i + 1 >= competitorNames.length) {
        side.push(createBye(competitorNames[i]));
        break;
      }

      const newMatch = new Match(competitorNames[i], competitorNames[i + 1], undefined);

      side.push(newMatch);
    }

    return side;
  }

  const generateInitialRound = (competitorNames: string[]): Round => {
    // generate the initial round
    const winnerSide = createSideFromCompetitorNames(competitorNames);
    const loserSide: Match[] = [];
    return new Round(winnerSide, loserSide);
  }

  // generate a bracket with the given parameters
  const generateBracket = (gender: Gender, ageGroup: AgeGroup, hand: Hand, weightLimit: number, competitorNames: string[]): Bracket => {

    Match.nextId = 0;

    const initialRound = generateInitialRound(competitorNames);

    // generate the rest of the rounds
    const rounds: Round[] = [initialRound];

    let previousRound = initialRound;

    // end condition: there is only 1 match in the winner side and the loser side is empty
    while (previousRound.winnerSide.length > 1 || previousRound.loserSide.length > 0) {

      let nextRound: Round;

      // special case: there was only 1 bye match in the winners side and only 1 match on the losers side: this is the semifinal, which means the new round will only have 1 match in the winners side, with the winner of the bye match and the winner of the losers match
      if (previousRound.winnerSide.length === 1 && previousRound.loserSide.length === 1) {
        const lastWinnerSide = [Match.createLinkedMatch(previousRound.winnerSide[0], true, previousRound.loserSide[0], true)];
        nextRound = new Round(lastWinnerSide, []);
        rounds.push(nextRound);
        break;
      }

      const winnerSide = previousRound.createNextWinnerSide();
      const loserSide = previousRound.createNextLoserSide();

      nextRound = new Round(winnerSide, loserSide);
      rounds.push(nextRound);

      previousRound = nextRound;
    }

    const bracket = { gender, ageGroup, hand, weightLimit, rounds } as Bracket

    return bracket;
  }

  const printBracket = (bracket: Bracket): void => {
    console.log(`Bracket with gender ${bracket.gender}, age group ${bracket.ageGroup}, hand ${bracket.hand}, and weight limit ${bracket.weightLimit} lbs:`);
    console.log('Rounds:');
    for (let i = 0; i < bracket.rounds.length; i++) {
      console.log('Round ' + (i + 1));
      console.log('Winner side:');
      for (let j = 0; j < bracket.rounds[i].winnerSide.length; j++) {
        console.log(`Match ${j + 1}: ${bracket.rounds[i].winnerSide[j].competitor0Name || 'TBD'} vs ${bracket.rounds[i].winnerSide[j].competitor1Name || 'TBD'}`);
      }
      if (bracket.rounds[i].loserSide) {
        console.log('Loser side:');
        for (let j = 0; j < (bracket.rounds[i].loserSide.length || 0); j++) {
          console.log(`Match ${j + 1}: ${bracket.rounds[i].loserSide[j].competitor0Name || 'TBD'} vs ${bracket.rounds[i].loserSide[j].competitor1Name || 'TBD'}`);
        }
      }
    }
  }

  const bracket = generateBracket(Gender.Mixed, AgeGroup.Senior, Hand.Left, 200, ['John', 'Jane', 'James', 'Jerry', 'Jack', 'Jill', 'Joe', 'Jenny']);

  const [bracketState, setBracketState] = useState(bracket);

  const updateMatch = (matchId: number, winner: number): void => {

    console.log('matchId:', matchId, 'winner:', winner);

    const newBracketState = { ...bracketState };

    for (let i = 0; i < newBracketState.rounds.length; i++) {
      for (let j = 0; j < newBracketState.rounds[i].winnerSide.length; j++) {
        if (newBracketState.rounds[i].winnerSide[j].id === matchId) {
          console.log('updating winner of match', matchId, 'to', winner);
          newBracketState.rounds[i].winnerSide[j].winner = winner;
          break;
        }
      }
      for (let j = 0; j < newBracketState.rounds[i].loserSide.length; j++) {
        if (newBracketState.rounds[i].loserSide[j].id === matchId) {
          newBracketState.rounds[i].loserSide[j].winner = winner;
          break;
        }
      }
    }



    console.log('newBracketState:', newBracketState);

    setBracketState(newBracketState);
  }

  return (
    <div className='p-4'>
      <BracketView initialBracket={bracket} updateMatch={updateMatch} />
    </div>
  )
}