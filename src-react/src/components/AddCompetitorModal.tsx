import { useState, useEffect, useContext } from 'react';
import { HiCheck as CheckIcon, HiChevronDown as ChevronDownIcon } from 'react-icons/hi2';

import { Gender } from '../../../src-shared/types';
import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';
import { useBracketSearchAndSort } from '../hooks/useBracketSearchAndSort';

import { CURRENT_STATE } from './App';
import BracketCheckboxList from './BracketCheckboxList';
import BracketSortDropdown from './BracketSortDropdown';

interface AddCompetitorModalProps {
    onClose: () => void;
}

export default function AddCompetitorModal({ onClose }: AddCompetitorModalProps) {
    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};
    const { showError, ErrorToastContainer } = useErrorToast();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState<Gender>('Male');
    const [paid, setPaid] = useState(false);
    const [selectedBrackets, setSelectedBrackets] = useState<Set<string>>(new Set());
    const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
    const { search: bracketSearch, setSearch: setBracketSearch, sorted: filteredBrackets, sortFieldItems, handleSortDragEnd } =
        useBracketSearchAndSort(tournament?.brackets ?? []);

    const resetModal = () => {
        setFirstName('');
        setLastName('');
        setPaid(false);
        setSelectedBrackets(new Set());
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    if (!tournament) {
        return null;
    }

    const toggleBracket = (bracketId: string) => {
        const newSelected = new Set(selectedBrackets);
        if (newSelected.has(bracketId)) {
            newSelected.delete(bracketId);
        } else {
            newSelected.add(bracketId);
        }
        setSelectedBrackets(newSelected);
    };

    const handleSubmit = async () => {
        if (!firstName.trim()) {
            showError('Please enter a first name');
            return;
        }

        if (!lastName.trim()) {
            showError('Please enter a last name');
            return;
        }

        if (selectedBrackets.size === 0) {
            showError('Please select at least one class');
            return;
        }

        try {
            let updatedTournament = tournament;

            // Add competitor to each selected bracket. the backend registers the competitor the first time
            // and reuses that same competitor (matched by name) for the rest, so they are one person everywhere.
            for (const bracketId of selectedBrackets) {
                const [data, error] = await safeApiCall(
                    window.electron.addCompetitorToBracket({
                        tournamentId: tournament.id,
                        bracketId: bracketId,
                        competitor: { firstName: firstName.trim(), lastName: lastName.trim(), gender, paid }
                    })
                );

                if (error) {
                    // keep the UI in sync with whatever was already added before the failure
                    setTournament(updatedTournament);
                    showError(error);
                    return;
                }

                if (data) {
                    updatedTournament = data;
                }
            }

            setTournament(updatedTournament);

            // Show success feedback
            setShowSuccessFeedback(true);
            setTimeout(() => setShowSuccessFeedback(false), 1000);

            resetModal();
        } catch (error) {
            console.error('Error adding competitor:', error);
            showError('An unexpected error occurred');
        }
    };

    return (
        <>
            <ErrorToastContainer />

            {/* Success Feedback Animation */}
            {showSuccessFeedback && (
                <div className='fixed inset-0 flex justify-center items-center z-[60] pointer-events-none'>
                    <div className='animate-[scale-up_0.3s_ease-out] bg-green-500 rounded-full p-6 shadow-2xl'>
                        <CheckIcon className='h-16 w-16 text-white animate-[pop_0.4s_ease-out]' strokeWidth={3} />
                    </div>
                </div>
            )}

            <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-2'>
                <div className='bg-gradient-to-br from-slate-800 to-slate-900 w-full max-w-3xl p-6 rounded-xl shadow-2xl border border-slate-700/50 flex flex-col gap-5 h-[90%] overflow-y-auto'>

                    <h1 className='text-2xl font-bold text-white text-center'>
                        <span className='bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'>Add New Competitor</span>
                    </h1>

                    <div className='flex flex-col gap-2'>
                        <label className='text-gray-300 text-sm font-medium'>
                            Competitor Info
                        </label>
                        <div className='flex gap-3'>
                            <input
                                type='text'
                                placeholder='First name'
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className='flex-1 min-w-0 bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
                                autoFocus
                            />
                            <input
                                type='text'
                                placeholder='Last name'
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className='flex-1 min-w-0 bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
                            />
                            {/* appearance-none removes the native arrow, which sits far from the text. the chevron is drawn just inside the box instead. */}
                            <div className='relative'>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as Gender)}
                                    className='appearance-none bg-slate-700 text-white pl-3 pr-9 py-3 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition h-full'
                                    title='Gender'
                                >
                                    <option value='Male'>Male</option>
                                    <option value='Female'>Female</option>
                                </select>
                                <div className='pointer-events-none absolute inset-y-0 right-2.5 flex items-center'>
                                    <ChevronDownIcon className='h-4 w-4 text-gray-400' aria-hidden='true' />
                                </div>
                            </div>
                            <label className='flex items-center gap-2 text-gray-300 text-sm cursor-pointer select-none'>
                                <input
                                    type='checkbox'
                                    checked={paid}
                                    onChange={(e) => setPaid(e.target.checked)}
                                    className='h-4 w-4 accent-green-500 cursor-pointer'
                                />
                                Paid
                            </label>
                        </div>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-gray-300 text-sm font-medium'>
                            Select Classes
                        </label>
                        <div className='flex gap-3'>
                            <input
                                type='text'
                                placeholder='Search classes...'
                                value={bracketSearch}
                                onChange={(e) => setBracketSearch(e.target.value)}
                                className='flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm'
                            />
                            <BracketSortDropdown fields={sortFieldItems} onDragEnd={handleSortDragEnd} />
                        </div>
                    </div>

                    <div className='max-h-96 overflow-y-auto min-h-36'>
                        <BracketCheckboxList
                            brackets={filteredBrackets}
                            selectedBracketIds={selectedBrackets}
                            onToggle={toggleBracket}
                        />
                    </div>

                    <div className='flex justify-center gap-3 mt-4'>
                        <button
                            className='bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                            onClick={handleSubmit}
                            disabled={!firstName.trim() || !lastName.trim() || selectedBrackets.size === 0}
                        >
                            Add Competitor
                        </button>
                        <button
                            className='bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-lg border border-slate-600/50 transition-all duration-200 hover:border-slate-500'
                            onClick={onClose}
                        >
                            Done
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}
