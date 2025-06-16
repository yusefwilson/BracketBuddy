import WinnerCheckbox from './WinnerCheckbox';
import Match from '../lib/Match';

export default function MatchView({ match, updateMatch, x, y, highlighted = false }:
  { match: Match, updateMatch: (matchId: number, winner: number) => void, x: number, y: number, highlighted: boolean }) {

  const toggleWinner = (newWinner: number) => {
    const updatedWinner = match.winner === newWinner ? -1 : newWinner;
    updateMatch(match.id, updatedWinner);
  };

  return (
    <div className='absolute' style={{
      left: `${x}px`,
      top: `${y}px`,
    }}>

      {/* Match container */}
      <div className={'rounded-md bg-transparent p-2 flex flex-row gap-2' + (highlighted ? ' border-2 border-yellow-500' : '')}>
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
