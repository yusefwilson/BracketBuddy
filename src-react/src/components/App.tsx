import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';

import { TournamentDTO } from '../../../src-shared/TournamentDTO';
import { safeApiCall } from '../utils/apiHelpers';
import { useErrorToast } from '../hooks/useErrorToast';

import TournamentView from '../pages/TournamentView';
import BracketView from '../pages/BracketView';
import Home from '../pages/Home';
import Navbar from './Navbar';

// this holds the current tournament and bracket that the user is viewing. all components that need to access the current tournament and bracket will use this context
// react automatically triggers refreshes for components that consume this context when the context value changes
export const CURRENT_STATE = createContext<{
  tournament: TournamentDTO | null,
  bracketIndex: number | null,
  setTournament: (tournament: TournamentDTO | null) => void,
  setBracketIndex: (index: number) => void
} | null>(null);

export default function App() {

  //localStorage.clear(); // for when some old storage is messing things up

  const [tournament, setTournament] = useState<TournamentDTO | null>(null);
  const [bracketIndex, setBracketIndex] = useState<number | null>(null);
  const { showError, ErrorToastContainer } = useErrorToast();

  // Load latest tournament on mount
  useEffect(() => {

    const loadLatest = async () => {

      // load saved data from disk. Tournament class has static method to load all tournaments, and getSaveData() is a helper function to read the save file
      console.log('loading all tournaments');
      const [tournaments, tournamentsError] = await safeApiCall(window.electron.loadAllTournaments());
      const [saveData, saveDataError] = await safeApiCall(window.electron.getSaveData());

      if (tournamentsError) {
        showError(tournamentsError);
        return;
      }

      if (saveDataError) {
        showError(saveDataError);
        return;
      }

      console.log('Loaded tournaments:', tournaments);
      console.log('Loaded save data:', saveData);

      const lastTournamentIndex = (saveData?.lastTournamentIndex || 0) as number;
      const lastBracketIndex = (saveData?.lastBracketIndex || 0) as number;

      const latestTournament = tournaments ? tournaments[lastTournamentIndex] || null : null;

      setTournament(latestTournament);
      setBracketIndex(lastBracketIndex);
    };
    console.log('App mounted');
    loadLatest();
  }, [showError]);

  return (
    <CURRENT_STATE.Provider value={{ tournament, bracketIndex, setTournament, setBracketIndex }}>
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