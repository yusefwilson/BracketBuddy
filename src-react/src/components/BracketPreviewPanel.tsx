import { TrashIcon } from '@heroicons/react/24/outline';
import { BracketDTO } from '../../../src-shared/BracketDTO';
import { Gender, Hand, ExperienceLevel, WeightLimit } from '../../../src-shared/types';

interface BracketPreviewPanelProps {
    existingBrackets: BracketDTO[];
    bracketsToAdd: Array<{
        gender: Gender;
        experienceLevel: ExperienceLevel;
        hand: Hand;
        weightLimit: WeightLimit;
    }>;
    onDeleteExisting: (bracketId: string) => void;
    onRemoveFromAdd: (bracket: {
        gender: Gender;
        experienceLevel: ExperienceLevel;
        hand: Hand;
        weightLimit: WeightLimit;
    }) => void;
    bracketExists: (bracket: {
        gender: Gender;
        experienceLevel: ExperienceLevel;
        hand: Hand;
        weightLimit: WeightLimit;
    }) => BracketDTO | undefined;
}

export default function BracketPreviewPanel({
    existingBrackets,
    bracketsToAdd,
    onDeleteExisting,
    onRemoveFromAdd,
    bracketExists
}: BracketPreviewPanelProps) {
    return (
        <div className="w-1/3 bg-slate-600 p-4 rounded-md overflow-y-auto flex flex-col gap-4">
            {/* Existing Brackets Section */}
            <div>
                <h2 className="text-white font-semibold mb-2">
                    Existing Brackets ({existingBrackets.length}):
                </h2>
                <div className="flex flex-col gap-1">
                    {existingBrackets.map((bracket) => (
                        <div
                            key={bracket.id}
                            className="bg-slate-700 px-3 py-2 rounded flex items-center justify-between text-sm"
                        >
                            <span className="text-white">
                                {`${bracket.gender} | ${bracket.experienceLevel} | ${bracket.hand} | ${bracket.weightLimit}`}
                            </span>
                            <button
                                onClick={() => onDeleteExisting(bracket.id)}
                                className="text-red-400 hover:text-red-300 transition ml-2 flex-shrink-0"
                                title="Delete bracket"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {existingBrackets.length === 0 && (
                        <p className="text-gray-400 text-sm italic">No existing brackets</p>
                    )}
                </div>
            </div>

            {/* New Brackets Section */}
            <div>
                <h2 className="text-white font-semibold mb-2">
                    New Brackets ({bracketsToAdd.length}):
                </h2>
                <div className="flex flex-col gap-1">
                    {bracketsToAdd.map((bracket, idx) => {
                        const alreadyExists = bracketExists(bracket);
                        const bgColor = alreadyExists ? 'bg-red-900' : 'bg-green-900';
                        const textColor = alreadyExists ? 'text-red-200' : 'text-green-200';

                        return (
                            <div
                                key={idx}
                                className={`${bgColor} bg-opacity-50 px-3 py-2 rounded flex items-center justify-between text-sm`}
                            >
                                <span className={textColor}>
                                    {`${bracket.gender} | ${bracket.experienceLevel} | ${bracket.hand} | ${bracket.weightLimit}`}
                                </span>
                                <button
                                    onClick={() => onRemoveFromAdd(bracket)}
                                    className="text-red-400 hover:text-red-300 transition ml-2 flex-shrink-0"
                                    title="Remove this bracket"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        );
                    })}
                    {bracketsToAdd.length === 0 && (
                        <p className="text-gray-400 text-sm italic">No new brackets to add</p>
                    )}
                </div>
            </div>
        </div>
    );
}
