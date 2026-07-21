import type { Metadata } from 'next'

import TetrisRlFigure from '@/app/components/tetris-rl/TetrisRlFigure'

import './tetris-rl-nn.css'

export const metadata: Metadata = {
  title: 'tetris-rl-nn — farhad omid',
  description:
    'A small Deep Q-Network that learned to play Tetris from self-play — running live in the browser, the real trained weights and all.',
}

export default function TetrisRlNnPage() {
  return (
    <div className="project-page">
      <h1 className="project-title">tetris-rl-nn</h1>
      <p className="project-meta">Hobby project · Deep Q-Network · Python / PyTorch</p>

      <p className="project-intro">
        I wanted to see a neural network teach itself Tetris with no rules
        beyond the score, so I built a small Deep Q-Network and let it play
        against itself for a few hundred thousand games. What is below is not a
        recording: the actual trained network is running in your browser, one
        placement at a time, deciding for itself where each piece should go.
      </p>

      {/* The real exported weights, fetched and run client-side. */}
      <figure className="project-figure">
        <TetrisRlFigure />
        <figcaption>
          The trained agent playing live in your browser. Before each drop it
          shades the ten columns by how highly it rates landing there (the strip
          under the board) and outlines the placement it chose; then the piece
          falls and any full rows clear. The 14 board features on the right are
          exactly what the network sees. This is the real exported model —
          about 330&nbsp;KB of weights fetched on load — not a canned animation,
          so every game plays out differently.
        </figcaption>
      </figure>

      <h2 className="project-heading"># how it works</h2>
      <p className="project-para">
        The trick that made this tractable is the action space. Instead of
        learning a sequence of left / right / rotate / drop key presses, the
        agent chooses a <em>placement</em> directly: one of 40 actions, each a
        (column, rotation) pair, saying where the current piece should come to
        rest. That collapses a long chain of moves into a single decision and
        makes the credit assignment far easier.
      </p>
      <p className="project-para">
        It never sees the raw pixels. The board is boiled down to 14 hand-picked
        features — the ten column heights, the aggregate and maximum height, the
        number of covered holes, and the surface bumpiness — and those get
        concatenated with one-hot encodings of the current and next piece for a
        28-number state vector. The network itself is deliberately tiny: a
        multilayer perceptron, 28 → 256 → 256 → 40, trained with Double DQN and
        prioritized experience replay, with exploration annealed away as it
        learned over roughly 480k steps of self-play.
      </p>

      <h2 className="project-heading"># what I found</h2>
      <p className="project-para">
        The reward shaping mattered far more than the architecture. My fancier
        ideas mostly backfired: a dueling network stalled at about a line a
        game, decaying exploration too quickly collapsed the policy back to
        random, and a heavy game-over penalty simply drowned out every other
        signal so the agent learned to fear the board instead of clearing it.
        The version that worked was the plain one with a reward that rewarded
        clears and gently discouraged holes and height.
      </p>
      <p className="project-para">
        Measured greedily on this exact exported model, it clears a mean of
        about 49 lines per game (median 49, ranging from 9 to 88 across 20
        games), placing roughly 160 pieces before it finally tops out. It is
        nowhere near the search-based Tetris bots — it has no lookahead at all,
        it just reacts to the board in front of it — but a 330&nbsp;KB pile of
        weights reliably keeping the stack flat and hunting for clears is more
        than I expected the plain version to pull off. It is the one running
        live above.
      </p>

      <p className="project-para">
        Code, the training journal, and the exporter are on{' '}
        <a href="https://github.com/frhd/tetris-rl-nn">
          github.com/frhd/tetris-rl-nn
        </a>
        .
      </p>
    </div>
  )
}
