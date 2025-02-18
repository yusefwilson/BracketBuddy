import { Round } from '../types';
import MatchView from './MatchView';

export default function RoundView({ round, updateMatch }: { round: Round, updateMatch: (matchId: number, winner: number) => void }) {

  const roundToRoundName = (round: Round) => {

    // get number of competitors
    const numMatches = round.matches.length * 2;

    switch (numMatches) {
      case 1:
        return 'Finals';
      case 2:
        return 'Semifinals';
      default:
        return `Round of ${numMatches}`;
    }
  }

  const bracketName = roundToRoundName(round);

  return (
    <div className='flex flex-col bg-yellow-200 w-1/5'>

      <h2 className='text-black text-center font-bold'>{bracketName}</h2>

      <div className='flex flex-col bg-green-200 p-4 gap-4'>
        {round.matches.map((match, i) => <MatchView key={i} match={match} updateMatch={updateMatch} />)}
      </div>
    </div>
  )
}