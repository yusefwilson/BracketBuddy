import { HiUser as UserIcon, HiAcademicCap as AcademicCapIcon, HiHandRaised as HandRaisedIcon, HiScale as ScaleIcon, HiTrash as TrashIcon } from 'react-icons/hi2';
import { BracketDTO } from '../../../src-shared/BracketDTO';
import { isBracketComplete } from '../../../src-shared/bracketHelpers';

interface BracketInfoCardProps {
    bracket: BracketDTO;
    onClick: (bracketId: string) => void;
    onDelete: (bracketId: string) => void;
}

export default function BracketInfoCard({ bracket, onClick, onDelete }: BracketInfoCardProps) {
    const competitorCount = bracket.competitorNames.length;
    const isComplete = isBracketComplete(bracket);

    return (
        <button
            onClick={() => onClick(bracket.id)}
            className="w-full bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all duration-200 p-5 rounded-xl shadow-lg border border-slate-600/50 hover:border-slate-500/50 hover:shadow-xl flex items-center justify-between gap-4 text-left"
        >
            {/* Left side: Bracket details with inline icons */}
            <div className="flex-1 flex flex-col gap-2">
                <h3 className="text-white font-semibold text-lg flex items-center flex-wrap gap-2">
                    <span className="flex items-center gap-1">
                        <UserIcon className="h-5 w-5 text-blue-400" />
                        {bracket.gender}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="flex items-center gap-1">
                        <AcademicCapIcon className="h-5 w-5 text-green-400" />
                        {bracket.experienceLevel}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="flex items-center gap-1">
                        <HandRaisedIcon className="h-5 w-5 text-yellow-400" />
                        {bracket.hand}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="flex items-center gap-1">
                        <ScaleIcon className="h-5 w-5 text-purple-400" />
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
            </div>

            {/* Right side: Placement information and delete button */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1 text-sm text-gray-300 bg-slate-900/30 rounded-lg p-3 border border-slate-600/30">
                    <div className="flex justify-between gap-4">
                        <span className="text-yellow-400 font-semibold">🥇 1st:</span>
                        <span className="text-white text-right">{bracket.firstPlace || "TBD"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-400 font-semibold">🥈 2nd:</span>
                        <span className="text-white text-right">{bracket.secondPlace || "TBD"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-orange-400 font-semibold">🥉 3rd:</span>
                        <span className="text-white text-right">{bracket.thirdPlace || "TBD"}</span>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(bracket.id);
                    }}
                    className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
                    type="button"
                    title="Delete bracket"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </button>
    );
}
