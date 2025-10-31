import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import BracketInfoCard from './BracketInfoCard';
import { CURRENT_STATE } from './App';

interface BracketListProps {
    onBracketRemoved: () => void;
}

export default function BracketList({ onBracketRemoved }: BracketListProps) {
    const state = useContext(CURRENT_STATE);
    const { tournament, setBracketIndex = () => { }, setTournament = () => { } } = state || {};
    const navigate = useNavigate();

    if (!tournament) {
        return null;
    }

    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
            {tournament?.brackets.length ? (
                tournament.brackets.map((bracket, index) => (
                    <BracketInfoCard
                        key={index}
                        bracket={bracket}
                        onClick={async () => {
                            setBracketIndex(index);
                            await window.electron.saveKeyValue({ key: 'lastBracketIndex', value: index });
                            navigate('/bracket');
                        }}
                        onRemoveClick={async () => {
                            const newTournament = await window.electron.removeBracketFromTournament({
                                tournamentId: tournament.id,
                                bracketId: bracket.id
                            });
                            setTournament(newTournament);
                            onBracketRemoved();
                        }}
                    />
                ))
            ) : (
                <p className="text-gray-400 text-center italic">No brackets added yet.</p>
            )}
        </div>
    );
}
