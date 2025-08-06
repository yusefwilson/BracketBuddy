import { parse, stringify } from 'flatted';

/* MATH */
function greatestPowerOf2LessThanOrEqualTo(n: number): number {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
}

function isPowerOfTwo(n: number) { return n > 0 && (n & (n - 1)) === 0; };

/* SERIALIZATION AND DESERIALIZATION */
function rehydrate(data: any, classMap: Record<string, new () => any>, cache = new WeakMap()): any {

    // Handle Date objects differently than the custom classes
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(data)) {
        return new Date(data); // Convert ISO string to Date instance
    }

    // Handle null and non-objects
    if (data === null || typeof data !== 'object') return data;

    // Handle circular references
    if (cache.has(data)) return cache.get(data);

    // Handle classes
    if (data.__class && classMap[data.__class]) {
        const instance = new classMap[data.__class]();
        cache.set(data, instance);
        Object.keys(data).forEach((key) => {
            if (key !== '__class') {
                (instance as any)[key] = rehydrate(data[key], classMap, cache);
            }
        });
        return instance;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        const rehydratedArray = data.map((item) => rehydrate(item, classMap, cache));
        cache.set(data, rehydratedArray);
        return rehydratedArray;
    }

    const rehydratedObject = {} as any;
    cache.set(data, rehydratedObject);

    Object.keys(data).forEach((key) => {
        rehydratedObject[key] = rehydrate(data[key], classMap, cache);
    });

    return rehydratedObject;
}

function serialize(obj: any): string {
    return stringify(obj);
}

function deserialize(serialized: string, classMap: Record<string, new () => any>): any {

    const deserialized = parse(serialized);

    // now rehydrate object by changing all __class fields to their respective classes
    const rehydrated = rehydrate(deserialized, classMap);

    return rehydrated;
}

const getSaveData = async (): Promise<Record<string, any>> => {
    const data = await window.electron.getSaveData();
    return data;
}

const saveKeyValue = async (key: string, value: any): Promise<void> => {
    await window.electron.saveKeyValue(key, value);
}

interface TO_Match {
    id: number | string;
    name: string;
    nextMatchId?: number | string | null;
    nextLooserMatchId?: number | string | null;
    tournamentRoundText?: string;
    startTime: string;
    state: string; // or more specific if known
    players: {
        id: string;
        resultText: string | null;
        isWinner: boolean;
        status: string | null;
        name: string;
    }[];
}

import { Match as G_Loot_Match } from '@g-loot/react-tournament-brackets';

function convertToGlootMatch(toMatch: TO_Match): G_Loot_Match {
    return {
        id: toMatch.id,
        name: toMatch.name,
        nextMatchId: toMatch.nextMatchId ?? null,
        nextLooserMatchId: toMatch.nextLooserMatchId ?? null,
        tournamentRoundText: toMatch.tournamentRoundText,
        startTime: toMatch.startTime,
        state: 'DONE',
        participants: toMatch.players.map(player => ({
            id: player.id,
            resultText: player.resultText,
            isWinner: player.isWinner,
            status: null,
            name: player.name,
        })),
    };
}

export {
    greatestPowerOf2LessThanOrEqualTo, isPowerOfTwo,
    serialize, deserialize,
    getSaveData, saveKeyValue,
    convertToGlootMatch,
};