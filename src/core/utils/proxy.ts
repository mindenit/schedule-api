export const fetchProxy = async <T extends object>(
	endpoint: string,
): Promise<T> => {
	const response = await fetch(endpoint)

	const data: T = await response.json()

	return data
}
