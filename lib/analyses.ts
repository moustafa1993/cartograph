import { createDatabaseClient } from '@/lib/database'

// No organization filter: the token carries the active organization and the
// policy decides which rows come back. If another organization's analysis
// ever appears here, the bug is the policy, not this query.
export async function listAnalyses() {
	const db = await createDatabaseClient()
	const { data, error } = await db
		.from('analyses')
		.select('id, repository, commit_sha, status, error, created_at, finished_at')
		.order('created_at', { ascending: false })
		.limit(100)
	if (error) throw new Error(`Listing analyses failed: ${error.message}`)
	// Ages are shown relative to the moment the rows were read.
	return { analyses: data, readAt: Date.now() }
}

export type AnalysisSummary = Awaited<
	ReturnType<typeof listAnalyses>
>['analyses'][number]
