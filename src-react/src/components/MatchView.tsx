import { useState } from 'react';

import WinnerCheckbox from './WinnerCheckbox';
import { Match } from '../types';

export default function MatchView({ match, updateMatch }: { match: Match, updateMatch: (matchId: number, winner: number) => void }) {

  const [winner, setWinner] = useState(match.winner || -1);

  const toggleWinner = (newWinner: number) => {
    if (newWinner === winner) {
      setWinner(-1);
      match.winner = undefined;
      updateMatch(match.id, -1);
    }
    else {
      setWinner(newWinner);
      match.winner = newWinner
      updateMatch(match.id, newWinner);
    }
  }

  return (
    <div className='rounded-md bg-purple-400 p-4 flex flex-col gap-4'>
      <h3 className='text-center font-bold'>Match {match.id}</h3>
      <div className={'flex flex-row justify-between items-center p-4 rounded-md' + (match.isBye() ? ' bg-green-950' : ' bg-blue-400')}>
        {match.competitor0Name || 'Bye'}
        {<WinnerCheckbox toggleWinner={() => toggleWinner(0)} checked={winner === 0 || match.isBye()} disabled={false} />}
      </div>
      <div className={'flex justify-between items-center p-4 rounded-md' + (match.isBye() ? ' bg-green-950' : ' bg-blue-400')}>
        {match.competitor1Name || 'Bye'}
        {<WinnerCheckbox toggleWinner={() => toggleWinner(1)} checked={winner === 1} disabled={match.isBye()} />}
      </div>
    </div>
  )
}