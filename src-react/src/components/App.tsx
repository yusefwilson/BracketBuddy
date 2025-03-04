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

  // create the current tournament and bracket, which are state variables here, and a context variable everywhere else
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(() => {
    const saved = localStorage.getItem('tournament');
    return saved ? Tournament.deserialize(saved) : null;
  });
  const [currentBracket, setCurrentBracket] = useState<Bracket | null>(() => {
    const saved = localStorage.getItem('bracket');
    return saved ? Bracket.deserialize(saved) : null;

  });

  // save the current tournament and bracket to local storage whenever they change
  useEffect(() => {
    if (currentTournament) localStorage.setItem('tournament', currentTournament.serialize());
    console.log('saved tournament to local storage');
  }, [currentTournament]);

  useEffect(() => {
    if (currentBracket) localStorage.setItem('bracket', currentBracket.serialize());
  }, [currentBracket]);

  return (
    <CURRENT_STATE.Provider value={{ tournament: currentTournament, bracket: currentBracket, setTournament: setCurrentTournament, setBracket: setCurrentBracket }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/tournament' element={<TournamentView />} />
          <Route path='/bracket' element={<BracketView />} />
        </Routes>
      </Router>
    </CURRENT_STATE.Provider>
  )
}