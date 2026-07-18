import HomePage from './components/home/HomePage'
import ThemeToggle from './components/home/ThemeToggle'
import { getAllPosts } from '@/lib/posts'
import { projects } from '@/lib/projects'

/**
 * Thin server component: loads content at build time and hands it to the
 * presentational HomePage. ThemeToggle is a sibling client component so
 * HomePage stays pure and easily unit-tested.
 */
export default function Home() {
  const posts = getAllPosts()
  return (
    <>
      <ThemeToggle />
      <HomePage posts={posts} projects={projects} />
    </>
  )
}
