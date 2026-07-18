import { afterEach, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { getAllPhotos, photoSrc, photoYears, type PhotoEntry } from '../photos'

/**
 * Fixture originals are written to a temp `content/photos/<year>/` tree per
 * test so the manifest/on-disk validation can be exercised against the real
 * filesystem. `getAllPhotos` never reads image bytes, so fixture files can be
 * empty placeholders.
 */
let fixtureDir: string

function writeOriginal(dir: string, year: string, filename: string) {
  const yearDir = path.join(dir, year)
  fs.mkdirSync(yearDir, { recursive: true })
  fs.writeFileSync(path.join(yearDir, filename), '')
}

afterEach(() => {
  if (fixtureDir) fs.rmSync(fixtureDir, { recursive: true, force: true })
})

function makeFixtureDir(): string {
  fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'photos-fixtures-'))
  return fixtureDir
}

describe('getAllPhotos', () => {
  it('returns [] for an empty manifest and a missing content dir', () => {
    const dir = path.join(os.tmpdir(), 'photos-fixtures-does-not-exist')
    expect(getAllPhotos([], dir)).toEqual([])
  })

  it('returns [] for an empty manifest and an empty content dir', () => {
    const dir = makeFixtureDir()
    expect(getAllPhotos([], dir)).toEqual([])
  })

  it('sorts photos by year descending, then slug ascending', () => {
    const dir = makeFixtureDir()
    writeOriginal(dir, '2024', 'zebra.jpg')
    writeOriginal(dir, '2026', 'banana.png')
    writeOriginal(dir, '2026', 'apple.jpg')

    const manifest: PhotoEntry[] = [
      { year: '2024', slug: 'zebra', ext: 'jpg' },
      { year: '2026', slug: 'banana', ext: 'png' },
      { year: '2026', slug: 'apple', ext: 'jpg' },
    ]

    const photos = getAllPhotos(manifest, dir)
    expect(photos.map((p) => `${p.year}/${p.slug}`)).toEqual([
      '2026/apple',
      '2026/banana',
      '2024/zebra',
    ])
  })

  it('includes the caption when present and omits it when absent', () => {
    const dir = makeFixtureDir()
    writeOriginal(dir, '2026', 'with-caption.jpg')
    writeOriginal(dir, '2026', 'no-caption.jpg')

    const manifest: PhotoEntry[] = [
      { year: '2026', slug: 'with-caption', ext: 'jpg', caption: 'a caption' },
      { year: '2026', slug: 'no-caption', ext: 'jpg' },
    ]

    const photos = getAllPhotos(manifest, dir)
    expect(photos.find((p) => p.slug === 'with-caption')?.caption).toBe('a caption')
    expect(photos.find((p) => p.slug === 'no-caption')?.caption).toBeUndefined()
  })

  it('throws when a manifest entry has no matching original on disk', () => {
    const dir = makeFixtureDir()
    // Nothing written to disk.
    const manifest: PhotoEntry[] = [{ year: '2026', slug: 'ghost', ext: 'jpg' }]

    expect(() => getAllPhotos(manifest, dir)).toThrow(/2026\/ghost/)
  })

  it('throws when a manifest entry references the wrong extension', () => {
    const dir = makeFixtureDir()
    writeOriginal(dir, '2026', 'mismatch.png')
    const manifest: PhotoEntry[] = [{ year: '2026', slug: 'mismatch', ext: 'jpg' }]

    expect(() => getAllPhotos(manifest, dir)).toThrow(/2026\/mismatch/)
  })

  it('throws when an on-disk original has no manifest entry', () => {
    const dir = makeFixtureDir()
    writeOriginal(dir, '2026', 'orphan.jpg')

    expect(() => getAllPhotos([], dir)).toThrow(/2026\/orphan/)
  })

  it('ignores non-photo files on disk', () => {
    const dir = makeFixtureDir()
    writeOriginal(dir, '2026', '.DS_Store')
    writeOriginal(dir, '2026', 'notes.txt')

    expect(getAllPhotos([], dir)).toEqual([])
  })
})

describe('photoSrc', () => {
  it('builds the thumb derivative path', () => {
    const photo: PhotoEntry = { year: '2026', slug: 'sunset', ext: 'jpg' }
    expect(photoSrc(photo, 'thumb')).toBe('/photos/2026/sunset-thumb.webp')
  })

  it('builds the large derivative path', () => {
    const photo: PhotoEntry = { year: '2026', slug: 'sunset', ext: 'jpg' }
    expect(photoSrc(photo, 'large')).toBe('/photos/2026/sunset-large.webp')
  })
})

describe('photoYears', () => {
  it('returns [] for an empty photo list', () => {
    expect(photoYears([])).toEqual([])
  })

  it('returns unique years, newest first', () => {
    const photos: PhotoEntry[] = [
      { year: '2026', slug: 'apple', ext: 'jpg' },
      { year: '2026', slug: 'banana', ext: 'jpg' },
      { year: '2024', slug: 'zebra', ext: 'jpg' },
      { year: '2025', slug: 'mid', ext: 'jpg' },
    ]
    expect(photoYears(photos)).toEqual(['2026', '2025', '2024'])
  })
})
