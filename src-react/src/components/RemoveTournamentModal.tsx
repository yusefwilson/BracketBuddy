import { useEffect } from 'react';
import Tournament from '../lib/Tournament';
import Bracket from '../lib/Bracket';

export default function RemoveTournamentModal({ setRemoveTournamentModalOpen, tournamentToDelete, }: { setRemoveTournamentModalOpen: (open: boolean) => void; tournamentToDelete: Tournament | null; }) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setRemoveTournamentModalOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const onDelete = () => {
        const serializedTournament = localStorage.getItem('tournament') || '';
        const tournament = Tournament.deserialize(serializedTournament);
        if (tournamentToDelete?.name === tournament.name) {
            localStorage.removeItem('tournament');
        }

        const serializedBracket = localStorage.getItem('bracket') || '';
        const bracket = Bracket.deserialize(serializedBracket);
        if (bracket.tournament?.name === tournamentToDelete?.name) {
            localStorage.removeItem('bracket');
        }

        tournamentToDelete?.delete();
        setRemoveTournamentModalOpen(false);
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
            <div className='bg-slate-700 w-full max-w-md p-6 rounded-xl shadow-lg flex flex-col gap-4'>

                <h1 className='text-white text-lg font-semibold text-center'>
                    Are you sure you want to delete{' '} <br />
                    <span className='text-red-400'>{tournamentToDelete?.name}</span>? <br />
                    <span className='text-sm font-normal text-gray-300'>This action cannot be undone.</span>
                </h1>

                <div className='flex justify-center gap-4 mt-4'>
                    <button
                        className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition'
                        onClick={() => setRemoveTournamentModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className='bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition'
                        onClick={onDelete}
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
