import { MatchDTO } from "./MatchDTO";

type Gender = 'Male' | 'Female' | 'Mixed';

type Hand = 'Left' | 'Right';

type ExperienceLevel = 'Youth' | 'Novice' | 'Amateur' | 'Semipro' | 'Pro' | 'Master' | 'Grandmaster' | 'Senior Grandmaster';

interface RenderableBracket {
    upper: MatchDTO[];
    lower: MatchDTO[];
}

export type { Gender, Hand, ExperienceLevel, RenderableBracket };