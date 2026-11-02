import type { Gender, Hand, ExperienceLevel, WeightLimit, InvalidRegistrationRow, RegistrationField } from './types';

export const DEFAULT_WEIGHTS: WeightLimit[] = [154, 165, 176, 187, 198, 209, 220, 231, 242, 'Superheavyweight'];

export const HANDS: Hand[] = ['Left', 'Right'];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = ['Youth', 'Novice', 'Amateur', 'Semipro', 'Pro', 'Master', 'Grandmaster', 'Senior Grandmaster'];

export interface ClassEntry {
    hand: Hand;
    experienceLevel: ExperienceLevel;
}

export interface ParsedRegistration {
    rowNumber: number;
    raw: string[];
    name: string;
    gender: Gender;
    weightLimit: WeightLimit;
    classes: ClassEntry[];
}

// minimal RFC 4180 parser: quoted fields, escaped quotes, commas/newlines inside quotes, optional BOM
export function parseCsv(text: string): string[][] {
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
    }

    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    const endRow = () => {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
    };

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += c;
            }
        } else if (c === '"') {
            inQuotes = true;
        } else if (c === ',') {
            row.push(field);
            field = '';
        } else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            endRow();
        } else {
            field += c;
        }
    }

    if (field !== '' || row.length > 0) {
        endRow();
    }

    return rows;
}

const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();

function parseWeight(value: string, recognizedWeights: WeightLimit[]): WeightLimit | null {
    const v = normalize(value);
    if (v === '') return null;

    if (v === 'shw' || v === 'superheavyweight' || v === '242+') {
        return recognizedWeights.includes('Superheavyweight') ? 'Superheavyweight' : null;
    }

    // plain positive number only, so "154abc" or "1e2" are rejected
    if (!/^\d+(\.\d+)?$/.test(v)) return null;
    const n = Number(v);
    return recognizedWeights.includes(n) ? n : null;
}

function parseClassEntry(entry: string): ClassEntry | null {
    const parts = entry.trim().replace(/\s+/g, ' ').split(' ');
    if (parts.length < 2) return null;

    const hand = HANDS.find(h => h.toLowerCase() === parts[0].toLowerCase());
    const experienceLevel = EXPERIENCE_LEVELS.find(e => e.toLowerCase() === parts.slice(1).join(' ').toLowerCase());
    if (!hand || !experienceLevel) return null;

    return { hand, experienceLevel };
}

export function parseRegistrationRows(
    rows: string[][],
    recognizedWeights: WeightLimit[]
): { valid: ParsedRegistration[]; invalid: InvalidRegistrationRow[] } | { error: string } {
    if (rows.length === 0) {
        return { error: 'The file is empty.' };
    }

    const header = rows[0].map(normalize);
    const columns = { name: header.indexOf('name'), gender: header.indexOf('gender'), weight: header.indexOf('weight'), classes: header.indexOf('classes') };
    const missing = (Object.keys(columns) as RegistrationField[]).filter(k => columns[k] === -1);
    if (missing.length > 0) {
        return { error: `Missing required column(s): ${missing.map(m => m.toUpperCase()).join(', ')}.` };
    }

    const valid: ParsedRegistration[] = [];
    const invalid: InvalidRegistrationRow[] = [];

    for (let i = 1; i < rows.length; i++) {
        const raw = rows[i];

        // skip blank lines
        if (raw.every(cell => cell.trim() === '')) continue;

        const rowNumber = i + 1;
        const reasons: string[] = [];
        const fields: RegistrationField[] = [];
        const fail = (field: RegistrationField, reason: string) => {
            reasons.push(reason);
            if (!fields.includes(field)) fields.push(field);
        };

        if (raw.length !== header.length) {
            // extra/missing cells usually mean an unquoted comma in CLASSES
            invalid.push({ rowNumber, raw, reasons: [`Expected ${header.length} columns but found ${raw.length}. Is the CLASSES list wrapped in quotes?`], fields: ['classes'] });
            continue;
        }

        const name = raw[columns.name].trim();
        if (!name) fail('name', 'Name is empty.');

        const genderValue = normalize(raw[columns.gender]);
        const gender: Gender | null = genderValue === 'male' ? 'Male' : genderValue === 'female' ? 'Female' : null;
        if (!gender) fail('gender', `Gender "${raw[columns.gender].trim()}" must be MALE or FEMALE.`);

        const weightLimit = parseWeight(raw[columns.weight], recognizedWeights);
        if (weightLimit === null) fail('weight', `Weight "${raw[columns.weight].trim()}" is not a recognized weight class.`);

        const classes: ClassEntry[] = [];
        const classEntries = raw[columns.classes].split(',').map(e => e.trim()).filter(e => e !== '');
        if (classEntries.length === 0) {
            fail('classes', 'No classes listed.');
        }
        for (const entry of classEntries) {
            const parsed = parseClassEntry(entry);
            if (!parsed) {
                fail('classes', `Class "${entry}" must be a hand and experience level, e.g. "Right Amateur".`);
            } else if (!classes.some(c => c.hand === parsed.hand && c.experienceLevel === parsed.experienceLevel)) {
                classes.push(parsed);
            }
        }

        if (reasons.length > 0) {
            invalid.push({ rowNumber, raw, reasons, fields });
        } else {
            valid.push({ rowNumber, raw, name, gender: gender!, weightLimit: weightLimit!, classes });
        }
    }

    return { valid, invalid };
}
