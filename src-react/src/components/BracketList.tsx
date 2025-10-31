import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import { CURRENT_STATE } from './App';
import BracketInfoCard from './BracketInfoCard';

interface BracketListProps {
    onBracketRemoved: () => void;
}

export default function BracketList({ onBracketRemoved }: BracketListProps) {
    const state = useContext(CURRENT_STATE);
    const { tournament, setBracketIndex = () => { }, setTournament = () => { } } = state || {};
    const navigate = useNavigate();
    const { showError, ErrorToastContainer } = useErrorToast();

    if (!tournament) {
        return null;
    }

    return (
        <>
            <ErrorToastContainer />
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
                {tournament?.brackets.length ? (
                    tournament.brackets.map((bracket, index) => (
                        <BracketInfoCard
                            key={index}
                            bracket={bracket}
                            onClick={async () => {
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
                            onRemoveClick={async () => {
                                const [data, error] = await safeApiCall(
                                    window.electron.removeBracketFromTournament({
                                        tournamentId: tournament.id,
                                        bracketId: bracket.id
                                    })
                                );

                                if (error) {
                                    showError(error);
                                    return;
                                }

                                if (data) {
                                    setTournament(data);
                                    onBracketRemoved();
                                }
                            }}
                        />
                    ))
                ) : (
                    <p className="text-gray-400 text-center italic">No brackets added yet.</p>
                )}
            </div>
        </>
    );
}
