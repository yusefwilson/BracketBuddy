import { DoubleEliminationBracket, Match as MatchComponent, SVGViewer } from '@g-loot/react-tournament-brackets';
import { ReactNode } from 'react';

export default function BracketView() {

  const matches = { upper: [], lower: [] };
  return (
    <DoubleEliminationBracket
      matches={matches}
      matchComponent={MatchComponent}
      svgWrapper={({ children, ...props }: { children: ReactNode;[key: string]: any }) => (
        <SVGViewer width={500} height={500} {...props}>
          {children}
        </SVGViewer>
      )}
    />
  );
}