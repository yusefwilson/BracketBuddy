import { useState, useContext, useEffect } from 'react';
import { UserIcon, AcademicCapIcon, HandRaisedIcon, PlusIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { Gender, Hand, ExperienceLevel, WeightLimit } from '../../../src-shared/types';
import { CURRENT_STATE } from './App';

interface BulkBracketInputModalProps {
    setBulkBracketModalOpen: (open: boolean) => void;
}

const defaultWeights: WeightLimit[] = [154, 165, 176, 187, 198, 220, 242, 'Superheavyweight'];

export default function BulkBracketInputModal({ setBulkBracketModalOpen }: BulkBracketInputModalProps) {
    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};

    const [selectedGenders, setSelectedGenders] = useState<Gender[]>(['Male']);
    const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<ExperienceLevel[]>(['Novice']);
    const [selectedHands, setSelectedHands] = useState<Hand[]>(['Right']);
    const [weightOptions, setWeightOptions] = useState<WeightLimit[]>(defaultWeights);
    const [selectedWeights, setSelectedWeights] = useState<WeightLimit[]>([154]);

    const addCustomWeight = (value: number) => {
        if (!weightOptions.includes(value)) {
            const newWeights = [...weightOptions.filter(w => w !== 'Superheavyweight'), value].sort();
            setWeightOptions(['Superheavyweight', ...newWeights]);
        }
    };

    const removeCustomWeight = (value: number | 'Superheavyweight') => {
        setWeightOptions(weightOptions.filter(w => w !== value));
        setSelectedWeights(selectedWeights.filter(w => w !== value));
    };

    const toggleSelect = <T,>(item: T, list: T[], setList: (list: T[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const resultingBrackets = selectedGenders.flatMap(gender =>
        selectedExperienceLevels.flatMap(exp =>
            selectedHands.flatMap(hand =>
                selectedWeights.map(weight => ({ gender, experienceLevel: exp, hand, weightLimit: weight }))
            )
        )
    );

    const onSubmit = async () => {
        if (!tournament) throw new Error('Cannot create bracket without a tournament.');

        const newTournament = await window.electron.addBracketToTournament({
            tournamentId: tournament.id,
            brackets: resultingBrackets.map(b => ({ ...b, competitorNames: [] }))
        });

        setTournament(newTournament);
        setBulkBracketModalOpen(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setBulkBracketModalOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Helper to sort weight buttons: Superheavyweight first, then ascending numbers
    const sortedWeights = [...weightOptions].sort((a, b) => (a === 'Superheavyweight' ? -1 : b === 'Superheavyweight' ? 1 : (a as number) - (b as number)));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-slate-700 w-full max-w-6xl p-6 rounded-xl shadow-lg flex gap-6 h-3/4">
                {/* Left Panel: Inputs */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                    <h1 className="text-xl font-semibold text-white text-center">Bulk Bracket Creator</h1>

                    {/* Gender */}
                    <div className="flex items-center gap-4">
                        <UserIcon className="h-6 w-6 text-blue-400 flex-shrink-0" />
                        <div className="flex gap-2 flex-wrap">
                            {['Male', 'Female', 'Mixed'].map(g => (
                                <button
                                    key={g}
                                    className={`px-3 py-1 rounded-md font-semibold ${selectedGenders.includes(g as Gender) ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}
                                    onClick={() => toggleSelect(g as Gender, selectedGenders, setSelectedGenders)}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Experience Level */}
                    <div className="flex items-center gap-4">
                        <AcademicCapIcon className="h-6 w-6 text-green-400 flex-shrink-0" />
                        <div className="flex gap-2 flex-wrap">
                            {['Youth', 'Novice', 'Amateur', 'Semipro', 'Pro', 'Master', 'Grandmaster', 'Senior Grandmaster'].map(e => (
                                <button
                                    key={e}
                                    className={`px-3 py-1 rounded-md font-semibold ${selectedExperienceLevels.includes(e as ExperienceLevel) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                                    onClick={() => toggleSelect(e as ExperienceLevel, selectedExperienceLevels, setSelectedExperienceLevels)}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hand */}
                    <div className="flex items-center gap-4">
                        <HandRaisedIcon className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                        <div className="flex gap-2 flex-wrap">
                            {['Right', 'Left'].map(h => (
                                <button
                                    key={h}
                                    className={`px-3 py-1 rounded-md font-semibold ${selectedHands.includes(h as Hand) ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'}`}
                                    onClick={() => toggleSelect(h as Hand, selectedHands, setSelectedHands)}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Weight Classes */}
                    <div className="flex flex-col gap-2">

                        <div className="flex items-center gap-2">
                            <ScaleIcon className="h-6 w-6 text-purple-500 flex-shrink-0" />
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                placeholder="New weight class"
                                className="w-48 px-3 py-2 rounded-md bg-slate-600 text-white"
                                onInput={(e) => {
                                    const val = e.currentTarget.value.replace(/\D/g, '').slice(0, 3); // only digits, max 3 chars
                                    e.currentTarget.value = val;
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = parseInt(e.currentTarget.value, 10);
                                        if (val > 0) addCustomWeight(val);
                                        e.currentTarget.value = '';
                                    }
                                }}
                                id="custom-weight-input"
                            />
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md"
                                onClick={() => {
                                    const input = document.getElementById('custom-weight-input') as HTMLInputElement;
                                    const val = parseInt(input.value, 10);
                                    if (val > 0) addCustomWeight(val);
                                    input.value = '';
                                }}
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {sortedWeights.map(w => (
                                <button
                                    key={w.toString()}
                                    className={`px-3 py-1 rounded-md font-semibold ${selectedWeights.includes(w) ? 'bg-purple-500 text-white' : 'bg-gray-500 text-white'}`}
                                    onClick={() => toggleSelect(w, selectedWeights, setSelectedWeights)}
                                >
                                    {w}
                                    {typeof w === 'number' && w > 0 ? (
                                        <span
                                            className="ml-1 cursor-pointer text-red-200"
                                            onClick={(e) => { e.stopPropagation(); removeCustomWeight(w); }}
                                        >
                                            ×
                                        </span>
                                    ) : null}
                                </button>
                            ))}
                        </div>

                    </div>


                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-auto">
                        <button
                            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-md transition"
                            onClick={() => setBulkBracketModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-5 py-2 rounded-md transition"
                            onClick={onSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </div>

                {/* Right Panel: Resulting Brackets */}
                <div className="w-1/3 bg-slate-600 p-2 rounded-md overflow-y-auto">
                    <h2 className="text-white font-semibold mb-2">Resulting Brackets ({resultingBrackets.length}):</h2>
                    <ul className="text-white text-sm list-disc list-inside">
                        {resultingBrackets.map((b, idx) => (
                            <li key={idx}>{`${b.gender} | ${b.experienceLevel} | ${b.hand} | ${b.weightLimit}`}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
