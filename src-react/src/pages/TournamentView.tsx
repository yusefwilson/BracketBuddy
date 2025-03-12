import BracketInfoCard from '../components/BracketInfoCard';

import { CURRENT_STATE } from '../components/App';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BracketInputModal from '../components/BracketInputModal';

export default function TournamentView() {

  const state = useContext(CURRENT_STATE);
  const { tournament, setTournament = () => { }, setBracket = () => { } } = state || {};

  const navigate = useNavigate();
  console.log('about to render tournament', tournament);

  const [bracketModalOpen, setBracketModalOpen] = useState(false);

  return (
    <div className='bg-slate-600 p-2 rounded-md flex flex-col items-center gap-4'>
      <h1>{'Tournament name: ' + tournament?.name}</h1>
      <h1>{'Tournament date: ' + tournament?.date.toDateString()}</h1>
      <button className='bg-yellow-500 p-4 rounded-md flex-shrink' onClick={() => { setBracketModalOpen(true); }}>Add Bracket</button>
      {bracketModalOpen && <BracketInputModal setBracketModalOpen={setBracketModalOpen} />}
      {tournament?.brackets.map((bracket, i) => <BracketInfoCard key={i} bracket={bracket} onClick={() => { setBracket(bracket); navigate('/bracket'); }}
        onRemoveClick={() => { tournament?.removeBracket(bracket); setTournament(tournament?.markUpdated()); }} />)}
    </div>
  )
}