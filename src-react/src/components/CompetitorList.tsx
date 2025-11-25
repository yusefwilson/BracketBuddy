import { useState, useContext, useMemo, useEffect } from 'react';
import { HiUser as UserIcon, HiPlus as PlusIcon } from 'react-icons/hi2';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';
import CompetitorClassModal from './CompetitorClassModal';
import AddCompetitorModal from './AddCompetitorModal';
import CompetitorInfoCard from './CompetitorInfoCard';

import { HiPlus } from 'react-icons/hi2';
import { CgArrowUp } from 'react-icons/cg';

export default function CompetitorList() {
    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};
    const { showError, ErrorToastContainer } = useErrorToast();

    const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [competitorToRemove, setCompetitorToRemove] = useState<{ name: string; brackets: Array<{ id: string; name: string }> } | null>(null);

    // Load saved modal state on mount
    useEffect(() => {
        const loadModalState = async () => {
            const [isAddCompetitorModalOpen, error] = await safeApiCall(window.electron.getSavedValue('isAddCompetitorModalOpen'));
            if (!error && isAddCompetitorModalOpen !== undefined) {
                setIsAddModalOpen(isAddCompetitorModalOpen);
            }
        };
        loadModalState();
    }, []);

    // Save modal state whenever it changes
    const handleModalToggle = async (isOpen: boolean) => {
        setIsAddModalOpen(isOpen);
        await safeApiCall(window.electron.saveKeyValue({ key: 'isAddCompetitorModalOpen', value: isOpen }));
    };

    // Get all unique competitors from all brackets
    const allCompetitors = useMemo(() => {
        if (!tournament) return [];

        const competitorMap = new Map<string, {
            name: string;
            bracketCount: number;
            brackets: Array<{ id: string; name: string }>;
        }>();

        tournament.brackets.forEach((bracket) => {
            const bracketName = `${bracket.gender} | ${bracket.experienceLevel} | ${bracket.hand} | ${bracket.weightLimit === 'Superheavyweight' ? 'SHW' : bracket.weightLimit + ' lbs'}`;

            bracket.competitorNames.forEach((competitorName) => {
                if (competitorMap.has(competitorName)) {
                    const existing = competitorMap.get(competitorName)!;
                    existing.bracketCount++;
                    existing.brackets.push({ id: bracket.id, name: bracketName });
                } else {
                    competitorMap.set(competitorName, {
                        name: competitorName,
                        bracketCount: 1,
                        brackets: [{ id: bracket.id, name: bracketName }]
                    });
                }
            });
        });

        // Convert to array and sort alphabetically
        return Array.from(competitorMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
    }, [tournament]);

    // Filter competitors based on search term (searches both name and bracket/class names)
    const filteredCompetitors = useMemo(() => {
        if (!searchTerm.trim()) return allCompetitors;

        const lowerSearch = searchTerm.toLowerCase();
        const searchWords = lowerSearch.split(/\s+/).filter(word => word.length > 0);

        return allCompetitors.filter(competitor => {
            const lowerName = competitor.name.toLowerCase();

            // Check if competitor name matches all search words
            if (searchWords.every(word => lowerName.includes(word))) {
                return true;
            }

            // Check if any bracket matches all search words
            return competitor.brackets.some(bracket => {
                const lowerBracketName = bracket.name.toLowerCase();
                return searchWords.every(word => lowerBracketName.includes(word));
            });
        });
    }, [allCompetitors, searchTerm]);

    // Handle removing competitor from all brackets
    const handleRemoveCompetitor = async (competitorName: string, brackets: Array<{ id: string; name: string }>) => {
        if (!tournament) return;

        // Remove from each bracket sequentially
        let currentTournament = tournament;
        for (const bracket of brackets) {
            const [updatedTournament, error] = await safeApiCall(
                window.electron.removeCompetitorFromBracket({
                    tournamentId: currentTournament.id,
                    bracketId: bracket.id,
                    competitorName
                })
            );

            if (error) {
                showError(error);
                return;
            }

            if (updatedTournament) {
                currentTournament = updatedTournament;
            }
        }

        // Update tournament after all removals
        setTournament(currentTournament);
        setCompetitorToRemove(null);
    };

    if (!tournament) {
        return (
            <div className="text-gray-400 text-center italic">
                No tournament selected
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <ErrorToastContainer />
            {/* Header and Search */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserIcon className="h-7 w-7 text-blue-400" />
                        All Competitors ({allCompetitors.length})
                    </h2>

                </div>
                <div className="flex flex-row gap-4">

                    <input
                        type="text"
                        placeholder="Search competitors/classes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-md"
                    />
                    <button
                        onClick={() => handleModalToggle(true)}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2"
                        style={allCompetitors.length === 0 ? { animation: 'flash 2s ease-in-out infinite' } : {}}
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add Competitor
                    </button>
                </div>



            </div>

            {/* Competitor List */}
            {filteredCompetitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                    {searchTerm.trim() ? (
                        <div className="text-lg">{`No competitors found matching "${searchTerm}"`}</div>
                    ) : (
                        <>
                            <div className="text-lg">No competitors yet</div>
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                                <div className="flex flex-row items-center gap-2 justify-center">
                                    <span>Click the</span>
                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center gap-1">
                                        <HiPlus className="h-5 w-5" />
                                        <span className='font-semibold p-1'>Add Competitor</span>
                                    </span>
                                    <span>button above to create your first competitor</span>
                                    <CgArrowUp className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filteredCompetitors.map((competitor) => (
                        <CompetitorInfoCard
                            key={competitor.name}
                            name={competitor.name}
                            bracketCount={competitor.bracketCount}
                            brackets={competitor.brackets}
                            onClick={() => setSelectedCompetitor(competitor.name)}
                            onRemove={() => setCompetitorToRemove({ name: competitor.name, brackets: competitor.brackets })}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {selectedCompetitor && (
                <CompetitorClassModal
                    competitorName={selectedCompetitor}
                    onClose={() => setSelectedCompetitor(null)}
                />
            )}

            {isAddModalOpen && (
                <AddCompetitorModal
                    onClose={() => handleModalToggle(false)}
                />
            )}

            {/* Confirmation Modal for Removal */}
            {competitorToRemove && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-slate-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-4">Remove Competitor</h3>
                        <p className="text-gray-300 mb-2">
                            Are you sure you want to remove <span className="font-semibold text-white">{competitorToRemove.name}</span> from all brackets?
                        </p>
                        <p className="text-gray-400 text-sm mb-6">
                            This will remove them from {competitorToRemove.brackets.length} {competitorToRemove.brackets.length === 1 ? 'class' : 'classes'}:
                        </p>
                        <ul className="text-gray-300 text-sm mb-6 max-h-32 overflow-y-auto">
                            {competitorToRemove.brackets.map((bracket) => (
                                <li key={bracket.id} className="mb-1">• {bracket.name}</li>
                            ))}
                        </ul>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setCompetitorToRemove(null)}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRemoveCompetitor(competitorToRemove.name, competitorToRemove.brackets)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
