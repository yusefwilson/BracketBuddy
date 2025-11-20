import { useState, useContext, useEffect, useMemo } from 'react';

import { Gender, Hand, ExperienceLevel, WeightLimit } from '../../../src-shared/types';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';
import BracketSelectionPanel from './BracketSelectionPanel';
import BracketPreviewPanel from './BracketPreviewPanel';

interface BulkBracketInputModalProps {
    setBulkBracketModalOpen: (open: boolean) => void;
}

const defaultWeights: WeightLimit[] = [154, 165, 176, 187, 198, 209, 220, 231, 242, 'Superheavyweight'];
const standardWeights: WeightLimit[] = [154, 165, 176, 187, 198, 209, 220, 231, 242, 'Superheavyweight'];

// Helper to create a unique key for a bracket
const getBracketKey = (bracket: { gender: Gender; experienceLevel: ExperienceLevel; hand: Hand; weightLimit: WeightLimit }) => {
    return `${bracket.gender}-${bracket.experienceLevel}-${bracket.hand}-${bracket.weightLimit}`;
};

export default function BulkBracketInputModal({ setBulkBracketModalOpen }: BulkBracketInputModalProps) {
    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};
    const { showError, ErrorToastContainer } = useErrorToast();

    const [weightOptions, setWeightOptions] = useState<WeightLimit[]>(defaultWeights);

    // Load custom weights from saved data on mount
    useEffect(() => {
        const loadCustomWeights = async () => {
            const [customWeights, error] = await safeApiCall(window.electron.getSavedValue('customWeights'));
            if (!error && customWeights) {
                const customWeightsArray: number[] = customWeights;
                // Combine standard weights with custom weights, ensuring no duplicates
                const allWeights = [...standardWeights];
                customWeightsArray.forEach(weight => {
                    if (!allWeights.includes(weight)) {
                        allWeights.push(weight);
                    }
                });
                // Sort: Superheavyweight first, then ascending numbers
                const sorted = allWeights.filter(w => w !== 'Superheavyweight').sort((a, b) => (a as number) - (b as number));
                setWeightOptions(['Superheavyweight', ...sorted]);
            }
        };
        loadCustomWeights();
    }, []);

    const [selectedGenders, setSelectedGenders] = useState<Gender[]>(['Male']);
    const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<ExperienceLevel[]>(['Novice']);
    const [selectedHands, setSelectedHands] = useState<Hand[]>(['Right']);
    const [selectedWeights, setSelectedWeights] = useState<WeightLimit[]>([154]);

    const [bracketsToAdd, setBracketsToAdd] = useState<Set<string>>(new Set());
    const [manuallyExcluded, setManuallyExcluded] = useState<Set<string>>(new Set());

    const addCustomWeight = async (value: number) => {
        if (!weightOptions.includes(value)) {
            const newWeights = [...weightOptions.filter(w => w !== 'Superheavyweight'), value].sort();
            setWeightOptions(['Superheavyweight', ...newWeights]);

            // Save custom weights (only non-standard ones)
            const customWeights = newWeights.filter(w => !standardWeights.includes(w)) as number[];
            await safeApiCall(window.electron.saveKeyValue({ key: 'customWeights', value: customWeights }));
        }
    };

    const removeCustomWeight = async (value: number | 'Superheavyweight') => {
        // Prevent deletion of standard weight classes
        if (standardWeights.includes(value)) {
            return;
        }
        const updatedWeights = weightOptions.filter(w => w !== value);
        setWeightOptions(updatedWeights);
        setSelectedWeights(selectedWeights.filter(w => w !== value));

        // Save custom weights (only non-standard ones)
        const customWeights = updatedWeights.filter(w => w !== 'Superheavyweight' && !standardWeights.includes(w)) as number[];
        await safeApiCall(window.electron.saveKeyValue({ key: 'customWeights', value: customWeights }));
    };

    const toggleSelect = <T,>(item: T, list: T[], setList: (list: T[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const removeBracket = (bracket: { gender: Gender; experienceLevel: ExperienceLevel; hand: Hand; weightLimit: WeightLimit }) => {
        const key = getBracketKey(bracket);
        setBracketsToAdd(prev => {
            const updated = new Set(prev);
            updated.delete(key);
            return updated;
        });
        setManuallyExcluded(prev => new Set([...prev, key]));
    };

    const allPossibleBrackets = useMemo(() => {
        return selectedGenders.flatMap(gender =>
            selectedExperienceLevels.flatMap(exp =>
                selectedHands.flatMap(hand =>
                    selectedWeights.map(weight => ({ gender, experienceLevel: exp, hand, weightLimit: weight }))
                )
            )
        );
    }, [selectedGenders, selectedExperienceLevels, selectedHands, selectedWeights]);


    // Update bracketsToAdd to include all possible brackets based on selections
    useEffect(() => {
        const possibleBrackets = selectedGenders.flatMap(gender =>
            selectedExperienceLevels.flatMap(exp =>
                selectedHands.flatMap(hand =>
                    selectedWeights.map(weight => ({ gender, experienceLevel: exp, hand, weightLimit: weight }))
                )
            )
        );
        const possibleKeys = new Set(possibleBrackets.map(getBracketKey));
        setBracketsToAdd(prev => {
            // Start with previous set
            const updated = new Set(prev);
            // Add any new possible brackets (but not if manually excluded)
            possibleKeys.forEach(key => {
                if (!manuallyExcluded.has(key)) {
                    updated.add(key);
                }
            });
            // Remove any that are no longer possible
            [...updated].forEach(key => {
                if (!possibleKeys.has(key)) {
                    updated.delete(key);
                }
            });
            return updated;
        });
        // Also clean up manuallyExcluded - remove any that are no longer possible. This is really important, since manually excluded brackets should only be ones that could even exist in the first place - otherwise you wouldn't ever be able to add manually excluded ones back!
        setManuallyExcluded(prev => {
            const updated = new Set([...prev].filter(key => possibleKeys.has(key)));
            return updated;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // Note: manuallyExcluded is intentionally not in deps - we only want this to run when selections change
    }, [selectedGenders, selectedExperienceLevels, selectedHands, selectedWeights]);

    // Filter to only include brackets that are in the bracketsToAdd set
    const resultingBrackets = allPossibleBrackets.filter(b => bracketsToAdd.has(getBracketKey(b)));

    const onSubmit = async () => {
        if (!tournament) {
            showError('Cannot create bracket without a tournament.');
            return;
        }

        const [data, error] = await safeApiCall(
            window.electron.addBracketsToTournament({
                tournamentId: tournament.id,
                brackets: resultingBrackets.map(b => ({ ...b, competitorNames: [] }))
            })
        );

        if (error) {
            showError(error);
            return;
        }

        if (data) {
            setTournament(data);
            // Clear selections after successful add
            setSelectedGenders([]);
            setSelectedExperienceLevels([]);
            setSelectedHands([]);
            setSelectedWeights([]);
            setManuallyExcluded(new Set());
            // Don't close the modal anymore
        }
    };

    const handleDeleteBracket = async (bracketId: string) => {
        if (!tournament) return;

        const [data, error] = await safeApiCall(
            window.electron.removeBracketFromTournament({
                tournamentId: tournament.id,
                bracketId
            })
        );

        if (error) {
            showError(error);
            return;
        }

        if (data) {
            setTournament(data);
        }
    };

    // Helper to check if a bracket already exists in the tournament
    const bracketExists = (bracket: { gender: Gender; experienceLevel: ExperienceLevel; hand: Hand; weightLimit: WeightLimit }) => {
        return tournament?.brackets.find(b =>
            b.gender === bracket.gender &&
            b.experienceLevel === bracket.experienceLevel &&
            b.hand === bracket.hand &&
            b.weightLimit === bracket.weightLimit
        );
    };

    // Get all brackets to display: existing + all in bracketsToAdd (even if they already exist)
    const existingBrackets = tournament?.brackets || [];

    // Calculate how many new brackets there are (brackets that don't already exist)
    const newBracketsCount = resultingBrackets.filter(b => !bracketExists(b)).length;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setBulkBracketModalOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <ErrorToastContainer />
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-slate-700 w-full max-w-6xl p-6 rounded-xl shadow-lg flex gap-6 h-3/4">
                    {/* Left Panel: Selection Controls */}
                    <BracketSelectionPanel
                        selectedGenders={selectedGenders}
                        setSelectedGenders={setSelectedGenders}
                        selectedExperienceLevels={selectedExperienceLevels}
                        setSelectedExperienceLevels={setSelectedExperienceLevels}
                        selectedHands={selectedHands}
                        setSelectedHands={setSelectedHands}
                        weightOptions={weightOptions}
                        standardWeights={standardWeights}
                        selectedWeights={selectedWeights}
                        setSelectedWeights={setSelectedWeights}
                        addCustomWeight={addCustomWeight}
                        removeCustomWeight={removeCustomWeight}
                        toggleSelect={toggleSelect}
                        onSubmit={onSubmit}
                        onCancel={() => setBulkBracketModalOpen(false)}
                        isAddDisabled={newBracketsCount === 0}
                    />

                    {/* Right Panel: Preview */}
                    <BracketPreviewPanel
                        existingBrackets={existingBrackets}
                        bracketsToAdd={resultingBrackets}
                        onDeleteExisting={handleDeleteBracket}
                        onRemoveFromAdd={removeBracket}
                        bracketExists={bracketExists}
                    />
                </div>
            </div>
        </>
    );
}
