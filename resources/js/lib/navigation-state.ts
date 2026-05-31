import { useSyncExternalStore } from 'react';

type NavigationState = {
    tableVisitCount: number;
    overlayVisitCount: number;
    pageVisitCount: number;
};

type NavigationSnapshot = {
    tableLoading: boolean;
    tableOverlayLoading: boolean;
    pageLoading: boolean;
    navigationLoading: boolean;
};

type VisitShape = {
    method?: string;
    async?: boolean;
    prefetch?: boolean;
    only?: string[];
    except?: string[];
    url?: string;
};

const listeners = new Set<() => void>();

let initialized = false;
let state: NavigationState = {
    tableVisitCount: 0,
    overlayVisitCount: 0,
    pageVisitCount: 0,
};
let snapshot: NavigationSnapshot = {
    tableLoading: false,
    tableOverlayLoading: false,
    pageLoading: false,
    navigationLoading: false,
};

function emit() {
    listeners.forEach((listener) => listener());
}

function updateState(updater: (current: NavigationState) => NavigationState) {
    const nextState = updater(state);

    if (
        nextState.tableVisitCount === state.tableVisitCount
        && nextState.overlayVisitCount === state.overlayVisitCount
        && nextState.pageVisitCount === state.pageVisitCount
    ) {
        return;
    }

    state = nextState;
    snapshot = {
        tableLoading: state.tableVisitCount > 0,
        tableOverlayLoading: state.overlayVisitCount > 0,
        pageLoading: state.pageVisitCount > 0,
        navigationLoading: state.pageVisitCount > 0 || state.tableVisitCount > 0,
    };
    emit();
}

function isGetVisit(visit?: VisitShape | null): visit is VisitShape {
    return visit?.method?.toLowerCase() === 'get';
}

function isAsyncPartialReload(visit?: VisitShape | null): visit is VisitShape {
    if (!isGetVisit(visit) || !visit.async || visit.prefetch) {
        return false;
    }

    return (visit.only?.length ?? 0) > 0 || (visit.except?.length ?? 0) > 0;
}

function visitUsesOverlay(visit?: VisitShape | null): boolean {
    if (!visit?.url) {
        return false;
    }

    try {
        return new URL(visit.url, window.location.origin).searchParams.has('page');
    } catch {
        return false;
    }
}

function isTrackedPageVisit(visit?: VisitShape | null): visit is VisitShape {
    return isGetVisit(visit) && !visit.prefetch && !isAsyncPartialReload(visit);
}

function incrementTableVisits(withOverlay: boolean) {
    updateState((current) => ({
        tableVisitCount: current.tableVisitCount + 1,
        overlayVisitCount: current.overlayVisitCount + (withOverlay ? 1 : 0),
    }));
}

function decrementTableVisits(withOverlay: boolean) {
    updateState((current) => ({
        tableVisitCount: Math.max(0, current.tableVisitCount - 1),
        overlayVisitCount: Math.max(0, current.overlayVisitCount - (withOverlay ? 1 : 0)),
    }));
}

function resetTableVisits() {
    updateState(() => ({
        tableVisitCount: 0,
        overlayVisitCount: 0,
        pageVisitCount: 0,
    }));
}

export function initializeNavigationState(inertiaRouter: {
    on: (event: string, callback: (event: CustomEvent<{ visit?: VisitShape }>) => void) => (() => void) | void;
}) {
    if (initialized) {
        return;
    }

    initialized = true;

    inertiaRouter.on('start', (event) => {
        if (isAsyncPartialReload(event.detail.visit)) {
            incrementTableVisits(visitUsesOverlay(event.detail.visit));
            return;
        }

        if (isTrackedPageVisit(event.detail.visit)) {
            updateState((current) => ({
                ...current,
                pageVisitCount: current.pageVisitCount + 1,
            }));
        }
    });

    inertiaRouter.on('finish', (event) => {
        if (isAsyncPartialReload(event.detail.visit)) {
            decrementTableVisits(visitUsesOverlay(event.detail.visit));
            return;
        }

        if (isTrackedPageVisit(event.detail.visit)) {
            updateState((current) => ({
                ...current,
                pageVisitCount: Math.max(0, current.pageVisitCount - 1),
            }));
        }
    });

    inertiaRouter.on('navigate', () => {
        resetTableVisits();
    });

    inertiaRouter.on('error', () => {
        resetTableVisits();
    });

    inertiaRouter.on('exception', () => {
        resetTableVisits();
    });

    inertiaRouter.on('invalid', () => {
        resetTableVisits();
    });
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return snapshot;
}

export function getNavigationSnapshot() {
    return snapshot;
}

export function useNavigationState() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
