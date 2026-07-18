import fs from 'node:fs'
import path from 'node:path'

/**
 * Content layer for photos.
 *
 * Unlike posts/projects, photos have no frontmatter file of their own —
 * `content/photos/<year>/<slug>.<ext>` holds only the pixels. Metadata
 * (caption) lives in the explicit `photoManifest` below, and the two are
 * cross-validated in both directions: a manifest entry with no matching
 * original throws, and an on-disk original with no manifest entry throws.
 * That keeps the manifest and the originals directory from silently drifting
 * apart, the same way malformed post frontmatter fails the build.
 *
 * `getAllPhotos` only touches the filesystem via `existsSync`/`readdirSync` —
 * it never calls into sharp — so it stays cheap enough to run synchronously
 * inside the (editor) layout at build time. The actual derivative images
 * (thumb/large WebP) are produced ahead of time by `scripts/photos.mjs`.
 */

export const PHOTOS_DIR = path.join(process.cwd(), 'content/photos')

const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png'] as const

/** Allowed original file extension (without the dot). */
export type PhotoExt = (typeof PHOTO_EXTENSIONS)[number]

/** A single photo: the manifest's source of truth, keyed by year + slug. */
export interface PhotoEntry {
  /** Directory the original lives in, e.g. "2026". */
  year: string
  /** Filename (without extension); becomes the detail page's last segment. */
  slug: string
  ext: PhotoExt
  /** Optional caption shown on the detail page. */
  caption?: string
}

/**
 * The site's photos. Empty until Phase 4 seeds it; every real entry must
 * point at an original that actually exists in `content/photos/`.
 */
export const photoManifest: PhotoEntry[] = []

function isPhotoExt(ext: string): ext is PhotoExt {
  return (PHOTO_EXTENSIONS as readonly string[]).includes(ext)
}

/** `content/photos/<year>/<slug>.<ext>` for a manifest entry. */
function originalPath(dir: string, entry: Pick<PhotoEntry, 'year' | 'slug' | 'ext'>): string {
  return path.join(dir, entry.year, `${entry.slug}.${entry.ext}`)
}

/** `year/slug.ext` — used both as a disk-scan key and in error messages. */
function entryKey(entry: Pick<PhotoEntry, 'year' | 'slug' | 'ext'>): string {
  return `${entry.year}/${entry.slug}.${entry.ext}`
}

/**
 * Every photo original actually present under `dir`, as `year/slug.ext`
 * keys. Missing `dir` scans as empty rather than throwing — the emptiness (or
 * not) is reconciled against the manifest by the caller.
 */
function scanOriginals(dir: string): Set<string> {
  const keys = new Set<string>()
  if (!fs.existsSync(dir)) return keys

  const yearEntries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory())

  for (const yearEntry of yearEntries) {
    const year = yearEntry.name
    const yearDir = path.join(dir, year)
    for (const filename of fs.readdirSync(yearDir)) {
      const ext = filename.slice(filename.lastIndexOf('.') + 1)
      if (!isPhotoExt(ext)) continue
      const slug = filename.slice(0, -(ext.length + 1))
      keys.add(entryKey({ year, slug, ext }))
    }
  }

  return keys
}

/**
 * All photos, validated and sorted (year descending, slug ascending as a
 * deterministic tie-break — ties on year are common, and an unstable order
 * would flap `generateStaticParams` between builds). `manifest`/`dir` are
 * injectable for testing; production callers omit both.
 *
 * Throws if any manifest entry has no matching original on disk, or if any
 * on-disk original has no manifest entry.
 */
export function getAllPhotos(
  manifest: PhotoEntry[] = photoManifest,
  dir: string = PHOTOS_DIR,
): PhotoEntry[] {
  const onDisk = scanOriginals(dir)
  const claimed = new Set<string>()

  for (const entry of manifest) {
    const key = entryKey(entry)
    claimed.add(key)
    if (!onDisk.has(key)) {
      throw new Error(
        `Photo "${entry.year}/${entry.slug}": no original found at ` +
          `"${originalPath(dir, entry)}".`,
      )
    }
  }

  for (const key of onDisk) {
    if (!claimed.has(key)) {
      throw new Error(
        `Photo original "${key}" found on disk but has no entry in photoManifest.`,
      )
    }
  }

  return [...manifest].sort((a, b) => {
    if (a.year !== b.year) return a.year < b.year ? 1 : -1
    return a.slug < b.slug ? -1 : 1
  })
}

/** Derived asset path for a photo at a given size, e.g. for use in `<img src>`. */
export function photoSrc(photo: PhotoEntry, size: 'thumb' | 'large'): string {
  return `/photos/${photo.year}/${photo.slug}-${size}.webp`
}

/** Unique years present in `photos`, newest first. */
export function photoYears(photos: PhotoEntry[]): string[] {
  const years = new Set(photos.map((photo) => photo.year))
  return [...years].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
}
