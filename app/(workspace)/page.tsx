import { listAnalyses, type AnalysisSummary } from '@/lib/analyses'
import type { AnalysisStatus } from '@/lib/database-types'
import { ago, duration } from '@/lib/time'

// State is told apart by shape, not colour: colour is reserved for direction
// and file kind on the map. Filled means finished, hollow means not yet.
const STATE_GLYPH: Record<AnalysisStatus, string> = {
	queued: '○',
	parsing: '◐',
	ready: '●',
	failed: '✕',
}

export default async function DashboardPage() {
	const { analyses, readAt } = await listAnalyses()

	return (
		<div className='flex h-full min-h-0 flex-col'>
			<div className='flex h-8 shrink-0 items-baseline gap-2 border-b border-line px-3 pt-2'>
				<h1 className='text-xs font-semibold'>Analyses</h1>
				{analyses.length > 0 && (
					<span className='text-xs tabular-nums text-fg-muted'>
						{analyses.length}
					</span>
				)}
			</div>
			{analyses.length === 0 ? (
				<Empty />
			) : (
				<div className='min-h-0 flex-1 overflow-auto'>
					<table className='w-full border-collapse text-xs'>
						<thead className='sticky top-0 bg-canvas'>
							<tr className='text-left text-[11px] text-fg-muted'>
								<Th>repository</Th>
								<Th>state</Th>
								<Th>commit</Th>
								<Th align='right'>started</Th>
								<Th align='right'>took</Th>
								<Th>note</Th>
							</tr>
						</thead>
						<tbody>
							{analyses.map((a) => (
								<Row key={a.id} analysis={a} now={readAt} />
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

function Th({
	children,
	align = 'left',
}: {
	children: React.ReactNode
	align?: 'left' | 'right'
}) {
	return (
		<th
			className={`h-7 border-b border-line px-3 font-normal ${align === 'right' ? 'text-right' : ''}`}
		>
			{children}
		</th>
	)
}

function Row({ analysis: a, now }: { analysis: AnalysisSummary; now: number }) {
	const [owner, name] = a.repository.split('/')
	return (
		<tr className='h-7 border-b border-line'>
			{/* Owner dimmed so the eye lands on the repository name. */}
			<td className='px-3 font-mono whitespace-nowrap'>
				<span className='text-fg-muted'>{owner}/</span>
				{name}
			</td>
			<td className='px-3 whitespace-nowrap'>
				<span aria-hidden className='inline-block w-3 text-fg-muted'>
					{STATE_GLYPH[a.status]}
				</span>
				{a.status}
			</td>
			<td className='px-3 font-mono text-fg-muted'>
				{a.commit_sha ? (
					<span title={a.commit_sha}>{a.commit_sha.slice(0, 7)}</span>
				) : (
					'—'
				)}
			</td>
			<td
				className='px-3 text-right tabular-nums whitespace-nowrap text-fg-muted'
				title={a.created_at}
			>
				{ago(a.created_at, now)}
			</td>
			<td className='px-3 text-right tabular-nums whitespace-nowrap text-fg-muted'>
				{a.finished_at ? duration(a.created_at, a.finished_at) : '—'}
			</td>
			<td className='w-full px-3 text-fg-muted'>{a.error}</td>
		</tr>
	)
}

function Empty() {
	return (
		<div className='px-3 py-6 text-xs'>
			<p className='font-medium'>
				No repositories mapped in this organization yet.
			</p>
			<p className='mt-1 max-w-prose text-fg-muted'>
				When anyone here maps a repository, it is listed on this page for
				everyone in the organization, with its state and the commit it was
				read at.
			</p>
		</div>
	)
}
