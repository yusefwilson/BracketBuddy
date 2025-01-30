import { Round } from '../types';
import MatchView from './MatchView';

export default function RoundView({ round }: { round: Round }) {

  const roundToRoundName = (round: Round) => {

    // get number of competitors. if loserSide doesn't exist, it has 0 length
    const numCompetitors = (round.winnerSide.length + (round.loserSide?.length ?? 0)) * 2;

    if (!round.loserSide) {
      return `Round of ${numCompetitors}`;
    }

    switch (numCompetitors) {
      case 2:
        return 'Finals';
      case 4:
        return 'Semifinals';
      case 8:
        return 'Quarterfinals';
      default:
        return `Round of ${numCompetitors}`;
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
          {round.loserSide?.map((match, i) => <MatchView key={i} match={match} />)}
        </div>
      }
    </div>
  )
}