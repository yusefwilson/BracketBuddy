import { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { HiChevronDown as ChevronDownIcon, HiMagnifyingGlass as SearchIcon } from 'react-icons/hi2';

import type { CompetitorDTO } from '../../../src-shared/CompetitorDTO';
import { Gender } from '../../../src-shared/types';
import { competitorFullName } from '../../../src-shared/utils';

import { CURRENT_STATE } from './App';
import BracketResetWarningModal from './BracketResetWarningModal';

interface AddCompetitorToBracketModalProps {
    // the competitors already in this bracket, so they are not offered again
    bracketCompetitors: CompetitorDTO[];
    defaultGender: Gender;
    // adding to a bracket that has results resets it, so ask for confirmation first
    bracketStarted: boolean;
    addCompetitor: (competitor: CompetitorDTO) => Promise<void>;
    onClose: () => void;
}

// adds competitors to the one bracket that is open. stays open after each add so several can be entered in a row.
export default function AddCompetitorToBracketModal({ bracketCompetitors, defaultGender, bracketStarted, addCompetitor, onClose }: AddCompetitorToBracketModalProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [weightText, setWeightText] = useState(''); // empty means the official weight is unknown
    const [gender, setGender] = useState<Gender>(defaultGender);
    const [paid, setPaid] = useState(false);
    const [search, setSearch] = useState('');
    // what to do once the user confirms the reset warning (adding to a started bracket)
    const [pendingAdd, setPendingAdd] = useState<(() => Promise<void>) | null>(null);
    const firstNameRef = useRef<HTMLInputElement>(null);

    const state = useContext(CURRENT_STATE);
    const tournamentCompetitors = state?.tournament?.competitors;

    // competitors in the tournament who are not in this bracket yet, filtered by the search (every word must match)
    const searchResults = useMemo(() => {
        const words = search.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        if (words.length === 0) return [];

        const inBracket = new Set(bracketCompetitors.map(c => c.id));
        return (tournamentCompetitors ?? [])
            .filter(c => !inBracket.has(c.id))
            .filter(c => {
                const name = competitorFullName(c).toLowerCase();
                return words.every(word => name.includes(word));
            })
            .sort((a, b) => competitorFullName(a).localeCompare(competitorFullName(b), undefined, { sensitivity: 'base' }));
    }, [search, tournamentCompetitors, bracketCompetitors]);

    // official weight is optional: blank is saved as unknown, anything else must be a non-negative number
    const trimmedWeight = weightText.trim();
    const officialWeight = trimmedWeight === '' ? null : Number(trimmedWeight);
    const weightIsValid = officialWeight === null || (Number.isFinite(officialWeight) && officialWeight >= 0);

    const canAdd = firstName.trim() !== '' && lastName.trim() !== '' && weightIsValid;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // the reset warning handles its own Escape
            if (event.key === 'Escape' && !pendingAdd) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, pendingAdd]);

    const submit = async () => {
        await addCompetitor({ firstName: firstName.trim(), lastName: lastName.trim(), gender, paid, officialWeight });
        setFirstName('');
        setLastName('');
        setWeightText('');
        setPaid(false);
        firstNameRef.current?.focus();
    };

    // adding to a bracket that has results resets it, so ask first
    const runOrConfirm = async (action: () => Promise<void>) => {
        if (bracketStarted) {
            setPendingAdd(() => action);
        } else {
            await action();
        }
    };

    const handleAdd = async () => {
        if (!canAdd) return;
        await runOrConfirm(submit);
    };

    const handleAddExisting = async (competitor: CompetitorDTO) => {
        await runOrConfirm(async () => {
            await addCompetitor(competitor); // it has an id, so the existing competitor is attached
            onClose(); // picking an existing competitor is a one-off, so close the modal
        });
    };

    const inputClass = 'w-full min-w-0 bg-slate-700 text-white px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition placeholder-gray-400';
    const normalInputClass = `${inputClass} border-slate-600/50 focus:ring-blue-500 focus:border-blue-500`;
    const onEnter = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAdd();
    };

    // rendered into document.body: the side panel this opens from has a backdrop blur, which would trap a fixed overlay inside it
    // React events bubble through portals along the component tree, so without stopping them here a click in this modal
    // would reach the bracket card it was opened from (and open the bracket, or start a drag)
    return createPortal(
        <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
            <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-2 cursor-default'>
                <div className='bg-gradient-to-br from-slate-800 to-slate-900 w-full max-w-md p-6 rounded-xl shadow-2xl border border-slate-700/50 flex flex-col gap-5'>

                    <h1 className='text-2xl font-bold text-white text-center'>
                        <span className='bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'>Add Competitor</span>
                    </h1>

                    <div className='flex flex-col gap-2'>
                        <label className='text-gray-300 text-sm font-medium'>Existing Competitor</label>
                        <div className='relative'>
                            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' aria-hidden='true' />
                            <input
                                type='text'
                                placeholder='Search competitors already in the tournament...'
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`${normalInputClass} pl-10`}
                            />
                        </div>
                        {search.trim() !== '' && (
                            <ul className='max-h-40 overflow-y-auto bg-slate-900/50 rounded-lg border border-slate-600/30'>
                                {searchResults.length === 0 ? (
                                    <li className='px-4 py-2 text-sm text-gray-400 italic'>No matching competitors outside this class</li>
                                ) : (
                                    searchResults.map(competitor => (
                                        <li key={competitor.id}>
                                            <button
                                                type='button'
                                                onClick={() => handleAddExisting(competitor)}
                                                className='w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition truncate'
                                            >
                                                {competitorFullName(competitor)}
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>

                    <div className='flex items-center gap-3 text-gray-500 text-xs uppercase tracking-wide'>
                        <div className='flex-1 h-px bg-slate-700' />
                        or add a new competitor
                        <div className='flex-1 h-px bg-slate-700' />
                    </div>

                    <div className='flex flex-col gap-3'>
                        <label className='text-gray-300 text-sm font-medium'>Competitor Info</label>
                        <input
                            ref={firstNameRef}
                            type='text'
                            placeholder='First name'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            onKeyDown={onEnter}
                            className={normalInputClass}
                            autoFocus
                        />
                        <input
                            type='text'
                            placeholder='Last name'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            onKeyDown={onEnter}
                            className={normalInputClass}
                        />
                        <input
                            type='text'
                            inputMode='decimal'
                            placeholder='Official weight (lbs, optional)'
                            value={weightText}
                            onChange={(e) => setWeightText(e.target.value)}
                            onKeyDown={onEnter}
                            className={weightIsValid ? normalInputClass : `${inputClass} border-red-500 focus:ring-red-500`}
                        />
                        <div className='flex items-center gap-4'>
                            <div className='relative'>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as Gender)}
                                    className='appearance-none bg-slate-700 text-white pl-3 pr-9 py-3 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
                                    title='Gender'
                                >
                                    <option value='Male'>Male</option>
                                    <option value='Female'>Female</option>
                                </select>
                                <div className='pointer-events-none absolute inset-y-0 right-2.5 flex items-center'>
                                    <ChevronDownIcon className='h-4 w-4 text-gray-400' aria-hidden='true' />
                                </div>
                            </div>
                            <label className='flex items-center gap-2 text-gray-300 text-sm cursor-pointer select-none'>
                                <input
                                    type='checkbox'
                                    checked={paid}
                                    onChange={(e) => setPaid(e.target.checked)}
                                    className='h-4 w-4 accent-green-500 cursor-pointer'
                                />
                                Paid
                            </label>
                        </div>
                    </div>

                    <div className='flex justify-center gap-3 mt-2'>
                        <button
                            className='bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                            onClick={handleAdd}
                            disabled={!canAdd}
                        >
                            Add Competitor
                        </button>
                        <button
                            className='bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-lg border border-slate-600/50 transition-all duration-200 hover:border-slate-500'
                            onClick={onClose}
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>

            {/* later in the DOM than the modal above, so it stacks on top of it */}
            <BracketResetWarningModal
                isOpen={pendingAdd !== null}
                onClose={() => setPendingAdd(null)}
                onConfirm={() => pendingAdd?.()}
                message='Adding a competitor will reset the entire bracket and all match results will be lost.'
            />
        </div>,
        document.body
    );
}
