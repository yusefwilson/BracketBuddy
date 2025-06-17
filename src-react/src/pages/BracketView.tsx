import { useContext, useEffect, useState } from 'react';
import { CURRENT_STATE } from '../components/App';

import CompetitorInput from '../components/CompetitorInput';
import MatchView from '../components/MatchView';
import YGuideLines from '../components/YGuideLines';

import Bracket from '../lib/Bracket';
import Tournament from '../lib/Tournament';

import {
  MatchAndPosition, isPowerOfTwo,
  calculateInitialRoundsMatchPositions,
  calculateMatchPositionsFromParentAverages,
  calculateMatchPositionsFromParentStaggered,
  WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET, LOSER_HORIZONTAL_OFFSET, LOSER_VERTICAL_OFFSET, HORIZONTAL_GAP
} from '../lib/utils';

export default function BracketView() {

  // state
  const state = useContext(CURRENT_STATE);
  const { bracket, setBracket = () => { }, tournament, setTournament = () => { } } = state || {};

  // local state
  const [competitorNames, setCompetitorNames] = useState<string[]>(bracket?.competitorNames || []);

  const [currentMatchId, setCurrentMatchId] = useState<number>(1);

  // update the winner of a match (this calls a recursive method on the Match class which updates all dependent matches)
  const updateMatch = (matchId: number, winner: number): void => {

    // find winner
    const matchToBeUpdated = bracket?.findMatchById(matchId);

    // update winner
    matchToBeUpdated?.updateWinner(winner);

    if (matchId === currentMatchId - 1 && winner === -1) {
      setCurrentMatchId(currentMatchId - 1);
    }

    if (matchId === currentMatchId) {
      setCurrentMatchId(currentMatchId + 1);
    }

    // hacky way to trigger refresh, and also to trigger tournament save in App useEffect
    setBracket(bracket?.markUpdated() as Bracket);
    setTournament(tournament?.markUpdated() as Tournament);
  }

  // update the competitor names in the bracket whenever they change, which will also update the matches
  useEffect(() => {
    // every time the bracket members are updated, update the bracket
    if (bracket) {
      console.log('updating competitornames from bracketview');
      bracket.setCompetitorNames(competitorNames);
      setBracket(bracket.markUpdated());
    }
  }, [competitorNames]);

  // **** RENDER WINNERS BRACKET ****

  let winnerMatches, loserMatches, WINNERS_BOTTOM = 0, LAST_WINNER_Y = 0, WINNERS_RIGHTMOST = 0;

  if (competitorNames.length >= 2) {
    // {match, x, y}[][]
    const winnerRounds = calculateInitialRoundsMatchPositions(bracket as Bracket, 'winner', WINNER_HORIZONTAL_OFFSET, WINNER_VERTICAL_OFFSET);
    const initialWinnerMatches = winnerRounds.slice();

    // iteratively calculate the positions of the rest of the matches by referencing and taking averages of the heights of their parents
    for (let roundIndex = isPowerOfTwo(competitorNames.length) ? 1 : 2; roundIndex < (bracket?.winnersBracket.length || 0); roundIndex++) {
      const previousRound = winnerRounds[roundIndex - 1];

      if (!previousRound || previousRound.length === 0) {
        console.warn(`No matches found for round index ${roundIndex - 1}`);
        continue;
      }

      let nextRound = calculateMatchPositionsFromParentAverages(previousRound, bracket?.winnersBracket[roundIndex].matches || [], roundIndex);

      winnerRounds.push(nextRound);
    }

    // flatten the winnerMatches array
    winnerMatches = winnerRounds.flat();

    // find max y value (lowest point) to use as reference point for losers bracket
    WINNERS_BOTTOM = Math.max(...winnerMatches.map(m => m?.y || 0)) + 100;

    // find max x value (rightmost point) to use as reference point for the finals matches
    WINNERS_RIGHTMOST = Math.max(...winnerMatches.map(m => m?.x || 0));
    LAST_WINNER_Y = winnerMatches[winnerMatches.length - 1]?.y || 0;

    // **** RENDER LOSERS BRACKET ****

    // {match, x, y}[][]
    const loserRounds = calculateInitialRoundsMatchPositions(bracket as Bracket, 'loser', LOSER_HORIZONTAL_OFFSET, WINNERS_BOTTOM + LOSER_VERTICAL_OFFSET);
    const initialLoserRounds = loserRounds.slice();

    // figure out whether match numbers stay constant or halve on even rounds based on index-1 match numbers
    let halving: boolean;

    if (initialWinnerMatches[initialWinnerMatches.length - 1]?.length === initialLoserRounds[initialLoserRounds.length - 1]?.length || isPowerOfTwo(competitorNames.length)) {
      halving = true; // even rounds halve, odd rounds stay constant
    }
    else {
      halving = false; // even rounds stay constant, odd rounds halve
    }

    for (let roundIndex = loserRounds.length === 1 ? 1 : 2; roundIndex < (bracket?.losersBracket.length || 0); roundIndex++) {
      const previousRoundMatches = loserRounds[roundIndex - 1];

      // if previous round somehow didn't exist or is empty
      if (!previousRoundMatches || previousRoundMatches.length === 0) {
        console.warn(`No matches found for round index ${roundIndex - 1}`);
        continue;
      }

      let nextRound;

      console.log('about to calculate round index: ', roundIndex, ' with halving: ', halving);
      console.log('previousRoundMatches: ', previousRoundMatches, ' and matches: ', bracket?.losersBracket[roundIndex].matches);

      if (halving) {
        nextRound = calculateMatchPositionsFromParentAverages(previousRoundMatches, bracket?.losersBracket[roundIndex].matches || [], roundIndex);
      }

      else {
        nextRound = calculateMatchPositionsFromParentStaggered(previousRoundMatches, bracket?.losersBracket[roundIndex].matches || [], roundIndex);
      }

      loserRounds.push(nextRound);

      halving = !halving; // toggle halving for next round
    }

    loserMatches = loserRounds.flat();
  }

  // **** RENDER FINALS ****

  const final = { match: bracket?.final, x: WINNERS_RIGHTMOST + HORIZONTAL_GAP, y: LAST_WINNER_Y };
  const finalRematch = { match: bracket?.finalRematch, x: WINNERS_RIGHTMOST + 2 * HORIZONTAL_GAP, y: LAST_WINNER_Y };

  console.log('about to render bracket ', bracket);
  return (
    <div className='rounded-md bg-orange-400 p-2 flex flex-row gap-4 h-full max-h-[92%]'>

      <div className='bg-gray-400 flex flex-col p-2 rounded-md'>
        <CompetitorInput competitors={competitorNames} setCompetitors={setCompetitorNames} />
      </div>

      {/* <Bracket display */}
      <div className='bg-gray-400 rounded-md flex flex-col gap-4 h-full w-full relative overflow-auto'>

        {
          competitorNames.length < 2 ?

            <div className='text-center text-white text-lg font-bold p-4'>
              Not enough competitors added yet. Please add competitors to view the bracket.
            </div>

            :

            <div>

              {/* Y-level guide lines */}
              <YGuideLines yLevels={[50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900]} />

              {winnerMatches?.map(element => {
                let { match, x, y } = element as MatchAndPosition;
                //console.log('about to render WINNER MATCHVIEW with x: ', x, ' and y: ', y);
                return <MatchView match={match} updateMatch={updateMatch} x={x} y={y} currentMatchId={currentMatchId} />
              })}

              {/* Winner/loser line separator */}
              <div
                className='absolute left-0 w-full border-t border-red-400 text-xs text-white'
                style={{ top: WINNERS_BOTTOM }}
              />

              {/* Vertical line separator */}
              <div
                className='absolute top-0 h-full border-l border-red-400 text-xs text-white'
                style={{ left: WINNERS_RIGHTMOST + 200 }}
              />

              {loserMatches?.map(element => {
                //console.log('about to render ELEMENT: ', element)
                if (!element) { return null; }
                let { match, x, y } = element as MatchAndPosition;
                //console.log('about to render LOSER MATCHVIEW with x: ', x, ' and y: ', y);
                return <MatchView match={match} updateMatch={updateMatch} x={x} y={y} currentMatchId={currentMatchId} />
              })}

              {/* Final match */}
              {final.match && <MatchView match={final.match} updateMatch={updateMatch} x={final.x} y={final.y} currentMatchId={currentMatchId} />}
              {/* Final rematch */}
              {finalRematch.match && <MatchView match={finalRematch.match} updateMatch={updateMatch} x={finalRematch.x} y={finalRematch.y} currentMatchId={currentMatchId} />}

            </div>

        }

      </div>
    </div>
  )
}