import { useState } from 'react';
import WinnerCheckbox from './WinnerCheckbox';
import Match from '../lib/Match';

export default function MatchView({ match, updateMatch }: { match: Match, updateMatch: (matchId: number, winner: number) => void }) {

  console.log('rendering match ', match.id, ' with winner ', match.winner);

  // just using match.winner as a truthy/falsy value results in logic error when winner is 0
  const [winner, setWinner] = useState(match.winner !== undefined ? match.winner : -1);

  console.log('winner is ', winner);

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
    <div className='relative'>

      {/* Match container */}
      <div className='rounded-md bg-purple-400 p-2 flex flex-col gap-2'>
        <h3 className='text-center font-bold'>Match {match.id}</h3>
        <div className='flex flex-row justify-between items-center p-2 rounded-md bg-blue-400'>
          {match.competitor0Name}
          {<WinnerCheckbox toggleWinner={() => toggleWinner(0)} checked={winner === 0} />}
        </div>
        <div className={'flex justify-between items-center p-2 rounded-md bg-blue-400'}>
          {match.competitor1Name}
          {<WinnerCheckbox toggleWinner={() => toggleWinner(1)} checked={winner === 1} />}
        </div>
      </div>
    </div>

  )
}