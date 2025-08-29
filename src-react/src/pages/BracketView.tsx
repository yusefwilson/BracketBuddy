import { DoubleEliminationBracket, SVGViewer, Match as MatchComponent } from '@replydev/react-tournament-brackets';
import { useWindowSize } from '@uidotdev/usehooks';
import { useState, useContext } from 'react';

import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';

export default function BracketView() {

  const state = useContext(CURRENT_STATE);
  const { bracket, setTournament = () => { } } = state || {};

  if (!bracket) {
    return <div>Bracket not found</div>;
  }

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
        matchComponent={MatchComponent}
        svgWrapper={({ children, ...props }) => (
          <SVGViewer width={finalWidth} height={finalHeight} {...props}>
            {children}
          </SVGViewer>
        )}
      />
    </div>

  );
}