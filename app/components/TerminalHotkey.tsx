'use client'

import { useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'

/**
 * Site-wide easter-egg hotkey: pressing a bare `t` anywhere navigates to the
 * full-screen terminal at /terminal/. Rendered once in the root layout so the
 * listener is active on every page. This is a plain navigation, not an overlay.
 *
 * The keypress is deliberately ignored when it would be hostile:
 *  - focus is in a text field (input/textarea/select/contenteditable) — so
 *    typing a `t` while filling a field, or into the terminal's own hidden
 *    xterm textarea, never re-navigates;
 *  - any modifier is held (ctrl/meta/alt) — those are shortcuts, not typing.
 *    Shift is naturally excluded because it produces 'T', not 't';
 *  - we are already on the terminal route.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return (
    target.isContentEditable ||
    target.closest('[contenteditable="true"], [contenteditable=""]') !== null
  )
}

export default function TerminalHotkey() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 't') return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (pathname === '/terminal' || pathname === '/terminal/') return
      if (isEditableTarget(event.target)) return
      router.push('/terminal/')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pathname, router])

  return null
}
