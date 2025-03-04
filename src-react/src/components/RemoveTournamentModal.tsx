import Tournament from "../lib/Tournament";

export default function RemoveTournamentModal({ setRemoveTournamentModalOpen, tournamentToDelete }:
    { setRemoveTournamentModalOpen: (open: boolean) => void, tournamentToDelete: Tournament }) {

    return (
        <div className='bg-purple-600 flex flex-col p-2 rounded-md gap-2'>

            {/* Warning */}
            <h1>Are you sure you want to delete this tournament? This action cannot be undone.</h1>

            {/* Confirm Button */}
            <button className='bg-yellow-500 p-4 rounded-md flex-shrink' onClick={() => { tournamentToDelete.delete(); setRemoveTournamentModalOpen(false); }}>Confirm</button>

            {/* Close Button (X) */}
            <button className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md' onClick={() => setRemoveTournamentModalOpen(false)}>X</button>

        </div>
    );
}