import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CURRENT_STATE } from "../components/App";
import TournamentInfoCard from "../components/TournamentInfoCard";

import Tournament from "../lib/Tournament";
import Bracket from "../lib/Bracket";

export default function Home() {

  const state = useContext(CURRENT_STATE);
  const navigate = useNavigate();

  const tournament1 = new Tournament('Tournament 1', new Date());
  const tournament2 = new Tournament('Tournament 2', new Date());

  const bracket1 = new Bracket('Male', 'Amateur', 'Left', 154, ['Aaron Tamkin', 'Justin Chan', 'John Doe']);
  tournament1.addBracket(bracket1);

  const [allTournaments, setAllTournaments] = useState([tournament1, tournament2]);

  // load saved tournaments
  useEffect(() => { });

  return (
    <div className='bg-slate-800 flex flex-col text-white text-center items-center gap-4'>
      <h1>Welcome to BracketBuddy</h1>
      <p>BracketBuddy is a tournament management system that helps you organize and run your tournaments.</p>
      <button className='bg-yellow-500 p-4 rounded-md flex-shrink'>Create Tournament</button>
      <h1>My Tournaments:</h1>
      {allTournaments.map((tournament, index) => <TournamentInfoCard key={index} tournament={tournament} onClick={() => { state?.setTournament(tournament); navigate('/tournament') }} />)}
    </div>
  );
}