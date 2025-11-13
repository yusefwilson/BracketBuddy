import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';
import BracketInfoCard from './BracketInfoCard';

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
                <div className="flex items-center justify-center h-full text-gray-400">
                    No brackets yet. Click "Add Brackets" to get started.
                </div>
            </>
        );
    }

    return (
        <>
            <ErrorToastContainer />
            <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto">
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
