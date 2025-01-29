import { useState } from 'react';

import WinnerButton from './WinnerButton';
import LoserButton from './LoserButton';

export default function Match({ competitor0name, competitor1name, winner }: { competitor0name: string, competitor1name: string, winner?: number }) {

  const [_winner, _setWinner] = useState(winner);

  const toggleWinner = () => {
    _setWinner(_winner === 0 ? 1 : 0);
  }

  return (
    <div className='rounded-md bg-purple-400 p-4 flex flex-col gap-4'>
      <div className='flex bg-blue-400 justify-between p-4 rounded-md'>
        {competitor0name}
        {_winner === 0 ? <WinnerButton toggleWinner={toggleWinner} /> : <LoserButton toggleWinner={toggleWinner} />}
      </div>
      <div className='flex bg-blue-400 justify-between p-4 rounded-md'>
        {competitor1name}
        {_winner === 1 ? <WinnerButton toggleWinner={toggleWinner} /> : <LoserButton toggleWinner={toggleWinner} />}
      </div>
    </div>
  )
}