import WinnerCheckbox from './WinnerCheckbox';
import Match from '../lib/Match';

export default function MatchView({ match, updateMatch, x, y, currentMatchId }:
  { match: Match, updateMatch: (matchId: number, winner: number) => void, x: number, y: number, currentMatchId: number }) {

  const toggleWinner = (newWinner: number) => {
    const updatedWinner = match.winner === newWinner ? -1 : newWinner;
    updateMatch(match.id, updatedWinner);
  };

  // highlight the match yellow if it is the current match, gray if it is stale
  const highlighted = match.id === currentMatchId;
  const stale = match.id < currentMatchId && match.winner === -1;
  let highlightStyle = '';

  if (highlighted) {
    highlightStyle = 'border-2 border-yellow-500';
  } else if (stale) {
    highlightStyle = 'border-2 border-gray-500';
  }

  return (
    <div className='absolute' style={{
      left: `${x}px`,
      top: `${y}px`,
    }}>

      {/* Match container */}
      <div className={'rounded-md bg-transparent p-2 flex flex-row gap-2 ' + highlightStyle}>
        {/* Match ID vertically centered */}
        <div className="flex items-center">
          <h3 className='text-center font-bold'>{match.id}.</h3>
        </div>
        <div className="flex flex-col gap-2">
          <div className='flex flex-row justify-between items-center p-2 rounded-md bg-blue-400 w-44' onClick={() => toggleWinner(0)}>
            <div className='text-sm truncate w-0 flex-1'>
              {match.competitor0Name || `[Enter Name]`}
            </div>
            <WinnerCheckbox toggleWinner={() => toggleWinner(0)} checked={match.winner === 0} />
          </div>
          <div className='flex flex-row justify-between items-center p-2 rounded-md bg-blue-400 w-44' onClick={() => toggleWinner(1)}>
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
