import { useState, useEffect, useContext } from 'react';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';
import { useBracketSearchAndSort } from '../hooks/useBracketSearchAndSort';

import { CURRENT_STATE } from './App';
import BracketCheckboxList from './BracketCheckboxList';
import BracketSortDropdown from './BracketSortDropdown';

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
    const { search, setSearch, sorted: sortedBrackets, sortFieldItems, handleSortDragEnd } =
        useBracketSearchAndSort(tournament?.brackets ?? []);

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
            <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50'>
                <div className='bg-gradient-to-br from-slate-800 to-slate-900 w-full max-w-3xl p-6 rounded-xl shadow-2xl border border-slate-700/50 flex flex-col gap-4 max-h-[80vh]'>

                    <h1 className='text-2xl font-bold text-white text-center'>
                        Manage Classes for <span className='bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'>{competitorName}</span>
                    </h1>

                    <p className='text-gray-300 text-center text-sm'>
                        Click on a class to add or remove this competitor
                    </p>

                    <div className='flex gap-3'>
                        <input
                            type='text'
                            placeholder='Search classes...'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className='flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm'
                        />
                        <BracketSortDropdown fields={sortFieldItems} onDragEnd={handleSortDragEnd} />
                    </div>

                    <div className='max-h-96 overflow-y-auto'>
                        <BracketCheckboxList
                            brackets={sortedBrackets}
                            selectedBracketIds={selectedBrackets}
                            onToggle={toggleBracket}
                            loading={loading}
                        />
                    </div>

                    <div className='flex justify-center gap-4 mt-4'>
                        <button
                            className='bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl'
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
