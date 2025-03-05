import { useState } from 'react'

import Tournament from '../lib/Tournament'
import RemoveTournamentModal from './RemoveTournamentModal'

export default function TournamentInfoCard({ tournament, onClick, onRemoveClick }: { tournament: Tournament, onClick: () => void, onRemoveClick: () => void }) {

    const [removeTournamentModalOpen, setRemoveTournamentModalOpen] = useState(false);

    return (
        <div className='bg-slate-600 p-2 rounded-md gap-2 relative' onClick={onClick}>

            {/* Delete Button (X) */}
            <button className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md' onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation(); // Prevents the click from reaching the parent div
                console.log('Delete button clicked and event propagation stopped');
                onRemoveClick();
            }}>X</button>

            {/* Tournament Info */}
            <h1>{'Name: ' + tournament.name.toString()}</h1>
            <h1>{'Date: ' + tournament.date.toLocaleDateString('en-US')}</h1>
            <h1>{'Number of classes: ' + tournament.brackets.length.toString()}</h1>


            {removeTournamentModalOpen && <RemoveTournamentModal setRemoveTournamentModalOpen={setRemoveTournamentModalOpen} tournamentToDelete={tournament} />}
        </div>
    )
}