/* AERS */
import Tournament from './Tournament.js';
import Bracket from './Bracket.js';
import Match from './Match.js';
import { ExperienceLevel, WeightLimit } from '../../src-shared/types.js';

function exportTournamentToAERS(tournament: Tournament): string {
    const rows: string[] = [];
    const headers = [
        'ORDER', 'PULLER1', 'PULLER2', 'WINNER',
        'CLASS', 'WEIGHT', 'HAND', 'DATE', 'TOURNAMENT NAME'
    ];
    rows.push(headers.join(','));

    for (const bracket of tournament.getAllBrackets()) {
        const matches = bracket.getMatches();
        const formattedMatches = formatBracketMatches(bracket, matches, tournament);
        rows.push(...formattedMatches);
    }

    return rows.join('\n');
}

function formatBracketMatches(bracket: Bracket, matches: Match[], tournament: Tournament): string[] {
    const { experienceLevel, weightLimit, hand } = bracket;


    // Determine the cutoff for consecutive decided matches starting from #1
    const decidedConsecutiveMatches = getConsecutiveDecided(matches);

    // Only export those matches
    return decidedConsecutiveMatches.map((match, index) => {

        const winner = match.getWinningPlayer();
        const convertedExperienceLevel = convertExperienceLevelToAERS(experienceLevel);
        const convertedWeightLimit = convertWeightLimitToAERS(weightLimit);

        return [
            match.number, // ORDER = match.number
            escapeCSV(match.player1),
            escapeCSV(match.player2),
            escapeCSV(winner),
            convertedExperienceLevel,
            convertedWeightLimit,
            hand,
            tournament.date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            }),
            escapeCSV(tournament.name)
        ].join(',');
    });
}

function convertExperienceLevelToAERS(experienceLevel: ExperienceLevel): string {
    if (experienceLevel === 'Youth') return 'Kids';
    if (experienceLevel === 'Grandmaster' || experienceLevel === 'Senior Grandmaster') return 'Master';
    else return experienceLevel;
}

function convertWeightLimitToAERS(weightLimit: WeightLimit): string {
    if (weightLimit === 'Superheavyweight') return '242+';
    else return weightLimit.toString();
}

function getConsecutiveDecided(matches: Match[]): Match[] {
    const result: Match[] = [];
    const sortedMatches = [...matches].sort((a, b) => a.number - b.number);

    for (const match of sortedMatches) {
        if (match.isDecided()) {
            result.push(match);
        } else {
            break; // stop at first undecided or incomplete
        }
    }

    return result;
}

function escapeCSV(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export { exportTournamentToAERS };