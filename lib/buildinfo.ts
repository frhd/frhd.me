/**
 * Build-time metadata for the editor chrome's footer (`⎇ <hash> · press t`).
 *
 * `NEXT_PUBLIC_COMMIT` is injected by `next.config.mjs` via
 * `execSync('git rev-parse --short HEAD')` at build time; it falls back to
 * 'dev' there when git is unavailable (e.g. some CI/deploy environments), so
 * this module just reads the already-resolved env var rather than shelling
 * out itself — `output: 'export'` has no server runtime to do that in.
 */
export const commitHash = process.env.NEXT_PUBLIC_COMMIT ?? 'dev'
