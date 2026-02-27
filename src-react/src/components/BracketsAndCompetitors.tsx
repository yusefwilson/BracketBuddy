import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';
import { useSortableList, SortableList } from '../hooks/useSortableList';

import { CURRENT_STATE } from './App';

import { HiPlus } from 'react-icons/hi2';
import { CgArrowUp } from 'react-icons/cg';
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
            console.log('updatedTournament', updatedTournament);
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

    const { items: brackets, handleDragEnd } = useSortableList(tournament.brackets, 'bracketOrder');

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
            <div className="flex flex-row w-full gap-4 overflow-x-auto h-full pb-2">
                <SortableList
                    items={brackets}
                    onDragEnd={handleDragEnd}
                    renderItem={(bracket) => (
                        <BracketCompetitorInput
                            key={bracket.id}
                            bracket={bracket}
                            onAddCompetitor={handleAddCompetitor}
                            onRemoveCompetitor={handleRemoveCompetitor}
                            onRandomize={handleRandomize}
                            onRemoveBracket={handleRemoveBracket}
                            onBracketClick={handleBracketClick}
                        />
                    )}
                />
            </div>
        </>
    );
}
