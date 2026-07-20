/**
 * Closed-form eigendecomposition of a symmetric 2x2 covariance matrix,
 * turned into the geometry of its confidence ellipse. Kept as a small pure
 * module so the math is unit-testable independently of the SVG figure.
 *
 * For a symmetric matrix [[xx, xy], [xy, yy]] the eigenvalues are
 *   lambda = (xx + yy) / 2 +/- sqrt( ((xx + yy) / 2)^2 - det )
 * and the major eigenvector's angle from +x is 0.5 * atan2(2*xy, xx - yy).
 * A confidence ellipse of `sigma` standard deviations has semi-axes
 * sigma * sqrt(lambda) along each eigenvector.
 */

export interface Covariance2 {
  xx: number
  xy: number
  yy: number
}

export interface Ellipse {
  /** Semi-axis along the major eigenvector: sigma * sqrt(lambda_major). */
  rx: number
  /** Semi-axis along the minor eigenvector: sigma * sqrt(lambda_minor). */
  ry: number
  /** Rotation of the major axis from the +x axis, in radians. */
  angle: number
}

/** Confidence level, in standard deviations, of the drawn ellipse. */
export const DEFAULT_SIGMA = 2

/**
 * Ellipse geometry for a covariance matrix. Eigenvalues are clamped at zero so
 * a zero (or rounded, slightly negative) matrix yields radii of 0 rather than
 * NaN.
 */
export function covarianceEllipse(cov: Covariance2, sigma: number = DEFAULT_SIGMA): Ellipse {
  const { xx, xy, yy } = cov
  const halfTrace = (xx + yy) / 2
  const det = xx * yy - xy * xy
  // Non-negative for any real symmetric matrix; max(0, ...) guards rounding.
  const spread = Math.sqrt(Math.max(0, halfTrace * halfTrace - det))
  const lambdaMajor = Math.max(0, halfTrace + spread)
  const lambdaMinor = Math.max(0, halfTrace - spread)

  return {
    rx: sigma * Math.sqrt(lambdaMajor),
    ry: sigma * Math.sqrt(lambdaMinor),
    angle: 0.5 * Math.atan2(2 * xy, xx - yy),
  }
}

/** Radians to degrees, for SVG `rotate()` transforms. */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}
