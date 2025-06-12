const fetchProxy = async <T extends object>(endpoint: string): Promise<T> => {
	const response = await fetch(endpoint)

	const data: T = await response.json()

	return data
}

const delay = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export { fetchProxy, delay }
