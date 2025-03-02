import Tournament from '../lib/Tournament';
import BracketInfoCard from '../components/BracketInfoCard';

import { CURRENT_STATE } from '../components/App';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TournamentView({ tournament }: { tournament: Tournament | null }) {

  const state = useContext(CURRENT_STATE);
  const navigate = useNavigate();

  console.log('about to render tournament', tournament);

  return (
    <div className='bg-slate-600 p-2 rounded-md'>
      <h1>{'Tournament name: ' + tournament?.name}</h1>
      <h1>{'Tournament date: ' + tournament?.date.toDateString()}</h1>
      {tournament?.brackets.map((bracket, i) => <BracketInfoCard key={i} bracket={bracket} onClick={() => { state?.setBracket(bracket); navigate('/bracket'); }} />)}
    </div>
  )
}