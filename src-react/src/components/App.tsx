import { Gender, AgeGroup, Hand } from '../lib/types';
import Bracket from '../lib/Bracket';
import BracketView from './BracketView';
import { useState } from 'react';

export default function App() {

  const [bracket, setBracket] = useState(new Bracket(Gender.Mixed, AgeGroup.Senior, Hand.Left, 200, ['John', 'Jane', 'Jack', 'Jill', 'Jim', 'Jenny', 'Jesse', 'Jasmine']));

  //bracket.print();

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