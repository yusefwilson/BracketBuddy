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
      // Small delay to allow tournament to be saved before loading. DISGUSTING. Should probably be replaced.
      await new Promise(resolve => setTimeout(resolve, 100));
      const tournaments = await Tournament.loadAllTournaments();
      console.log('about to set all tournaments', tournaments);
      setAllTournaments(tournaments);
    }

    loadTournaments();
  }, [tournamentModalOpen, removeTournamentModalOpen]);

  return (
    !allTournaments ?

      <h1>LOADING</h1>

      :

      <div className='bg-slate-800 flex flex-col text-white text-center items-center gap-4 h-screen p-4 w-max'>

        <button className='bg-blue-400 p-1 rounded-md flex-shrink font-bold' onClick={() => { setTournamentModalOpen(true); }}>Create Tournament</button>

        <div className='bg-gray-400 rounded-md p-4 flex flex-col gap-4'>
          <h1 className='font-bold text-xl'>My Tournaments:</h1>
          {allTournaments?.map((tournament, index) => <TournamentInfoCard key={index} tournament={tournament} onClick={() => { state?.setTournament(tournament); navigate('tournament') }} onRemoveClick={() => { setTournamentToDelete(tournament); setRemoveTournamentModalOpen(true); }} />)}
          {tournamentModalOpen && <TournamentInputModal setTournamentModalOpen={setTournamentModalOpen} />}
          {removeTournamentModalOpen && <RemoveTournamentModal setRemoveTournamentModalOpen={setRemoveTournamentModalOpen} tournamentToDelete={tournamentToDelete} />}

        </div>

      </div>
  );
}