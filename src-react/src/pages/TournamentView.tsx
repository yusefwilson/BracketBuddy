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
      <div className="bg-slate-700 flex flex-col w-full mx-auto h-full overflow-y-auto">
        {/* Compact Header/Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-600 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white">
              <span className="text-blue-400">{tournament?.name}</span>
            </h1>
            <h2 className="text-sm text-gray-300">
              {dateToLocalTimezoneString(tournament?.date)}
            </h2>
          </div>

          {/* Toolbar Buttons */}
          <div className="flex gap-3 items-center">

            {/* View Toggle Buttons */}
            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-400 font-semibold">Views</div>
              <div className="flex gap-1 bg-slate-600 rounded-md p-1.5 shadow-inner h-[50px] items-center">
                <button
                  onClick={() => handleViewChange('both')}
                  className={`px-4 py-2 rounded transition-all duration-200 ${currentView === 'both'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-slate-500'
                    }`}
                  type="button"
                  title="View both brackets and competitors"
                >
                  <FaRegRectangleList className='h-6 w-6' />
                </button>
                <button
                  onClick={() => handleViewChange('brackets')}
                  className={`px-4 py-2 rounded transition-all duration-200 ${currentView === 'brackets'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-slate-500'
                    }`}
                  type="button"
                  title="View brackets/classes list"
                >
                  <TbTournament className='h-6 w-6' />
                </button>
                <button
                  onClick={() => handleViewChange('competitor-list')}
                  className={`px-4 py-2 rounded transition-all duration-200 ${currentView === 'competitor-list'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-slate-500'
                    }`}
                  type="button"
                  title="View all competitors"
                >
                  <UserIcon className='h-6 w-6' />
                </button>
              </div>
            </div>

            <button
              onClick={() => setBulkBracketModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition h-[50px] flex items-center justify-center"
              style={tournament?.brackets.length === 0 ? { animation: 'flash 2s ease-in-out infinite' } : {}}
              type="button"
              title="Add brackets/classes"
            >
              <PlusIcon className='h-6 w-6' />
            </button>

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
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition h-[50px] flex items-center justify-center"
              type="button"
              title="Download save file"
            >
              <ArrowDownTrayIcon className='h-6 w-6' />
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
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition h-[50px] flex items-center justify-center"
              type="button"
              title="Export to AERS"
            >
              <img src={AERSLogo} className='w-24' alt="AERS" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`p-6 flex-1 flex flex-col ${currentView === 'both' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {/* Modals */}
          {bulkBracketModalOpen && (
            <BulkBracketInputModal setBulkBracketModalOpen={setBulkBracketModalOpen} />
          )}

          {currentView === 'both' ? (
            <BracketsAndCompetitors />
          ) : currentView === 'brackets' ? (
            <BracketList />
          ) : (
            <CompetitorList />
          )}
        </div>
      </div>
    </>
  );
}
