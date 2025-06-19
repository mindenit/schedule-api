import { createHash } from 'node:crypto'

const hashObject = (o: object): string => {
	const stringifiedObj = JSON.stringify(o, Object.keys(o).toSorted())

	return createHash('sha256').update(stringifiedObj).digest('hex')
}

export { hashObject }
