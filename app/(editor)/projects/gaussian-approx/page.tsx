import type { Metadata } from 'next'

import KalmanFigure from '@/app/components/gaussian-approx/KalmanFigure'
import { loadGaussianRuns } from '@/lib/gaussianRunsLoader'

import './gaussian-approx.css'

export const metadata: Metadata = {
  title: 'gaussian-approx — farhad omid',
  description:
    'A hobby sigma-point (unscented) Kalman filter in C, with an ASCII terminal visualizer and an interactive figure replaying real recorded runs.',
}

export default function GaussianApproxPage() {
  const runs = loadGaussianRuns()

  return (
    <div className="project-page">
      <h1 className="project-title">gaussian-approx</h1>
      <p className="project-meta">Hobby project · sigma-point Kalman filter in C</p>

      <p className="project-intro">
        I wanted to understand how sigma-point (unscented) Kalman filters work,
        and the way that finally stuck was watching one run. So this is two
        small things: a dependency-free C filter library, and an ASCII terminal
        visualizer that tracks a moving target from noisy measurements and draws
        the whole thing (grids, markers, and covariance ellipses) in the
        terminal.
      </p>

      {/* The figure replays real recorded runs of the C binary. */}
      <figure className="project-figure">
        <KalmanFigure runs={runs} />
        <figcaption>
          A tracking run, replayed from real output of the C binary (exported to
          CSV, one row per step). The thin grey line is the true path, the faint
          dots are the noisy position measurements the filter actually sees, the
          blue trail is its estimate, and the blue ellipse is the current
          2σ position covariance. Switch trajectories or scrub the timeline.
        </figcaption>
      </figure>

      <h2 className="project-heading"># how it works</h2>
      <p className="project-para">
        Rather than linearizing the motion and measurement models with
        Jacobians the way an extended Kalman filter does, a sigma-point filter
        picks a small set of sample points that capture the current mean and
        covariance, pushes each one through the real nonlinear model, and
        reconstructs the resulting Gaussian from where they land. This build
        uses pre-computed optimal sample placements at three precision levels
        (3, 5, or 7 points per axis), all in pure C with nothing beyond libc and
        libm.
      </p>

      <h2 className="project-heading"># what I found</h2>
      <p className="project-para">
        The surprise was how little the approximation level mattered. For this
        near-linear constant-velocity model the 3-, 5-, and 7-point filters
        produce essentially the same estimate. The extra sigma points buy you
        nothing until the dynamics actually bend, which is exactly the sort of
        thing you only believe once you have watched it. The honest failure is
        elsewhere: under the heavy measurement noise the estimate visibly lags
        the truth on the curved trajectories, leaning on the constant-velocity
        assumption through each turn before the measurements pull it back. The
        near-straight <code>line</code> run tracks tightly;{' '}
        <code>random</code> is the stress case.
      </p>

      <p className="project-para">
        Code, build instructions, and the other demo modes are on{' '}
        <a href="https://github.com/frhd/gaussian-approx">
          github.com/frhd/gaussian-approx
        </a>
        .
      </p>
    </div>
  )
}
