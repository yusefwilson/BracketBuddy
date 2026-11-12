import { useState, useCallback } from 'react';

import type { BracketDTO } from '../../../src-shared/BracketDTO';
import { isBracketStarted, getUnpaidCompetitors } from '../../../src-shared/bracketHelpers';
import { competitorFullName } from '../../../src-shared/utils';

import UnpaidCompetitorsWarningModal from '../components/UnpaidCompetitorsWarningModal';

// a bracket "starts" when its first result is entered. wrap that action in guardStart: if the bracket
// has not started and some of its competitors are unpaid, a warning is shown first and the action only
// runs once the user confirms. otherwise the action runs immediately.
export function useUnpaidStartGuard(bracket: BracketDTO) {
    const [pending, setPending] = useState<{ unpaidNames: string[]; action: () => void } | null>(null);

    const guardStart = useCallback((action: () => void) => {
        const unpaid = isBracketStarted(bracket) ? [] : getUnpaidCompetitors(bracket);
        if (unpaid.length === 0) {
            action();
            return;
        }
        setPending({ unpaidNames: unpaid.map(competitorFullName), action });
    }, [bracket]);

    const UnpaidWarningModal = useCallback(() => (
        <UnpaidCompetitorsWarningModal
            isOpen={pending !== null}
            unpaidNames={pending?.unpaidNames ?? []}
            onClose={() => setPending(null)}
            onConfirm={() => pending?.action()}
        />
    ), [pending]);

    return { guardStart, UnpaidWarningModal };
}
