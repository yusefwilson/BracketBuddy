import { Bracket } from "../types";
import RoundView from "./RoundView";

export default function BracketView({ bracket }: { bracket: Bracket }) {

  return (
    <div className='rounded-md bg-orange-400 p-4 flex flex-row gap-4'>
      {bracket.rounds.map((round, i) => <RoundView key={i} round={round} />)}
    </div>
  )
}