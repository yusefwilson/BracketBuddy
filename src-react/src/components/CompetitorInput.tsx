import { useEffect, useRef, useState } from 'react';
import { HiTrash as TrashIcon, HiPlus as PlusIcon, HiArrowPath as ArrowPathRoundedSquareIcon } from 'react-icons/hi2';

function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

interface CompetitorInputProps {
    competitors: string[];
    addCompetitor: (name: string) => Promise<void>;
    removeCompetitor: (name: string) => Promise<void>;
    randomizeCompetitors: () => Promise<void>;
    bracketStarted: boolean;
    onShowWarning: (message: string, onConfirm: () => void) => void;
}

export default function CompetitorInput({ competitors, addCompetitor, removeCompetitor, randomizeCompetitors, bracketStarted, onShowWarning }: CompetitorInputProps) {
    const [newName, setNewName] = useState('');

    // This is a dummy div that we use to auto-scroll to the bottom when competitors update
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const prevLength = usePrevious(competitors.length);

    // Add a new competitor
    const handleAdd = async () => {
        if (bracketStarted) {
            onShowWarning(
                'Adding a competitor will reset the entire bracket and all match results will be lost.',
                async () => {
                    await addCompetitor(newName);
                    setNewName('');
                }
            );
        } else {
            await addCompetitor(newName);
            setNewName('');
        }
    };

    const handleRemove = async (name: string) => {
        if (bracketStarted) {
            onShowWarning(
                'Removing a competitor will reset the entire bracket and all match results will be lost.',
                async () => {
                    await removeCompetitor(name);
                }
            );
        } else {
            await removeCompetitor(name);
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
                        <ArrowPathRoundedSquareIcon className="h-4 w-4" />
                    </button>
                </div>

                {competitors.length === 0 && (
                    <p className="text-gray-400 text-sm italic">No competitors yet</p>
                )}

                {competitors.map((name, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            value={name}
                            disabled
                            className="flex-grow px-3 py-2 rounded-lg bg-slate-700 text-white text-sm border border-slate-600/50 opacity-90 cursor-not-allowed"
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(name);
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
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
                    <input
                        type="text"
                        placeholder="New competitor name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAdd();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="flex-grow px-3 py-2 rounded-lg bg-slate-700 text-white text-sm border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400"
                    />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAdd();
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        disabled={newName.trim() === ''}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
                        type="button"
                        title="Add competitor"
                    >
                        <PlusIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
