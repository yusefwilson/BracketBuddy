import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';

import Home from '../pages/Home';
import Navbar from './Navbar';

import { TournamentDTO } from '../../../src-shared/TournamentDTO';
import { BracketDTO } from '../../../src-shared/BracketDTO';
import TournamentView from '../pages/TournamentView';
import BracketView from '../pages/BracketView';

// this holds the current tournament and bracket that the user is viewing. all components that need to access the current tournament and bracket will use this context
// react automatically triggers refreshes for components that consume this context when the context value changes
export const CURRENT_STATE = createContext<{
  tournament: TournamentDTO | null, bracket: BracketDTO | null,
  setTournament: (tournament: TournamentDTO | null) => void,
  setBracket: (bracket: BracketDTO) => void
} | null>(null);

export default function App() {

  //localStorage.clear(); // for when some old storage is messing things up

  const [currentTournament, setCurrentTournament] = useState<TournamentDTO | null>(null);
  const [currentBracket, setCurrentBracket] = useState<BracketDTO | null>(null);

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
      const latestBracket = latestTournament?.brackets[lastBracketIndex] || null;

      setCurrentTournament(latestTournament);
      setCurrentBracket(latestBracket);
    };
    console.log('App mounted');
    loadLatest();
  }, []);

  return (
    <CURRENT_STATE.Provider value={{ tournament: currentTournament, bracket: currentBracket, setTournament: setCurrentTournament, setBracket: setCurrentBracket }}>
      <Router>
        <div className='h-screen flex flex-col'>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/tournament' element={<TournamentView />} />
            <Route path='/bracket' element={<BracketView />} />
          </Routes>
        </div>
      </Router>
    </CURRENT_STATE.Provider>
  );
}