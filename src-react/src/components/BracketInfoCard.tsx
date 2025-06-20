import { UserIcon, AcademicCapIcon, ScaleIcon, TrashIcon, HandRaisedIcon } from '@heroicons/react/24/outline';
import Bracket from '../lib/Bracket';

export default function BracketInfoCard({ bracket, onClick, onRemoveClick, }: { bracket: Bracket; onClick: () => void; onRemoveClick: () => void; }) {
    return (
        <div
            className='bg-slate-500 hover:bg-slate-600 transition cursor-pointer p-4 rounded-xl flex items-center justify-between gap-6 shadow-sm w-1/5'
            onClick={onClick}
        >
            {/* Bracket Info with Icons */}
            <div className='flex flex-col text-white text-sm gap-2'>
                <div className='flex items-center gap-2'>
                    <UserIcon className='h-5 w-5 text-blue-300' />
                    <span>{bracket.gender}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <AcademicCapIcon className='h-5 w-5 text-green-300' />
                    <span>{bracket.experienceLevel}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <ScaleIcon className='h-5 w-5 text-purple-300' />
                    <span>{bracket.weightLimit}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <HandRaisedIcon className='h-5 w-5 text-yellow-300' />
                    <span>{bracket.hand}</span>
                </div>
            </div>

            {/* Remove Button */}
            <button
                className='bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition flex items-center gap-1'
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onRemoveClick();
                }}
            >
                <TrashIcon className='h-4 w-4' />
                <span className='text-sm font-medium'>Remove</span>
            </button>
        </div>
    );
}
