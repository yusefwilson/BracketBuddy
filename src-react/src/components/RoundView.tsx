import Round from '../lib/Round';
import MatchView from './MatchView';

export default function RoundView({ round, updateMatch, matchRefs, roundType }: { round: Round, updateMatch: (matchId: number, winner: number) => void, matchRefs: React.MutableRefObject<Map<number, HTMLDivElement>>, roundType: 'initialWinner' | 'initialLoser' | 'winner' | 'loserEven' | 'loserOdd' }) {

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

  const roundName = roundToRoundName(round);

  console.log('rendering round', round);

  let styleString = 'text-black text-center font-bold'

  switch (roundType) {
    case 'initialWinner':
      styleString += ' mb-6 ';
      break;
    case 'initialLoser':
      styleString += ' mb-6 ';
      break;
  }


  return (
    <div className='flex flex-col bg-yellow-200 z-10'>

      <h2 className={styleString}>{roundName}</h2>

      <div className={'flex flex-col p-2 gap-2 ' + (round.winnerRound ? 'bg-green-200' : 'bg-red-500')}>
        {round.matches.map((match, i) => <MatchView key={i} match={match} updateMatch={updateMatch} matchRefs={matchRefs} />)}
      </div>

    </div>
  )
}