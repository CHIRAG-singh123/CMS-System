export function normalizeSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function shouldFollowSourceSlug(currentSlug: string, previousSource: string): boolean {
    return currentSlug.trim() === '' || currentSlug === normalizeSlug(previousSource);
}
