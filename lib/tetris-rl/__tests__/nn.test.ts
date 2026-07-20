import { describe, expect, it } from 'vitest'

import { argmax, parseModel, qValues } from '../nn'

const IN_DIM = 28
const HID = 256
const OUT_DIM = 40

/**
 * Builds a full-size (28->256->256->40) model whose layers are identity on the
 * first 28 lanes, so `q[i] = relu(x[i])` for i < 28 and 0 otherwise. Exercises
 * the row-major `(out, in)` indexing and the ReLU without the golden fixture.
 */
function identityModel(): ArrayBuffer {
  const total = HID * IN_DIM + HID + HID * HID + HID + OUT_DIM * HID + OUT_DIM
  const f = new Float32Array(total)
  let off = 0
  // W0 (256, 28): 1 on the diagonal for the first 28 rows.
  for (let i = 0; i < HID; i++) {
    for (let j = 0; j < IN_DIM; j++) {
      if (i < IN_DIM && i === j) f[off + i * IN_DIM + j] = 1
    }
  }
  off += HID * IN_DIM
  off += HID // b0 = 0
  // W1 (256, 256): identity.
  for (let i = 0; i < HID; i++) f[off + i * HID + i] = 1
  off += HID * HID
  off += HID // b1 = 0
  // W2 (40, 256): pick lane i.
  for (let i = 0; i < OUT_DIM; i++) f[off + i * HID + i] = 1
  off += OUT_DIM * HID
  off += OUT_DIM // b2 = 0
  return f.buffer
}

describe('argmax', () => {
  it('returns the first index on ties', () => {
    expect(argmax([1, 3, 3, 2])).toBe(1)
    expect(argmax([5, 5, 5])).toBe(0)
    expect(argmax([-1, -1, -2])).toBe(0)
    expect(argmax([0, 0, 1, 1])).toBe(2)
  })

  it('finds a strict maximum', () => {
    expect(argmax([2, 9, 4])).toBe(1)
    expect(argmax([9, 2, 4])).toBe(0)
    expect(argmax([2, 4, 9])).toBe(2)
  })
})

describe('parseModel', () => {
  it('slices the buffer into the six weight/bias tensors', () => {
    const net = parseModel(identityModel())
    expect(net.W0.length).toBe(HID * IN_DIM)
    expect(net.b0.length).toBe(HID)
    expect(net.W1.length).toBe(HID * HID)
    expect(net.b1.length).toBe(HID)
    expect(net.W2.length).toBe(OUT_DIM * HID)
    expect(net.b2.length).toBe(OUT_DIM)
  })

  it('throws on a size mismatch', () => {
    expect(() => parseModel(new ArrayBuffer(8))).toThrow(/size mismatch/)
  })
})

describe('qValues', () => {
  it('computes relu(x) through the identity model (row-major indexing + ReLU)', () => {
    const net = parseModel(identityModel())
    const x = new Float32Array(IN_DIM)
    for (let i = 0; i < IN_DIM; i++) x[i] = i - 14 // both signs
    const q = qValues(net, x)
    expect(q.length).toBe(OUT_DIM)
    for (let i = 0; i < OUT_DIM; i++) {
      const expected = i < IN_DIM ? Math.max(0, i - 14) : 0
      expect(q[i]).toBeCloseTo(expected, 6)
    }
  })
})
