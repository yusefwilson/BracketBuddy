import Bracket from '../lib/Bracket';
import Tournament from '../lib/Tournament';
import RoundView from '../components/RoundView';
import { useContext, useState } from 'react';
import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';

export default function BracketView() {

  const state = useContext(CURRENT_STATE);
  const { bracket, setBracket = () => { }, tournament, setTournament = () => { } } = state || {};

  const [competitorNames, setCompetitorNames] = useState<string[]>(bracket?.competitorNames || []);

  const updateMatch = (matchId: number, winner: number): void => {

    // find winner
    const matchToBeUpdated = bracket?.findMatchById(matchId);

    // update winner
    matchToBeUpdated?.updateWinner(winner);

    // hacky way to trigger refresh, and also to trigger tournament save in App useEffect
    setBracket(bracket?.markUpdated() as Bracket);
    setTournament(tournament?.markUpdated() as Tournament);
  }

  console.log('about to render bracket ', bracket);

  return (
    <div className='rounded-md bg-orange-400 p-2 flex flex-row gap-4 h-full'>

      <div className='bg-pink-500 flex flex-col p-2'>
        <CompetitorInput competitors={competitorNames} setCompetitors={setCompetitorNames} />
        <button className='bg-blue-500 text-white px-4 py-2 rounded-md mt-2' onClick={() => { bracket?.initialize(); setBracket(bracket?.markUpdated() as Bracket); }}>Initialize</button>
      </div>

      <div className='bg-blue-400 p-2 rounded-md flex flex-col gap-4 h-full w-full'>
        <div className='rounded-md bg-green-700 flex flex-row p-4 gap-4 overflow-x-auto justify-between'>
          {bracket?.winnersBracket.map((round, i) => <RoundView key={i} round={round} updateMatch={updateMatch} />)}
        </div>

        <div className='rounded-md bg-red-700 flex flex-row p-2 gap-4 overflow-x-auto justify-between'>
          {bracket?.losersBracket.map((round, i) => <RoundView key={i} round={round} updateMatch={updateMatch} />)}
        </div>
      </div>

    </div>
  )
}