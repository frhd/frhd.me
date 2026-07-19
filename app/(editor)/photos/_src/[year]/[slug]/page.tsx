import { cache } from 'react'

import type { Metadata } from 'next'
import Link from 'next/link'

import { getAllPhotos, photoSrc, type PhotoEntry } from '@/lib/photos'
import { SITE_TITLE } from '@/lib/site'

/**
 * A single photo at `/photos/<year>/<slug>/`: the large derivative, an
 * optional caption, and prev/next navigation within the year (ordered the
 * same way `getAllPhotos` sorts — slug ascending within a year). Every
 * (year, slug) pair is prerendered at build time via generateStaticParams;
 * `dynamicParams = false` means any other pair 404s instead of hitting a
 * nonexistent server render.
 */

const getCachedPhotos = cache(getAllPhotos)

interface PhotoParams {
  year: string
  slug: string
}

export const dynamicParams = false

export function generateStaticParams(): PhotoParams[] {
  return getCachedPhotos().map((photo) => ({ year: photo.year, slug: photo.slug }))
}

/**
 * The photo at `year/slug` plus its neighbors within that year, in the
 * manifest's sort order. Throws if `year/slug` isn't found — with
 * `dynamicParams = false` that should be unreachable at build time, since
 * every rendered pair came from `generateStaticParams` above.
 */
function findPhotoWithNeighbors(
  photos: PhotoEntry[],
  year: string,
  slug: string,
): { photo: PhotoEntry; prev?: PhotoEntry; next?: PhotoEntry } {
  const yearPhotos = photos.filter((photo) => photo.year === year)
  const index = yearPhotos.findIndex((photo) => photo.slug === slug)
  if (index === -1) {
    throw new Error(`Photo "${year}/${slug}" not found among generated static params.`)
  }
  return {
    photo: yearPhotos[index],
    prev: index > 0 ? yearPhotos[index - 1] : undefined,
    next: index < yearPhotos.length - 1 ? yearPhotos[index + 1] : undefined,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PhotoParams>
}): Promise<Metadata> {
  const { year, slug } = await params
  const { photo } = findPhotoWithNeighbors(getCachedPhotos(), year, slug)
  return { title: `${photo.caption ?? photo.slug} — ${SITE_TITLE}` }
}

export default async function PhotoPage({
  params,
}: {
  params: Promise<PhotoParams>
}) {
  const { year, slug } = await params
  const { photo, prev, next } = findPhotoWithNeighbors(getCachedPhotos(), year, slug)

  return (
    <div className="photo-detail">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimization */}
      <img src={photoSrc(photo, 'large')} alt={photo.caption ?? photo.slug} />
      {photo.caption && <p className="photo-caption">{photo.caption}</p>}
      <nav className="photo-nav">
        {prev ? (
          <Link href={`/photos/${year}/${prev.slug}/`}>← {prev.slug}</Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/photos/${year}/${next.slug}/`}>{next.slug} →</Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}
