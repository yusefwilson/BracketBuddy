import { TrashIcon } from '@heroicons/react/24/outline';

import { BracketDTO } from '../../../src-shared/BracketDTO';
import CompetitorInput from './CompetitorInput';

interface BracketCompetitorInputProps {
    bracket: BracketDTO;
    onAddCompetitor: (bracketId: string, name: string) => Promise<void>;
    onRemoveCompetitor: (bracketId: string, name: string) => Promise<void>;
    onRandomize: (bracketId: string) => Promise<void>;
    onRemoveBracket: (bracketId: string) => Promise<void>;
    onBracketClick: (bracketId: string) => Promise<void>;
}

export default function BracketCompetitorInput({
    bracket,
    onAddCompetitor,
    onRemoveCompetitor,
    onRandomize,
    onRemoveBracket,
    onBracketClick,
}: BracketCompetitorInputProps) {
    return (
        <div
            key={bracket.id}
            className="flex flex-col rounded-lg p-4 bg-slate-500 transition [&:not(:has(:hover))]:hover:bg-slate-600 [&:not(:has(:hover))]:hover:cursor-pointer min-w-[300px] h-full"
            onClick={async (e) => {
                // Only trigger if the click happened directly on this div, not a child
                if (e.target !== e.currentTarget) return;
                await onBracketClick(bracket.id);
            }}
        >
            <div className="flex justify-between items-center mb-3 flex-shrink-0 w-full">
                <h2 className="text-md font-semibold text-white">
                    {bracket.gender} | {bracket.experienceLevel} | {bracket.hand}{' '}
                    {bracket.weightLimit !== 'Superheavyweight'
                        ? `(${bracket.weightLimit} lbs)`
                        : '(Superheavyweight)'}
                </h2>
                <button
                    onClick={async (e) => {
                        e.stopPropagation();
                        await onRemoveBracket(bracket.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition flex items-center flex-shrink-0"
                    type="button"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 min-h-0">
                <CompetitorInput
                    competitors={bracket.competitorNames}
                    addCompetitor={(name) => onAddCompetitor(bracket.id, name)}
                    removeCompetitor={(name) => onRemoveCompetitor(bracket.id, name)}
                    randomizeCompetitors={() => onRandomize(bracket.id)}
                />
            </div>
        </div>
    );
}
