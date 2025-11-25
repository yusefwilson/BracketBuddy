import { HiTrophy as TrophyIcon } from 'react-icons/hi2';

interface FinalPlacingsProps {
    first?: string;
    second?: string;
    third?: string;
}

export default function FinalPlacings({ first, second, third }: FinalPlacingsProps) {
    return (
        <div className='w-full flex flex-col items-center mt-4'>

            <h2 className='text-white font-semibold text-lg mb-2'>Final Placings</h2>
            <div className='flex flex-col gap-6 justify-center items-center'>

                {/* 1st Place */}
                <div className='flex flex-col items-center scale-110'>
                    <div className='bg-gradient-to-br from-yellow-400 to-yellow-500 text-black px-4 py-3 rounded-lg shadow-xl w-40 text-center font-bold border-2 border-yellow-300'>
                        {first || 'TBD'}
                    </div>
                    <div className='flex items-center gap-1 mt-1 text-sm text-black bg-yellow-400 px-2 py-1 rounded-b-lg w-28 justify-center shadow-md'>
                        <TrophyIcon className='w-4 h-4 text-yellow-700' />
                        <span className='font-semibold'>1st</span>
                    </div>
                </div>

                {/* 2nd Place */}
                <div className='flex flex-col items-center'>
                    <div className='bg-gradient-to-br from-slate-400 to-slate-500 text-white px-4 py-3 rounded-lg shadow-lg w-36 text-center font-semibold border-2 border-slate-300'>
                        {second || 'TBD'}
                    </div>
                    <div className='flex items-center gap-1 mt-1 text-sm text-white bg-slate-600 px-2 py-1 rounded-b-lg w-28 justify-center shadow-md'>
                        🥈
                        <span className='font-semibold'>2nd</span>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className='flex flex-col items-center'>
                    <div className='bg-gradient-to-br from-orange-400 to-orange-500 text-white px-4 py-3 rounded-lg shadow-lg w-36 text-center font-semibold border-2 border-orange-300'>
                        {third || 'TBD'}
                    </div>
                    <div className='flex items-center gap-1 mt-1 text-sm text-white bg-orange-600 px-2 py-1 rounded-b-lg w-28 justify-center shadow-md'>
                        🥉
                        <span className='font-semibold'>3rd</span>
                    </div>
                </div>

            </div>
        </div>
    );
}