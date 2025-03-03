import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CURRENT_STATE } from '../components/App';
import TournamentInfoCard from '../components/TournamentInfoCard';

import Tournament from '../lib/Tournament';
import TournamentInputModal from '../components/TournamentInputModal';

export default function Home() {

  const state = useContext(CURRENT_STATE);
  const navigate = useNavigate();

  const [allTournaments, setAllTournaments] = useState<Tournament[]>();
  const [tournamentModalOpen, setTournamentModalOpen] = useState(false);


  // load saved tournaments
  useEffect(() => {
    const loadTournaments = async () => {
      const tournaments = await Tournament.loadAllTournaments();
      setAllTournaments(tournaments);
    }

    loadTournaments();
  }, [tournamentModalOpen]);

  return (
    <div className='bg-slate-800 flex flex-col text-white text-center items-center gap-4'>
      <h1>Welcome to BracketBuddy</h1>
      <p>BracketBuddy is a tournament management system that helps you organize and run your tournaments.</p>
      <button className='bg-yellow-500 p-4 rounded-md flex-shrink' onClick={() => { setTournamentModalOpen(true); }}>Create Tournament</button>
      <h1>My Tournaments:</h1>
      {allTournaments?.map((tournament, index) => <TournamentInfoCard key={index} tournament={tournament} onClick={() => { state?.setTournament(tournament); navigate('/tournament') }} />)}
      {tournamentModalOpen && <TournamentInputModal setTournamentModalOpen={setTournamentModalOpen} />}
    </div>
  );
}