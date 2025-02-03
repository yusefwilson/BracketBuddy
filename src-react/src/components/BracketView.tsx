import { useState } from "react";

import { Bracket, Match } from "../types";
import RoundView from "./RoundView";

export default function BracketView({ initialBracket }: { initialBracket: Bracket }) {

  const [bracket, setBracket] = useState<Bracket>(initialBracket);

  const updateMatch = (updatedMatch: Match) => {
    setBracket(prevBracket => ({
      ...prevBracket,
      rounds: prevBracket.rounds.map(round => ({ 
        ...round,
        winnerSide: round.winnerSide.map(match =>
          match === updatedMatch ? updatedMatch : match
        ),
        loserSide: round.loserSide.map(match =>
          match === updatedMatch ? updatedMatch : match
        ),
      })),
    }));
  };

  return (
    <div className='rounded-md bg-orange-400 p-4 flex flex-row gap-4'>
      {initialBracket.rounds.map((round, i) => <RoundView key={i} round={round} />)}
    </div>
  )
}