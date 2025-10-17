import { TournamentDTO } from '../../../src-shared/TournamentDTO';

interface BracketHotSwapBarProps {
    tournament: TournamentDTO;
    currentBracketIndex: number;
    onBracketChange: (index: number) => void;
}

export default function BracketHotSwapBar({ tournament, currentBracketIndex, onBracketChange }: BracketHotSwapBarProps) {
    return (
        <div className="w-full bg-slate-600 p-4 rounded-md shadow-inner overflow-x-auto flex gap-2">
            {tournament.brackets.map((bracket, index) => (
                <button
                    key={bracket.id}
                    onClick={() => onBracketChange(index)}
                    className={`flex-shrink-0 px-4 py-2 rounded-md font-semibold transition-colors duration-200 text-sm
                        ${index === currentBracketIndex
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-blue-500 text-white hover:bg-blue-400 hover:scale-105'}`
                    }
                >
                    {`${bracket.gender} | ${bracket.hand} | ${bracket.experienceLevel} | ${bracket.weightLimit}`}
                </button>
            ))}
        </div>
    );
}
