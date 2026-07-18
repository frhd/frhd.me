'use client'

import dynamic from 'next/dynamic'

// Note: deliberately NOT { ssr: false }. Scene.tsx is SSR-safe (all WebGL
// work happens in its effect), and prerendering it keeps the <img> fallback
// in the static HTML — with ssr: false the whole figure bails out to
// client-side rendering and the pre-JS page loses the photo. dynamic() still
// splits three.js into a chunk loaded only on this route.
const CrawlerScene = dynamic(() => import('./Scene'))

export default CrawlerScene
