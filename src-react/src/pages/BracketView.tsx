import { DoubleEliminationBracket, SVGViewer, Match as MatchComponent, MatchComponentProps, MatchType } from '@replydev/react-tournament-brackets';
import { useWindowSize } from '@uidotdev/usehooks';
import { useState, useContext } from 'react';

import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';

export default function BracketView() {

  const state = useContext(CURRENT_STATE);
  const { bracket, tournament, setTournament = () => { } } = state || {};

  if (!bracket) {
    return <div>Bracket not found</div>;
  }

  const onMatchClick = async (args: { match: MatchType, topWon: boolean, bottomWon: boolean, event: SVGViewer<HTMLAnchorElement, MouseEvent> }) => {

    console.log('onMatchClick args: ', args);

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (typeof args.match.id !== 'string') {
      throw new Error('Match id is not a string');
    }

    const newTournament = await window.electron.enterResult(tournament.id, bracket.id, args.match.id, args.topWon);
    setTournament(newTournament);
  };

  const WrappedMatchComponent = (props: MatchComponentProps) => {
    return <MatchComponent {...props} onMatchClick={onMatchClick} />;
  };

  const matches = bracket.renderableBracket;
  console.log('matches: ', matches);

  const { width, height } = useWindowSize();
  const [competitors, setCompetitors] = useState<string[]>([]);

  if (!width || !height) {
    return <div>Error with window size!</div>;
  }

  const finalWidth = Math.max(width - 50, 500);
  const finalHeight = Math.max(height - 100, 500);
  return (
    <div className='flex flex-row'>
      <CompetitorInput competitors={competitors} setCompetitors={setCompetitors} />
      <DoubleEliminationBracket
        matches={matches}
        matchComponent={WrappedMatchComponent}
        svgWrapper={({ children, ...props }) => (
          <SVGViewer width={finalWidth} height={finalHeight} {...props}>
            {children}
          </SVGViewer>
        )}
      />
    </div>

  );
}