import { HiUser as UserIcon, HiTrash as TrashIcon } from 'react-icons/hi2';

interface CompetitorRowProps {
    name: string;
    bracketCount: number;
    brackets: Array<{ id: string; name: string }>;
    onClick: () => void;
    onRemove: () => void;
}

export default function CompetitorInfoCard({ name, bracketCount, brackets, onClick, onRemove }: CompetitorRowProps) {
    return (
        <button
            onClick={onClick}
            className="bg-slate-600 hover:bg-slate-500 px-6 py-4 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-blue-400 group w-full"
        >
            <div className="grid grid-cols-[250px_1fr_120px_auto] items-center gap-4">
                {/* Name column - fixed width with truncation */}
                <div className="flex items-center gap-3 min-w-0">
                    <UserIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    <span className="text-white font-semibold text-lg group-hover:text-blue-300 truncate">
                        {name}
                    </span>
                </div>

                {/* Brackets column - flexible width with truncation */}
                <span className="text-gray-300 text-sm truncate text-left min-w-0">
                    {brackets.map(b => b.name).join(' • ')}
                </span>

                {/* Count column - fixed width */}
                <div className="text-sm text-gray-300 whitespace-nowrap text-right">
                    <span className="font-medium text-blue-300">{bracketCount}</span>
                    {' '}
                    {bracketCount === 1 ? 'class' : 'classes'}
                </div>

                {/* Remove button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition shadow-md hover:shadow-lg flex items-center flex-shrink-0"
                    type="button"
                    title="Remove from all brackets"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
        </button>
    );
}
