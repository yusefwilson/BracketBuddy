import { useState, useEffect } from 'react';

import { dateToLocalTimezoneString } from '../../../src-shared/utils';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

interface TournamentInputModalProps {
    setTournamentModalOpen: (open: boolean) => void;
}

export default function TournamentInputModal({ setTournamentModalOpen }: TournamentInputModalProps) {
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date());
    const [error, setError] = useState('');
    const { showError, ErrorToastContainer } = useErrorToast();

    const invalidChars = /[:<>:'/\\|?*]/g;

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        switch (event.target.name) {
            case 'name':
                setName(event.target.value);
                break;
            case 'date': {
                const [year, month, day] = event.target.value.split('-').map(Number);
                setDate(new Date(year, month - 1, day));
                break;
            }
            default:
                break;
        }
    };

    const onSubmit = async () => {
        if (invalidChars.test(name)) {
            setError(`Tournament name contains invalid characters: :<>:'/\\|?*`);
            return;
        }

        const [allTournaments, tournamentsError] = await safeApiCall(
            window.electron.loadAllTournaments()
        );

        if (tournamentsError) {
            showError(tournamentsError);
            return;
        }

        // TODO: should this be some kind of id check instead?
        if (allTournaments && allTournaments.some((t) => t.name === name)) {
            setError(`Tournament with name '${name}' already exists.`);
            return;
        }

        // clear error if valid
        setError('');

        // create and save tournament. TODO: does this update state? (probably)
        console.log('about to create tournament with name', name, 'and date', date);
        const [, createError] = await safeApiCall(
            window.electron.createTournament({ name, date })
        );

        if (createError) {
            showError(createError);
            return;
        }

        // close modal
        setTournamentModalOpen(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setTournamentModalOpen(false);
            } else if (event.key === 'Enter') {
                onSubmit();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onSubmit, setTournamentModalOpen]);

    return (
        <>
            <ErrorToastContainer />
            <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50'>
                <div className='bg-gradient-to-br from-slate-800 to-slate-900 w-full max-w-md rounded-xl p-6 shadow-2xl border border-slate-700/50 flex flex-col gap-5'>

                    <h1 className='text-2xl font-bold text-white text-center'>
                        <span className='bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'>Enter Tournament Info</span>
                    </h1>

                    {/* Input: Name */}
                    <input
                        className='bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
                        placeholder='Tournament Name'
                        name='name'
                        onChange={onChange}
                    />

                    {/* Input: Date */}
                    <input
                        type='date'
                        name='date'
                        className='bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
                        value={dateToLocalTimezoneString(date)}
                        onChange={onChange}
                    />

                    {/* Error Message */}
                    {error && (
                        <p className='bg-gradient-to-br from-red-500 to-red-600 text-white text-sm px-4 py-2 rounded-lg shadow-md'>{error}</p>
                    )}

                    {/* Action Buttons */}
                    <div className='flex justify-center gap-3 mt-2'>
                        <button
                            className='bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg border border-slate-600/50 transition-all duration-200 hover:border-slate-500'
                            onClick={() => setTournamentModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className='bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
                            onClick={onSubmit}
                            disabled={name.trim() === ''}
                        >
                            Create Tournament
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
