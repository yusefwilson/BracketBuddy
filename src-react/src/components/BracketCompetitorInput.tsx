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
            className="flex flex-col rounded-xl p-5 bg-slate-600 shadow-lg transition hover:bg-slate-500 hover:cursor-pointer hover:shadow-xl min-w-[320px] h-full"
            onClick={async () => {
                await onBracketClick(bracket.id);
            }}
        >
            <div className="flex justify-between items-start mb-4 flex-shrink-0 w-full gap-3">
                <h2 className="text-lg font-semibold text-white leading-tight">
                    {bracket.gender} | {bracket.experienceLevel} | {bracket.hand}{' '}
                    <span className="text-white">
                        {bracket.weightLimit !== 'Superheavyweight'
                            ? `${bracket.weightLimit} lbs`
                            : 'Superheavyweight'}
                    </span>
                </h2>
                <button
                    onClick={async (e) => {
                        e.stopPropagation();
                        await onRemoveBracket(bracket.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition shadow-md hover:shadow-lg flex items-center flex-shrink-0"
                    type="button"
                    title="Delete bracket"
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
