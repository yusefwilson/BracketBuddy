import { useContext, useState } from 'react';

import BracketList from '../components/BracketList';
import MassCompetitorInput from '../components/MassCompetitorInput';
import FullCompetitorList from '../components/FullCompetitorList';
import { CURRENT_STATE } from '../components/App';

import BulkBracketInputModal from '../components/BulkBracketInputModal';
import { dateToLocalTimezoneString } from '../../../src-shared/utils';

export default function TournamentView() {
  const state = useContext(CURRENT_STATE);
  const { tournament } = state || {};

  const [bulkBracketModalOpen, setBulkBracketModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'brackets' | 'mass-input' | 'competitor-list'>('brackets');
  const [refreshTick, setRefreshTick] = useState(0);

  const cycleView = () => {
    if (currentView === 'brackets') {
      setCurrentView('mass-input');
    } else if (currentView === 'mass-input') {
      setCurrentView('competitor-list');
    } else {
      setCurrentView('brackets');
    }
  };

  const getViewButtonText = () => {
    switch (currentView) {
      case 'brackets':
        return 'View: Brackets';
      case 'mass-input':
        return 'View: Mass Input';
      case 'competitor-list':
        return 'View: Competitors';
      default:
        return 'Switch View';
    }
  };

  if (!tournament) {
    return (
      <div>
        No tournament! Uh oh.
      </div>
    )
  }

  return (
    <div className="bg-slate-700 p-6 flex flex-col items-center gap-6 w-full mx-auto h-full">
      <h1 className="text-3xl font-bold text-white flex-shrink-0">
        Tournament: <span className="text-blue-400">{tournament?.name}</span>
      </h1>
      <h2 className="text-lg text-gray-300 flex-shrink-0">
        Date: <span className="font-semibold">{dateToLocalTimezoneString(tournament?.date)}</span>
      </h2>

      {/* Buttons to open modals */}
      <div className="flex gap-4 flex-shrink-0">
        <button
          onClick={() => setBulkBracketModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-md shadow-md transition"
          type="button"
        >
          Add Brackets
        </button>
        <button
          onClick={cycleView}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-md shadow-md transition"
          type="button"
        >
          {getViewButtonText()}
        </button>
        <button
          onClick={async () => {
            const AERSData = await window.electron.convertToAERS({ tournamentId: tournament.id });
            const { canceled, filePath } = await window.electron.saveCsv(`${tournament.name}_AERS`, AERSData);

            if (!canceled) {
              console.log(`✅ Saved CSV to: ${filePath}`);
            } else {
              console.log('❌ Save canceled');
            }
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-md shadow-md transition"
          type="button"
        >
          Export To AERS
        </button>
      </div>

      {/* Modals */}
      {bulkBracketModalOpen && (
        <BulkBracketInputModal setBulkBracketModalOpen={setBulkBracketModalOpen} />
      )}

      {currentView === 'mass-input' ? (
        <MassCompetitorInput />
      ) : currentView === 'competitor-list' ? (
        <FullCompetitorList />
      ) : (
        <BracketList onBracketRemoved={() => setRefreshTick(refreshTick + 1)} />
      )}

    </div>
  );
}
