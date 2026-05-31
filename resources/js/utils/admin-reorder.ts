export type UidMap = Record<number, string>;

function csrfToken(): string | null {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null;
}

export async function persistAdminSortOrder(url: string, orderedIds: number[]): Promise<UidMap> {
    const payload = new URLSearchParams({ _method: 'put' });
    orderedIds.forEach((id) => payload.append('ordered_ids[]', String(id)));

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            ...(csrfToken() ? { 'X-CSRF-TOKEN': csrfToken() as string } : {}),
        },
        body: payload.toString(),
    });

    const payload = await response.json().catch(() => null) as { message?: string; uid_map?: Record<string, string> } | null;

    if (!response.ok) {
        throw new Error(payload?.message ?? 'Order could not be saved.');
    }

    return Object.fromEntries(
        Object.entries(payload?.uid_map ?? {}).map(([id, uid]) => [Number(id), uid]),
    );
}
