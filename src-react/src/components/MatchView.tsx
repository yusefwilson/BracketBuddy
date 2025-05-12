import WinnerCheckbox from './WinnerCheckbox';
import Match from '../lib/Match';
import { useEffect, useRef } from 'react';

export default function MatchView({ match, updateMatch, matchRefs }: { match: Match, updateMatch: (matchId: number, winner: number) => void, matchRefs: React.MutableRefObject<Map<number, HTMLDivElement>> }) {

  const matchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchRef.current) {
      matchRefs.current.set(match.id, matchRef.current);
    }

    return () => {
      matchRefs.current.delete(match.id); // Clean up when unmounting
    };
  }, []);

  const toggleWinner = (newWinner: number) => {
    const updatedWinner = match.winner === newWinner ? -1 : newWinner;
    updateMatch(match.id, updatedWinner);
  };

  return (
    <div ref={matchRef} className='relative'>

      {/* Match container */}
      <div className='rounded-md bg-purple-400 p-2 flex flex-col gap-2'>
        {/*<h3 className='text-center font-bold'>Match {match.id}</h3>*/}
        <div className='flex flex-row justify-between items-center p-2 rounded-md bg-blue-400 w-52'>
          <div className="truncate w-0 flex-1">
            {match.competitor0Name}
          </div>
          <WinnerCheckbox toggleWinner={() => toggleWinner(0)} checked={match.winner === 0} />
        </div>
        <div className='flex flex-row justify-between items-center p-2 rounded-md bg-blue-400 w-52'>
          <div className="truncate w-0 flex-1">
            {match.competitor1Name}
          </div>
          <WinnerCheckbox toggleWinner={() => toggleWinner(1)} checked={match.winner === 1} />
        </div>
      </div>
    </div>
  );
}
