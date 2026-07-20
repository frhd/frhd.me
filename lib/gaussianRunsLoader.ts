import fs from 'node:fs'
import path from 'node:path'

import type { GaussianRuns, Trajectory } from './gaussianRuns'
import { parseRun, TRAJECTORIES } from './gaussianRuns'

/**
 * Server-only filesystem loader for the recorded gaussian-approx runs. Kept
 * apart from `gaussianRuns.ts` (which the client figure imports for its types
 * and constants) so `node:fs` never reaches the browser bundle. All parsing
 * and validation lives in `parseRun`; this module only locates and reads the
 * files.
 */

export const GAUSSIAN_RUNS_DIR = path.join(process.cwd(), 'content/projects/gaussian-approx')

/** CSV filename backing each trajectory. */
const RUN_FILES: Record<Trajectory, string> = {
  circle: 'circle-l7.csv',
  line: 'line-l7.csv',
  fig8: 'fig8-l7.csv',
  random: 'random-l7.csv',
}

/**
 * Reads and validates all four run CSVs, returned keyed by trajectory in
 * display order. `dir` is injectable for testing; production callers omit it.
 * Throws (failing the build) on any malformed file.
 */
export function loadGaussianRuns(dir: string = GAUSSIAN_RUNS_DIR): GaussianRuns {
  const runs = {} as GaussianRuns
  for (const trajectory of TRAJECTORIES) {
    const file = path.join(dir, RUN_FILES[trajectory])
    const csv = fs.readFileSync(file, 'utf8')
    runs[trajectory] = parseRun(csv, trajectory, RUN_FILES[trajectory])
  }
  return runs
}
