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

    let colorStyle = 'bg-blue-400 hover:bg-blue-500';

    if (highlighted) {
        colorStyle = 'bg-yellow-500 transition-200 hover:bg-yellow-600';
    } else if (stale) {
        colorStyle = 'bg-gray-500 hover:bg-gray-600';
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
                    <div className={'flex flex-row justify-between items-center p-2 rounded-md w-44 transition duration-200 ease-in-out select-none ' + colorStyle} onClick={() => toggleStatus('PLAYER_1_WON')}>
                        <div className='text-sm truncate w-0 flex-1'>
                            {match.player1 || match.slot1GenericName}
                        </div>
                        <WinnerCheckbox toggleWinner={() => toggleStatus('PLAYER_1_WON')} checked={match.status === 'PLAYER_1_WON' || match.status === 'PLAYER_2_DROPOUT'} />
                    </div>
                    <div className={'flex flex-row justify-between items-center p-2 rounded-md w-44 transition duration-200 ease-in-out select-none ' + colorStyle} onClick={() => toggleStatus('PLAYER_2_WON')}>
                        <div className='text-sm truncate w-0 flex-1'>
                            {match.player2 || match.slot2GenericName}
                        </div>
                        <WinnerCheckbox toggleWinner={() => toggleStatus('PLAYER_2_WON')} checked={match.status === 'PLAYER_2_WON' || match.status === 'PLAYER_1_DROPOUT'} />
                    </div>
                </div>
            </div>
        </div>
    );
}