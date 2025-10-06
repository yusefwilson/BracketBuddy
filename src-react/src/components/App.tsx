import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';

import Home from '../pages/Home';
import Navbar from './Navbar';

import { TournamentDTO } from '../../../src-shared/TournamentDTO';
import TournamentView from '../pages/TournamentView';
import BracketView from '../pages/BracketView';

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

  const [currentTournament, setCurrentTournament] = useState<TournamentDTO | null>(null);
  const [currentBracketIndex, setCurrentBracketIndex] = useState<number | null>(null);

  // Load latest tournament on mount
  useEffect(() => {

    const loadLatest = async () => {

      // load saved data from disk. Tournament class has static method to load all tournaments, and getSaveData() is a helper function to read the save file
      console.log('loading all tournaments');
      const tournaments = await window.electron.loadAllTournaments();
      const saveData = await window.electron.getSaveData();

      console.log('Loaded tournaments:', tournaments);
      console.log('Loaded save data:', saveData);

      const lastTournamentIndex = saveData.lastTournamentIndex || 0;
      const lastBracketIndex = saveData.lastBracketIndex || 0;

      const latestTournament = tournaments[lastTournamentIndex] || null;

      setCurrentTournament(latestTournament);
      setCurrentBracketIndex(lastBracketIndex);
    };
    console.log('App mounted');
    loadLatest();
  }, []);

  return (
    <CURRENT_STATE.Provider value={{ tournament: currentTournament, bracketIndex: currentBracketIndex, setTournament: setCurrentTournament, setBracketIndex: setCurrentBracketIndex }}>
      <Router>
        <div className="flex flex-col text-white min-h-screen bg-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/tournament' element={<TournamentView />} />
              <Route path='/bracket' element={<BracketView />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CURRENT_STATE.Provider>
  );
}