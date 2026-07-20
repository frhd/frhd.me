import { describe, expect, it } from 'vitest'

import { covarianceEllipse, toDegrees } from '../ellipse'

describe('covarianceEllipse', () => {
  it('turns a diagonal matrix into an axis-aligned ellipse with 2-sigma radii', () => {
    // eigenvalues 9 (x) and 4 (y); 2-sigma radii are 2*sqrt(lambda) = 6 and 4.
    const e = covarianceEllipse({ xx: 9, xy: 0, yy: 4 })
    expect(e.angle).toBeCloseTo(0, 12)
    expect(e.rx).toBeCloseTo(6, 12)
    expect(e.ry).toBeCloseTo(4, 12)
  })

  it('respects a custom sigma level', () => {
    const e = covarianceEllipse({ xx: 9, xy: 0, yy: 4 }, 1)
    expect(e.rx).toBeCloseTo(3, 12)
    expect(e.ry).toBeCloseTo(2, 12)
  })

  it('recovers the expected angle and axes for a known non-diagonal matrix', () => {
    // [[2,1],[1,2]] -> eigenvalues 3 and 1, major eigenvector along (1,1) = 45deg.
    const e = covarianceEllipse({ xx: 2, xy: 1, yy: 2 })
    expect(toDegrees(e.angle)).toBeCloseTo(45, 10)
    expect(e.rx).toBeCloseTo(2 * Math.sqrt(3), 12)
    expect(e.ry).toBeCloseTo(2 * Math.sqrt(1), 12)
  })

  it('handles the zero matrix without NaN', () => {
    const e = covarianceEllipse({ xx: 0, xy: 0, yy: 0 })
    expect(e.rx).toBe(0)
    expect(e.ry).toBe(0)
    expect(Number.isFinite(e.angle)).toBe(true)
  })

  it('clamps a singular matrix (minor eigenvalue ~0) instead of producing NaN', () => {
    // [[1,1],[1,1]] is rank-1: eigenvalues 2 and 0.
    const e = covarianceEllipse({ xx: 1, xy: 1, yy: 1 })
    expect(e.rx).toBeCloseTo(2 * Math.sqrt(2), 12)
    expect(e.ry).toBe(0)
    expect(Number.isNaN(e.ry)).toBe(false)
    expect(toDegrees(e.angle)).toBeCloseTo(45, 10)
  })
})
