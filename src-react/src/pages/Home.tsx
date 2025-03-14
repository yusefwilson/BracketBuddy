import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CURRENT_STATE } from '../components/App';
import TournamentInfoCard from '../components/TournamentInfoCard';

import Tournament from '../lib/Tournament';
import TournamentInputModal from '../components/TournamentInputModal';
import RemoveTournamentModal from '../components/RemoveTournamentModal';

export default function Home() {

  const state = useContext(CURRENT_STATE);
  const navigate = useNavigate();

  const [allTournaments, setAllTournaments] = useState<Tournament[]>();
  const [tournamentModalOpen, setTournamentModalOpen] = useState(false);
  const [removeTournamentModalOpen, setRemoveTournamentModalOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);


  // load saved tournaments
  useEffect(() => {
    const loadTournaments = async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to allow tournament to be saved before loading. DISGUSTING. Should probably be replaced.
      const tournaments = await Tournament.loadAllTournaments();
      setAllTournaments(tournaments);
    }

    loadTournaments();
  }, [tournamentModalOpen, removeTournamentModalOpen]);

  return (
    !allTournaments ?

      <h1>LOADING</h1>

      :

      <div className='bg-slate-800 flex flex-col text-white text-center items-center gap-4'>
        <h1>Welcome to BracketBuddy</h1>
        <p>BracketBuddy is a tournament management system that helps you organize and run your tournaments.</p>
        <button className='bg-yellow-500 p-4 rounded-md flex-shrink' onClick={() => { setTournamentModalOpen(true); }}>Create Tournament</button>
        <h1>My Tournaments:</h1>
        {allTournaments?.map((tournament, index) => <TournamentInfoCard key={index} tournament={tournament} onClick={() => { state?.setTournament(tournament); navigate('tournament') }} onRemoveClick={() => { setTournamentToDelete(tournament); setRemoveTournamentModalOpen(true); }} />)}
        {tournamentModalOpen && <TournamentInputModal setTournamentModalOpen={setTournamentModalOpen} />}
        {removeTournamentModalOpen && <RemoveTournamentModal setRemoveTournamentModalOpen={setRemoveTournamentModalOpen} tournamentToDelete={tournamentToDelete} />}
      </div>
  );
}