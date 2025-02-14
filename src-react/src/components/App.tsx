import { Bracket, Round, Match, Gender, Hand, AgeGroup } from '../types';
import BracketView from './BracketView';

import { useState } from 'react';

export default function App() {

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

  const [bracket, setBracket] = useState(new Bracket(Gender.Mixed, AgeGroup.Senior, Hand.Left, 200, ['John', 'Jane', 'James', 'Jerry', 'Jack', 'Jill', 'Joe', 'Jenny']));

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