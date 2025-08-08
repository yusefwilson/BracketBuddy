import { DoubleEliminationBracket, Match as MatchView, SVGViewer, BracketData } from '@g-loot/react-tournament-brackets';
import { ReactNode } from 'react';

export default function BracketView({ matches }: { matches: BracketData }) {

  return (
    <DoubleEliminationBracket
      matches={matches}
      matchComponent={MatchView}
      svgWrapper={({ children, ...props }: { children: ReactNode;[key: string]: any }) => (
        <SVGViewer width={500} height={500} {...props}>
          {children}
        </SVGViewer>
      )}
    />
  );
}