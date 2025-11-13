import { useState, useEffect, useContext } from 'react';

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
            resetModal();
        } catch (error) {
            console.error('Error adding competitor:', error);
            showError('An unexpected error occurred');
        }
    };

    return (
        <>
            <ErrorToastContainer />
            <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                <div className='bg-slate-700 w-full max-w-3xl p-6 rounded-xl shadow-lg flex flex-col gap-4 max-h-[80vh] overflow-y-auto'>

                    <h1 className='text-2xl font-semibold text-white text-center'>
                        Add New Competitor
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
                            className='bg-slate-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
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

                    <div className='flex justify-center gap-4 mt-4'>
                        <button
                            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed'
                            onClick={handleSubmit}
                            disabled={!competitorName.trim() || selectedBrackets.size === 0}
                        >
                            Add Competitor
                        </button>
                        <button
                            className='bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition'
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
