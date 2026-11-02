import { useContext } from 'react';
import { CURRENT_STATE } from '../components/App';
import { DoubleEliminationBracketDTO } from '../../../src-shared/DoubleEliminationBracketDTO';
import { RoundRobinBracketDTO } from '../../../src-shared/RoundRobinBracketDTO';
import DoubleEliminationBracketView from './DoubleEliminationBracketView';
import RoundRobinBracketView from './RoundRobinBracketView';

export default function BracketView() {
  const state = useContext(CURRENT_STATE);
  const { bracketId, tournament } = state || {};

  if (!tournament || !bracketId) {
    return (
      <div className='h-full flex items-center justify-center text-white'>
        Loading bracket...
      </div>
    );
  }

  const bracket = tournament.brackets.find(b => b.id === bracketId);
  if (!bracket) {
    return (
      <div className='h-full flex items-center justify-center text-white'>
        Bracket not found
      </div>
    );
  }

  switch (bracket.type) {
    case 'DoubleEliminationBracket':
      return <DoubleEliminationBracketView bracket={bracket as DoubleEliminationBracketDTO} />;
    case 'RoundRobinBracket':
      return <RoundRobinBracketView bracket={bracket as RoundRobinBracketDTO} />;
    default:
      return <div>Bracket type not found</div>;

  }

}