import { useContext, useEffect, useRef, useState } from 'react';

import { CURRENT_STATE } from '../components/App';
import CompetitorInput from '../components/CompetitorInput';
import MatchView from '../components/MatchView';
import FinalPlacings from '../components/FinalPlacings';
import BracketHotSwapBar from '../components/BracketHotSwapBar';

import { calculateAllMatchPositions } from '../../../src-shared/utils';

export default function BracketView() {

  // state
  const state = useContext(CURRENT_STATE);
  const { bracketIndex, tournament, setTournament = () => { }, setBracketIndex = () => { } } = state || {};

  const [finalRematchJustSpawned, setFinalRematchJustSpawned] = useState(false);

  // ref to bracket container (used to scroll final rematch into view)
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (finalRematchJustSpawned) {
      containerRef.current?.scrollTo({
        left: containerRef.current.scrollWidth, // max scroll
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
    <div className='h-full flex flex-col gap-4 p-4 bg-slate-800 shadow-inner'>

      {/* Top: Controls + Bracket Display */}
      <div className='flex flex-1 gap-6'>

        {/* Controls Panel */}
        <div className='bg-slate-700 rounded-lg p-4 shadow-md flex flex-col gap-4 overflow-y-auto'>
          <p className='self-center text-lg font-bold'>
            {bracket.gender + ' | ' + bracket.hand + ' | ' + bracket.experienceLevel + ' | ' + bracket.weightLimit}
          </p>

          <h2 className='text-white text-lg font-semibold text-center'>Competitors</h2>

          <div className='h-[45%]'>
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

          <button
            onClick={async () => {
              const newTournament = await window.electron.startBracket({
                tournamentId: bracket.tournamentId,
                bracketId: bracket.id
              });
              setTournament(newTournament);
            }}
            className='bg-slate-800 text-white rounded-lg p-4 shadow-md'
          >
            Start Bracket
          </button>
        </div>

        {/* Bracket Display */}
        <div className='flex-1 bg-slate-700 rounded-lg p-4 shadow-md relative overflow-auto' ref={containerRef}>
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
