import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';
import CompetitorInput from './CompetitorInput';

export default function MassCompetitorInput() {

    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { }, setBracketIndex = () => { }, } = state || {};
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

    const brackets = tournament.brackets;

    return (
        <>
            <ErrorToastContainer />
            <div className="flex flex-row p-2 w-full gap-2 flex-1 min-h-0 overflow-x-auto">
            {brackets.map((bracket, index) => (
                <div
                    key={bracket.id}
                    className="flex flex-col rounded-lg p-4 h-full bg-slate-500 transition [&:not(:has(:hover))]:hover:bg-slate-600 [&:not(:has(:hover))]:hover:cursor-pointer"
                    onClick={async (e) => {
                        // Only trigger if the click happened directly on this div, not a child
                        if (e.target !== e.currentTarget) return;

                        setBracketIndex(index);
                        const [, error] = await safeApiCall(
                            window.electron.saveKeyValue({ key: 'lastBracketIndex', value: index })
                        );

                        if (error) {
                            showError(error);
                            return;
                        }

                        navigate('/bracket');
                    }}
                >
                    <div className="flex justify-between items-center mb-3 flex-shrink-0 self-center">
                        <h2 className="text-md font-semibold text-white">
                            {bracket.gender} | {bracket.experienceLevel} | {bracket.hand}{' '}
                            {bracket.weightLimit !== 'Superheavyweight'
                                ? `(${bracket.weightLimit} lbs)`
                                : '(Superheavyweight)'}
                        </h2>
                    </div>

                    <div className="flex-1 min-h-0">
                        <CompetitorInput
                            competitors={bracket.competitorNames}
                            addCompetitor={(name) => handleAddCompetitor(bracket.id, name)}
                            removeCompetitor={(name) => handleRemoveCompetitor(bracket.id, name)}
                            randomizeCompetitors={() => handleRandomize(bracket.id)}
                        />
                    </div>
                </div>
            ))}
            </div>
        </>
    );
}