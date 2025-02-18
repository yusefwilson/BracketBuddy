import { Bracket } from '../types';
import RoundView from './RoundView';

export default function BracketView({ initialBracket, updateMatch }: { initialBracket: Bracket, updateMatch: (matchId: number, winner: number) => void }) {

  return (
    <div className='rounded-md bg-orange-400 p-4 flex flex-col gap-4'>
      {initialBracket.winnersBracket.map((round, i) => <RoundView key={i} round={round} updateMatch={updateMatch} />)}
      {initialBracket.losersBracket.map((round, i) => <RoundView key={i} round={round} updateMatch={updateMatch} />)}
    </div>
  )
}