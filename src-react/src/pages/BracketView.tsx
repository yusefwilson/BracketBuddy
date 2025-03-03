import Bracket from '../lib/Bracket';
import RoundView from '../components/RoundView';
import { useContext } from 'react';
import { CURRENT_STATE } from '../components/App';

export default function BracketView() {

  const state = useContext(CURRENT_STATE);
  const { bracket, setBracket = () => { } } = state || {};

  const updateMatch = (matchId: number, winner: number): void => {

    // find winner
    const matchToBeUpdated = bracket?.findMatchById(matchId);

    // update winner
    matchToBeUpdated?.updateWinner(winner);

    // hacky way to trigger refresh
    setBracket(bracket?.markUpdated() as Bracket);
  }

  console.log('about to render initialBracket', bracket);

  return (
    <div className='rounded-md bg-orange-400 p-2 flex flex-col gap-4'>
      <div className='rounded-md bg-green-700 flex flex-row p-4 gap-4 overflow-x-auto justify-between'>
        {bracket?.winnersBracket.map((round, i) => <RoundView key={i} round={round} updateMatch={updateMatch} />)}
      </div>

      <div className='rounded-md bg-red-700 flex flex-row p-2 gap-4 overflow-x-auto justify-between'>
        {bracket?.losersBracket.map((round, i) => <RoundView key={i} round={round} updateMatch={updateMatch} />)}
      </div>
    </div>
  )
}