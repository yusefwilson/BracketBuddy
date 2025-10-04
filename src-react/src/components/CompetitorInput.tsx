import { useEffect, useRef, useState, useContext } from 'react';
import { TrashIcon, PlusIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid';
import { CURRENT_STATE } from './App';

function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

export default function CompetitorInput({ competitors, addCompetitor, removeCompetitor, }: { competitors: string[]; addCompetitor: (name: string) => Promise<void>; removeCompetitor: (name: string) => Promise<void>; }) {

    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { }, bracketIndex } = state || {};

    if (!tournament || bracketIndex === null || bracketIndex === undefined) {
        return (
            <div className='h-full flex items-center justify-center text-white'>
                ERROR NO TOURNAMENT
            </div>
        );
    }

    const [newName, setNewName] = useState('');

    // This is a dummy div that we use to auto-scroll to the bottom when competitors update
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const prevLength = usePrevious(competitors.length);

    // Add a new competitor
    const handleAdd = () => {
        const competitorNameToAdd = newName.trim()
        // prevent empty names
        if (competitorNameToAdd === '') return;
        // prevent duplicate competitors
        if (competitors.includes(competitorNameToAdd)) return;

        // add competitor
        addCompetitor(competitorNameToAdd);
        setNewName('');
    };

    const handleShuffle = async () => {
        const bracket = tournament.brackets[bracketIndex];
        const newTournament = await window.electron.randomizeCompetitors(tournament.id, bracket.id);
        setTournament(newTournament);
    };

    // Auto-scroll to bottom when competitors update, but only scroll when a competitor was added
    useEffect(() => {
        if (prevLength !== undefined && competitors.length > prevLength) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [competitors.length, prevLength]);
    
    return (
        <div className='flex flex-col h-full justify-between'>
            <div className='overflow-y-scroll border border-gray-600 rounded-md p-4 bg-slate-700 h-64'>

                <div className='flex items-center space-x-3 mb-3'>
                    <h2 className='text-lg font-semibold text-white'>
                        Enter Competitor Names ({competitors.length})
                    </h2>
                    <button
                        onClick={handleShuffle}
                        disabled={competitors.length < 2}
                        className='
                mt-3
                bg-purple-500
                hover:bg-purple-600
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-white
                px-3
                py-1.5
                rounded-md
                transition
                duration-200
                ease-in-out
                '
                        type='button'
                    >
                        <ArrowPathRoundedSquareIcon className='h-5 w-5' />
                    </button>
                </div>


                {competitors.length === 0 && (
                    <p className='text-gray-400 italic'>No competitors added yet.</p>
                )}

                {competitors.map((name, index) => (
                    <div key={index} className='flex items-center space-x-3 mb-3'>
                        <input
                            type='text'
                            value={name}
                            disabled
                            className='
                flex-grow
                p-2
                rounded-md
                border
                border-gray-500
                bg-slate-600
                text-white
                opacity-80
                cursor-not-allowed
              '
                        />
                        <button
                            onClick={() => removeCompetitor(name)}
                            className='
                bg-red-600
                hover:bg-red-700
                text-white
                px-3
                py-1.5
                rounded-md
                transition
                duration-200
                ease-in-out
              '
                            type='button'
                        >
                            <TrashIcon className='h-5 w-5' />
                        </button>
                    </div>
                ))}

                {/* Ghost input always at the bottom */}
                <div className='flex items-center space-x-3 mt-3'>
                    <input
                        type='text'
                        placeholder='New competitor name'
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAdd();
                        }}
                        className='
              flex-grow
              p-2
              rounded-md
              border
              border-gray-500
              bg-slate-600
              text-white
              focus:outline-none
              focus:ring-2
              focus:ring-blue-400
              transition
              duration-200
              ease-in-out
            '
                    />
                    <button
                        onClick={handleAdd}
                        disabled={newName.trim() === ''}
                        className='
              bg-blue-500
              hover:bg-blue-600
              disabled:opacity-50
              disabled:cursor-not-allowed
              text-white
              px-3
              py-1.5
              rounded-md
              transition
              duration-200
              ease-in-out
            '
                        type='button'
                    >
                        <PlusIcon className='h-5 w-5' />
                    </button>
                </div>

                {/* This dummy div is the scroll target */}
                <div ref={bottomRef} />

            </div>
        </div>
    );
}
