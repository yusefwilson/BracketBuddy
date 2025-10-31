import { useState, useEffect, useContext } from 'react';
import { UserIcon, AcademicCapIcon, HandRaisedIcon, ScaleIcon } from '@heroicons/react/24/outline';

import { BracketDTO } from '../../../src-shared/BracketDTO';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';

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

    const toggleBracket = async (bracket: BracketDTO) => {
        setLoading(true);
        try {
            const isCurrentlySelected = selectedBrackets.has(bracket.id);

            let result;
            if (isCurrentlySelected) {
                // Remove competitor from bracket
                const [data, error] = await safeApiCall(
                    window.electron.removeCompetitorFromBracket({
                        tournamentId: tournament.id,
                        bracketId: bracket.id,
                        competitorName: competitorName
                    })
                );

                if (error) {
                    showError(error);
                    return;
                }

                result = data;
                const newSelected = new Set(selectedBrackets);
                newSelected.delete(bracket.id);
                setSelectedBrackets(newSelected);
            } else {
                // Add competitor to bracket
                const [data, error] = await safeApiCall(
                    window.electron.addCompetitorToBracket({
                        tournamentId: tournament.id,
                        bracketId: bracket.id,
                        competitorName: competitorName
                    })
                );

                if (error) {
                    showError(error);
                    return;
                }

                result = data;
                const newSelected = new Set(selectedBrackets);
                newSelected.add(bracket.id);
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
            <div className='bg-slate-700 w-full max-w-3xl p-6 rounded-xl shadow-lg flex flex-col gap-4 max-h-[80vh] overflow-y-auto'>

                <h1 className='text-2xl font-semibold text-white text-center'>
                    Manage Classes for <span className='text-blue-400'>{competitorName}</span>
                </h1>

                <p className='text-gray-300 text-center text-sm'>
                    Click on a class to add or remove this competitor
                </p>

                {tournament.brackets.length === 0 ? (
                    <p className='text-gray-400 text-center italic py-8'>
                        No brackets available. Create brackets first.
                    </p>
                ) : (
                    <div className='grid grid-cols-1 gap-3'>
                        {tournament.brackets.map((bracket) => {
                            const isSelected = selectedBrackets.has(bracket.id);
                            const competitorCount = bracket.competitorNames.length;

                            return (
                                <button
                                    key={bracket.id}
                                    onClick={() => toggleBracket(bracket)}
                                    disabled={loading}
                                    className={`
                                        p-4 rounded-lg border-2 transition-all duration-200 text-left
                                        ${isSelected
                                            ? 'bg-blue-600 border-blue-400 hover:bg-blue-700'
                                            : 'bg-slate-600 border-slate-500 hover:bg-slate-500'
                                        }
                                        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3 flex-wrap'>
                                            <div className='flex items-center gap-1'>
                                                <UserIcon className='h-4 w-4 text-blue-300' />
                                                <span className='text-white font-semibold text-sm'>{bracket.gender}</span>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <AcademicCapIcon className='h-4 w-4 text-green-300' />
                                                <span className='text-white font-semibold text-sm'>{bracket.experienceLevel}</span>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <HandRaisedIcon className='h-4 w-4 text-yellow-300' />
                                                <span className='text-white font-semibold text-sm'>{bracket.hand}</span>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <ScaleIcon className='h-4 w-4 text-purple-300' />
                                                <span className='text-white font-semibold text-sm'>
                                                    {bracket.weightLimit === 'Superheavyweight' ? 'SHW' : `${bracket.weightLimit} lbs`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <span className='text-gray-300 text-sm'>
                                                {competitorCount} {competitorCount === 1 ? 'competitor' : 'competitors'}
                                            </span>
                                            <div className={`
                                                w-6 h-6 rounded flex items-center justify-center
                                                ${isSelected ? 'bg-white' : 'bg-slate-700'}
                                            `}>
                                                {isSelected && (
                                                    <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className='flex justify-center gap-4 mt-4'>
                    <button
                        className='bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition'
                        onClick={onClose}
                        disabled={loading}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}
