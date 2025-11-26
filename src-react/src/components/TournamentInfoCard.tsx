import { HiCalendarDays as CalendarDaysIcon, HiUserGroup as UserGroupIcon, HiTrash as TrashIcon, HiTrophy as TrophyIcon } from 'react-icons/hi2';

import { TournamentDTO } from '../../../src-shared/TournamentDTO';

interface TournamentInfoCardProps {
    tournament: TournamentDTO;
    onClick: () => void;
    onRemoveClick: () => void;
}

// ✅ Use the props interface in the component
export default function TournamentInfoCard({ tournament, onClick, onRemoveClick }: TournamentInfoCardProps) {
    return (
        <div
            className='bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 p-5 rounded-xl cursor-pointer shadow-lg border border-slate-600/50 transition-all duration-200 flex flex-row gap-3 group hover:shadow-xl hover:border-slate-500/50 justify-between items-center'
            onClick={onClick}
        >
            <div className="flex flex-row gap-3">
                {/* Name */}
                <div className='flex items-center gap-2'>
                    <TrophyIcon className='h-6 w-6 text-yellow-400 drop-shadow-md' />
                    <span className='text-xl font-bold text-white group-hover:text-blue-300 transition-colors'>{tournament.name}</span>
                </div>

                {/* Date */}
                <div className='flex items-center gap-2'>
                    <CalendarDaysIcon className='h-5 w-5 text-blue-400' />
                    <span className='text-gray-200'>
                        {tournament.date.toLocaleDateString('en-US')}
                    </span>
                </div>

                {/* Number of Brackets */}
                <div className='flex items-center gap-2'>
                    <UserGroupIcon className='h-5 w-5 text-green-400' />
                    <span className='text-gray-200'>
                        {tournament.brackets.length} class{tournament.brackets.length !== 1 ? 'es' : ''}
                    </span>
                </div>
            </div>


            {/* Remove Button */}
            <button
                className='flex items-center gap-1.5 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg'
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onRemoveClick();
                }}
            >
                <TrashIcon className='h-4 w-4' />
            </button>
        </div>
    );
}