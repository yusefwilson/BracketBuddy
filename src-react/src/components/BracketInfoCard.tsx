import { BracketDTO } from '../../../src-shared/BracketDTO';

interface BracketInfoCardProps {
    bracket: BracketDTO;
    onClick: (bracketId: string) => void;
}

export default function BracketInfoCard({ bracket, onClick }: BracketInfoCardProps) {
    const competitorCount = bracket.competitorNames.length;
    const isComplete = bracket.firstPlace !== undefined;

    return (
        <button
            onClick={() => onClick(bracket.id)}
            className="w-full bg-slate-600 hover:bg-slate-500 transition p-4 rounded-lg shadow-md flex items-center justify-between text-left"
        >
            {/* Left side: Bracket details */}
            <div className="flex flex-col gap-1">
                <h3 className="text-white font-semibold text-lg">
                    {`${bracket.gender} | ${bracket.experienceLevel} | ${bracket.hand} | ${bracket.weightLimit}`}
                </h3>
                <div className="flex gap-4 text-sm text-gray-300">
                    <span>{competitorCount} competitor{competitorCount !== 1 ? 's' : ''}</span>
                    {isComplete && (
                        <span className="text-green-400 font-semibold">✓ Complete</span>
                    )}
                </div>
            </div>

            {/* Right side: Placement information */}
            {isComplete && (
                <div className="flex flex-col gap-1 text-sm text-gray-300">
                    {bracket.firstPlace && (
                        <div className="flex gap-2">
                            <span className="text-yellow-400 font-semibold">🥇 1st:</span>
                            <span className="text-white">{bracket.firstPlace}</span>
                        </div>
                    )}
                    {bracket.secondPlace && (
                        <div className="flex gap-2">
                            <span className="text-gray-400 font-semibold">🥈 2nd:</span>
                            <span className="text-white">{bracket.secondPlace}</span>
                        </div>
                    )}
                    {bracket.thirdPlace && (
                        <div className="flex gap-2">
                            <span className="text-orange-400 font-semibold">🥉 3rd:</span>
                            <span className="text-white">{bracket.thirdPlace}</span>
                        </div>
                    )}
                </div>
            )}
        </button>
    );
}
