import Bracket from '../lib/Bracket';
import Tournament from '../lib/Tournament';
import RoundView from '../components/RoundView';
import { useContext, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';
import Match from '../lib/Match';

export default function BracketView() {

  // state
  const state = useContext(CURRENT_STATE);
  const { bracket, setBracket = () => { }, tournament, setTournament = () => { } } = state || {};

  // local state
  const [competitorNames, setCompetitorNames] = useState<string[]>(bracket?.competitorNames || []);
  const [lines, setLines] = useState<{ x1: number, x2: number, y1: number, y2: number, color: string }[]>([]);
  const matchRefs = useRef(new Map<number, HTMLDivElement>());
  const matchRoundTypes = useRef(new Map<number, 'initialWinner' | 'initialLoser' | 'winner' | 'loserEven' | 'loserOdd'>());
  const matchToRoundRefs = useRef(new Map<number, HTMLDivElement>());

  const updateMatch = (matchId: number, winner: number): void => {

    // find winner
    const matchToBeUpdated = bracket?.findMatchById(matchId);

    // update winner
    matchToBeUpdated?.updateWinner(winner);

    // hacky way to trigger refresh, and also to trigger tournament save in App useEffect
    setBracket(bracket?.markUpdated() as Bracket);
    setTournament(tournament?.markUpdated() as Tournament);
  }

  useEffect(() => {
    // every time the bracket members are updated, update the bracket
    if (bracket) {
      console.log('updating competitornames from bracketview');
      bracket.setCompetitorNames(competitorNames);
      setBracket(bracket.markUpdated());
    }
  }, [competitorNames]);

  // draw lines between matches
  useEffect(() => {
    const newLines: { x1: number, x2: number, y1: number, y2: number, color: string }[] = [];

    // for every round
    bracket?.winnersBracket.concat(bracket.losersBracket).forEach((round) => {

      // for every match
      round.matches.forEach((match) => {

        const matchElem = matchRefs.current.get(match.id);
        if (!matchElem) return;

        console.log('about to operate on match ', match.id, ' with elem ', matchElem);

        // 
        const matchRect = matchElem.getBoundingClientRect();
        const centerX = matchRect.left + matchRect.width / 2;
        const centerY = matchRect.top + matchRect.height / 2;

        const addLine = (childMatch: Match | undefined, color: string) => {
          if (!childMatch) return;
          const childElem = matchRefs.current.get(childMatch.id);
          if (!childElem) return;

          const childRect = childElem.getBoundingClientRect();
          newLines.push({
            x1: centerX,
            y1: centerY,
            x2: childRect.left + childRect.width / 2,
            y2: childRect.top + childRect.height / 2,
            color,
          });
        };

        addLine(match.winnerChild, "orange");
        addLine(match.loserChild, "powderblue");
      });
    });

    setLines(newLines);
  }, [bracket]);

  // layout pass
  useLayoutEffect(() => {
    if (!bracket) return;

    const raf = requestAnimationFrame(() => { layoutMatches(); })

    const layoutMatches = () => {
      // merge all matches into a single array
      const allMatches = [...(bracket.winnersBracket.flatMap(round => round.matches) || []), ...(bracket.losersBracket.flatMap(round => round.matches) || [])];

      // -------------------------------------------------------------------
      // 1. LAYOUT: First Normal Winner Round — Even Vertical Spacing
      // -------------------------------------------------------------------

      //Find the first round in the winners bracket that is not an initial round
      const firstNormalWinnerRound = bracket.winnersBracket.find(
        round => round.matches.length > 0 && matchRoundTypes.current.get(round.matches[0].id) === 'winner'
      );

      if (firstNormalWinnerRound) {
        // Get the DOM elements for each match in the first normal round
        const matchElems: [number, HTMLDivElement][] = [];

        for (const match of allMatches) {
          const elem = matchRefs.current.get(match.id);
          if (elem) {
            matchElems.push([match.id, elem]);
          }
        }

        if (matchElems.length > 0) {
          const matchHeight = matchElems[0][1].offsetHeight;  // Assume uniform height
          const gap = 16;                                  // Desired spacing between matches in pixels

          // Compute the total height needed to stack all matches with the desired gap
          const totalBlockHeight = matchElems.length * matchHeight + (matchElems.length - 1) * gap;
          console.log('matchToRoundRefs', matchToRoundRefs.current);
          console.log('matchElems', matchElems);
          // Compute the vertical starting point so the block is vertically centered
          const startY = (matchToRoundRefs.current.get(matchElems[0][0]).offsetHeight - totalBlockHeight) / 2;

          // Position each match element using absolute top placement
          matchElems.forEach((elem, i) => {
            elem[1].style.position = 'absolute';                        // Required for manual top/y placement
            elem[1].style.top = `${startY + i * (matchHeight + gap)}px`; // Even vertical spacing
            elem[1].style.transform = '';                               // Clear any previous transform
          });
        }
      }

      // -------------------------------------------------------------------
      // 2. LAYOUT: Initial Winner Matches — Align with Children (Staggered)
      // -------------------------------------------------------------------

      for (const match of allMatches) {
        // Only handle matches marked as 'initialWinner'
        if (matchRoundTypes.current.get(match.id) !== 'initialWinner') continue;

        const matchElem = matchRefs.current.get(match.id);     // Parent match element
        const child = match.winnerChild;                       // The child match (first round)
        const childElem = child ? matchRefs.current.get(child.id) : null;


        if (!matchElem || !childElem) continue; // Skip if either element is missing

        // Get screen-relative position of both elements
        const childRect = childElem.getBoundingClientRect();
        const parentRect = matchElem.getBoundingClientRect();

        console.log('child top:', childRect.top, 'parent top:', parentRect.top);

        // Target Y: position parent so its center aligns with the bottom quarter of child
        const targetY = childRect.top + childRect.height * 0.75;

        // Difference between where the parent is and where we want it to be
        const deltaY = targetY - (parentRect.top + parentRect.height / 2);

        // Apply vertical shift via transform (does not affect layout flow)
        matchElem.style.transform = `translateY(${deltaY}px)`;
      }
    }
  });

  console.log('about to render bracket ', bracket);

  return (
    <div className='rounded-md bg-orange-400 p-2 flex flex-row gap-4 h-full'>

      <div className='bg-pink-500 flex flex-col p-2'>
        <CompetitorInput competitors={competitorNames} setCompetitors={setCompetitorNames} />
      </div>

      <div className='bg-blue-400 p-2 rounded-md flex flex-col gap-4 h-full w-full'>

        <div className='rounded-md bg-green-700 flex flex-row p-2 gap-4 overflow-x-auto'>
          {bracket?.winnersBracket.map((round, i) => {
            let roundType: 'initialWinner' | 'initialLoser' | 'winner' | 'loserEven' | 'loserOdd' = i === 0 ? 'initialWinner' : 'winner';
            for (let match of round.matches) {
              matchRoundTypes.current.set(match.id, roundType);
            }
            return <RoundView key={i} round={round} updateMatch={updateMatch} roundName={roundType} matchRefs={matchRefs} matchToRoundRefs={matchToRoundRefs} />
          })}
        </div>

        <div className='rounded-md bg-red-700 flex flex-row p-2 gap-4 overflow-x-auto'>
          {bracket?.losersBracket.map((round, i) => {
            let roundType: 'initialWinner' | 'initialLoser' | 'winner' | 'loserEven' | 'loserOdd' = i === 0 ? 'initialLoser' : (i % 2 === 0 ? 'loserEven' : 'loserOdd');
            for (let match of round.matches) {
              matchRoundTypes.current.set(match.id, roundType);
            }
            return <RoundView key={i} round={round} updateMatch={updateMatch} roundName={roundType} matchRefs={matchRefs} matchToRoundRefs={matchToRoundRefs} />
          })}
        </div>

      </div>

      {/* SVG Lines */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">

        {lines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color}
            strokeWidth="2"
          />
        ))}
      </svg>

    </div>
  )
}