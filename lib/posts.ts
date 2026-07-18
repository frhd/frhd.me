import fs from 'node:fs'
import path from 'node:path'

import matter from 'gray-matter'
import { JSON_SCHEMA, load as loadYaml } from 'js-yaml'

/**
 * Content layer for writing posts.
 *
 * Posts are MDX files in `content/writing/`. The slug is the filename without
 * its extension. Frontmatter is validated up front so that malformed content
 * fails `pnpm check` / the build rather than rendering oddly.
 *
 * `getPost` returns the raw MDX body as `content`; the actual MDX rendering is
 * done by the page (e.g. next-mdx-remote in a server component), keeping this
 * module renderer-agnostic.
 */

export const POSTS_DIR = path.join(process.cwd(), 'content/writing')

const POST_EXTENSION = '.mdx'

/** Frontmatter + slug for a post, without its body. Used for listings. */
export interface PostMeta {
  slug: string
  /** Post title. */
  title: string
  /** Publication date in canonical `YYYY-MM-DD` form. */
  date: string
  /** Optional one-line summary. */
  summary?: string
}

/** A fully loaded post: metadata plus its raw MDX body. */
export interface Post extends PostMeta {
  /** Raw MDX body (frontmatter stripped), ready to be rendered. */
  content: string
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * A date is valid when it is exactly `YYYY-MM-DD` AND names a real calendar
 * day. The round-trip check rejects impossible dates like `2026-02-30` or
 * `2026-13-01`, which the pattern alone would let through.
 */
function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.toISOString().slice(0, 10) === value
}

/**
 * Parse frontmatter with the YAML JSON schema so scalars stay as written —
 * notably, `date: 2026-07-18` is kept as the string "2026-07-18" instead of
 * being silently coerced to a JS Date, which would defeat format validation.
 */
function readFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const parsed = matter(raw, {
    engines: {
      yaml: (input: string) =>
        (loadYaml(input, { schema: JSON_SCHEMA }) ?? {}) as object,
    },
  })
  return { data: parsed.data as Record<string, unknown>, content: parsed.content }
}

/**
 * Validate and shape a single post from its raw file contents. Throws a clear,
 * slug-tagged error on any invalid or missing required frontmatter.
 */
export function parsePost(slug: string, raw: string): Post {
  let data: Record<string, unknown>
  let content: string
  try {
    ;({ data, content } = readFrontmatter(raw))
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Post "${slug}": invalid frontmatter YAML. ${reason}`)
  }
  const { title, date, summary } = data

  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error(
      `Post "${slug}": missing or invalid "title" (expected a non-empty string).`,
    )
  }

  if (typeof date !== 'string' || !isValidDate(date)) {
    throw new Error(
      `Post "${slug}": missing or invalid "date" ` +
        `(expected a real calendar date in YYYY-MM-DD form, got ${JSON.stringify(date)}).`,
    )
  }

  if (summary !== undefined && typeof summary !== 'string') {
    throw new Error(`Post "${slug}": "summary" must be a string when present.`)
  }

  const post: Post = { slug, title, date, content }
  if (summary !== undefined) post.summary = summary
  return post
}

function slugFromFilename(filename: string): string {
  return filename.slice(0, -POST_EXTENSION.length)
}

/**
 * All posts as metadata, newest first. Ties on date are broken by slug so the
 * order is deterministic. `dir` is injectable for testing; production callers
 * omit it.
 */
export function getAllPosts(dir: string = POSTS_DIR): PostMeta[] {
  const filenames = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(POST_EXTENSION))

  const posts = filenames.map((filename) => {
    const slug = slugFromFilename(filename)
    const raw = fs.readFileSync(path.join(dir, filename), 'utf8')
    // Discard the body; the listing only needs metadata.
    const { content: _body, ...meta } = parsePost(slug, raw)
    return meta
  })

  return posts.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return a.slug < b.slug ? -1 : 1
  })
}

/**
 * Load one post by slug, including its raw MDX body. Throws if the file is
 * missing or its frontmatter is invalid.
 */
export function getPost(slug: string, dir: string = POSTS_DIR): Post {
  let raw: string
  try {
    raw = fs.readFileSync(path.join(dir, `${slug}${POST_EXTENSION}`), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Post "${slug}" not found.`)
    }
    throw error
  }
  return parsePost(slug, raw)
}
