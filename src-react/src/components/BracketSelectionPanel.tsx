import { UserIcon, AcademicCapIcon, HandRaisedIcon, PlusIcon, ScaleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Gender, Hand, ExperienceLevel, WeightLimit } from '../../../src-shared/types';

interface BracketSelectionPanelProps {
    selectedGenders: Gender[];
    setSelectedGenders: (genders: Gender[]) => void;
    selectedExperienceLevels: ExperienceLevel[];
    setSelectedExperienceLevels: (levels: ExperienceLevel[]) => void;
    selectedHands: Hand[];
    setSelectedHands: (hands: Hand[]) => void;
    weightOptions: WeightLimit[];
    standardWeights: WeightLimit[];
    selectedWeights: WeightLimit[];
    setSelectedWeights: (weights: WeightLimit[]) => void;
    addCustomWeight: (value: number) => void;
    removeCustomWeight: (value: number | 'Superheavyweight') => void;
    toggleSelect: <T>(item: T, list: T[], setList: (list: T[]) => void) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isAddDisabled: boolean;
}

export default function BracketSelectionPanel({
    selectedGenders,
    setSelectedGenders,
    selectedExperienceLevels,
    setSelectedExperienceLevels,
    selectedHands,
    setSelectedHands,
    weightOptions,
    standardWeights,
    selectedWeights,
    setSelectedWeights,
    addCustomWeight,
    removeCustomWeight,
    toggleSelect,
    onSubmit,
    onCancel,
    isAddDisabled
}: BracketSelectionPanelProps) {
    // Helper to sort weight buttons: standard weights first (in order), then custom weights (in ascending order)
    const sortedWeights = (() => {
        const standard = standardWeights.filter(w => weightOptions.includes(w));
        const custom = weightOptions.filter(w => !standardWeights.includes(w)).sort((a, b) => (a as number) - (b as number));
        return [...standard, ...custom];
    })();

    return (
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
            <h1 className="text-xl font-semibold text-white text-center pb-4 border-b border-slate-600">Bulk Bracket Creator</h1>

            {/* Gender */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-600">
                <UserIcon className="h-6 w-6 text-blue-400 flex-shrink-0" />
                <div className="flex gap-2 flex-wrap">
                    {['Male', 'Female', 'Mixed'].map(g => (
                        <button
                            key={g}
                            className={`px-3 py-1 rounded-md font-semibold ${selectedGenders.includes(g as Gender)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-500 text-white'
                                }`}
                            onClick={() => toggleSelect(g as Gender, selectedGenders, setSelectedGenders)}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            {/* Experience Level */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-600">
                <AcademicCapIcon className="h-6 w-6 text-green-400 flex-shrink-0" />
                <div className="flex gap-2 flex-wrap">
                    {['Youth', 'Novice', 'Amateur', 'Semipro', 'Pro', 'Master', 'Grandmaster', 'Senior Grandmaster'].map(e => (
                        <button
                            key={e}
                            className={`px-3 py-1 rounded-md font-semibold ${selectedExperienceLevels.includes(e as ExperienceLevel)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-500 text-white'
                                }`}
                            onClick={() => toggleSelect(e as ExperienceLevel, selectedExperienceLevels, setSelectedExperienceLevels)}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hand */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-600">
                <HandRaisedIcon className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                <div className="flex gap-2 flex-wrap">
                    {['Right', 'Left'].map(h => (
                        <button
                            key={h}
                            className={`px-3 py-1 rounded-md font-semibold ${selectedHands.includes(h as Hand)
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-500 text-white'
                                }`}
                            onClick={() => toggleSelect(h as Hand, selectedHands, setSelectedHands)}
                        >
                            {h}
                        </button>
                    ))}
                </div>
            </div>

            {/* Weight Classes */}
            <div className="flex flex-col gap-2 pb-6 border-b border-slate-600">
                <div className="flex items-center gap-2">
                    <ScaleIcon className="h-6 w-6 text-purple-500 flex-shrink-0" />
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="New weight class"
                        className="w-48 px-3 py-2 rounded-md bg-slate-600 text-white"
                        onInput={(e) => {
                            const val = e.currentTarget.value.replace(/\D/g, '').slice(0, 3);
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
                    {sortedWeights.map(w => {
                        const isCustomWeight = !standardWeights.includes(w);
                        return (
                            <button
                                key={w.toString()}
                                className={`px-3 py-1 rounded-md font-semibold flex flex-row items-center ${selectedWeights.includes(w)
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-500 text-white'
                                    }`}
                                onClick={() => toggleSelect(w, selectedWeights, setSelectedWeights)}
                            >
                                <div className="">{w}</div>
                                {isCustomWeight ? (
                                    <span
                                        className="ml-2 px-1 rounded-full bg-red-500 hover:bg-red-600 hover:scale-110 text-white font-bold transition-all duration-150 cursor-pointer text-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeCustomWeight(w);
                                        }}
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-auto">
                <button
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-md transition"
                    onClick={onSubmit}
                    disabled={isAddDisabled}
                >
                    Add Brackets
                </button>
                <button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-md transition"
                    onClick={onCancel}
                >
                    Done
                </button>

            </div>
        </div>
    );
}
