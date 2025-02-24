import Tournament from '../lib/Tournament';
import BracketInfoCard from '../components/BracketInfoCard';

export default function TournamentView({ tournament }: { tournament: Tournament }) {

  return (
    <div className='bg-slate-600 p-2 rounded-md'>
      <h1>{'Tournament name: ' + tournament.name}</h1>
      <h1>{'Tournament date: ' + tournament.date.toDateString()}</h1>
      {tournament.brackets.map((bracket, i) => <BracketInfoCard key={i} bracket={bracket} />)}
    </div>
  )
}