import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';
import BracketCompetitorInput from './BracketCompetitorInput';

export default function BracketsAndCompetitors() {
    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { }, setBracketId = () => { } } = state || {};
    const navigate = useNavigate();
    const { showError, ErrorToastContainer } = useErrorToast();

    if (!tournament) {
        return <div>Loading tournament...</div>;
    }
    if (!tournament.id) {
        return <div>No tournament id</div>;
    }

    const handleAddCompetitor = async (bracketId: string, name: string) => {
        const [updatedTournament, error] = await safeApiCall(
            window.electron.addCompetitorToBracket({ tournamentId: tournament.id, bracketId, competitorName: name })
        );

        if (error) {
            showError(error);
            return;
        }

        if (updatedTournament) {
            setTournament(updatedTournament);
        }
    };

    const handleRemoveCompetitor = async (bracketId: string, name: string) => {
        const [updatedTournament, error] = await safeApiCall(
            window.electron.removeCompetitorFromBracket({ tournamentId: tournament.id, bracketId, competitorName: name })
        );

        if (error) {
            showError(error);
            return;
        }

        if (updatedTournament) {
            setTournament(updatedTournament);
        }
    };

    const handleRandomize = async (bracketId: string) => {
        const [updatedTournament, error] = await safeApiCall(
            window.electron.randomizeCompetitors({ tournamentId: tournament.id, bracketId })
        );

        if (error) {
            showError(error);
            return;
        }

        if (updatedTournament) {
            setTournament(updatedTournament);
        }
    };

    const handleRemoveBracket = async (bracketId: string) => {
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

    const brackets = tournament.brackets;

    return (
        <>
            <ErrorToastContainer />
            <div className="flex flex-row w-full gap-2 overflow-x-auto h-full">
                {brackets.map((bracket) => (
                    <BracketCompetitorInput
                        key={bracket.id}
                        bracket={bracket}
                        onAddCompetitor={handleAddCompetitor}
                        onRemoveCompetitor={handleRemoveCompetitor}
                        onRandomize={handleRandomize}
                        onRemoveBracket={handleRemoveBracket}
                        onBracketClick={handleBracketClick}
                    />
                ))}
            </div>
        </>
    );
}
