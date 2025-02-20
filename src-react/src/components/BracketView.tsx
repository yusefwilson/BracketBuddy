import Bracket from '../lib/Bracket';
import RoundView from './RoundView';
import { useState } from 'react';

export default function BracketView({ initialBracket }: { initialBracket: Bracket }) {

  const updateMatch = (matchId: number, winner: number): void => {

    // find winner
    const matchToBeUpdated = bracket.findMatchById(matchId);

    // update winner
    matchToBeUpdated?.updateWinner(winner);

    // hacky way to trigger refresh
    setBracket(bracket.markUpdated());
  }

  const [bracket, setBracket] = useState(initialBracket);

  return (
    <div className='rounded-md bg-orange-400 p-2 flex flex-col gap-4'>
      <div className='rounded-md bg-green-700 flex flex-row p-4 gap-4 overflow-x-auto justify-between'>
        {initialBracket.winnersBracket.map((round, i) => <RoundView key={i} round={round} updateMatch={updateMatch} />)}
      </div>

      <div className='rounded-md bg-red-700 flex flex-row p-2 gap-4 overflow-x-auto justify-between'>
        {initialBracket.losersBracket.map((round, i) => <RoundView key={i} round={round} updateMatch={updateMatch} />)}
      </div>
    </div>
  )
}