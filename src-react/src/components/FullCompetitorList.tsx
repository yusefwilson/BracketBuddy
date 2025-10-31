import { useState, useContext, useMemo } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';
import { CURRENT_STATE } from './App';
import CompetitorClassModal from './CompetitorClassModal';

export default function FullCompetitorList() {
    const state = useContext(CURRENT_STATE);
    const { tournament } = state || {};

    const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Filter competitors based on search term
    const filteredCompetitors = useMemo(() => {
        if (!searchTerm.trim()) return allCompetitors;

        const lowerSearch = searchTerm.toLowerCase();
        return allCompetitors.filter(competitor =>
            competitor.name.toLowerCase().includes(lowerSearch)
        );
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
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <UserIcon className="h-7 w-7 text-blue-400" />
                    All Competitors ({allCompetitors.length})
                </h2>

                <input
                    type="text"
                    placeholder="Search competitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-md"
                />
            </div>

            {/* Competitor List */}
            {filteredCompetitors.length === 0 ? (
                <div className="text-gray-400 text-center italic py-8">
                    {searchTerm.trim()
                        ? `No competitors found matching "${searchTerm}"`
                        : 'No competitors yet. Add brackets and competitors to get started.'
                    }
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {filteredCompetitors.map((competitor) => (
                        <button
                            key={competitor.name}
                            onClick={() => setSelectedCompetitor(competitor.name)}
                            className="bg-slate-600 hover:bg-slate-500 p-4 rounded-lg transition-all duration-200 text-left border-2 border-transparent hover:border-blue-400 group"
                        >
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                                    <span className="text-white font-semibold truncate group-hover:text-blue-300">
                                        {competitor.name}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-300">
                                    <span className="font-medium text-blue-300">{competitor.bracketCount}</span>
                                    {' '}
                                    {competitor.bracketCount === 1 ? 'class' : 'classes'}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedCompetitor && (
                <CompetitorClassModal
                    competitorName={selectedCompetitor}
                    onClose={() => setSelectedCompetitor(null)}
                />
            )}
        </div>
    );
}
