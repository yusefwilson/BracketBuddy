import Bracket from '../lib/Bracket';
import Tournament from '../lib/Tournament';
import RoundView from '../components/RoundView';
import { useContext, useEffect, useState, useRef } from 'react';
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
  const matchRefs = useRef(new Map());

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
            return <RoundView key={i} round={round} updateMatch={updateMatch} matchRefs={matchRefs} roundType={roundType} />
          })}
        </div>

        <div className='rounded-md bg-red-700 flex flex-row p-2 gap-4 overflow-x-auto'>
          {bracket?.losersBracket.map((round, i) => {
            let roundType: 'initialWinner' | 'initialLoser' | 'winner' | 'loserEven' | 'loserOdd' = i === 0 ? 'initialLoser' : (i % 2 === 0 ? 'loserEven' : 'loserOdd');
            return <RoundView key={i} round={round} updateMatch={updateMatch} matchRefs={matchRefs} roundType={roundType} />
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