'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import { THEME_STORAGE_KEY, type Theme } from '@/lib/theme'

/**
 * Small unobtrusive light/dark toggle. The no-flash script in app/layout.tsx
 * stamps `data-theme` on <html> before this mounts, and that attribute is the
 * single source of truth: we read it via useSyncExternalStore (subscribed to a
 * MutationObserver) rather than mirroring it into React state, so a click or an
 * OS change is reflected without effect-driven setState.
 */
function readDomTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light'
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => observer.disconnect()
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    readDomTheme,
    () => 'light' as Theme,
  )

  // Follow OS changes only while the user hasn't made a manual choice. This
  // only mutates the DOM attribute; the MutationObserver turns that into a
  // re-render, so no setState is needed here.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return
      document.documentElement.setAttribute(
        'data-theme',
        event.matches ? 'dark' : 'light',
      )
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const next: Theme = readDomTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Private mode / storage disabled: the visual toggle still works.
    }
  }, [])

  // Label/text describe the theme this button switches *to*.
  const label =
    theme === 'dark' ? 'switch to light theme' : 'switch to dark theme'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? 'light' : 'dark'}
    </button>
  )
}
