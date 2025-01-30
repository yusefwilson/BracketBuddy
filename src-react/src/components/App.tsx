import { Bracket, Round, Gender, Hand, AgeGroup } from '../types';
import BracketView from './BracketView';

export default function App() {

  const round1: Round = { winnerSide: [{ competitor0Name: 'John', competitor1Name: 'Jane', winner: 0 }, { competitor0Name: 'James', competitor1Name: 'Jerry', winner: 0 }] };
  const round2: Round = { winnerSide: [{ competitor0Name: 'John', competitor1Name: 'Jerry' }], loserSide: [{ competitor0Name: 'Jane', competitor1Name: 'James' }] };

  const bracket: Bracket = { ageGroup: 'Senior' as AgeGroup, hand: 'Right' as Hand, gender: 'Male' as Gender, rounds: [round1, round2], weightLimit: 176 };

  return (
    <div className='p-4'>
      <h1>This is a Vite/React/Typescript project working with Electron!</h1>
      <BracketView bracket={bracket} />
    </div>
  )
}