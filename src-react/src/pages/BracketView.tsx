import { DoubleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';
export default function BracketView() {

  return (
    <DoubleEliminationBracket
      matches={matches}
      matchComponent={Match}
      svgWrapper={({ children, ...props }) => (
        <SVGViewer width={500} height={500} {...props}>
          {children}
        </SVGViewer>
      )}
    />
  );
}