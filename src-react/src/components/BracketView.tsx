import { Bracket } from '../types';
import RoundView from './RoundView';

export default function BracketView({ initialBracket, updateMatch }: { initialBracket: Bracket, updateMatch: (matchId: number, winner: number) => void }) {

  return (
    <div className='rounded-md bg-orange-400 p-4 flex flex-row gap-4'>
      {initialBracket.rounds.map((round, i) => <RoundView key={i} round={round} updateMatch={updateMatch} />)}
    </div>
  )
}