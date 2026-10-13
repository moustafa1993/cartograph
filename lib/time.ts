// Relative rather than a clock time: the server doesn't know the viewer's
// timezone, and "3h ago" is right everywhere. Exact time is in the title.
export function ago(iso: string, now: number): string {
	const seconds = Math.max(
		0,
		Math.round((now - new Date(iso).getTime()) / 1000),
	)
	if (seconds < 60) return `${seconds}s ago`
	const minutes = Math.round(seconds / 60)
	if (minutes < 60) return `${minutes}m ago`
	const hours = Math.round(minutes / 60)
	if (hours < 48) return `${hours}h ago`
	return `${Math.round(hours / 24)}d ago`
}

// How long something ran, at the precision that matters for its length.
export function duration(fromIso: string, toIso: string): string {
	const seconds = Math.max(
		0,
		Math.round(
			(new Date(toIso).getTime() - new Date(fromIso).getTime()) / 1000,
		),
	)
	if (seconds < 60) return `${seconds}s`
	const minutes = Math.floor(seconds / 60)
	if (minutes < 60) return `${minutes}m ${seconds % 60}s`
	return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}
