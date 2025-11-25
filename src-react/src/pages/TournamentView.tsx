import { useContext, useState, useEffect } from 'react';

import { dateToLocalTimezoneString } from '../../../src-shared/utils';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from '../components/App';
import BracketsAndCompetitors from '../components/BracketsAndCompetitors';
import CompetitorList from '../components/CompetitorList';
import BracketList from '../components/BracketList';
import BulkBracketInputModal from '../components/BulkBracketInputModal';

import AERSLogo from '../../../assets/AERS_Logo.png'
import { HiArrowDownTray as ArrowDownTrayIcon, HiPlus as PlusIcon, HiUser as UserIcon } from 'react-icons/hi2';
import { TbTournament } from 'react-icons/tb';

import { FaRegRectangleList } from "react-icons/fa6";


export default function TournamentView() {
  const state = useContext(CURRENT_STATE);
  const { tournament } = state || {};
  const { showError, ErrorToastContainer } = useErrorToast();

  const [bulkBracketModalOpen, setBulkBracketModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'both' | 'brackets' | 'competitor-list'>('both');

  // Load saved view on mount
  useEffect(() => {
    const loadView = async () => {
      const [currentViewValue, error] = await safeApiCall(window.electron.getSavedValue('currentView'));
      if (!error && currentViewValue) {
        setCurrentView(currentViewValue);
      }
    };
    loadView();
  }, []);

  // Save view whenever it changes
  const handleViewChange = async (view: 'both' | 'brackets' | 'competitor-list') => {
    setCurrentView(view);
    await safeApiCall(window.electron.saveKeyValue({ key: 'currentView', value: view }));
  };

  if (!tournament) {
    return (
      <div>
        No tournament! Uh oh.
      </div>
    )
  }

  return (
    <>
      <ErrorToastContainer />
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col w-full mx-auto h-full">
        {/* Sleek Header/Toolbar */}
        <div className="flex items-center justify-between px-8 py-5 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 flex-shrink-0 shadow-lg">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">{tournament?.name}</span>
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              {dateToLocalTimezoneString(tournament?.date)}
            </div>
          </div>

          {/* Toolbar Buttons */}
          <div className="flex gap-4 items-center">

            {/* View Toggle Buttons */}
            <div className="flex gap-3 items-center">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">View</div>
              <div className="flex gap-1 bg-slate-800 rounded-lg p-1 shadow-lg border border-slate-700/50">
                <button
                  onClick={() => handleViewChange('both')}
                  className={`px-4 py-2.5 rounded-md transition-all duration-200 ${currentView === 'both'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  type="button"
                  title="View both brackets and competitors"
                >
                  <FaRegRectangleList className='h-5 w-5' />
                </button>
                <button
                  onClick={() => handleViewChange('brackets')}
                  className={`px-4 py-2.5 rounded-md transition-all duration-200 ${currentView === 'brackets'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  type="button"
                  title="View brackets/classes list"
                >
                  <TbTournament className='h-5 w-5' />
                </button>
                <button
                  onClick={() => handleViewChange('competitor-list')}
                  className={`px-4 py-2.5 rounded-md transition-all duration-200 ${currentView === 'competitor-list'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  type="button"
                  title="View all competitors"
                >
                  <UserIcon className='h-5 w-5' />
                </button>
              </div>
            </div>

            <button
              onClick={() => setBulkBracketModalOpen(true)}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2"
              style={tournament?.brackets.length === 0 ? { animation: 'flash 2s ease-in-out infinite' } : {}}
              type="button"
              title="Add brackets/classes"
            >
              <PlusIcon className='h-5 w-5' />
            </button>

            <div className="h-8 w-px bg-slate-700"></div>

            <button
              onClick={async () => {
                const [result, error] = await safeApiCall(
                  window.electron.exportTournament({ tournamentId: tournament.id })
                );

                if (error) {
                  showError(error);
                  return;
                }

                if (result && !result.canceled) {
                  console.log(`✅ Saved tournament to: ${result.filePath}`);
                } else {
                  console.log('❌ Save canceled');
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md border border-slate-700/50 transition-all duration-200 hover:border-slate-600 flex items-center justify-center"
              type="button"
              title="Download save file"
            >
              <ArrowDownTrayIcon className='h-5 w-5' />
            </button>
            <button
              onClick={async () => {
                const [result, error] = await safeApiCall(
                  window.electron.exportToAERS({ tournamentId: tournament.id })
                );

                if (error) {
                  showError(error);
                  return;
                }

                if (result && !result.canceled) {
                  console.log(`✅ Saved CSV to: ${result.filePath}`);
                } else {
                  console.log('❌ Save canceled');
                }
              }
              }
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md border border-slate-700/50 transition-all duration-200 hover:border-slate-600 flex items-center justify-center"
              type="button"
              title="Export to AERS"
            >
              <img src={AERSLogo} className='w-16' alt="AERS" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`p-8 flex-1 flex flex-col ${currentView === 'both' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {/* Modals */}
          {bulkBracketModalOpen && (
            <BulkBracketInputModal setBulkBracketModalOpen={setBulkBracketModalOpen} />
          )}

          <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 shadow-2xl p-6 h-full flex flex-col backdrop-blur-sm">
            {currentView === 'both' ? (
              <BracketsAndCompetitors />
            ) : currentView === 'brackets' ? (
              <BracketList />
            ) : (
              <CompetitorList />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
