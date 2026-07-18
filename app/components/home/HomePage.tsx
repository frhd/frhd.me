import type { PostMeta } from '@/lib/posts'
import type { Project } from '@/lib/projects'

/**
 * The quiet, text-first homepage. Purely presentational: it receives the
 * already-loaded content so it can be unit-tested without touching the
 * filesystem or async RSC plumbing. The `##` prefixes are literal README-voice
 * text rendered inside real semantic headings.
 */
export interface HomePageProps {
  posts: PostMeta[]
  projects: Project[]
}

function projectHref(project: Project): string {
  return project.slug ? `/projects/${project.slug}/` : project.href
}

export default function HomePage({ posts, projects }: HomePageProps) {
  return (
    <main className="home">
      <h1 className="home-name">farhad omid</h1>
      <p className="home-intro">
        software engineer. i build tools, toys, and long-running experiments.
        <br />
        this page is plain on purpose.
      </p>

      <section className="home-section" aria-labelledby="work-heading">
        <h2 id="work-heading" className="home-heading">
          ## work
        </h2>
        <ul className="home-list">
          {projects.map((project) => (
            <li key={project.name} className="home-item">
              <a className="home-link" href={projectHref(project)}>
                {project.name}
              </a>{' '}
              <span className="home-dim">{project.oneLiner}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section" aria-labelledby="writing-heading">
        <h2 id="writing-heading" className="home-heading">
          ## writing
        </h2>
        <ul className="home-list">
          {posts.map((post) => (
            <li key={post.slug} className="home-item">
              <span className="home-dim home-date">{post.date}</span>{' '}
              <a className="home-link" href={`/writing/${post.slug}/`}>
                {post.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section" aria-labelledby="now-heading">
        <h2 id="now-heading" className="home-heading">
          ## now
        </h2>
        <p className="home-now">
          rebuilding this site as plain text. next: making this line update
          itself.
        </p>
      </section>

      <section className="home-section" aria-labelledby="elsewhere-heading">
        <h2 id="elsewhere-heading" className="home-heading">
          ## elsewhere
        </h2>
        <p className="home-elsewhere">
          <a className="home-link" href="https://github.com/frhd">
            github.com/frhd
          </a>
          <span className="home-dim"> · </span>
          <a className="home-link" href="mailto:farhad@omid.cc">
            farhad@omid.cc
          </a>
          <span className="home-dim"> · </span>
          <a className="home-link" href="/rss.xml">
            rss
          </a>
        </p>
      </section>

      <footer className="home-footer">
        <span className="home-hint">press t</span>
      </footer>
    </main>
  )
}
