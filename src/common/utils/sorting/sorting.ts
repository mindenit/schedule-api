export const byStringLength = (...names: string[]): string[] => {
	return names.toSorted((a, b) => b.length - a.length)
}
