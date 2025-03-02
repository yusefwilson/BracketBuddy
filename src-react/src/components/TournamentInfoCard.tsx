import Tournament from '../lib/Tournament'

export default function TournamentInfoCard({ tournament, onClick }: { tournament: Tournament, onClick: () => void }) {

    return (
        <div className='bg-slate-600 p-2 rounded-md gap-2' onClick={onClick}>
            <h1>{'Name: ' + tournament.name.toString()}</h1>
            <h1>{'Date: ' + tournament.date.toLocaleDateString('en-US')}</h1>
            <h1>{'Number of classes: ' + tournament.brackets.length.toString()}</h1>
        </div>
    )
}