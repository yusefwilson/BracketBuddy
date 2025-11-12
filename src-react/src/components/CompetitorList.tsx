import { useState, useContext, useMemo, useEffect } from 'react';
import { UserIcon, PlusIcon } from '@heroicons/react/24/outline';

import { safeApiCall } from '../utils/apiHelpers';

import { CURRENT_STATE } from './App';
import CompetitorClassModal from './CompetitorClassModal';
import AddCompetitorModal from './AddCompetitorModal';
import CompetitorInfoCard from './CompetitorInfoCard';

export default function CompetitorList() {
    const state = useContext(CURRENT_STATE);
    const { tournament } = state || {};

    const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Load saved modal state on mount
    useEffect(() => {
        const loadModalState = async () => {
            const [saveData, error] = await safeApiCall(window.electron.getSaveData());
            if (!error && saveData?.isAddCompetitorModalOpen !== undefined) {
                setIsAddModalOpen(saveData.isAddCompetitorModalOpen);
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

    if (!tournament) {
        return (
            <div className="text-gray-400 text-center italic">
                No tournament selected
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
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
                        placeholder="Search competitors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-md"
                    />
                    <button
                        onClick={() => handleModalToggle(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-2 font-semibold"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add Competitor
                    </button>
                </div>



            </div>

            {/* Competitor List */}
            {filteredCompetitors.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                    {searchTerm.trim()
                        ? `No competitors found matching "${searchTerm}"`
                        : 'No brackets yet. Click "Add Brackets" to get started.'
                    }
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
        </div>
    );
}
