import { useState, useEffect } from 'react';
import { HiCheck as CheckIcon, HiArrowPath as ResetIcon } from 'react-icons/hi2';
import { MatchDTO } from '../../../src-shared/MatchDTO';

interface RoundRobinMatchViewProps {
    match: MatchDTO;
    updateMatchScore: (matchId: string, player1Score: number, player2Score: number) => void;
    resetMatch: (matchId: string) => void;
    x: number;
    y: number;
    currentMatchId?: number;
}

export default function RoundRobinMatchView({ match, updateMatchScore, resetMatch, x, y, currentMatchId }: RoundRobinMatchViewProps) {

    const [player1Score, setPlayer1Score] = useState<string>(match.player1Score?.toString() ?? '');
    const [player2Score, setPlayer2Score] = useState<string>(match.player2Score?.toString() ?? '');

    // keep local inputs in sync when the bracket refreshes (e.g. after saving)
    useEffect(() => {
        setPlayer1Score(match.player1Score?.toString() ?? '');
        setPlayer2Score(match.player2Score?.toString() ?? '');
    }, [match.player1Score, match.player2Score]);

    const highlighted = match.number === currentMatchId;

    const bothFilled = player1Score.trim() !== '' && player2Score.trim() !== '';

    // convenience: entering a score for one player defaults the other to 0 (if still blank)
    const handlePlayer1Change = (val: string) => {
        if (Number(val) < 0) return; // no negative scores
        setPlayer1Score(val);
        if (val.trim() !== '' && player2Score.trim() === '') {
            setPlayer2Score('0');
        }
    };

    const handlePlayer2Change = (val: string) => {
        if (Number(val) < 0) return; // no negative scores
        setPlayer2Score(val);
        if (val.trim() !== '' && player1Score.trim() === '') {
            setPlayer1Score('0');
        }
    };

    const handleSave = () => {
        const p1 = Number(player1Score);
        const p2 = Number(player2Score);
        if (Number.isNaN(p1) || Number.isNaN(p2)) {
            return;
        }
        updateMatchScore(match.id, p1, p2);
    };

    // winner highlighting once a result is in
    const decided = match.status !== 'UNDECIDED';
    const player1Won = match.status === 'PLAYER_1_WON';
    const player2Won = match.status === 'PLAYER_2_WON';

    const player1RowStyle = player1Won ? 'bg-green-500' : highlighted ? 'bg-yellow-500' : 'bg-blue-400';
    const player2RowStyle = player2Won ? 'bg-green-500' : highlighted ? 'bg-yellow-500' : 'bg-blue-400';

    return (
        <div className='absolute' style={{ left: `${x}px`, top: `${y}px` }}>
            <div className='bg-transparent p-2 flex flex-row gap-2'>
                {/* Match number */}
                <div className='flex items-center'>
                    <h3 className='text-center font-bold w-8'>{match.number}.</h3>
                </div>

                <div className='flex flex-col gap-2'>
                    {/* Player 1 */}
                    <div className={'flex flex-row justify-between items-center p-2 rounded-md w-52 gap-2 transition duration-200 ease-in-out ' + player1RowStyle}>
                        <div className='text-sm truncate w-0 flex-1'>{match.player1}</div>
                        <input
                            type='number'
                            min={0}
                            className='w-12 px-1 py-0.5 rounded bg-white text-slate-900 text-sm text-center'
                            value={player1Score}
                            onChange={(e) => handlePlayer1Change(e.target.value)}
                            title='Player 1 points'
                        />
                    </div>

                    {/* Player 2 */}
                    <div className={'flex flex-row justify-between items-center p-2 rounded-md w-52 gap-2 transition duration-200 ease-in-out ' + player2RowStyle}>
                        <div className='text-sm truncate w-0 flex-1'>{match.player2}</div>
                        <input
                            type='number'
                            min={0}
                            className='w-12 px-1 py-0.5 rounded bg-white text-slate-900 text-sm text-center'
                            value={player2Score}
                            onChange={(e) => handlePlayer2Change(e.target.value)}
                            title='Player 2 points'
                        />
                    </div>
                </div>

                {/* Save / Reset buttons */}
                <div className='flex flex-col justify-center gap-1'>
                    <button
                        className='flex items-center justify-center w-7 h-7 rounded transition duration-200 bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed'
                        onClick={handleSave}
                        disabled={!bothFilled}
                        title='Save scores'
                    >
                        <CheckIcon className='h-4 w-4' strokeWidth={3} />
                    </button>
                    {decided && (
                        <button
                            className='flex items-center justify-center w-7 h-7 rounded transition duration-200 bg-slate-600 text-white hover:bg-slate-700'
                            onClick={() => resetMatch(match.id)}
                            title='Reset result'
                        >
                            <ResetIcon className='h-4 w-4' strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
