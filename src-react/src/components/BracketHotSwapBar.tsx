import { TournamentDTO } from '../../../src-shared/TournamentDTO';

interface BracketHotSwapBarProps {
    tournament: TournamentDTO;
    currentBracketId: string;
    onBracketChange: (bracketId: string) => void;
}

export default function BracketHotSwapBar({ tournament, currentBracketId, onBracketChange }: BracketHotSwapBarProps) {
    const handleBracketChange = async (bracketId: string) => {
        onBracketChange(bracketId);
        await window.electron.saveKeyValue({ key: 'lastBracketId', value: bracketId });
    };

    return (
        <div className="w-full bg-slate-600 p-4 rounded-md shadow-inner overflow-x-auto flex gap-2">
            {tournament.brackets.map((bracket) => (
                <button
                    key={bracket.id}
                    onClick={() => handleBracketChange(bracket.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-md font-semibold transition-colors duration-200 text-sm
                        ${bracket.id === currentBracketId
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
