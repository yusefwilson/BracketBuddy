import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { TournamentDTO } from '../../../src-shared/TournamentDTO';

import { CURRENT_STATE } from '../components/App';
import TournamentInfoCard from '../components/TournamentInfoCard';
import TournamentInputModal from '../components/TournamentInputModal';
import RemoveTournamentModal from '../components/RemoveTournamentModal';

export default function Home() {
  const state = useContext(CURRENT_STATE);
  const navigate = useNavigate();

  const [allTournaments, setAllTournaments] = useState<TournamentDTO[]>();
  const [tournamentModalOpen, setTournamentModalOpen] = useState(false);
  const [removeTournamentModalOpen, setRemoveTournamentModalOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<TournamentDTO | null>(null);

  useEffect(() => {
    const loadTournaments = async () => {
      console.log('Loading tournaments...');
      await new Promise(resolve => setTimeout(resolve, 100)); // 💀
      const tournaments = await window.electron.loadAllTournaments();
      console.log('Loaded tournaments:', tournaments);
      setAllTournaments(tournaments);
    };
    console.log('Home page mounted');
    loadTournaments();
  }, [tournamentModalOpen, removeTournamentModalOpen]);

  if (!allTournaments) {
    return (
      <div className='flex justify-center items-center h-screen bg-slate-800 text-white text-2xl'>
        Loading...
      </div>
    );
  }

  return (
    <div className='bg-slate-800 min-h-screen w-full text-white p-6 flex flex-col items-center'>

      {/* Create Button */}
      <div className='w-full max-w-3xl flex justify-end mb-4'>
        <button
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-semibold transition duration-200'
          onClick={() => setTournamentModalOpen(true)}
        >
          + Create Tournament
        </button>
      </div>

      {/* Tournament List */}
      <div className='w-full max-w-3xl bg-slate-700 rounded-xl p-6 flex flex-col gap-4 shadow-lg'>
        <h1 className='text-2xl font-bold mb-2'>My Tournaments</h1>

        {allTournaments.length === 0 ? (
          <p className='text-gray-300'>No tournaments yet. Create one above.</p>
        ) : (
          allTournaments.map((tournament, index) => (
            <TournamentInfoCard
              key={index}
              tournament={tournament}
              onClick={async () => {
                state?.setTournament(tournament);
                // record this change in the save file
                await window.electron.saveKeyValue('lastTournamentIndex', index);
                navigate('/tournament');
              }}
              onRemoveClick={() => {
                setTournamentToDelete(tournament);
                setRemoveTournamentModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {tournamentModalOpen && (
        <TournamentInputModal setTournamentModalOpen={setTournamentModalOpen} />
      )}
      {removeTournamentModalOpen && (
        <RemoveTournamentModal setRemoveTournamentModalOpen={setRemoveTournamentModalOpen} tournamentToDelete={tournamentToDelete} />
      )}
    </div>
  );
}
