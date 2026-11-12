import { BracketDTO } from '../../../src-shared/BracketDTO';
import { Gender, Hand, ExperienceLevel } from '../../../src-shared/types';

export type SortFieldId = 'gender' | 'experienceLevel' | 'hand' | 'weight';

export interface SortField {
    id: SortFieldId;
    label: string;
}

export const SORT_FIELDS: SortField[] = [
    { id: 'gender', label: 'Gender' },
    { id: 'experienceLevel', label: 'Experience Level' },
    { id: 'hand', label: 'Hand' },
    { id: 'weight', label: 'Weight' },
];

const GENDER_ORDER: Gender[] = ['Male', 'Female', 'Mixed'];

const EXPERIENCE_LEVEL_ORDER: ExperienceLevel[] = [
    'Youth', 'Novice', 'Amateur', 'Semipro', 'Pro', 'Master', 'Grandmaster', 'Senior Grandmaster',
];

const HAND_ORDER: Hand[] = ['Right', 'Left'];

function weightValue(bracket: BracketDTO): number {
    return bracket.weightLimit === 'Superheavyweight' ? Infinity : bracket.weightLimit;
}

function compareField(a: BracketDTO, b: BracketDTO, field: SortFieldId): number {
    switch (field) {
        case 'gender':
            return GENDER_ORDER.indexOf(a.gender) - GENDER_ORDER.indexOf(b.gender);
        case 'experienceLevel':
            return EXPERIENCE_LEVEL_ORDER.indexOf(a.experienceLevel) - EXPERIENCE_LEVEL_ORDER.indexOf(b.experienceLevel);
        case 'hand':
            return HAND_ORDER.indexOf(a.hand) - HAND_ORDER.indexOf(b.hand);
        case 'weight':
            return weightValue(a) - weightValue(b);
    }
}

export function sortBrackets(brackets: BracketDTO[], fieldOrder: SortFieldId[]): BracketDTO[] {
    return [...brackets].sort((a, b) => {
        for (const field of fieldOrder) {
            const cmp = compareField(a, b, field);
            if (cmp !== 0) return cmp;
        }
        return 0;
    });
}
