import { useEffect } from 'react';
import Tournament from '../lib/Tournament';
import Bracket from '../lib/Bracket';

export default function RemoveTournamentModal({ setRemoveTournamentModalOpen, tournamentToDelete }:
    { setRemoveTournamentModalOpen: (open: boolean) => void, tournamentToDelete: Tournament | null }) {

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

        // clear local storage if tournament is in local storage
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

        // delete file
        tournamentToDelete?.delete();

        // close modal
        setRemoveTournamentModalOpen(false);
    }

    return (
        <div className='fixed left-0 right-0 top-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center'>
            <div className='bg-purple-600 flex flex-col p-2 rounded-md gap-2'>

                {/* Warning */}
                <h1>Are you sure you want to delete this tournament? This action cannot be undone.</h1>

                {/* Confirm Button */}
                <button className='bg-yellow-500 p-4 rounded-md flex-shrink' onClick={onDelete}>Confirm</button>

                {/* Close Button (X) */}
                <button className='bg-red-500 text-white px-2 py-1 rounded-md' onClick={() => setRemoveTournamentModalOpen(false)}>Cancel</button>

            </div>
        </div >
    );
}