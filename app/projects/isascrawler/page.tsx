import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ISAScrawler — farhad omid',
  description:
    'Rebuilding a caterpillar swarm robot: mechanics, electronics, and firmware. Studienarbeit at ISAS, Universität Karlsruhe, 2006–07.',
}

export default function IsascrawlerPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-mono text-[15px] leading-relaxed">
      <h1 className="text-lg font-bold">ISAScrawler</h1>
      <p className="mt-1 text-sm opacity-60">
        Studienarbeit, ISAS · Universität Karlsruhe · 2006–07
      </p>

      <p className="mt-8">
        At the Intelligent Sensor-Actuator-Systems lab, a group of small
        caterpillar robots was meant to explore collaborative swarm behavior —
        machines that crawl over terrain in groups and solve tasks together.
        The existing prototype had accumulated enough mechanical and electrical
        problems that efficient operation was impossible, so my Studienarbeit
        became a ground-up redesign.
      </p>

      {/* 3D scene mounts here in a later task; the photo is its permanent fallback */}
      <figure className="mt-8">
        <img
          src="/projects/isascrawler/prototype.jpg"
          alt="The ISAScrawler prototype: three servo-driven leg segments under a copper PCB trunk carrying a LiPo battery and an XBee radio module"
          width={1200}
          height={747}
          className="h-auto w-full"
        />
        <figcaption className="mt-2 text-sm opacity-60">
          The finished prototype, 16 cm and 160 g.
        </figcaption>
      </figure>

      <h2 className="mt-10 font-bold"># what was wrong</h2>
      <p className="mt-3">
        The predecessor fought itself: open-loop motors with no position
        feedback, a microcontroller per limb, joints that shed their ball
        bearings, and a tethered power supply. Every subsystem needed
        redesign, and the fixes only worked together — so it became a new
        robot.
      </p>

      <h2 className="mt-10 font-bold"># the redesign</h2>
      <p className="mt-3">
        The frame is CNC-milled copper-clad PCB material — structure and
        circuit board in one. The joints became a sandwich construction:
        three plates with enclosed ball-bearing races, so the bearings
        physically cannot fall out, driven by 4.7-gram positional micro
        servos. One microcontroller replaced the previous cluster, a new
        radio module made communication bidirectional, and a lithium-polymer
        cell finally cut the cable. The firmware was rewritten from scratch:
        besides manual and per-servo control, the robot accepts target
        coordinates and walks a straight computed path on its own — dead
        reckoning only, no feedback about drift yet.
      </p>

      <figure className="mt-8">
        <img
          src="/projects/isascrawler/joint.jpg"
          alt="Sandwich joint: three milled PCB plates enclosing ball bearings in their races"
          width={900}
          height={285}
          loading="lazy"
          decoding="async"
          className="h-auto w-full"
        />
        <figcaption className="mt-2 text-sm opacity-60">
          The sandwich joint — the bearings are enclosed between three milled plates.
        </figcaption>
      </figure>

      <figure className="mt-8">
        <img
          src="/projects/isascrawler/leg.jpg"
          alt="A leg segment: milled PCB frame with two micro servos and blue leg rods"
          width={900}
          height={727}
          loading="lazy"
          decoding="async"
          className="h-auto w-full"
        />
        <figcaption className="mt-2 text-sm opacity-60">
          A leg segment — frame and circuit board are the same milled material.
        </figcaption>
      </figure>

      <h2 className="mt-10 font-bold"># looking back</h2>
      <p className="mt-3">
        It was the first project where I built the whole stack myself —
        mechanics, boards, radio protocol, firmware — and where I learned
        that the second version of anything is mostly an apology to the
        first. The crawler above is rebuilt in code from the thesis
        drawings, walking its original gait.
      </p>

      <p className="mt-12 text-sm">
        <Link href="/" className="home-link">
          ← home
        </Link>
      </p>
    </main>
  )
}
