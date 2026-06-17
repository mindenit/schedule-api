/*
 * Checks if the given value is a record (non-array object).
 * @param {unknown} value The value to check.
 * @returns {boolean} true if the value is a record, false otherwise.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)
