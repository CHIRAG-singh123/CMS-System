import { useEffect, useRef } from 'react';

const MIN_SEARCH_DELAY = 280;

function searchChanged<TData extends Record<string, unknown>>(previousData: TData, nextData: TData): boolean {
    return previousData.search !== nextData.search;
}

export function useAutoSubmitFilters<TData extends Record<string, unknown>>(
    data: TData,
    submit: () => void,
    delay = 180,
    cancel?: () => void,
) {
    const isFirstRender = useRef(true);
    const skipNextSubmit = useRef(false);
    const submitRef = useRef(submit);
    const cancelRef = useRef(cancel);
    const previousDataRef = useRef(data);
    const lastSerializedFilters = useRef(JSON.stringify(data));

    submitRef.current = submit;
    cancelRef.current = cancel;

    useEffect(() => {
        const nextSerializedFilters = JSON.stringify(data);

        if (isFirstRender.current) {
            isFirstRender.current = false;
            previousDataRef.current = data;
            lastSerializedFilters.current = nextSerializedFilters;
            return;
        }

        if (skipNextSubmit.current) {
            skipNextSubmit.current = false;
            previousDataRef.current = data;
            lastSerializedFilters.current = nextSerializedFilters;
            return;
        }

        if (lastSerializedFilters.current === nextSerializedFilters) {
            previousDataRef.current = data;
            return;
        }

        const effectiveDelay = searchChanged(previousDataRef.current, data)
            ? Math.max(delay, MIN_SEARCH_DELAY)
            : delay;

        previousDataRef.current = data;
        cancelRef.current?.();

        const timeoutId = window.setTimeout(() => {
            lastSerializedFilters.current = nextSerializedFilters;
            submitRef.current();
        }, effectiveDelay);

        return () => window.clearTimeout(timeoutId);
    }, [data, delay]);

    return () => {
        skipNextSubmit.current = true;
    };
}
