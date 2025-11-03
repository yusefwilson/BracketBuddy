import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { MatchDTO } from '../../../src-shared/MatchDTO';
import { MatchStatus } from '../../../src-shared/types';

import WinnerCheckbox from './WinnerCheckbox';

interface MatchViewProps {
    match: MatchDTO;
    updateMatch: (matchId: string, status: MatchStatus) => void;
    x: number;
    y: number;
    currentMatchId?: number;
}

export default function MatchView({ match, updateMatch, x, y, currentMatchId, }: MatchViewProps) {

    // toggle between statuses and UNDECIDED
    const toggleStatus = (status: MatchStatus) => {
        updateMatch(match.id, match.status === status ? 'UNDECIDED' : status);
    };

    // highlight the match yellow if it is the current match, gray if it is stale
    const highlighted = match.number === currentMatchId;

    let stale;
    if (currentMatchId === undefined) {
        stale = false;
    }
    else if (match.number < currentMatchId && match.status === 'UNDECIDED') {
        stale = true;
    }
    else {
        stale = false;
    }

    // Determine color for player 1
    let player1ColorStyle = 'bg-blue-400 hover:bg-blue-500';
    if (highlighted) {
        player1ColorStyle = 'bg-yellow-500 transition-200 hover:bg-yellow-600';
    } else if (stale) {
        player1ColorStyle = 'bg-gray-500 hover:bg-gray-600';
    } else if (match.status === 'PLAYER_1_DROPOUT') {
        player1ColorStyle = 'bg-red-500 hover:bg-red-600';
    }

    // Determine color for player 2
    let player2ColorStyle = 'bg-blue-400 hover:bg-blue-500';
    if (highlighted) {
        player2ColorStyle = 'bg-yellow-500 transition-200 hover:bg-yellow-600';
    } else if (stale) {
        player2ColorStyle = 'bg-gray-500 hover:bg-gray-600';
    } else if (match.status === 'PLAYER_2_DROPOUT') {
        player2ColorStyle = 'bg-red-500 hover:bg-red-600';
    }

    return (
        <div className='absolute' style={{
            left: `${x}px`,
            top: `${y}px`,
        }}>

            {/* Match container */}
            <div className={'bg-transparent p-2 flex flex-row gap-2'}>
                {/* Match ID vertically centered */}
                <div className='flex items-center'>
                    <h3 className='text-center font-bold w-8'>{match.number}.</h3>
                </div>
                <div className='flex flex-col gap-2'>
                    {/* Player 1 */}
                    <div className='flex flex-row items-center gap-1'>
                        <div className={'flex flex-row justify-between items-center p-2 rounded-md w-44 transition duration-200 ease-in-out select-none ' + player1ColorStyle}
                            onClick={() => toggleStatus('PLAYER_1_WON')}
                            title="Mark as winner">
                            <div className='text-sm truncate w-0 flex-1'>
                                {match.player1 || match.slot1GenericName}
                            </div>
                            <WinnerCheckbox toggleWinner={() => toggleStatus('PLAYER_1_WON')} checked={match.status === 'PLAYER_1_WON' || match.status === 'PLAYER_2_DROPOUT'} />
                        </div>
                        <button
                            className={'flex items-center justify-center w-6 h-6 rounded text-xs font-bold transition duration-200 ' +
                                (match.status === 'PLAYER_1_DROPOUT'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white')}
                            onClick={() => toggleStatus('PLAYER_1_DROPOUT')}
                            title="Mark as dropout/injury/no-show"
                        >
                            <ExclamationTriangleIcon className='h-4 w-4' />
                        </button>
                    </div>

                    {/* Player 2 */}
                    <div className='flex flex-row items-center gap-1'>
                        <div className={'flex flex-row justify-between items-center p-2 rounded-md w-44 transition duration-200 ease-in-out select-none ' + player2ColorStyle}
                            onClick={() => toggleStatus('PLAYER_2_WON')}
                            title="Mark as winner">
                            <div className='text-sm truncate w-0 flex-1'>
                                {match.player2 || match.slot2GenericName}
                            </div>
                            <WinnerCheckbox toggleWinner={() => toggleStatus('PLAYER_2_WON')} checked={match.status === 'PLAYER_2_WON' || match.status === 'PLAYER_1_DROPOUT'} />
                        </div>
                        <button
                            className={'flex items-center justify-center w-6 h-6 rounded text-xs font-bold transition duration-200 ' +
                                (match.status === 'PLAYER_2_DROPOUT'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white')}
                            onClick={() => toggleStatus('PLAYER_2_DROPOUT')}
                            title="Mark as dropout/injury/no-show"
                        >
                            <ExclamationTriangleIcon className='h-4 w-4' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}