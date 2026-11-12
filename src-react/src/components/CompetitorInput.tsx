import { useEffect, useRef, useState } from 'react';
import { HiTrash as TrashIcon, HiPlus as PlusIcon } from 'react-icons/hi2';
import { FaShuffle } from "react-icons/fa6";

import { CompetitorDTO } from '../../../src-shared/CompetitorDTO';
import { Gender } from '../../../src-shared/types';
import { competitorFullName } from '../../../src-shared/utils';

import AddCompetitorToBracketModal from './AddCompetitorToBracketModal';

function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

interface CompetitorInputProps {
    competitors: CompetitorDTO[];
    defaultGender: Gender;
    addCompetitor: (competitor: CompetitorDTO) => Promise<void>;
    removeCompetitor: (competitorId: string) => Promise<void>;
    randomizeCompetitors: () => Promise<void>;
    bracketStarted: boolean;
    onShowWarning: (message: string, onConfirm: () => void) => void;
}

export default function CompetitorInput({ competitors, defaultGender, addCompetitor, removeCompetitor, randomizeCompetitors, bracketStarted, onShowWarning }: CompetitorInputProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // This is a dummy div that we use to auto-scroll to the bottom when competitors update
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const prevLength = usePrevious(competitors.length);

    const handleRemove = async (competitorId: string) => {
        if (bracketStarted) {
            onShowWarning(
                'Removing a competitor will reset the entire bracket and all match results will be lost.',
                async () => {
                    await removeCompetitor(competitorId);
                }
            );
        } else {
            await removeCompetitor(competitorId);
        }
    };

    const handleRandomize = async () => {
        if (bracketStarted) {
            onShowWarning(
                'Randomizing competitors will reset the entire bracket and all match results will be lost.',
                async () => {
                    await randomizeCompetitors();
                }
            );
        } else {
            await randomizeCompetitors();
        }
    };

    // Auto-scroll to bottom when competitors update, but only scroll when a competitor was added
    useEffect(() => {
        if (prevLength !== undefined && competitors.length > prevLength) {
            const container = scrollContainerRef.current;
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth',
                });
            }
        }
    }, [competitors.length, prevLength]);

    return (
        <div className="flex flex-col justify-between h-full">
            <div className="flex flex-col overflow-y-auto h-full rounded-xl p-4 bg-slate-900/50 border border-slate-700/30" ref={scrollContainerRef}>
                <div className="flex items-center justify-between mb-4 gap-3">
                    <h2 className="text-sm font-semibold text-white">
                        Competitors ({competitors.length})
                    </h2>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRandomize();
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        disabled={competitors.length < 2}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        type="button"
                        title="Randomize order"
                    >
                        <FaShuffle className="h-4 w-4" />
                    </button>
                </div>

                {competitors.length === 0 && (
                    <p className="text-gray-400 text-sm italic">No competitors yet</p>
                )}

                {competitors.map((competitor) => (
                    <div key={competitor.id} className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            value={competitorFullName(competitor)}
                            disabled
                            className="flex-grow px-3 py-2 rounded-lg bg-slate-700 text-white text-sm border border-slate-600/50 opacity-90 cursor-not-allowed"
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (competitor.id) handleRemove(competitor.id);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
                            type="button"
                            title="Remove competitor"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {/* New competitors are entered in a modal */}
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsAddModalOpen(true);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        type="button"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Competitor
                    </button>
                </div>
            </div>

            {isAddModalOpen && (
                <AddCompetitorToBracketModal
                    bracketCompetitors={competitors}
                    defaultGender={defaultGender}
                    bracketStarted={bracketStarted}
                    addCompetitor={addCompetitor}
                    onClose={() => setIsAddModalOpen(false)}
                />
            )}
        </div>
    );
}
