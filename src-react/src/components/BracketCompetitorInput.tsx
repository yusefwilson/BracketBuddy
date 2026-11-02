import { HiTrash as TrashIcon } from 'react-icons/hi2';

import { BracketDTO } from '../../../src-shared/BracketDTO';
import { isAnyBracketStarted, isBracketComplete } from '../../../src-shared/bracketHelpers';
import CompetitorInput from './CompetitorInput';
import BracketResetWarningModal from './BracketResetWarningModal';
import { useState } from 'react';

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
    const [warningModal, setWarningModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
        isOpen: false,
        message: '',
        onConfirm: () => { }
    });

    return (
        <>
            <BracketResetWarningModal
                isOpen={warningModal.isOpen}
                onClose={() => setWarningModal({ ...warningModal, isOpen: false })}
                onConfirm={warningModal.onConfirm}
                message={warningModal.message}
            />
            <div
                key={bracket.id}
                className="flex flex-col rounded-xl p-5 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 shadow-xl transition-all duration-200 hover:from-slate-600 hover:to-slate-700 hover:cursor-pointer hover:shadow-2xl hover:border-slate-500/50 min-w-[320px] h-full"
                onClick={async () => {
                    await onBracketClick(bracket.id);
                }}
            >
                <div className="flex justify-between items-start mb-4 flex-shrink-0 w-full gap-3">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-semibold text-white leading-tight">
                            {bracket.gender} | {bracket.experienceLevel} | {bracket.hand}{' '}
                            <span className="text-white">
                                {bracket.weightLimit !== 'Superheavyweight'
                                    ? `${bracket.weightLimit} lbs`
                                    : 'Superheavyweight'}
                            </span>
                        </h2>
                        {isBracketComplete(bracket) ? (
                            <span className="text-green-400 font-semibold text-sm">✓ Complete</span>
                        ) : (
                            <span className="text-yellow-400 font-semibold text-sm">⏳ In Progress</span>
                        )}
                    </div>
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            await onRemoveBracket(bracket.id);
                        }}
                        className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center flex-shrink-0"
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
                        bracketStarted={isAnyBracketStarted(bracket)}
                        onShowWarning={(message, onConfirm) => {
                            setWarningModal({ isOpen: true, message, onConfirm });
                        }}
                    />
                </div>
            </div>
        </>
    );
}
