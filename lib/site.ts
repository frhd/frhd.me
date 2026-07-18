/**
 * Canonical site identity in one place, so the origin and the human-facing
 * strings aren't scattered across metadata, the RSS feed, and links.
 */

/** Canonical origin, no trailing slash. */
export const SITE_ORIGIN = 'https://frhd.me'

/** Site title, shared by page metadata and the RSS channel. */
export const SITE_TITLE = 'frhd.me'

/** Site description, used by the root layout metadata and the RSS channel. */
export const SITE_DESCRIPTION =
  'farhad omid — software engineer. tools, toys, and long-running experiments.'
