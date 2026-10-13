// The shape of the tables the app reads, in the form `supabase gen types`
// produces. Written by hand because nothing generates it yet; once the CLI
// is linked, `supabase gen types typescript --linked` replaces this file.
// A table missing here is a compile error at the query, not a silent `any`.

export type AnalysisStatus = 'queued' | 'parsing' | 'ready' | 'failed'

export type Database = {
	public: {
		Tables: {
			analyses: {
				Row: {
					id: string
					organization_id: string
					repository: string
					commit_sha: string | null
					status: AnalysisStatus
					error: string | null
					created_by: string
					created_at: string
					finished_at: string | null
				}
				// Nothing in the app writes yet, and the database grants no writes.
				Insert: never
				Update: never
				Relationships: []
			}
		}
		Views: Record<never, never>
		Functions: Record<never, never>
		Enums: Record<never, never>
		CompositeTypes: Record<never, never>
	}
}
