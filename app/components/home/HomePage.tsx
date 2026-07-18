import type { PostMeta } from '@/lib/posts'
import type { Project } from '@/lib/projects'

/**
 * The editorial homepage: a single page with a wide two-column reading layout
 * and in-page anchor navigation (#work / #writing / #now). Purely
 * presentational — it receives already-loaded content so it can be unit-tested
 * without touching the filesystem or async RSC plumbing. Headings, nav, and
 * entry titles are set in Geist Sans; running prose (intro, blurbs, "now",
 * "elsewhere") is the Benne serif.
 */
export interface HomePageProps {
  posts: PostMeta[]
  projects: Project[]
}

function projectHref(project: Project): string {
  if (project.slug) return `/projects/${project.slug}/`
  if (project.href) return project.href
  // Every entry must have slug or href; the throw enforces this at build time.
  throw new Error(`project "${project.name}" has neither slug nor href`)
}

export default function HomePage({ posts, projects }: HomePageProps) {
  return (
    <main className="site">
      <header className="site-header">
        <h1 className="site-name">Farhad Omid</h1>
        <nav className="site-nav">
          <a href="#work">Work</a>
          <a href="#writing">Writing</a>
          <a href="#now">Now</a>
        </nav>
      </header>

      <p className="home-intro">
        Software engineer. I build tools, toys, and long-running experiments —
        most recently teaching this website to stop pretending it&rsquo;s a
        computer.
      </p>

      <div className="home-grid">
        <section id="work" aria-labelledby="work-heading">
          <h2 id="work-heading" className="home-heading">
            Work
          </h2>
          {projects.map((project) => (
            <div key={project.name} className="entry">
              <a className="entry-title" href={projectHref(project)}>
                {project.name}
              </a>
              <p className="entry-blurb">{project.oneLiner}</p>
            </div>
          ))}
        </section>

        <div className="home-col">
          <section id="writing" aria-labelledby="writing-heading">
            <h2 id="writing-heading" className="home-heading">
              Writing
            </h2>
            {posts.map((post) => (
              <div key={post.slug} className="entry">
                <div className="entry-head">
                  <a className="entry-title" href={`/writing/${post.slug}/`}>
                    {post.title}
                  </a>
                  <span className="entry-date">{post.date}</span>
                </div>
                {post.summary ? (
                  <p className="entry-blurb">{post.summary}</p>
                ) : null}
              </div>
            ))}
          </section>

          <section id="now" aria-labelledby="now-heading">
            <h2 id="now-heading" className="home-heading">
              Now
            </h2>
            <p className="home-now">
              Redesigning this site for reading. The terminal it used to be
              still lives at <a href="/terminal">/terminal</a>.
            </p>
          </section>

          <section aria-labelledby="elsewhere-heading">
            <h2 id="elsewhere-heading" className="home-heading">
              Elsewhere
            </h2>
            <p className="home-elsewhere">
              <a href="https://github.com/frhd">github.com/frhd</a>
              <span className="home-sep"> · </span>
              <a href="mailto:farhad@omid.cc">farhad@omid.cc</a>
              <span className="home-sep"> · </span>
              <a href="/rss.xml">rss</a>
            </p>
          </section>
        </div>
      </div>

      <footer className="home-footer">
        <span className="home-hint">press t</span>
      </footer>
    </main>
  )
}
