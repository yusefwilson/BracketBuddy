import { Round } from '../types';
import MatchView from './MatchView';

export default function RoundView({ round }: { round: Round }) {

  const roundToRoundName = (round: Round) => {

    // get number of competitors
    const numMatches = (round.winnerSide.length + round.loserSide.length);

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
    <div className='flex flex-col bg-yellow-200'>
      <h2 className='text-black text-center font-bold'>{bracketName}</h2>
      <div className='flex flex-col bg-green-200 p-4'>
        {round.winnerSide.map((match, i) => <MatchView key={i} match={match} />)}
      </div>
      {round.loserSide &&
        <div className='flex flex-col bg-red-200 p-4'>
          {round.loserSide.map((match, i) => <MatchView key={i} match={match} />)}
        </div>
      }
    </div>
  )
}