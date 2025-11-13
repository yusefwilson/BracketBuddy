import { useContext, useState, useEffect } from 'react';

import { dateToLocalTimezoneString } from '../../../src-shared/utils';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from '../components/App';
import BracketsAndCompetitors from '../components/BracketsAndCompetitors';
import CompetitorList from '../components/CompetitorList';
import BracketList from '../components/BracketList';
import BulkBracketInputModal from '../components/BulkBracketInputModal';

export default function TournamentView() {
  const state = useContext(CURRENT_STATE);
  const { tournament } = state || {};
  const { showError, ErrorToastContainer } = useErrorToast();

  const [bulkBracketModalOpen, setBulkBracketModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'both' | 'brackets' | 'competitor-list'>('both');

  // Load saved view on mount
  useEffect(() => {
    const loadView = async () => {
      const [saveData, error] = await safeApiCall(window.electron.getSaveData());
      if (!error && saveData?.currentView) {
        setCurrentView(saveData.currentView);
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
          <div className="flex gap-3">
            <button
              onClick={() => setBulkBracketModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
              type="button"
            >
              Add Brackets
            </button>

            {/* View Toggle Buttons */}
            <div className="flex gap-1 bg-slate-600 rounded-md p-1">
              <button
                onClick={() => handleViewChange('both')}
                className={`px-4 py-1 rounded transition font-semibold ${currentView === 'both'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                  }`}
                type="button"
              >
                Both
              </button>
              <button
                onClick={() => handleViewChange('brackets')}
                className={`px-4 py-1 rounded transition font-semibold ${currentView === 'brackets'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                  }`}
                type="button"
              >
                Brackets
              </button>
              <button
                onClick={() => handleViewChange('competitor-list')}
                className={`px-4 py-1 rounded transition font-semibold ${currentView === 'competitor-list'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                  }`}
                type="button"
              >
                Competitors
              </button>
            </div>

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
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
              type="button"
            >
              Export To AERS
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
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-md transition"
              type="button"
            >
              Export To File
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
