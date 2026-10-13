import type { NextConfig } from 'next'
import { assertEnv } from './lib/env'

assertEnv()

// Tailwind runs as a Turbopack loader rather than through PostCSS: one tool
// compiles the CSS instead of two.
const nextConfig: NextConfig = {
	turbopack: {
		rules: {
			'*.css': {
				loaders: ['@tailwindcss/turbopack'],
				as: '*.css',
			},
		},
	},
}

export default nextConfig
