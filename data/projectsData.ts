interface Project {
  title: string,
  description: string,
  href?: string,
  imgSrc?: string,
}

const projectsData: Project[] = [
  {
    title: 'A Search Engine',
    description: `What if you could look up any information in the world? Webpages, images, videos
    and more. Google has many features to help you find exactly what you're looking
    for.`,
    imgSrc: '/static/images/google.png',
    href: 'https://www.google.com',
  },
  {
    title: 'An intelligent swarm of catarpillar robot',
    description: `Designing and building a swarm of robots that can work together to solve problems.`,
    imgSrc: '/static/images/time-machine.jpg',
    href: '/blog/isasCrawler',
  },
]

export default projectsData
