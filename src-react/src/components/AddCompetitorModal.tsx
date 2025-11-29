import { useState, useEffect, useContext } from 'react';
import { HiCheck as CheckIcon } from 'react-icons/hi2';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';
import BracketCheckboxList from './BracketCheckboxList';

interface AddCompetitorModalProps {
    onClose: () => void;
}

export default function AddCompetitorModal({ onClose }: AddCompetitorModalProps) {
    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};
    const { showError, ErrorToastContainer } = useErrorToast();

    const [competitorName, setCompetitorName] = useState('');
    const [selectedBrackets, setSelectedBrackets] = useState<Set<string>>(new Set());
    const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);

    const resetModal = () => {
        setCompetitorName('');
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
        if (!competitorName) {
            showError('Please enter a competitor name');
            return;
        }

        if (selectedBrackets.size === 0) {
            showError('Please select at least one class');
            return;
        }

        try {
            let updatedTournament = tournament;

            // Add competitor to each selected bracket
            for (const bracketId of selectedBrackets) {
                const [data, error] = await safeApiCall(
                    window.electron.addCompetitorToBracket({
                        tournamentId: tournament.id,
                        bracketId: bracketId,
                        competitorName: competitorName
                    })
                );

                if (error) {
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

            <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50'>
                <div className='bg-gradient-to-br from-slate-800 to-slate-900 w-full max-w-3xl p-6 rounded-xl shadow-2xl border border-slate-700/50 flex flex-col gap-5 max-h-[80vh]'>

                    <h1 className='text-2xl font-bold text-white text-center'>
                        <span className='bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'>Add New Competitor</span>
                    </h1>

                    <div className='flex flex-col gap-2'>
                        <label className='text-gray-300 text-sm font-medium'>
                            Competitor Name
                        </label>
                        <input
                            type='text'
                            placeholder='Enter competitor name...'
                            value={competitorName}
                            onChange={(e) => setCompetitorName(e.target.value)}
                            className='bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
                            autoFocus
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-gray-300 text-sm font-medium'>
                            Select Classes
                        </label>
                        <p className='text-gray-400 text-xs'>
                            Click on classes to add the competitor to them
                        </p>
                    </div>

                    <div className='max-h-96 overflow-y-auto'>
                        <BracketCheckboxList
                            brackets={tournament.brackets}
                            selectedBracketIds={selectedBrackets}
                            onToggle={toggleBracket}
                        />
                    </div>

                    <div className='flex justify-center gap-3 mt-4'>
                        <button
                            className='bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                            onClick={handleSubmit}
                            disabled={!competitorName.trim() || selectedBrackets.size === 0}
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
