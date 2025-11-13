import { TournamentDTO } from '../../../src-shared/TournamentDTO';
import { useSortableList, SortableList } from '../hooks/useSortableList';

interface BracketHotSwapBarProps {
    tournament: TournamentDTO;
    currentBracketId: string;
    onBracketChange: (bracketId: string) => void;
}

export default function BracketHotSwapBar({ tournament, currentBracketId, onBracketChange }: BracketHotSwapBarProps) {

    const { items: brackets, handleDragEnd } = useSortableList(tournament.brackets, 'bracketOrder');

    const handleBracketChange = async (bracketId: string) => {
        onBracketChange(bracketId);
        await window.electron.saveKeyValue({ key: 'lastBracketId', value: bracketId });
    };

    return (
        <div className="w-full bg-slate-600 p-4 rounded-md shadow-inner overflow-x-auto">
            <SortableList
                items={brackets}
                onDragEnd={handleDragEnd}
                renderItem={(bracket) => (
                    <button
                        key={bracket.id}
                        onClick={() => handleBracketChange(bracket.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-md font-semibold transition-transform duration-150 text-sm
              ${bracket.id === currentBracketId
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-blue-500 text-white hover:bg-blue-400 hover:scale-105'}`}
                    >
                        {`${bracket.gender} | ${bracket.hand} | ${bracket.experienceLevel} | ${bracket.weightLimit}`}
                    </button>
                )}
            />
        </div>
    );
}
