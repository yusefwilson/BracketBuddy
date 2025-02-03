import { Bracket, Round, Match, Gender, Hand, AgeGroup } from '../types';
import BracketView from './BracketView';

export default function App() {

  const numWinnerBracketCompetitors = (round: Round): number => {
    let competitors = 0;
    for (let i = 0; i < round.winnerSide.length; i++) {
      if (round.winnerSide[i].competitor0Name)
        competitors++;
      if (round.winnerSide[i].competitor1Name)
        competitors++;
    }

    return competitors;
  }

  const numLoserBracketCompetitors = (round: Round): number => {
    let competitors = 0;
    for (let i = 0; i < (round.loserSide?.length || 0); i++) {
      if (round.loserSide[i].competitor0Name)
        competitors++;
      if (round.loserSide[i].competitor1Name)
        competitors++;
    }

    return competitors;
  }

  const numCompetitors = (round: Round) => {
    return numWinnerBracketCompetitors(round) + numLoserBracketCompetitors(round);
  }

  // requires last round to have winner field filled out in all winnerSide matches
  const generateWinnerMatchesFromPreviousRound = (previousRound: Round): Match[] => {
    const winnerMatches: Match[] = [];
    for (let i = 0; i < previousRound.winnerSide.length; i += 2) {
      
      // if the previous two matches don't have winners, throw an error
      if (previousRound.winnerSide[i].winner === undefined && previousRound.winnerSide[i + 1].winner === undefined)
        throw new Error('Previous round winner matches must have winner field filled out');

      //handle bye situation
      

      let winner0Name = previousRound.winnerSide[i].winner === 0 ? previousRound.winnerSide[i].competitor0Name : previousRound.winnerSide[i].competitor1Name;
      let winner1Name = previousRound.winnerSide[i + 1].winner === 0 ? previousRound.winnerSide[i + 1].competitor0Name : previousRound.winnerSide[i + 1].competitor1Name;
      winnerMatches.push({ competitor0Name: winner0Name, competitor1Name: winner1Name });
    }

    return winnerMatches;
  }

  const generateBracket = (gender: Gender, ageGroup: AgeGroup, hand: Hand, weightLimit: number, competitorNames: string[]): Bracket => {
    // generate the initial round
    const initialWinnerSide: Match[] = [];
    for (let i = 0; i < competitorNames.length; i += 2) {

      if (i + 1 >= competitorNames.length) {
        initialWinnerSide.push({ competitor0Name: competitorNames[i] });
        break;
      }
      initialWinnerSide.push({ competitor0Name: competitorNames[i], competitor1Name: competitorNames[i + 1] });
    }
    const initialRound: Round = { winnerSide: initialWinnerSide, loserSide: [] }

    // generate the rest of the rounds
    const rounds: Round[] = [initialRound];

    let previousRound = initialRound;

    // keep generating rounds until the winner bracket has only one competitor
    while (previousRound.winnerSide.length > 1 || previousRound.loserSide.length > 0) {

      let nextRound: Round;

      if (previousRound.winnerSide.length > 1) {

        nextRound = {
          // winner side is half the size of the previous round
          winnerSide: Array.from({ length: Math.max(1, Math.ceil(previousRound.winnerSide.length / 2)) }, () => ({ competitor0Name: undefined, competitor1Name: undefined })),
          // loser side is half the size of the previous round + half the size of the previous winner side
          loserSide: Array.from({ length: (previousRound.loserSide.length || 0) / 2 + Math.floor(previousRound.winnerSide.length / 2) }, () => ({ competitor0Name: undefined, competitor1Name: undefined }))
        };
      }

      else
        nextRound = {
          winnerSide: [{ competitor0Name: previousRound.winnerSide[0].competitor0Name }],
          loserSide: Array.from({ length: (previousRound.loserSide.length) / 2 }, () => ({ competitor0Name: undefined, competitor1Name: undefined }))
        }

      rounds.push(nextRound);

      previousRound = nextRound;
    }

    return { gender, ageGroup, hand, weightLimit, rounds } as Bracket;
  }

  const printBracket = (bracket: Bracket): void => {
    console.log(`Bracket with gender ${bracket.gender}, age group ${bracket.ageGroup}, hand ${bracket.hand}, and weight limit ${bracket.weightLimit} lbs:`);
    console.log('Rounds:');
    for (let i = 0; i < bracket.rounds.length; i++) {
      console.log('Round ' + (i + 1));
      console.log('Winner side:');
      for (let j = 0; j < bracket.rounds[i].winnerSide.length; j++) {
        console.log(`Match ${j + 1}: ${bracket.rounds[i].winnerSide[j].competitor0Name || 'TBD'} vs ${bracket.rounds[i].winnerSide[j].competitor1Name || 'TBD'}`);
      }
      if (bracket.rounds[i].loserSide) {
        console.log('Loser side:');
        for (let j = 0; j < (bracket.rounds[i].loserSide.length || 0); j++) {
          console.log(`Match ${j + 1}: ${bracket.rounds[i].loserSide[j].competitor0Name || 'TBD'} vs ${bracket.rounds[i].loserSide[j].competitor1Name || 'TBD'}`);
        }
      }
    }
  }

  const bracket: Bracket = generateBracket('Mixed' as Gender, 'Senior' as AgeGroup, 'Left' as Hand, 200, ['John', 'Jane', 'James', 'Jerry', 'Jack', 'Jill', 'Joe', 'Jenny']);

  return (
    <div className='p-4'>
      <BracketView initialBracket={bracket} />
    </div>
  )
}