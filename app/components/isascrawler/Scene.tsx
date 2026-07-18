'use client'

/**
 * Three.js view for the ISAScrawler replica.
 *
 * Thin rendering shell around the tested pure modules (gait-engine.ts,
 * model.ts): it owns the WebGL renderer lifecycle, pausing on visibility /
 * reduced motion, and drag-to-orbit. The photo fallback stays rendered until
 * the first frame draws, and permanently if WebGL is unavailable — no error
 * UI by design.
 */

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { jointStateAt } from './gait-engine'
import { applyCrawlerState, buildCrawler } from './model'

const IDLE_YAW_RATE = 0.15 // rad/s, slow turntable until the user drags
const ORBIT_SENSITIVITY = 0.005 // rad per dragged px
const MAX_PITCH = 0.35 // rad, clamp for root.rotation.x while orbiting
const MAX_FRAME_DELTA = 0.1 // s, so background-tab gaps don't fast-forward

interface SceneProps {
  fallbackSrc: string
  fallbackAlt: string
}

export default function Scene({ fallbackSrc, fallbackAlt }: SceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      return // WebGL unavailable — silently keep the photo
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene() // transparent; the page theme shows through
    const camera = new THREE.PerspectiveCamera(38, 1, 1, 2000)
    camera.position.set(200, 140, 220)
    camera.lookAt(0, 35, 0)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x404050, 2.5))
    const sun = new THREE.DirectionalLight(0xffffff, 2.5)
    sun.position.set(150, 300, 200)
    scene.add(sun)

    const parts = buildCrawler()
    scene.add(parts.root)
    applyCrawlerState(parts, jointStateAt(0))

    const canvas = renderer.domElement
    canvas.style.position = 'absolute'
    canvas.style.inset = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.touchAction = 'pan-y' // horizontal drag orbits, vertical still scrolls
    canvas.style.cursor = 'grab'
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', fallbackAlt)
    container.appendChild(canvas)

    // Mutable animation state lives in closure variables, never React state.
    let elapsed = 0
    let lastTimestamp: number | null = null
    let rafId: number | null = null
    let inView = false
    let hasDragged = false
    let firstFrame = false
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reducedMotion = reducedMotionQuery.matches

    const renderFrame = () => {
      renderer.render(scene, camera)
      if (!firstFrame) {
        firstFrame = true
        setReady(true)
      }
    }

    const frame = (timestamp: number) => {
      rafId = null
      if (!inView || reducedMotion) {
        lastTimestamp = null
        return
      }
      const delta =
        lastTimestamp === null ? 0 : Math.min((timestamp - lastTimestamp) / 1000, MAX_FRAME_DELTA)
      lastTimestamp = timestamp
      elapsed += delta
      applyCrawlerState(parts, jointStateAt(elapsed))
      if (!hasDragged) parts.root.rotation.y += IDLE_YAW_RATE * delta
      renderFrame()
      rafId = requestAnimationFrame(frame)
    }

    const startLoop = () => {
      if (rafId === null && inView && !reducedMotion) {
        lastTimestamp = null
        rafId = requestAnimationFrame(frame)
      }
    }

    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      lastTimestamp = null
    }

    // Fires once on observe, which produces the first frame (and `ready`).
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      if (rafId === null) renderFrame()
    })
    resizeObserver.observe(container)

    const intersectionObserver = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting)
      if (inView) startLoop()
      else stopLoop()
    })
    intersectionObserver.observe(canvas)

    let dragging = false
    let lastX = 0
    let lastY = 0

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      canvas.setPointerCapture(event.pointerId)
      canvas.style.cursor = 'grabbing'
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      // Idle yaw stops for good only once a rotation is actually applied —
      // a vertical scroll swipe (pan-y steals the gesture -> pointercancel)
      // must not kill the turntable.
      hasDragged = true
      parts.root.rotation.y += (event.clientX - lastX) * ORBIT_SENSITIVITY
      parts.root.rotation.x = Math.max(
        -MAX_PITCH,
        Math.min(MAX_PITCH, parts.root.rotation.x + (event.clientY - lastY) * ORBIT_SENSITIVITY),
      )
      lastX = event.clientX
      lastY = event.clientY
      if (rafId === null) renderFrame() // paused (reduced motion / off-screen): re-render per drag
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      canvas.style.cursor = 'grab'
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)

    const onReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches
      if (reducedMotion) {
        stopLoop()
        renderFrame()
      } else {
        startLoop()
      }
    }
    reducedMotionQuery.addEventListener('change', onReducedMotionChange)

    return () => {
      stopLoop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      reducedMotionQuery.removeEventListener('change', onReducedMotionChange)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.remove()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          for (const material of materials) material.dispose()
        }
      })
      renderer.dispose()
      renderer.forceContextLoss()
    }
  }, [fallbackAlt])

  return (
    <div ref={containerRef} className="relative" style={{ aspectRatio: '1200 / 747' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimization */}
      <img
        src={fallbackSrc}
        alt={fallbackAlt}
        width={1200}
        height={747}
        className="h-auto w-full"
        style={ready ? { visibility: 'hidden' } : undefined}
      />
    </div>
  )
}
