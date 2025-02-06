import { Bracket, Round, Match, Gender, Hand, AgeGroup } from '../types';
import BracketView from './BracketView';

export default function App() {

  const createBye = (competitorName: string): Match => {
    const newMatch = new Match(competitorName, undefined, 0, true);
    console.log('just created bye with id', newMatch.id);
    return newMatch;
  }

  const createSideFromCompetitorNames = (competitorNames: string[]): Match[] => {
    let side: Match[] = [];

    for (let i = 0; i < competitorNames.length; i += 2) {

      // if there is only one competitor left, add a bye
      if (i + 1 >= competitorNames.length) {
        side.push(createBye(competitorNames[i]));
        break;
      }

      const newMatch = new Match(competitorNames[i], competitorNames[i + 1], undefined);
      console.log('just created match with id', newMatch.id);

      side.push(newMatch);
    }

    return side;
  }

  const generateInitialRound = (competitorNames: string[]): Round => {
    // generate the initial round
    const winnerSide = createSideFromCompetitorNames(competitorNames);
    const loserSide: Match[] = [];
    return new Round(winnerSide, loserSide);
  }

  // generate a bracket with the given parameters
  const generateBracket = (gender: Gender, ageGroup: AgeGroup, hand: Hand, weightLimit: number, competitorNames: string[]): Bracket => {

    const initialRound = generateInitialRound(competitorNames);
    console.log('Initial round:', initialRound);

    // generate the rest of the rounds
    const rounds: Round[] = [initialRound];

    let previousRound = initialRound;

    const maxIterations = 8;
    let iterations = 0;

    // end condition: there is only 1 match in the winner side and the loser side is empty
    while (previousRound.winnerSide.length > 1 || previousRound.loserSide.length > 0) {

      if (iterations++ >= maxIterations) {
        console.log('Max iterations reached');
        break;
      }

      let nextRound: Round;
      console.log('Previous round:', previousRound);

      // special case: there was only 1 bye match in the winners side and only 1 match on the losers side: this is the semifinal, which means the new round will only have 1 match in the winners side, with the winner of the bye match and the winner of the losers match
      if (previousRound.winnerSide.length === 1 && previousRound.loserSide.length === 1) {
        const lastWinnerSide = [new Match(previousRound.winnerSide[0].getWinner(), previousRound.loserSide[0].getWinner(), undefined)];
        nextRound = new Round(lastWinnerSide, []);
        rounds.push(nextRound);
        break;
      }

      // collect winners
      const winners = previousRound.collectWinners();
      console.log('Winners:', winners);

      // create winner side
      const winnerSide = createSideFromCompetitorNames(winners);
      console.log('Winner side:', winnerSide);

      // collect losers
      const losers = previousRound.collectLosers();
      console.log('Losers:', losers);

      // create loser side
      const loserSide = createSideFromCompetitorNames(losers);
      console.log('Loser side:', loserSide);

      nextRound = new Round(winnerSide, loserSide);
      rounds.push(nextRound);

      previousRound = nextRound;
    }

    const bracket = { gender, ageGroup, hand, weightLimit, rounds } as Bracket

    printBracket(bracket);

    return bracket;
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

  const bracket = generateBracket('Mixed' as Gender, 'Senior' as AgeGroup, 'Left' as Hand, 200, ['John', 'Jane', 'James', 'Jerry', 'Jack', 'Jill', 'Joe', 'Jenny']);

  return (
    <div className='p-4'>
      <BracketView initialBracket={bracket} />
    </div>
  )
}