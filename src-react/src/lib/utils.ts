import { parse, stringify } from 'flatted';

function greatestPowerOf2LessThanOrEqualTo(n: number): number {
    let power = 1;
    while (power * 2 <= n) {
        power *= 2;
    }
    return power;
}

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

export { greatestPowerOf2LessThanOrEqualTo, serialize, deserialize };