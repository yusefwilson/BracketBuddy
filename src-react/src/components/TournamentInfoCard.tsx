import { CalendarDaysIcon, UserGroupIcon, TrashIcon, TrophyIcon } from '@heroicons/react/24/outline';
import Tournament from '../lib/Tournament';

export default function TournamentInfoCard({
    tournament,
    onClick,
    onRemoveClick,
}: {
    tournament: Tournament;
    onClick: () => void;
    onRemoveClick: () => void;
}) {
    return (
        <div
            className='bg-slate-700 hover:bg-slate-600 p-4 rounded-xl cursor-pointer shadow-md transition duration-200 flex flex-col gap-3 group'
            onClick={onClick}
        >
            {/* Name */}
            <div className='flex items-center gap-2'>
                <TrophyIcon className='h-5 w-5 text-yellow-400' />
                <span className='text-lg font-semibold text-white'>{tournament.name}</span>
            </div>

            {/* Date */}
            <div className='flex items-center gap-2'>
                <CalendarDaysIcon className='h-5 w-5 text-blue-300' />
                <span className='text-white'>
                    {tournament.date.toLocaleDateString('en-US')}
                </span>
            </div>

            {/* Number of Brackets */}
            <div className='flex items-center gap-2'>
                <UserGroupIcon className='h-5 w-5 text-green-300' />
                <span className='text-white'>
                    {tournament.brackets.length} class{tournament.brackets.length !== 1 ? 'es' : ''}
                </span>
            </div>

            {/* Remove Button */}
            <button
                className='flex items-center gap-1 self-start bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md mt-2 transition duration-150'
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onRemoveClick();
                }}
            >
                <TrashIcon className='h-4 w-4' />
                Remove
            </button>
        </div>
    );
}