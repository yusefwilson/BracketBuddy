import { useState } from 'react';

import WinnerCheckbox from './WinnerCheckbox';
import { Match } from '../types';

export default function MatchView({ match }: { match: Match }) {

  const [winner, setWinner] = useState(match.winner || -1);

  const toggleWinner = (newWinner: number) => {
    if (newWinner === winner) {
      setWinner(-1);
      match.winner = undefined;
    }
    else {
      setWinner(newWinner);
      match.winner = newWinner;
    }
  }

  return (
    <div className='rounded-md bg-purple-400 p-4 flex flex-col gap-4'>
      <div className='flex flex-row bg-blue-400 justify-between items-center p-4 rounded-md'>
        {match.competitor0Name || 'TBD'}
        {<WinnerCheckbox toggleWinner={() => toggleWinner(0)} checked={winner === 0} />}
      </div>
      <div className='flex bg-blue-400 justify-between items-center p-4 rounded-md'>
        {match.competitor1Name || 'TBD'}
        {<WinnerCheckbox toggleWinner={() => toggleWinner(1)} checked={winner === 1} />}
      </div>
    </div>
  )
}