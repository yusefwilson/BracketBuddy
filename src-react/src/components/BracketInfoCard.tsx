import { UserIcon, AcademicCapIcon, HandRaisedIcon, ScaleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BracketDTO } from '../../../src-shared/BracketDTO';

interface BracketInfoCardProps {
    bracket: BracketDTO;
    onClick: (bracketId: string) => void;
    onDelete: (bracketId: string) => void;
}

export default function BracketInfoCard({ bracket, onClick, onDelete }: BracketInfoCardProps) {
    const competitorCount = bracket.competitorNames.length;
    const isComplete = bracket.firstPlace !== undefined;

    return (
        <div className="w-full bg-slate-600 hover:bg-slate-500 transition p-4 rounded-lg shadow-md flex items-center justify-between gap-4">
            {/* Left side: Bracket details with inline icons */}
            <button
                onClick={() => onClick(bracket.id)}
                className="flex-1 flex flex-col gap-1 text-left"
            >
                <h3 className="text-white font-semibold text-lg flex items-center flex-wrap gap-2">
                    <span className="flex items-center gap-1">
                        <UserIcon className="h-5 w-5 text-blue-400" />
                        {bracket.gender}
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                        <AcademicCapIcon className="h-5 w-5 text-green-400" />
                        {bracket.experienceLevel}
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                        <HandRaisedIcon className="h-5 w-5 text-yellow-400" />
                        {bracket.hand}
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                        <ScaleIcon className="h-5 w-5 text-purple-500" />
                        {bracket.weightLimit}
                    </span>
                </h3>
                <div className="flex gap-4 text-sm text-gray-300">
                    <span>{competitorCount} competitor{competitorCount !== 1 ? 's' : ''}</span>
                    {isComplete ? (
                        <span className="text-green-400 font-semibold">✓ Complete</span>
                    ) : (
                        <span className="text-yellow-400 font-semibold">⏳ In Progress</span>
                    )}
                </div>
            </button>

            {/* Right side: Placement information and delete button */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1 text-sm text-gray-300">
                    <div className="flex gap-2">
                        <span className="text-yellow-400 font-semibold">🥇 1st:</span>
                        <span className="text-white">{bracket.firstPlace || "TBD"}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-gray-400 font-semibold">🥈 2nd:</span>
                        <span className="text-white">{bracket.secondPlace || "TBD"}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-orange-400 font-semibold">🥉 3rd:</span>
                        <span className="text-white">{bracket.thirdPlace || "TBD"}</span>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(bracket.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition shadow-md hover:shadow-lg flex-shrink-0"
                    type="button"
                    title="Delete bracket"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
