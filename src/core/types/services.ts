interface CistService<T extends object> {
	processParsedJSON: (data: T) => Promise<void>
}

export type { CistService }
