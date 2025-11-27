import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';
import BracketInfoCard from './BracketInfoCard';
import { HiPlus } from 'react-icons/hi2';
import { CgArrowUp } from 'react-icons/cg';

export default function BracketList() {
    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { }, setBracketId = () => { } } = state || {};
    const navigate = useNavigate();
    const { showError, ErrorToastContainer } = useErrorToast();

    if (!tournament) {
        return <div>Loading tournament...</div>;
    }

    const handleBracketClick = async (bracketId: string) => {
        setBracketId(bracketId);
        const [, error] = await safeApiCall(
            window.electron.saveKeyValue({ key: 'lastBracketId', value: bracketId })
        );

        if (error) {
            showError(error);
            return;
        }

        navigate('/bracket');
    };

    const handleDeleteBracket = async (bracketId: string) => {
        const [updatedTournament, error] = await safeApiCall(
            window.electron.removeBracketFromTournament({ tournamentId: tournament.id, bracketId })
        );

        if (error) {
            showError(error);
            return;
        }

        if (updatedTournament) {
            setTournament(updatedTournament);
        }
    };

    const brackets = tournament.brackets;

    if (brackets.length === 0) {
        return (
            <>
                <ErrorToastContainer />
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                    <div className="text-lg">No classes created yet</div>
                    <div className="flex flex-row items-center gap-2 justify-center">
                        <span>Click the</span>
                        <span className="bg-blue-500 text-white p-3 rounded-md">
                            <HiPlus className="h-5 w-5" />
                        </span>
                        <span>button above to create your first class</span>
                        <CgArrowUp className="h-8 w-8 text-white" />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <ErrorToastContainer />
            <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto overflow-auto">
                {brackets.map((bracket) => (
                    <BracketInfoCard
                        key={bracket.id}
                        bracket={bracket}
                        onClick={handleBracketClick}
                        onDelete={handleDeleteBracket}
                    />
                ))}
            </div>
        </>
    );
}
