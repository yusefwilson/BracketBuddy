import { useContext, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';
import MatchView from '../components/MatchView';
import FinalPlacings from '../components/FinalPlacings';
import BracketHotSwapBar from '../components/BracketHotSwapBar';
import { calculateAllMatchPositions } from '../../../src-shared/utils';

export default function BracketView() {
  const state = useContext(CURRENT_STATE);
  const { bracketIndex, tournament, setTournament = () => { }, setBracketIndex = () => { } } = state || {};
  const [finalRematchJustSpawned, setFinalRematchJustSpawned] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (finalRematchJustSpawned) {
      containerRef.current?.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [finalRematchJustSpawned]);

  if (!tournament || bracketIndex === null || bracketIndex === undefined) {
    return (
      <div className='h-full flex items-center justify-center text-white'>
        Loading bracket...
      </div>
    );
  }

  const bracket = tournament.brackets[bracketIndex];
  if (!bracket) {
    return (
      <div className='h-full flex items-center justify-center text-white'>
        Bracket not found
      </div>
    );
  }

  const updateMatch = async (matchId: string, winner: number): Promise<void> => {
    const newTournament = await window.electron.enterResult({
      tournamentId: bracket.tournamentId,
      bracketId: bracket.id,
      matchId: matchId.toString(),
      winner
    });

    const finalRematchInExistenceAfter = newTournament.brackets[bracketIndex].finalRematchNeeded;
    setFinalRematchJustSpawned(!bracket.finalRematchNeeded && finalRematchInExistenceAfter);
    setTournament(newTournament);
  };

  const { winnerMatches, loserMatches, final, finalRematch } = calculateAllMatchPositions(bracket);

  return (
    <div className='flex flex-col h-full gap-4 p-8 bg-slate-800 shadow-inner'>

      {/* Toggle Button */}
      <button
        onClick={() => setControlsOpen(!controlsOpen)}
        className='absolute left-4 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md transition'
        title={controlsOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {controlsOpen ? <ChevronLeftIcon className='h-4 w-4' strokeWidth={4} /> : <ChevronRightIcon className='h-4 w-4' strokeWidth={4} />}
      </button>

      {/* Top: Controls + Bracket Display */}
      <div className='flex flex-1 gap-6 relative overflow-hidden'>

        {/* Controls Panel */}
        <div
          className={`flex flex-col bg-slate-700 rounded-lg p-4 shadow-md gap-4 items-center
            ${controlsOpen ? '' : 'w-0 opacity-0 h-0'}`}
        >
          <p className='text-lg font-bold'>
            {bracket.gender + ' | ' + bracket.hand + ' | ' + bracket.experienceLevel + ' | ' + bracket.weightLimit}
          </p>

          <h2 className='text-white text-lg font-semibold text-center'>Competitors</h2>

          <div className='h-64'>
            <CompetitorInput
              competitors={bracket.competitorNames ?? []}
              addCompetitor={async (name) => {
                const newTournament = await window.electron.addCompetitorToBracket({
                  tournamentId: bracket.tournamentId,
                  bracketId: bracket.id,
                  competitorName: name
                });
                setTournament(newTournament);
              }}
              removeCompetitor={async (name) => {
                const newTournament = await window.electron.removeCompetitorFromBracket({
                  tournamentId: bracket.tournamentId,
                  bracketId: bracket.id,
                  competitorName: name
                });
                setTournament(newTournament);
              }}
              randomizeCompetitors={async () => {
                const newTournament = await window.electron.randomizeCompetitors({
                  tournamentId: bracket.tournamentId,
                  bracketId: bracket.id
                });
                setTournament(newTournament);
              }}
            />
          </div>

          <FinalPlacings first={bracket.firstPlace} second={bracket.secondPlace} third={bracket.thirdPlace} />
        </div>

        {/* Bracket Display */}
        <div className='bg-slate-700 rounded-lg p-4 shadow-md relative overflow-auto flex-1' ref={containerRef}>
          {bracket.competitorNames && bracket.competitorNames.length < 2 ? (
            <div className='text-white text-center font-semibold text-lg py-12'>
              Not enough competitors yet.
              <br />
              Add at least two to begin the bracket.
            </div>
          ) : (
            <>
              {winnerMatches?.map(({ match, x, y }) => (
                <MatchView match={match} updateMatch={updateMatch} x={x} y={y} currentMatchId={bracket.currentMatchNumber} />
              ))}
              {loserMatches?.map(({ match, x, y }) => (
                <MatchView match={match} updateMatch={updateMatch} x={x} y={y} currentMatchId={bracket.currentMatchNumber} />
              ))}
              {final.match && (
                <MatchView match={final.match} updateMatch={updateMatch} x={final.x} y={final.y} currentMatchId={bracket.currentMatchNumber} />
              )}
              {finalRematch.match && bracket.finalRematchNeeded && (
                <MatchView match={finalRematch.match} updateMatch={updateMatch} x={finalRematch.x} y={finalRematch.y} currentMatchId={bracket.currentMatchNumber} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Hot-Swap Bar */}
      {tournament && (
        <BracketHotSwapBar
          tournament={tournament}
          currentBracketIndex={bracketIndex!}
          onBracketChange={setBracketIndex}
        />
      )}
    </div>
  );
}
