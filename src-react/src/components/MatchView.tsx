import { useState } from 'react';

import WinnerButton from './WinnerButton';
import LoserButton from './LoserButton';
import { Match } from '../types';

export default function MatchView({ match }: { match: Match }) {

  const [_winner, _setWinner] = useState(match.winner || 0);

  const toggleWinner = () => {
    _setWinner(_winner === 0 ? 1 : 0);
  }

  return (
    <div className='rounded-md bg-purple-400 p-4 flex flex-col gap-4'>
      <div className='flex flex-row bg-blue-400 justify-between items-center p-4 rounded-md'>
        {match.competitor0Name || 'TBD'}
        {_winner === 0 ? <WinnerButton toggleWinner={toggleWinner} /> : <LoserButton toggleWinner={toggleWinner} />}
      </div> 
      <div className='flex bg-blue-400 justify-between items-center p-4 rounded-md'>
        {match.competitor1Name || 'TBD'}
        {_winner === 1 ? <WinnerButton toggleWinner={toggleWinner} /> : <LoserButton toggleWinner={toggleWinner} />}
      </div>
    </div>
  )
}