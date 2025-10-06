import { TrophyIcon } from '@heroicons/react/24/solid';

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
                    <div className='bg-yellow-500 text-black px-3 py-2 rounded-md shadow-lg w-36 text-center font-semibold'>
                        {first || 'TBD'}
                    </div>
                    <div className='flex items-center gap-1 mt-1 text-sm text-black bg-yellow-400 px-2 py-1 rounded-b-md w-24 justify-center'>
                        <TrophyIcon className='w-4 h-4 text-yellow-700' />
                        <span>1st</span>
                    </div>
                </div>

                {/* 2nd Place */}
                <div className='flex flex-col items-center'>
                    <div className='bg-slate-400 text-white px-3 py-2 rounded-md shadow-md w-32 text-center'>
                        {second || 'TBD'}
                    </div>
                    <div className='flex items-center gap-1 mt-1 text-sm text-white bg-slate-600 px-2 py-1 rounded-b-md w-24 justify-center'>
                        🥈
                        <span>2nd</span>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className='flex flex-col items-center'>
                    <div className='bg-stone-400 text-white px-3 py-2 rounded-md shadow-md w-32 text-center'>
                        {third || 'TBD'}
                    </div>
                    <div className='flex items-center gap-1 mt-1 text-sm text-white bg-orange-500 px-2 py-1 rounded-b-md w-24 justify-center'>
                        🥉
                        <span>3rd</span>
                    </div>
                </div>

            </div>
        </div>
    );
}