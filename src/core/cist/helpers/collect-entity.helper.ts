import { EntityMapper } from 'src/core/entity.mapper'

export const collectEntity = <From, To>(
	mapper: EntityMapper<From, To>,
	input: From,
	bucket: To[],
): boolean => {
	const entity = mapper.toEntity(input)

	if (entity.isNone()) {
		return false
	}

	bucket.push(entity.value)
	return true
}
