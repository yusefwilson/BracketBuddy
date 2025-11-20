import { createContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import { TournamentDTO } from '../../../src-shared/TournamentDTO';

import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import Home from '../pages/Home';
import TournamentView from '../pages/TournamentView';
import BracketView from '../pages/BracketView';

import Navbar from './Navbar';

// this holds the current tournament and bracket that the user is viewing. all components that need to access the current tournament and bracket will use this context
// react automatically triggers refreshes for components that consume this context when the context value changes
export const CURRENT_STATE = createContext<{
  tournament: TournamentDTO | null,
  bracketId: string | null,
  setTournament: (tournament: TournamentDTO | null) => void,
  setBracketId: (id: string | null) => void
} | null>(null);

export default function App() {

  //localStorage.clear(); // for when some old storage is messing things up

  const [tournament, setTournament] = useState<TournamentDTO | null>(null);
  const [bracketId, setBracketId] = useState<string | null>(null);
  const { showError, ErrorToastContainer } = useErrorToast();

  // Load latest tournament on mount
  useEffect(() => {

    const loadLatest = async () => {

      // load saved data from disk. Tournament class has static method to load all tournaments
      console.log('loading all tournaments');
      const [tournaments, tournamentsError] = await safeApiCall(window.electron.loadAllTournaments());
      const [lastTournamentIndex, lastTournamentIndexError] = await safeApiCall(window.electron.getSavedValue('lastTournamentIndex'));
      const [lastBracketId, lastBracketIdError] = await safeApiCall(window.electron.getSavedValue('lastBracketId'));

      if (tournamentsError) {
        showError(tournamentsError);
        return;
      }

      if (lastTournamentIndexError) {
        showError(lastTournamentIndexError);
        return;
      }

      if (lastBracketIdError) {
        showError(lastBracketIdError);
        return;
      }

      console.log('Loaded tournaments:', tournaments);
      console.log('Loaded lastTournamentIndex:', lastTournamentIndex);
      console.log('Loaded lastBracketId:', lastBracketId);

      const tournamentIndex = (lastTournamentIndex || 0) as number;
      const bracketId = (lastBracketId || null) as string | null;

      const latestTournament = tournaments ? tournaments[tournamentIndex] || null : null;

      setTournament(latestTournament);
      setBracketId(bracketId);
    };
    console.log('App mounted');
    loadLatest();
  }, [showError]);

  return (
    <CURRENT_STATE.Provider value={{ tournament, bracketId, setTournament, setBracketId }}>
      <ErrorToastContainer />
      <Router>
        <Navbar />
        <div className="text-white h-screen-navbar">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/tournament' element={<TournamentView />} />
            <Route path='/bracket' element={<BracketView />} />
          </Routes>
        </div>
      </Router>

    </CURRENT_STATE.Provider >
  );
}