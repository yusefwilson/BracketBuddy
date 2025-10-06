import BracketInfoCard from '../components/BracketInfoCard';
import { CURRENT_STATE } from '../components/App';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BracketInputModal from '../components/BracketInputModal';

export default function TournamentView() {
  const state = useContext(CURRENT_STATE);
  const { tournament, setBracketIndex = () => { }, setTournament = () => { } } = state || {};
  const navigate = useNavigate();

  const [bracketModalOpen, setBracketModalOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  return (
    <div className='bg-slate-700 p-6 flex flex-col items-center gap-6 w-full mx-auto min-h-screen'>
      <h1 className='text-3xl font-bold text-white'>
        Tournament: <span className='text-blue-400'>{tournament?.name}</span>
      </h1>
      <h2 className='text-lg text-gray-300'>
        Date: <span className='font-semibold'>{tournament?.date.toDateString()}</span>
      </h2>

      <button
        onClick={() => setBracketModalOpen(true)}
        className='bg-blue-500 hover:bg-blue-600 text-black font-semibold px-6 py-3 rounded-md shadow-md transition'
        type='button'
      >
        Add Bracket
      </button>

      {bracketModalOpen && <BracketInputModal setBracketModalOpen={setBracketModalOpen} />}

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6'>
        {tournament?.brackets.length ? (
          tournament.brackets.map((bracket, index) => (
            <BracketInfoCard key={index} bracket={bracket}
              onClick={async () => {
                setBracketIndex(index);
                await window.electron.saveKeyValue({ key: 'lastBracketIndex', value: index });
                navigate('/bracket');
              }}
              onRemoveClick={async () => {
                const newTournament = await window.electron.removeBracketFromTournament({tournamentId: tournament.id, bracketId: bracket.id});
                setTournament(newTournament);
                setRefreshTick(refreshTick + 1);
              }}
            />
          ))
        ) : (
          <p className='text-gray-400 text-center italic'>No brackets added yet.</p>
        )}
      </div>
    </div>
  );
}
