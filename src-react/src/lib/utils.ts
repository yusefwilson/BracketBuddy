import { parse, stringify } from "flatted";
import Tournament from "./Tournament";
import Bracket from "./Bracket";
import Round from "./Round";
import Match from "./Match";

function greatestPowerOf2LessThanOrEqualTo(n: number): number {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
}

function deepSerialize(obj: any, seen = new WeakMap(), idCounter = { count: 0 }): any {
    if (obj && typeof obj === 'object') {
        if (seen.has(obj)) {
            //console.log('Returning reference for:', obj, 'as', seen.get(obj));
            return { __ref: seen.get(obj) };
        }

        if (idCounter.count === 5) {
            //console.log('Setting reference for:', obj, 'as', idCounter.count);
        }

        const id = idCounter.count++;
        seen.set(obj, id);

        //console.log(`Serializing ${obj.constructor.name} with id ${id}`, obj);

        if (Array.isArray(obj)) {
            return { __array: obj.map((item) => deepSerialize(item, seen, idCounter)) };
        }

        if (obj instanceof Date) {
            return { __date: obj.toISOString() }; // Store dates as ISO strings
        }

        const serializedObj: any = { __class: obj.constructor.name, __id: id };

        for (const key in obj) {
            serializedObj[key] = deepSerialize(obj[key], seen, idCounter);
        }

        //console.log('serializedObj:', serializedObj);
        return serializedObj;
    }

    return obj;
}

function deepDeserialize<T>(obj: any, classMap: Record<string, new (...args: any[]) => any>, seen = new Map()): T {

    console.log('deserializing with seen = ', seen);

    if (obj && typeof obj === 'object') {
        if (obj.__ref) {
            return seen.get(obj.__ref);
        }

        if (obj.__array) {
            return obj.__array.map((item: any) => deepDeserialize(item, classMap, seen));
        }

        if (obj.__date) {
            return new Date(obj.__date) as T; // Restore Date object
        }

        if (obj.__class && classMap[obj.__class]) {
            const instance = Object.create(classMap[obj.__class].prototype);
            seen.set(obj.__id, instance);

            for (const key in obj) {
                if (key !== '__class' && key !== '__id') {
                    instance[key] = deepDeserialize(obj[key], classMap, seen);
                }
            }
            return instance;
        }
    }
    return obj as T;
}

const classMap: Record<string, any> = { 'Tournament': Tournament, 'Bracket': Bracket, 'Round': Round, 'Match': Match };

function rehydrate(data: any, classMap: Record<string, new () => any>, cache = new WeakMap()): any {

    // Handle Date objects differently than the custom classes
    if (typeof data === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(data)) {
        return new Date(data); // Convert ISO string to Date instance
    }

    if (data === null || typeof data !== "object") return data;
    if (cache.has(data)) return cache.get(data);

    if (data.__class && classMap[data.__class]) {
        const instance = new classMap[data.__class]();
        cache.set(data, instance);
        Object.keys(data).forEach((key) => {
            if (key !== "__class") {
                (instance as any)[key] = rehydrate(data[key], classMap, cache);
            }
        });
        return instance;
    }

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

function deserialize(serialized: string): any {

    const deserialized = parse(serialized);

    // now rehydrate object by changing all __class fields to their respective classes
    const rehydrated = rehydrate(deserialized, classMap);

    return rehydrated;
}


// testing

const tournament = new Tournament('new tournament', new Date());
const bracket = new Bracket('Female', 'Amateur', 'Left', 123, ['A', 'B', 'C']);
bracket.initialize();
tournament.addBracket(bracket);

console.log('before flatted, object has type ', typeof tournament, tournament);
const stringified = serialize(tournament);
console.log('serialized: ', stringified);
const parsed = deserialize(stringified);
console.log('deserialized, object has type ', typeof parsed, parsed);

console.log('date on tournament: ', tournament.date, 'date on parsed: ', parsed.date);
console.log('type of date on tournament: ', typeof tournament.date, 'type of date on parsed: ', typeof parsed.date);

export { greatestPowerOf2LessThanOrEqualTo, deepDeserialize, deepSerialize, serialize, deserialize };