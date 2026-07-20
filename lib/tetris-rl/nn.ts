/**
 * MLP inference for the trained DQN: 28 -> Linear(256) -> ReLU ->
 * Linear(256) -> ReLU -> Linear(40). Weights come from `model.bin`
 * (float32 little-endian, order W0,b0,W1,b1,W2,b2; each W row-major with
 * shape `(out, in)`, so `q[i] = sum_j W[i*in + j] * x[j] + b[i]`).
 *
 * The forward pass accumulates in JS `number` (float64) over the float32
 * weights — the exact arithmetic the golden trace was generated with.
 */

const IN_DIM = 28
const H1_DIM = 256
const H2_DIM = 256
const OUT_DIM = 40

export interface QNet {
  W0: Float32Array // (256, 28)
  b0: Float32Array // (256)
  W1: Float32Array // (256, 256)
  b1: Float32Array // (256)
  W2: Float32Array // (40, 256)
  b2: Float32Array // (40)
}

export function parseModel(buf: ArrayBuffer): QNet {
  const f32 = new Float32Array(buf)
  let off = 0
  const take = (len: number): Float32Array => {
    const view = f32.subarray(off, off + len)
    off += len
    return view
  }
  const W0 = take(H1_DIM * IN_DIM)
  const b0 = take(H1_DIM)
  const W1 = take(H2_DIM * H1_DIM)
  const b1 = take(H2_DIM)
  const W2 = take(OUT_DIM * H2_DIM)
  const b2 = take(OUT_DIM)
  if (off !== f32.length) {
    throw new Error(
      `model.bin size mismatch: expected ${off} floats, got ${f32.length}`,
    )
  }
  return { W0, b0, W1, b1, W2, b2 }
}

function linearRelu(
  W: Float32Array,
  b: Float32Array,
  x: ArrayLike<number>,
  outDim: number,
  inDim: number,
): Float64Array {
  const out = new Float64Array(outDim)
  for (let i = 0; i < outDim; i++) {
    let acc = b[i]
    const base = i * inDim
    for (let j = 0; j < inDim; j++) {
      acc += W[base + j] * x[j]
    }
    out[i] = acc > 0 ? acc : 0
  }
  return out
}

export function qValues(net: QNet, state: Float32Array): Float64Array {
  const h0 = linearRelu(net.W0, net.b0, state, H1_DIM, IN_DIM)
  const h1 = linearRelu(net.W1, net.b1, h0, H2_DIM, H1_DIM)
  const q = new Float64Array(OUT_DIM)
  for (let i = 0; i < OUT_DIM; i++) {
    let acc = net.b2[i]
    const base = i * H2_DIM
    for (let j = 0; j < H2_DIM; j++) {
      acc += net.W2[base + j] * h1[j]
    }
    q[i] = acc
  }
  return q
}

/** First maximal index (np.argmax tie semantics): only a strictly greater value wins. */
export function argmax(values: ArrayLike<number>): number {
  let best = 0
  let bestVal = values[0]
  for (let i = 1; i < values.length; i++) {
    if (values[i] > bestVal) {
      bestVal = values[i]
      best = i
    }
  }
  return best
}
