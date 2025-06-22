import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';

import Home from '../pages/Home';
import Navbar from './Navbar';

import Tournament from '../lib/Tournament';
import Bracket from '../lib/Bracket';
import TournamentView from '../pages/TournamentView';
import BracketView from '../pages/BracketView';

// this holds the current tournament and bracket that the user is viewing. all components that need to access the current tournament and bracket will use this context
// react automatically triggers refreshes for components that consume this context when the context value changes
export const CURRENT_STATE = createContext<{
  tournament: Tournament | null, bracket: Bracket | null,
  setTournament: (tournament: Tournament) => void,
  setBracket: (bracket: Bracket) => void
} | null>(null);

export default function App() {

  //localStorage.clear(); // for when some old storage is messing things up

  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [currentBracket, setCurrentBracket] = useState<Bracket | null>(null);

  // Load latest tournament on mount
  useEffect(() => {
    const loadLatest = async () => {
      const tournaments = await Tournament.loadAllTournaments();
      const latest = tournaments[tournaments.length - 1]; // or pick based on timestamp/name
      console.log('tournaments', tournaments);
      if (latest) {
        const currentTournament = latest;
        const currentBracket = latest.brackets[latest.brackets.length - 1] || null;
        console.log('checking bracket and tournament link valid: ', currentBracket?.tournament?.brackets.includes(currentBracket));
        setCurrentTournament(currentTournament);
        setCurrentBracket(currentBracket);
      }
    };
    console.log('App mounted');
    loadLatest();
  }, []);

  // save the current tournament and bracket to local storage whenever they change
  useEffect(() => {
    currentTournament?.save();
  }, [currentTournament]);

  // useEffect(() => {
  //   currentBracket?.tournament?.save(); // Save tournament when bracket updates
  // }, [currentBracket]);

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