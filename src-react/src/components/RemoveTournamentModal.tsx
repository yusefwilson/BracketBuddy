import { useContext, useEffect } from 'react';

import { TournamentDTO } from '../../../src-shared/TournamentDTO';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';

interface RemoveTournamentModalProps {
    setRemoveTournamentModalOpen: (open: boolean) => void;
    tournamentToDelete: TournamentDTO | null;
}

export default function RemoveTournamentModal({ setRemoveTournamentModalOpen, tournamentToDelete, }: RemoveTournamentModalProps) {
    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};
    const { showError, ErrorToastContainer } = useErrorToast();

    // close modal when escape key is pressed
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

    // delete tournament from disk, clear state if necessary, and close modal
    const onDelete = async () => {
        console.log('Deleting tournament:', tournamentToDelete?.name);
        if (!tournamentToDelete?.id) {
            showError('No tournament selected to delete');
            return;
        }

        console.log("about to send api call");

        const [, error] = await safeApiCall(
            window.electron.deleteTournament({ tournamentId: tournamentToDelete.id })
        );

        console.log('returned from api call');

        if (error) {
            console.log('error deleting tournament: ', error);
            showError(error);
            return;
        }

        console.log('conditionally clearing state');

        // clear state
        if (tournament?.id === tournamentToDelete?.id) {
            setTournament(null);
        }

        console.log('about to close modal');

        setRemoveTournamentModalOpen(false);
    };

    return (
        <>
            <ErrorToastContainer />
            <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50'>
                <div className='bg-gradient-to-br from-slate-800 to-slate-900 w-full max-w-md p-6 rounded-xl shadow-2xl border border-slate-700/50 flex flex-col gap-5'>

                    <h1 className='text-white text-xl font-bold text-center'>
                        Are you sure you want to delete{' '} <br />
                        <span className='bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent'>{tournamentToDelete?.name}</span>? <br />
                        <span className='text-sm font-normal text-gray-400 mt-2 block'>This action cannot be undone.</span>
                    </h1>

                    <div className='flex justify-center gap-3 mt-4'>
                        <button
                            className='bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg border border-slate-600/50 transition-all duration-200 hover:border-slate-500'
                            onClick={() => setRemoveTournamentModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className='bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
                            onClick={onDelete}
                        >
                            Confirm Delete
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
