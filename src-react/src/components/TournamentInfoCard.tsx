import Tournament from "../lib/Tournament"

export default function TournamentInfoCard({ tournament }: { tournament: Tournament }) {

    return (
        <div className='bg-slate-600 p-2 rounded-md gap-2'>
            <h1>{'Name: ' + tournament.name.toString()}</h1>
            <h1>{'Date: ' + tournament.date.toString()}</h1>
            <h1>{'Number of classes: ' + tournament.brackets.length.toString()}</h1>
        </div>
    )
}