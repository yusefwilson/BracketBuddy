import { useState, useEffect } from 'react';
import { HiUser as UserIcon, HiTrash as TrashIcon } from 'react-icons/hi2';

interface CompetitorRowProps {
    name: string;
    bracketCount: number;
    brackets: Array<{ id: string; name: string }>;
    officialWeight: number | null;
    paid: boolean;
    onClick: () => void;
    onRemove: () => void;
    onPaidChange: (paid: boolean) => void;
    onWeightChange: (officialWeight: number | null) => void;
}

export default function CompetitorInfoCard({ name, bracketCount, brackets, officialWeight, paid, onClick, onRemove, onPaidChange, onWeightChange }: CompetitorRowProps) {
    // the weight is edited as text and only saved on blur/Enter. an empty box means unknown.
    const [weightText, setWeightText] = useState(officialWeight === null ? '' : String(officialWeight));

    useEffect(() => {
        setWeightText(officialWeight === null ? '' : String(officialWeight));
    }, [officialWeight]);

    const commitWeight = () => {
        const trimmed = weightText.trim();
        const parsed = trimmed === '' ? null : Number(trimmed);

        // ignore anything that is not a non-negative number: put the saved value back
        if (parsed !== null && (!Number.isFinite(parsed) || parsed < 0)) {
            setWeightText(officialWeight === null ? '' : String(officialWeight));
            return;
        }
        if (parsed !== officialWeight) {
            onWeightChange(parsed);
        }
    };

    // clicks inside the paid/weight controls must not open the competitor's class modal
    const stop = (e: React.SyntheticEvent) => e.stopPropagation();

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className="bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 px-5 py-2 rounded-lg transition-all duration-200 border border-slate-600/50 hover:border-blue-500/50 hover:shadow-lg group w-full shadow-md cursor-pointer"
        >
            <div className="grid grid-cols-[250px_1fr_130px_80px_120px_auto] items-center gap-4">
                {/* Name column - fixed width with truncation */}
                <div className="flex items-center gap-3 min-w-0">
                    <UserIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-white font-semibold text-base group-hover:text-blue-300 truncate transition-colors">
                        {name}
                    </span>
                </div>

                {/* Brackets column - flexible width with truncation */}
                <span className="text-gray-300 text-sm truncate text-left min-w-0">
                    {brackets.map(b => b.name).join(' • ')}
                </span>

                {/* Official weight column */}
                <div className="flex items-center gap-1 text-sm text-gray-300" onClick={stop}>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={weightText}
                        placeholder="Unknown"
                        aria-label={`Official weight for ${name}`}
                        onChange={(e) => setWeightText(e.target.value)}
                        onBlur={commitWeight}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                                e.currentTarget.blur();
                            } else if (e.key === 'Escape') {
                                setWeightText(officialWeight === null ? '' : String(officialWeight));
                                e.currentTarget.blur();
                            }
                        }}
                        className="bg-slate-600 text-white px-2 py-0.5 rounded-md w-20 text-right placeholder:italic placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span>lbs</span>
                </div>

                {/* Paid column */}
                <label
                    className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none"
                    onClick={stop}
                    onKeyDown={stop}
                >
                    <input
                        type="checkbox"
                        checked={paid}
                        onChange={(e) => onPaidChange(e.target.checked)}
                        className="h-4 w-4 accent-green-500 cursor-pointer"
                    />
                    <span className={paid ? 'text-green-400 font-medium' : 'text-yellow-400'}>
                        {paid ? 'Paid' : 'Unpaid'}
                    </span>
                </label>

                {/* Count column - fixed width */}
                <div className="text-sm text-gray-300 whitespace-nowrap text-right">
                    <span className="font-medium text-blue-400">{bracketCount}</span>
                    {' '}
                    {bracketCount === 1 ? 'class' : 'classes'}
                </div>

                {/* Remove button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center flex-shrink-0"
                    type="button"
                    title="Remove from all brackets"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
