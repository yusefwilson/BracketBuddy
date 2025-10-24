import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BracketInfoCard from '../components/BracketInfoCard';
import MassCompetitorInput from '../components/MassCompetitorInput';
import { CURRENT_STATE } from '../components/App';

import BulkBracketInputModal from '../components/BulkBracketInputModal';
import { dateToLocalTimezoneString } from '../../../src-shared/utils';

export default function TournamentView() {
  const state = useContext(CURRENT_STATE);
  const { tournament, setBracketIndex = () => { }, setTournament = () => { } } = state || {};
  const navigate = useNavigate();

  const [bulkBracketModalOpen, setBulkBracketModalOpen] = useState(false);
  const [competitorViewOpen, setCompetitorViewOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

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
          onClick={() => setCompetitorViewOpen(!competitorViewOpen)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-md shadow-md transition"
          type="button"
        >
          Switch View
        </button>
      </div>

      {/* Modals */}
      {bulkBracketModalOpen && (
        <BulkBracketInputModal setBulkBracketModalOpen={setBulkBracketModalOpen} />
      )}

      {
        competitorViewOpen ?
          <MassCompetitorInput />
          :
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
            {tournament?.brackets.length ? (
              tournament.brackets.map((bracket, index) => (
                <BracketInfoCard
                  key={index}
                  bracket={bracket}
                  onClick={async () => {
                    setBracketIndex(index);
                    await window.electron.saveKeyValue({ key: 'lastBracketIndex', value: index });
                    navigate('/bracket');
                  }}
                  onRemoveClick={async () => {
                    const newTournament = await window.electron.removeBracketFromTournament({
                      tournamentId: tournament.id,
                      bracketId: bracket.id
                    });
                    setTournament(newTournament);
                    setRefreshTick(refreshTick + 1);
                  }}
                />
              ))
            ) : (
              <p className="text-gray-400 text-center italic">No brackets added yet.</p>
            )}
          </div>
      }

    </div>
  );
}
