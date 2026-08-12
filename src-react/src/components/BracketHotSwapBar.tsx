import { TournamentDTO } from '../../../src-shared/TournamentDTO';
import { Gender } from '../../../src-shared/types';
import { isBracketStarted } from '../../../src-shared/bracketHelpers';
import { useSortableList, SortableList } from '../hooks/useSortableList';

interface BracketHotSwapBarProps {
    tournament: TournamentDTO;
    currentBracketId: string;
    onBracketChange: (bracketId: string) => void;
}

const GENDER_CLASSES: Record<Gender, { bg: string; hoverBg: string }> = {
    Female: { bg: 'bg-pink-300', hoverBg: 'hover:bg-pink-200' },
    Male: { bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-500' },
    Mixed: { bg: 'bg-purple-600', hoverBg: 'hover:bg-purple-500' },
};

const STATUS_BORDER_CLASSES = {
    notStarted: 'border-red-700',
    inProgress: 'border-orange-400',
    complete: 'border-green-400',
};

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
                renderItem={(bracket) => {
                    const isComplete = bracket.firstPlace !== undefined;
                    const started = isBracketStarted(bracket);
                    const statusBorder = isComplete
                        ? STATUS_BORDER_CLASSES.complete
                        : started
                            ? STATUS_BORDER_CLASSES.inProgress
                            : STATUS_BORDER_CLASSES.notStarted;
                    const genderClasses = GENDER_CLASSES[bracket.gender];

                    return (
                        <button
                            key={bracket.id}
                            onClick={() => handleBracketChange(bracket.id)}
                            className={`flex-shrink-0 flex flex-col items-center gap-1 px-2 py-1 rounded-md font-bold
                                transition-all duration-150 text-xs whitespace-nowrap text-white border-4
                                ${genderClasses.bg} ${genderClasses.hoverBg} ${statusBorder}
                                ${bracket.id === currentBracketId
                                    ? 'ring-2 ring-offset-2 ring-offset-slate-600 ring-yellow-300 scale-105 shadow-lg'
                                    : 'hover:scale-105'}`}
                        >
                            <span>{`${bracket.gender} | ${bracket.hand} | ${bracket.weightLimit}`}</span>
                            <span>{bracket.experienceLevel}</span>
                        </button>
                    );
                }}
            />
        </div>
    );
}
