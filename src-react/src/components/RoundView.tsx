import Round from '../lib/Round';
import MatchView from './MatchView';

import { useEffect, useRef } from 'react';

export default function RoundView({ round, updateMatch, roundName, matchRefs, matchToRoundRefs }:
  {
    round: Round,
    updateMatch: (matchId: number, winner: number) => void,
    matchRefs: React.MutableRefObject<Map<number, HTMLDivElement>>,
    roundName: string,
    matchToRoundRefs: React.MutableRefObject<Map<number, HTMLDivElement>>
  }) {

  const roundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('BBBBBBBBBBBBBBB')
    if (roundRef.current) {
      for (const match of round.matches) {
        matchToRoundRefs.current.set(match.id, roundRef.current);
        console.log('setting matchToRoundRefs for match', match.id, 'to roundRef', roundRef.current);
      }
    }

    return () => {
      for (const match of round.matches) {
        matchToRoundRefs.current.delete(match.id);
      }
    };
  }, [round]);


  console.log('rendering round', round);

  return (
    <div className='flex flex-col bg-yellow-200 z-10'>

      <h2 className='text-black text-center font-bold'>[FIX ROUND NAME]</h2>

      <div className={'relative p-2 ' + (round.winnerRound ? 'bg-green-200' : 'bg-red-500')}>
        {round.matches.map((match, i) => <MatchView key={i} match={match} updateMatch={updateMatch} matchRefs={matchRefs} />)}
      </div>

    </div>
  )
}