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

export { greatestPowerOf2LessThanOrEqualTo, deepSerialize, deepDeserialize };