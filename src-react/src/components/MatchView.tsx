import WinnerCheckbox from './WinnerCheckbox';
import Match from '../lib/Match';

export default function MatchView({ match, updateMatch, x, y, currentMatchId }:
  { match: Match, updateMatch: (matchId: number, winner: number) => void, x: number, y: number, currentMatchId: number | undefined }) {

  const toggleWinner = (newWinner: number) => {
    const updatedWinner = match.winner === newWinner ? -1 : newWinner;
    updateMatch(match.id, updatedWinner);
  };

  // highlight the match yellow if it is the current match, gray if it is stale
  const highlighted = match.id === currentMatchId;

  let stale;
  if (currentMatchId === undefined) {
    stale = false;
  }
  else if (match.id < currentMatchId && match.winner === -1) {
    stale = true;
  }
  else {
    stale = false;
  }

  let colorStyle = 'bg-blue-400 hover:bg-blue-500';

  if (highlighted) {
    colorStyle = 'bg-yellow-500 transition-200 hover:bg-yellow-600';
  } else if (stale) {
    colorStyle = 'bg-gray-500 hover:bg-gray-600';
  }

  return (
    <div className='absolute' style={{
      left: `${x}px`,
      top: `${y}px`,
    }}>

      {/* Match container */}
      <div className={'bg-transparent p-2 flex flex-row gap-2'}>
        {/* Match ID vertically centered */}
        <div className='flex items-center'>
          <h3 className='text-center font-bold w-8'>{match.id}.</h3>
        </div>
        <div className='flex flex-col gap-2'>
          <div className={'flex flex-row justify-between items-center p-2 rounded-md w-44 transition duration-200 ease-in-out select-none ' + colorStyle} onClick={() => toggleWinner(0)}>
            <div className='text-sm truncate w-0 flex-1'>
              {match.competitor0Name || `[Enter Name]`}
            </div>
            <WinnerCheckbox toggleWinner={() => toggleWinner(0)} checked={match.winner === 0} />
          </div>
          <div className={'flex flex-row justify-between items-center p-2 rounded-md w-44 transition duration-200 ease-in-out select-none ' + colorStyle} onClick={() => toggleWinner(1)}>
            <div className='text-sm truncate w-0 flex-1'>
              {match.competitor1Name || `[Enter Name]`}
            </div>
            <WinnerCheckbox toggleWinner={() => toggleWinner(1)} checked={match.winner === 1} />
          </div>
        </div>
      </div>
    </div>
  );
}