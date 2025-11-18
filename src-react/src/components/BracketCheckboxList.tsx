import { HiUser as UserIcon, HiAcademicCap as AcademicCapIcon, HiHandRaised as HandRaisedIcon, HiScale as ScaleIcon } from 'react-icons/hi2';

import { BracketDTO } from '../../../src-shared/BracketDTO';

interface BracketCheckboxListProps {
    brackets: BracketDTO[];
    selectedBracketIds: Set<string>;
    onToggle: (bracketId: string) => void;
    loading?: boolean;
}

export default function BracketCheckboxList({
    brackets,
    selectedBracketIds,
    onToggle,
    loading = false
}: BracketCheckboxListProps) {
    if (brackets.length === 0) {
        return (
            <p className='text-gray-400 text-center italic py-8'>
                No brackets available. Create brackets first.
            </p>
        );
    }

    return (
        <div className='grid grid-cols-1 gap-3'>
            {brackets.map((bracket) => {
                const isSelected = selectedBracketIds.has(bracket.id);
                const competitorCount = bracket.competitorNames.length;

                return (
                    <button
                        key={bracket.id}
                        onClick={() => onToggle(bracket.id)}
                        disabled={loading}
                        className={`
                            p-4 rounded-lg border-2 transition-all duration-200 text-left
                            ${isSelected
                                ? 'bg-blue-600 border-blue-400 hover:bg-blue-700'
                                : 'bg-slate-600 border-slate-500 hover:bg-slate-500'
                            }
                            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3 flex-wrap'>
                                <div className='flex items-center gap-1'>
                                    <UserIcon className='h-4 w-4 text-blue-300' />
                                    <span className='text-white font-semibold text-sm'>{bracket.gender}</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <AcademicCapIcon className='h-4 w-4 text-green-300' />
                                    <span className='text-white font-semibold text-sm'>{bracket.experienceLevel}</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <HandRaisedIcon className='h-4 w-4 text-yellow-300' />
                                    <span className='text-white font-semibold text-sm'>{bracket.hand}</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <ScaleIcon className='h-4 w-4 text-purple-300' />
                                    <span className='text-white font-semibold text-sm'>
                                        {bracket.weightLimit === 'Superheavyweight' ? 'SHW' : `${bracket.weightLimit} lbs`}
                                    </span>
                                </div>
                            </div>
                            <div className='flex items-center gap-3'>
                                <span className='text-gray-300 text-sm'>
                                    {competitorCount} {competitorCount === 1 ? 'competitor' : 'competitors'}
                                </span>
                                <div className={`
                                    w-6 h-6 rounded flex items-center justify-center
                                    ${isSelected ? 'bg-white' : 'bg-slate-700'}
                                `}>
                                    {isSelected && (
                                        <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
