import { Result } from 'better-result'
import {
	CistCrawlerErrorCodes,
	CistCrawlerException,
} from 'src/common/exceptions/cist-crawler.exception'
import type { SyncRunsService } from 'src/components/sync-runs/sync-runs.service'
import { academicGroupTable } from 'src/db/schema'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ScheduleService } from './schedule.service'

// The 8s inter-group delay would make every case take minutes.
vi.mock('node:timers/promises', () => ({
	setTimeout: () => Promise.resolve(),
}))

const groupsOf = (n: number) =>
	Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `G-${i + 1}` }))
const fetchFailed = () =>
	Result.err(
		new CistCrawlerException(CistCrawlerErrorCodes.FETCH_FAILED, 'CIST down'),
	)

describe('ScheduleService.processSchedule (orchestration)', () => {
	let existingGroups: ReturnType<typeof groupsOf>
	let totalEventCount: number
	let groupsProcessor: { process: ReturnType<typeof vi.fn> }
	let eventsProcessor: Record<
		| 'process'
		| 'removeLinksOfGroups'
		| 'countExtraEvents'
		| 'removeExtraEvents',
		ReturnType<typeof vi.fn>
	>
	let syncRuns: Record<
		| 'open'
		| 'setTotalGroups'
		| 'close'
		| 'recordGroup'
		| 'purgeOldRuns'
		| 'getLastGoodGroupsCount',
		ReturnType<typeof vi.fn>
	>
	let ping: ReturnType<typeof vi.fn>
	let service: ScheduleService

	beforeEach(() => {
		existingGroups = groupsOf(5)
		totalEventCount = 1000
		const db = {
			select: () => ({
				from: (table: unknown) =>
					Promise.resolve(
						table === academicGroupTable
							? existingGroups
							: [{ count: totalEventCount }],
					),
			}),
		}
		const okList = { process: vi.fn().mockResolvedValue(Result.ok([])) }
		groupsProcessor = {
			process: vi.fn(() => Promise.resolve(Result.ok(existingGroups))),
		}
		eventsProcessor = {
			process: vi.fn().mockResolvedValue(Result.ok([{}, {}])),
			removeLinksOfGroups: vi.fn().mockResolvedValue(0),
			countExtraEvents: vi.fn().mockResolvedValue(10),
			removeExtraEvents: vi.fn().mockResolvedValue(10),
		}
		syncRuns = {
			open: vi.fn(),
			setTotalGroups: vi.fn(),
			close: vi.fn(),
			recordGroup: vi.fn(),
			purgeOldRuns: vi.fn().mockResolvedValue(0),
			getLastGoodGroupsCount: vi.fn().mockResolvedValue(null),
		}
		ping = vi.fn()
		const stats = {
			keySwitches: 0,
			rejections: 0,
			activeKey: 'k0:00000000',
			keyCount: 1,
		}

		service = new ScheduleService(
			db as never,
			{ set: vi.fn().mockResolvedValue('OK') } as never,
			okList as never,
			eventsProcessor as never,
			groupsProcessor as never,
			okList as never,
			syncRuns as never,
			{ ping } as never,
			{ log: vi.fn(), warn: vi.fn(), error: vi.fn() } as never,
			{ get: () => ({ enabled: false }) } as never,
			{
				isFullRecheckRun: () => false,
				getHistoricallyEmptyGroupIds: vi.fn().mockResolvedValue([]),
			} as never,
			{ resetStats: vi.fn(), getStats: () => stats } as never,
		)
	})

	const closed = () =>
		syncRuns.close.mock.calls.at(-1)![1] as Parameters<
			SyncRunsService['close']
		>[1]

	it('removes unseen events and closes as success on the happy path', async () => {
		await service.processSchedule()

		expect(eventsProcessor.process).toHaveBeenCalledTimes(5)
		expect(eventsProcessor.removeExtraEvents).toHaveBeenCalledOnce()
		expect(closed()).toMatchObject({ status: 'success', removedEvents: 10 })
		expect(closed().steps.deleteSkipped).toBeUndefined()
		expect(ping).not.toHaveBeenCalled()
	})

	it('aborts without the stale-event guard or cleanup when the breaker trips', async () => {
		existingGroups = groupsOf(400)
		eventsProcessor.process.mockResolvedValue(fetchFailed())
		// Unreached groups' events would look stale and trip the delete guard.
		eventsProcessor.countExtraEvents.mockResolvedValue(900)

		await service.processSchedule()

		// 100 in a row and over the 20% retry budget (80): stop at group 100.
		expect(eventsProcessor.process).toHaveBeenCalledTimes(100)
		expect(eventsProcessor.countExtraEvents).not.toHaveBeenCalled()
		expect(eventsProcessor.removeExtraEvents).not.toHaveBeenCalled()
		expect(closed()).toMatchObject({ status: 'failed', failedGroups: 100 })
		expect(closed().steps.circuitBreaker).toEqual({ unprocessedGroups: 300 })
		expect(closed().steps.deleteSkipped).toBeUndefined()
		expect(ping).toHaveBeenCalledOnce()
		expect(ping.mock.calls[0][0]).toContain('aborted')

		// The running guard is released: a next run starts normally.
		await service.processSchedule()
		expect(syncRuns.open).toHaveBeenCalledTimes(2)
	})

	it('keeps unseen events when they exceed the delete ratio', async () => {
		eventsProcessor.countExtraEvents.mockResolvedValue(300)

		await service.processSchedule()

		expect(eventsProcessor.removeExtraEvents).not.toHaveBeenCalled()
		expect(closed()).toMatchObject({ status: 'success', removedEvents: 0 })
		expect(closed().steps.deleteSkipped).toEqual({
			staleEvents: 300,
			totalEvents: 1000,
		})
		expect(ping).toHaveBeenCalledOnce()
		expect(ping.mock.calls[0][0]).toContain('skipped removing 300/1000')
	})

	it('falls back to known groups when the CIST list is truncated', async () => {
		existingGroups = groupsOf(100)
		syncRuns.getLastGoodGroupsCount.mockResolvedValue(100)
		groupsProcessor.process.mockResolvedValue(Result.ok(groupsOf(79)))

		await service.processSchedule()

		expect(syncRuns.setTotalGroups).toHaveBeenCalledWith(
			expect.any(Number),
			100,
		)
		expect(eventsProcessor.process).toHaveBeenCalledTimes(100)
		expect(closed().steps.groups).toMatchObject({ ok: false, count: 0 })
		expect(closed().steps.groups?.error).toContain('groups list too small')
	})
})
