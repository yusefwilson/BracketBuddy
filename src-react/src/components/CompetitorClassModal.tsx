import { useState, useEffect, useContext } from 'react';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';
import BracketCheckboxList from './BracketCheckboxList';

interface CompetitorClassModalProps {
    competitorName: string;
    onClose: () => void;
}

export default function CompetitorClassModal({ competitorName, onClose }: CompetitorClassModalProps) {
    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};
    const { showError, ErrorToastContainer } = useErrorToast();

    const [loading, setLoading] = useState(false);
    const [selectedBrackets, setSelectedBrackets] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!tournament) return;

        // Find which brackets this competitor is already in
        const bracketsWithCompetitor = tournament.brackets
            .filter(bracket => bracket.competitorNames.includes(competitorName))
            .map(bracket => bracket.id);

        setSelectedBrackets(new Set(bracketsWithCompetitor));
    }, [tournament, competitorName]);

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

    const toggleBracket = async (bracketId: string) => {
        setLoading(true);
        try {
            const isCurrentlySelected = selectedBrackets.has(bracketId);

            let result;
            if (isCurrentlySelected) {
                // Remove competitor from bracket
                const [data, error] = await safeApiCall(
                    window.electron.removeCompetitorFromBracket({
                        tournamentId: tournament.id,
                        bracketId: bracketId,
                        competitorName: competitorName
                    })
                );

                if (error) {
                    showError(error);
                    return;
                }

                result = data;
                const newSelected = new Set(selectedBrackets);
                newSelected.delete(bracketId);
                setSelectedBrackets(newSelected);
            } else {
                // Add competitor to bracket
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

                result = data;
                const newSelected = new Set(selectedBrackets);
                newSelected.add(bracketId);
                setSelectedBrackets(newSelected);
            }

            if (result) {
                setTournament(result);
            }
        } catch (error) {
            console.error('Error toggling bracket:', error);
            showError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <>
            <ErrorToastContainer />
            <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                <div className='bg-slate-700 w-full max-w-3xl p-6 rounded-xl shadow-lg flex flex-col gap-4 max-h-[80vh]'>

                    <h1 className='text-2xl font-semibold text-white text-center'>
                        Manage Classes for <span className='text-blue-400'>{competitorName}</span>
                    </h1>

                    <p className='text-gray-300 text-center text-sm'>
                        Click on a class to add or remove this competitor
                    </p>

                    <div className='max-h-96 overflow-y-auto'>
                        <BracketCheckboxList
                            brackets={tournament.brackets}
                            selectedBracketIds={selectedBrackets}
                            onToggle={toggleBracket}
                            loading={loading}
                        />
                    </div>

                    <div className='flex justify-center gap-4 mt-4'>
                        <button
                            className='bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition'
                            onClick={onClose}
                            disabled={loading}
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
