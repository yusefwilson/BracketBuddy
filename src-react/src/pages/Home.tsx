import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowUpTray as ArrowUpTrayIcon, HiPlus as PlusIcon } from 'react-icons/hi2';

import type { TournamentDTO } from '../../../src-shared/TournamentDTO';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from '../components/App';
import TournamentInfoCard from '../components/TournamentInfoCard';
import TournamentInputModal from '../components/TournamentInputModal';
import RemoveTournamentModal from '../components/RemoveTournamentModal';

import { HiPlus } from 'react-icons/hi2';
import { CgArrowUp } from 'react-icons/cg';

export default function Home() {
  const state = useContext(CURRENT_STATE);
  const navigate = useNavigate();
  const { showError, ErrorToastContainer } = useErrorToast();

  const [allTournaments, setAllTournaments] = useState<TournamentDTO[]>();
  const [tournamentModalOpen, setTournamentModalOpen] = useState(false);
  const [removeTournamentModalOpen, setRemoveTournamentModalOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<TournamentDTO | null>(null);

  useEffect(() => {
    const loadTournaments = async () => {
      console.log('Loading tournaments...');
      await new Promise(resolve => setTimeout(resolve, 100)); // 💀
      const [tournaments, error] = await safeApiCall(window.electron.loadAllTournaments());

      if (error) {
        showError(error);
        setAllTournaments([]);
        return;
      }

      console.log('Loaded tournaments:', tournaments);
      setAllTournaments(tournaments || []);
    };
    console.log('Home page mounted');
    loadTournaments();
  }, [tournamentModalOpen, removeTournamentModalOpen, showError]);

  if (!allTournaments) {
    return (
      <div className='flex justify-center items-center h-full text-white text-2xl bg-slate-700' />
    );
  }

  return (
    <>
      <ErrorToastContainer />
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col w-full mx-auto h-full">
        {/* Sleek Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 flex-shrink-0 shadow-lg">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">My Tournaments</span>
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              {allTournaments.length} {allTournaments.length === 1 ? 'tournament' : 'tournaments'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 items-center">
            <button
              onClick={async () => {
                const [result, error] = await safeApiCall(
                  window.electron.importTournament({})
                );

                if (error) {
                  showError(error);
                  return;
                }

                if (result) {
                  console.log('✅ Imported tournament:', result.name);
                  // Reload tournaments list
                  const [tournaments, loadError] = await safeApiCall(window.electron.loadAllTournaments());
                  if (loadError) {
                    showError(loadError);
                  } else {
                    setAllTournaments(tournaments || []);
                  }
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md border border-slate-700/50 transition-all duration-200 hover:border-slate-600 flex items-center justify-center"
              title="Load tournament from save file"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setTournamentModalOpen(true)}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2"
              title="Create tournament"
              style={allTournaments.length === 0 ? { animation: 'flash 2s ease-in-out infinite' } : {}}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-8 flex-1 flex flex-col overflow-y-auto">
          <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 shadow-2xl p-6 backdrop-blur-sm">
            {allTournaments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <div className="text-lg">No tournaments created yet</div>
                <div className="flex flex-row items-center gap-2 justify-center">
                  <span>Click the</span>
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    <HiPlus className="h-5 w-5" />
                  </span>
                  <span>button above to create your first tournament!</span>
                  <CgArrowUp className="h-8 w-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {allTournaments.map((tournament, index) => (
                  <TournamentInfoCard
                    key={index}
                    tournament={tournament}
                    onClick={async () => {
                      state?.setTournament(tournament);
                      // record this change in the save file
                      const [, error] = await safeApiCall(
                        window.electron.saveKeyValue({ key: 'lastTournamentIndex', value: index })
                      );

                      if (error) {
                        showError(error);
                        return;
                      }

                      navigate('/tournament');
                    }}
                    onRemoveClick={() => {
                      setTournamentToDelete(tournament);
                      setRemoveTournamentModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {tournamentModalOpen && (
          <TournamentInputModal setTournamentModalOpen={setTournamentModalOpen} />
        )}
        {removeTournamentModalOpen && (
          <RemoveTournamentModal setRemoveTournamentModalOpen={setRemoveTournamentModalOpen} tournamentToDelete={tournamentToDelete} />
        )}
      </div>
    </>
  );
}
