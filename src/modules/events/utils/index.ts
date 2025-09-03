export const arrDifference = <T>(arr1: T[], arr2: T[]): T[] => {
	return arr1.filter((item) => !arr2.includes(item))
}
