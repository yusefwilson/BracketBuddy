import { useMemo, useState } from 'react';

import { BracketDTO } from '../../../src-shared/BracketDTO';
import { SORT_FIELDS, sortBrackets } from '../utils/bracketSort';
import { useSortableList } from './useSortableList';

const SORT_FIELD_ORDER_KEY = 'bracketSortFieldOrder';

export function useBracketSearchAndSort(brackets: BracketDTO[]) {
    const [search, setSearch] = useState('');
    const { items: sortFieldItems, handleDragEnd: handleSortDragEnd } =
        useSortableList(SORT_FIELDS, SORT_FIELD_ORDER_KEY);

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        return brackets.filter((b) => {
            const weightLabel = b.weightLimit === 'Superheavyweight' ? 'shw superheavyweight' : `${b.weightLimit} lbs`;
            return [b.gender, b.experienceLevel, b.hand, weightLabel].some((f) =>
                f.toLowerCase().includes(term)
            );
        });
    }, [brackets, search]);

    const sorted = useMemo(
        () => sortBrackets(filtered, sortFieldItems.map((f) => f.id)),
        [filtered, sortFieldItems]
    );

    return { search, setSearch, sorted, sortFieldItems, handleSortDragEnd };
}
