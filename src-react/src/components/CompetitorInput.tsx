import { useEffect, useRef, useState } from 'react';
import { TrashIcon, PlusIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid';

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
}

export default function CompetitorInput({ competitors, addCompetitor, removeCompetitor, randomizeCompetitors, }: CompetitorInputProps) {
    const [newName, setNewName] = useState('');

    // This is a dummy div that we use to auto-scroll to the bottom when competitors update
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const prevLength = usePrevious(competitors.length);

    // Add a new competitor
    const handleAdd = async () => {
        // add competitor
        await addCompetitor(newName);
        setNewName('');
    };

    const handleRandomize = async () => {
        await randomizeCompetitors();
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
            <div className="flex flex-col overflow-y-auto h-full rounded-lg p-4 bg-slate-700 shadow-inner" ref={scrollContainerRef}>
                <div className="flex items-center justify-between mb-4 gap-3">
                    <h2 className="text-sm font-semibold text-white">
                        Competitors ({competitors.length})
                    </h2>
                    <button
                        onClick={handleRandomize}
                        disabled={competitors.length < 2}
                        className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition shadow-md hover:shadow-lg"
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
                            className="flex-grow px-3 py-2 rounded-lg bg-slate-600 text-white text-sm border border-slate-500 opacity-90 cursor-not-allowed"
                        />
                        <button
                            onClick={() => removeCompetitor(name)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition shadow-md hover:shadow-lg flex-shrink-0"
                            type="button"
                            title="Remove competitor"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {/* Input for new competitor */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-600">
                    <input
                        type="text"
                        placeholder="New competitor name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAdd();
                        }}
                        className="flex-grow px-3 py-2 rounded-lg bg-slate-600 text-white text-sm border border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-400"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={newName.trim() === ''}
                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition shadow-md hover:shadow-lg flex-shrink-0"
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
