import { cache } from 'react'

import type { Metadata } from 'next'
import Link from 'next/link'

import { getAllPhotos, photoSrc, photoYears } from '@/lib/photos'
import { SITE_TITLE } from '@/lib/site'

/**
 * The thumbnail grid for one year at `/photos/<year>/`. Every year present in
 * the manifest is prerendered at build time (static export) via
 * generateStaticParams; `dynamicParams = false` means any other year 404s
 * instead of hitting a nonexistent server render.
 *
 * While the manifest is still empty, `photoYears` returns `[]`, so this route
 * generates zero pages — that's the empty-window case phase 4a verifies.
 */

const getCachedPhotos = cache(getAllPhotos)

interface PhotoYearParams {
  year: string
}

export const dynamicParams = false

export function generateStaticParams(): PhotoYearParams[] {
  return photoYears(getCachedPhotos()).map((year) => ({ year }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PhotoYearParams>
}): Promise<Metadata> {
  const { year } = await params
  return { title: `photos/${year} — ${SITE_TITLE}` }
}

export default async function PhotoYearPage({
  params,
}: {
  params: Promise<PhotoYearParams>
}) {
  const { year } = await params
  const photos = getCachedPhotos().filter((photo) => photo.year === year)

  return (
    <div className="photo-grid">
      {photos.map((photo) => (
        <Link key={photo.slug} href={`/photos/${photo.year}/${photo.slug}/`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimization */}
          <img
            src={photoSrc(photo, 'thumb')}
            alt={photo.caption ?? photo.slug}
            loading="lazy"
          />
        </Link>
      ))}
    </div>
  )
}
