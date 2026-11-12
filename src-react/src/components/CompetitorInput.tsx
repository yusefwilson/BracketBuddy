import { useEffect, useRef, useState } from 'react';
import { HiTrash as TrashIcon, HiPlus as PlusIcon, HiChevronDown as ChevronDownIcon } from 'react-icons/hi2';
import { FaShuffle } from "react-icons/fa6";

import { CompetitorDTO } from '../../../src-shared/CompetitorDTO';
import { Gender } from '../../../src-shared/types';
import { competitorFullName } from '../../../src-shared/utils';

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
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newGender, setNewGender] = useState<Gender>(defaultGender);
    const [newPaid, setNewPaid] = useState(false);

    // This is a dummy div that we use to auto-scroll to the bottom when competitors update
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const prevLength = usePrevious(competitors.length);

    const canAdd = newFirstName.trim() !== '' && newLastName.trim() !== '';

    const submitNewCompetitor = async () => {
        await addCompetitor({ firstName: newFirstName.trim(), lastName: newLastName.trim(), gender: newGender, paid: newPaid });
        setNewFirstName('');
        setNewLastName('');
        setNewPaid(false);
    };

    // Add a new competitor
    const handleAdd = async () => {
        if (!canAdd) return;
        if (bracketStarted) {
            onShowWarning(
                'Adding a competitor will reset the entire bracket and all match results will be lost.',
                submitNewCompetitor
            );
        } else {
            await submitNewCompetitor();
        }
    };

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

                {/* Input for new competitor */}
                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-700/50">
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="First name"
                            value={newFirstName}
                            onChange={(e) => setNewFirstName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAdd();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="w-full min-w-0 px-3 py-2 rounded-lg bg-slate-700 text-white text-sm border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Last name"
                            value={newLastName}
                            onChange={(e) => setNewLastName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAdd();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="w-full min-w-0 px-3 py-2 rounded-lg bg-slate-700 text-white text-sm border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {/* compact select with the chevron drawn just inside the box, instead of a wide box with the native arrow at the far edge */}
                        <div className="relative flex-shrink-0">
                            <select
                                value={newGender}
                                onChange={(e) => setNewGender(e.target.value as Gender)}
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-slate-700 text-white text-sm border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                title="Gender"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                                <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </div>
                        </div>
                        <label
                            className="flex items-center gap-1.5 text-gray-300 text-sm cursor-pointer select-none flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <input
                                type="checkbox"
                                checked={newPaid}
                                onChange={(e) => setNewPaid(e.target.checked)}
                                className="h-4 w-4 accent-green-500 cursor-pointer"
                            />
                            Paid
                        </label>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAdd();
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            disabled={!canAdd}
                            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0 ml-auto"
                            type="button"
                            title="Add competitor"
                        >
                            <PlusIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
