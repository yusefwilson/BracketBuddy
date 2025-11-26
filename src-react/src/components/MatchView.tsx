import { useState, useRef, useEffect } from 'react';
import { HiExclamationTriangle as ExclamationTriangleIcon, HiCheck as CheckIcon } from 'react-icons/hi2';
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

    const [showPlayer1Dropdown, setShowPlayer1Dropdown] = useState(false);
    const [showPlayer2Dropdown, setShowPlayer2Dropdown] = useState(false);
    const player1DropdownRef = useRef<HTMLDivElement>(null);
    const player2DropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (player1DropdownRef.current && !player1DropdownRef.current.contains(event.target as Node)) {
                setShowPlayer1Dropdown(false);
            }
            if (player2DropdownRef.current && !player2DropdownRef.current.contains(event.target as Node)) {
                setShowPlayer2Dropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // toggle between statuses and UNDECIDED
    const toggleStatus = (status: MatchStatus) => {
        updateMatch(match.id, match.status === status ? 'UNDECIDED' : status);
    };

    // highlight the match yellow if it is the current match, gray if it is stale
    const highlighted = match.number === currentMatchId;

    // Determine color for player 1
    let player1ColorStyle = 'bg-blue-400 hover:bg-blue-500';
    if (highlighted) {
        player1ColorStyle = 'bg-yellow-500 transition-200 hover:bg-yellow-600';
    } else if (match.status === 'PLAYER_1_NO_SHOW') {
        player1ColorStyle = 'bg-gray-500 hover:bg-gray-600';
    } else if (match.status === 'PLAYER_1_DROPOUT') {
        player1ColorStyle = 'bg-red-500 hover:bg-red-600';
    }

    // Determine color for player 2
    let player2ColorStyle = 'bg-blue-400 hover:bg-blue-500';
    if (highlighted) {
        player2ColorStyle = 'bg-yellow-500 transition-200 hover:bg-yellow-600';
    } else if (match.status === 'PLAYER_2_NO_SHOW') {
        player2ColorStyle = 'bg-gray-500 hover:bg-gray-600';
    } else if (match.status === 'PLAYER_2_DROPOUT') {
        player2ColorStyle = 'bg-red-500 hover:bg-red-600';
    }

    // Handle dropdown option selection
    const handlePlayer1Option = (status: 'PLAYER_1_DROPOUT' | 'PLAYER_1_NO_SHOW') => {
        toggleStatus(status);
        setShowPlayer1Dropdown(false);
    };

    const handlePlayer2Option = (status: 'PLAYER_2_DROPOUT' | 'PLAYER_2_NO_SHOW') => {
        toggleStatus(status);
        setShowPlayer2Dropdown(false);
    };

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
                            <WinnerCheckbox toggleWinner={() => toggleStatus('PLAYER_1_WON')} checked={match.status === 'PLAYER_1_WON' || match.status === 'PLAYER_2_DROPOUT' || match.status === 'PLAYER_2_NO_SHOW'} />
                        </div>
                        <div className='relative' ref={player1DropdownRef}>
                            <button
                                className={'flex items-center justify-center w-6 h-6 rounded text-xs font-bold transition duration-200 ' +
                                    (match.status === 'PLAYER_1_DROPOUT' || match.status === 'PLAYER_1_NO_SHOW'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white')}
                                onClick={() => setShowPlayer1Dropdown(!showPlayer1Dropdown)}
                                title="Mark as dropout/no-show"
                            >
                                <ExclamationTriangleIcon className='h-4 w-4' />
                            </button>
                            {showPlayer1Dropdown && (
                                <div className='absolute left-0 top-7 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50 min-w-[120px]'>
                                    <button
                                        className='w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 transition rounded-t-md flex items-center justify-between'
                                        onClick={() => handlePlayer1Option('PLAYER_1_DROPOUT')}
                                    >
                                        <span>Dropout</span>
                                        {match.status === 'PLAYER_1_DROPOUT' && <CheckIcon className='h-4 w-4 text-green-400' />}
                                    </button>
                                    <button
                                        className='w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 transition rounded-b-md flex items-center justify-between'
                                        onClick={() => handlePlayer1Option('PLAYER_1_NO_SHOW')}
                                    >
                                        <span>No Show</span>
                                        {match.status === 'PLAYER_1_NO_SHOW' && <CheckIcon className='h-4 w-4 text-green-400' />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Player 2 */}
                    <div className='flex flex-row items-center gap-1'>
                        <div className={'flex flex-row justify-between items-center p-2 rounded-md w-44 transition duration-200 ease-in-out select-none ' + player2ColorStyle}
                            onClick={() => toggleStatus('PLAYER_2_WON')}
                            title="Mark as winner">
                            <div className='text-sm truncate w-0 flex-1'>
                                {match.player2 || match.slot2GenericName}
                            </div>
                            <WinnerCheckbox toggleWinner={() => toggleStatus('PLAYER_2_WON')} checked={match.status === 'PLAYER_2_WON' || match.status === 'PLAYER_1_DROPOUT' || match.status === 'PLAYER_1_NO_SHOW'} />
                        </div>
                        <div className='relative' ref={player2DropdownRef}>
                            <button
                                className={'flex items-center justify-center w-6 h-6 rounded text-xs font-bold transition duration-200 ' +
                                    (match.status === 'PLAYER_2_DROPOUT' || match.status === 'PLAYER_2_NO_SHOW'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white')}
                                onClick={() => setShowPlayer2Dropdown(!showPlayer2Dropdown)}
                                title="Mark as dropout/no-show"
                            >
                                <ExclamationTriangleIcon className='h-4 w-4' />
                            </button>
                            {showPlayer2Dropdown && (
                                <div className='absolute left-0 top-7 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50 min-w-[120px]'>
                                    <button
                                        className='w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 transition rounded-t-md flex items-center justify-between'
                                        onClick={() => handlePlayer2Option('PLAYER_2_DROPOUT')}
                                    >
                                        <span>Dropout</span>
                                        {match.status === 'PLAYER_2_DROPOUT' && <CheckIcon className='h-4 w-4 text-green-400' />}
                                    </button>
                                    <button
                                        className='w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 transition rounded-b-md flex items-center justify-between'
                                        onClick={() => handlePlayer2Option('PLAYER_2_NO_SHOW')}
                                    >
                                        <span>No Show</span>
                                        {match.status === 'PLAYER_2_NO_SHOW' && <CheckIcon className='h-4 w-4 text-green-400' />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}