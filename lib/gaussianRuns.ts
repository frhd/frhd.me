/**
 * Types, constants, and the pure CSV parser for the recorded gaussian-approx
 * filter runs. This module is deliberately free of `node:fs` so it stays safe
 * to import from the client figure component (which needs `TRAJECTORIES` /
 * `STEPS_PER_RUN` and the `Run` types). The filesystem loader lives in
 * `gaussianRunsLoader.ts`, a server-only module.
 *
 * Each run is a CSV exported by the C `vizga` binary (`-o file.csv`), one row
 * per filter step. Like the photo manifest, the data is validated strictly so
 * a corrupt or truncated export fails the build loudly rather than shipping a
 * broken figure: the header must match exactly, there must be exactly
 * `STEPS_PER_RUN` data rows, and every numeric field must be finite.
 *
 * Floats are rounded to 3 decimals and only the fields the figure actually
 * draws are kept (position/measurement/estimate + the covariance block +
 * rmse), which keeps the JSON handed to the client component small. The
 * exported-but-unused columns (`time`, `est_vx`, `est_vy`, `nis`) are still
 * validated as finite, just not stored — `nis` is ~0 in these runs and is
 * deliberately not surfaced.
 */

/** Exact CSV header every run file must start with. */
export const RUN_HEADER =
  'step,time,true_x,true_y,meas_x,meas_y,est_x,est_y,est_vx,est_vy,cov_xx,cov_xy,cov_yy,rmse,nis'

/** Number of data rows each run must contain. */
export const STEPS_PER_RUN = 100

const COLUMN_COUNT = RUN_HEADER.split(',').length

/** Trajectory names in display order. */
export const TRAJECTORIES = ['circle', 'line', 'fig8', 'random'] as const

export type Trajectory = (typeof TRAJECTORIES)[number]

/** One recorded filter step (the subset of columns the figure draws). */
export interface RunStep {
  step: number
  trueX: number
  trueY: number
  measX: number
  measY: number
  estX: number
  estY: number
  covXX: number
  covXY: number
  covYY: number
  rmse: number
}

export interface Run {
  trajectory: Trajectory
  steps: RunStep[]
}

/** All runs, keyed by trajectory name (iteration order = display order). */
export type GaussianRuns = Record<Trajectory, Run>

function round3(value: number): number {
  return Math.round(value * 1000) / 1000
}

/**
 * Parses one run CSV. Pure (no fs) so the strict validation can be unit-tested
 * with fixture strings instead of temp files. `source` only labels error
 * messages.
 */
export function parseRun(csv: string, trajectory: Trajectory, source: string = trajectory): Run {
  const lines = csv.replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n')

  const header = lines[0]
  if (header !== RUN_HEADER) {
    throw new Error(
      `gaussian run "${source}": unexpected CSV header.\n  expected: ${RUN_HEADER}\n  got:      ${header ?? '<empty file>'}`,
    )
  }

  const dataLines = lines.slice(1)
  if (dataLines.length !== STEPS_PER_RUN) {
    throw new Error(
      `gaussian run "${source}": expected exactly ${STEPS_PER_RUN} data rows, got ${dataLines.length}.`,
    )
  }

  const steps = dataLines.map((line, index) => {
    const cols = line.split(',')
    if (cols.length !== COLUMN_COUNT) {
      throw new Error(
        `gaussian run "${source}" row ${index}: expected ${COLUMN_COUNT} columns, got ${cols.length}.`,
      )
    }

    const nums = cols.map((cell) => Number(cell))
    nums.forEach((value, col) => {
      if (cols[col].trim() === '' || !Number.isFinite(value)) {
        throw new Error(
          `gaussian run "${source}" row ${index}: non-finite value "${cols[col]}" in column ${col}.`,
        )
      }
    })

    // Column order is fixed by RUN_HEADER; unused columns (time, est_vx,
    // est_vy, nis) are validated above but not stored.
    return {
      step: nums[0],
      trueX: round3(nums[2]),
      trueY: round3(nums[3]),
      measX: round3(nums[4]),
      measY: round3(nums[5]),
      estX: round3(nums[6]),
      estY: round3(nums[7]),
      covXX: round3(nums[10]),
      covXY: round3(nums[11]),
      covYY: round3(nums[12]),
      rmse: round3(nums[13]),
    }
  })

  return { trajectory, steps }
}
