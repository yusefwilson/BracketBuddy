import { DoubleEliminationBracket, SVGViewer, Match as MatchComponent } from '@replydev/react-tournament-brackets';
import { useWindowSize } from '@uidotdev/usehooks';
import { exampleData } from './example-data';

export default function BracketView() {

  const matches = exampleData;

  const { width, height } = useWindowSize();

  console.log('width', width);
  console.log('height', height);

  if (!width || !height) {
    return <div>Error with window size!</div>;
  }

  const finalWidth = Math.max(width - 50, 500);
  const finalHeight = Math.max(height - 100, 500);
  return (
    <DoubleEliminationBracket
      matches={matches}
      matchComponent={MatchComponent}
      svgWrapper={({ children, ...props }) => (
        <SVGViewer width={finalWidth} height={finalHeight} {...props}>
          {children}
        </SVGViewer>
      )}
    />
  );
}