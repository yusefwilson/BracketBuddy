import { Bracket, Gender, Hand, AgeGroup } from '../types';
import BracketView from './BracketView';

import { useState } from 'react';

export default function App() {

  const printBracket = (bracket: Bracket): void => {
    console.log(`Bracket with gender ${bracket.gender}, age group ${bracket.ageGroup}, hand ${bracket.hand}, and weight limit ${bracket.weightLimit} lbs:`);

    console.log('Winners Bracket:');
    bracket.winnersBracket.forEach((round, i) => {
      console.log(`Round ${i + 1}:`);
      round.matches.forEach(match => {
        console.log(`Match ${match.id}: ${match.competitor0Name} vs ${match.competitor1Name}`);
      });
    });

    console.log('Losers Bracket:');
    bracket.losersBracket.forEach((round, i) => {
      console.log(`Round ${i + 1}:`);
      round.matches.forEach(match => {
        console.log(`Match ${match.id}: ${match.competitor0Name} vs ${match.competitor1Name}`);
      });
    });
  }

  const [bracket, setBracket] = useState(new Bracket(Gender.Mixed, AgeGroup.Senior, Hand.Left, 200, ['John', 'Jane', 'James', 'Jerry', 'Jack', 'Jill', 'Joe', 'Jenny', 'Josiah', 'Juan']));

  printBracket(bracket);

  const updateMatch = (matchId: number, winner: number): void => {

    console.log('updating match ' + matchId + ' with winner ' + winner);

    const matchToBeUpdated = bracket.findMatchById(matchId);
    console.log('match to be updated found with id: ' + matchToBeUpdated?.id);

    matchToBeUpdated?.updateWinner(winner);

    console.log('match updated with winner ' + matchToBeUpdated?.winner);

    setBracket(bracket.markUpdated());
    console.log('updated bracket: ', bracket);
  }

  return (
    <div className='p-4'>
      <BracketView initialBracket={bracket} updateMatch={updateMatch} />
    </div>
  )
}