import fs from 'node:fs'
import path from 'node:path'

import sharp from 'sharp'

/**
 * Pre-sizing pipeline for the photos/ section.
 *
 * Scans `content/photos/<year>/*.{jpg,jpeg,png}` and writes two WebP
 * derivatives per original into the (gitignored) `public/photos/<year>/`:
 * `<slug>-thumb.webp` (480w) for grids and `<slug>-large.webp` (1600w) for
 * detail pages. Runs ahead of `next build` (see the "build" script in
 * package.json) since the static export can only serve pre-generated files.
 *
 * A missing `content/photos/` directory is a normal, expected state (the
 * manifest starts empty) — this exits 0 quietly rather than failing the
 * build. Derivatives already newer than their source are skipped so repeat
 * builds are fast.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content/photos')
const OUTPUT_DIR = path.join(process.cwd(), 'public/photos')

const PHOTO_EXTENSION_PATTERN = /\.(jpe?g|png)$/i

const SIZES = [
  { suffix: 'thumb', width: 480 },
  { suffix: 'large', width: 1600 },
]

/** Whether `outPath` is at least as new as `srcPath` (both must exist). */
function isUpToDate(srcPath, outPath) {
  if (!fs.existsSync(outPath)) return false
  return fs.statSync(outPath).mtimeMs >= fs.statSync(srcPath).mtimeMs
}

async function processOriginal(year, filename) {
  const slug = filename.replace(PHOTO_EXTENSION_PATTERN, '')
  const srcPath = path.join(CONTENT_DIR, year, filename)
  const outDir = path.join(OUTPUT_DIR, year)

  for (const { suffix, width } of SIZES) {
    const outPath = path.join(outDir, `${slug}-${suffix}.webp`)

    if (isUpToDate(srcPath, outPath)) {
      console.log(`photos: ${year}/${slug}-${suffix}.webp up to date`)
      continue
    }

    fs.mkdirSync(outDir, { recursive: true })
    await sharp(srcPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath)
    console.log(`photos: generated ${year}/${slug}-${suffix}.webp`)
  }
}

async function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('photos: no content/photos/ directory, skipping.')
    return
  }

  const years = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  for (const year of years) {
    const filenames = fs
      .readdirSync(path.join(CONTENT_DIR, year))
      .filter((name) => PHOTO_EXTENSION_PATTERN.test(name))

    for (const filename of filenames) {
      await processOriginal(year, filename)
    }
  }
}

main().catch((error) => {
  console.error('photos: failed —', error)
  process.exitCode = 1
})
