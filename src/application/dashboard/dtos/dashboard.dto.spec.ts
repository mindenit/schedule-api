import { describe, expect, it } from 'vitest'

import { syncRunSchema } from './dashboard.dto'

describe('syncRunSchema steps', () => {
	it('keeps guard/breaker steps and strips CIST key stats', () => {
		const guardSteps = {
			deleteSkipped: { staleEvents: 300, totalEvents: 1000 },
			circuitBreaker: { unprocessedGroups: 900 },
			guardsOverridden: true,
		}

		const { steps } = syncRunSchema.parse({
			id: 1,
			startedAt: '2026-10-16T00:00:00.000Z',
			finishedAt: null,
			status: 'failed',
			trigger: 'cron',
			totalGroups: 1000,
			failedGroups: 100,
			removedEvents: 0,
			totalEvents: 1000,
			steps: {
				...guardSteps,
				cist: { keySwitches: 0, rejections: 0, activeKeyIndex: 1, keyCount: 1 },
			},
		})

		expect(steps).toEqual(guardSteps)
	})
})
