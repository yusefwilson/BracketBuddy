import SuperJSON from 'superjson';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';

import Home from '../pages/Home';
import Navbar from './Navbar';

import DataStore from '../lib/DataStore';
import Tournament from '../lib/Tournament';
import Bracket from '../lib/Bracket';
import TournamentView from '../pages/TournamentView';
import BracketView from '../pages/BracketView';

export const CURRENT_STATE = createContext<{
  tournament: Tournament | null, bracket: Bracket | null,
  setTournament: (tournament: Tournament) => void,
  setBracket: (bracket: Bracket) => void
} | null>(null);


export const DATASTORE = createContext<DataStore | null>(null);

export default function App() {

  localStorage.clear();

  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(() => {
    const saved = localStorage.getItem('tournament');
    return saved ? SuperJSON.parse(saved) : null;
  });

  const [currentBracket, setCurrentBracket] = useState<Bracket | null>(() => {
    const saved = localStorage.getItem('bracket');
    return saved ? SuperJSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentTournament) localStorage.setItem('tournament', SuperJSON.stringify(currentTournament));
  }, [currentTournament]);

  useEffect(() => {
    if (currentBracket) localStorage.setItem('bracket', SuperJSON.stringify(currentBracket));
  }, [currentBracket]);

  return (
    <DATASTORE.Provider value={new DataStore()} >
      <CURRENT_STATE.Provider value={{ tournament: currentTournament, bracket: currentBracket, setTournament: setCurrentTournament, setBracket: setCurrentBracket }}>
        <Router>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/tournament' element={<TournamentView tournament={currentTournament} />} />
            <Route path='/bracket' element={<BracketView initialBracket={currentBracket} />} />
          </Routes>
        </Router>
      </CURRENT_STATE.Provider>
    </DATASTORE.Provider>
  )
}