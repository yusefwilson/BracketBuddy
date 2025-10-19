import { useState, useContext } from 'react';
import CompetitorInput from './CompetitorInput';
import { CURRENT_STATE } from './App';

export default function MassCompetitorInput() {

    const state = useContext(CURRENT_STATE);
    const { tournament, setTournament = () => { } } = state || {};

    if (!tournament) {
        return <div>Loading tournament...</div>;
    }
    if (!tournament.id) {
        return <div>No tournament id</div>;
    }

    const [loadingBracketId, setLoadingBracketId] = useState<string | null>(null);

    const handleAddCompetitor = async (bracketId: string, name: string) => {
        try {
            setLoadingBracketId(bracketId);
            const updatedTournament = await window.electron.addCompetitorToBracket({ tournamentId: tournament.id, bracketId, competitorName: name });
            setTournament(updatedTournament);
        } finally {
            setLoadingBracketId(null);
        }
    };

    const handleRemoveCompetitor = async (bracketId: string, name: string) => {
        try {
            setLoadingBracketId(bracketId);
            const updatedTournament = await window.electron.removeCompetitorFromBracket({ tournamentId: tournament.id, bracketId, competitorName: name });
            setTournament(updatedTournament);
        } finally {
            setLoadingBracketId(null);
        }
    };

    const handleRandomize = async (bracketId: string) => {
        try {
            setLoadingBracketId(bracketId);
            const updatedTournament = await window.electron.randomizeCompetitors({ tournamentId: tournament.id, bracketId });
            setTournament(updatedTournament);
        } finally {
            setLoadingBracketId(null);
        }
    };

    const brackets = tournament.brackets;

    return (
        <div className="flex flex-row p-2 h-full bg-purple-400 w-full gap-2">
            {brackets.map((bracket) => (
                <div
                    key={bracket.id}
                    className="flex flex-col border border-gray-600 rounded-lg p-4 bg-yellow-800 h-full"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold text-white">
                            {bracket.gender} / {bracket.experienceLevel} / {bracket.hand}{' '}
                            {bracket.weightLimit !== 'Superheavyweight'
                                ? `(${bracket.weightLimit} lbs)`
                                : '(Superheavyweight)'}
                        </h2>
                        {loadingBracketId === bracket.id && (
                            <span className="text-sm text-gray-400 animate-pulse">
                                Updating...
                            </span>
                        )}
                    </div>

                    <div className="h-full">
                        <CompetitorInput
                            competitors={bracket.competitorNames}
                            addCompetitor={(name) => handleAddCompetitor(bracket.id, name)}
                            removeCompetitor={(name) => handleRemoveCompetitor(bracket.id, name)}
                            randomizeCompetitors={() => handleRandomize(bracket.id)}
                        />
                    </div>

                    {/* <div className="h-full bg-pink-300">
                        FAKE COMPETITOR INPUT
                    </div> */}
                </div>
            ))}
        </div>
    );
}