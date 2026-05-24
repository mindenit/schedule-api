/**
 * Returns the array if non-nullish, otherwise an empty array.
 * Convenient for iterating over optional arrays without inline `?? []`.
 */
export const orEmpty = <T>(arr: T[] | null | undefined): T[] => arr ?? []
