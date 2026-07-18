import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TerminalHotkey from '../TerminalHotkey'

const pushMock = vi.fn()
let mockPathname = '/'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => mockPathname,
}))

describe('TerminalHotkey', () => {
  beforeEach(() => {
    pushMock.mockClear()
    mockPathname = '/'
  })

  afterEach(() => {
    cleanup()
  })

  it('navigates to /terminal/ on a bare "t"', () => {
    render(<TerminalHotkey />)
    fireEvent.keyDown(document.body, { key: 't' })
    expect(pushMock).toHaveBeenCalledWith('/terminal/')
  })

  it('ignores "t" typed in an input', () => {
    const { container } = render(
      <>
        <TerminalHotkey />
        <input />
      </>,
    )
    fireEvent.keyDown(container.querySelector('input')!, { key: 't' })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('ignores "t" typed in a textarea', () => {
    const { container } = render(
      <>
        <TerminalHotkey />
        <textarea />
      </>,
    )
    fireEvent.keyDown(container.querySelector('textarea')!, { key: 't' })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('ignores "t" typed in a select', () => {
    const { container } = render(
      <>
        <TerminalHotkey />
        <select>
          <option>a</option>
        </select>
      </>,
    )
    fireEvent.keyDown(container.querySelector('select')!, { key: 't' })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('ignores "t" typed in a contenteditable element', () => {
    const { container } = render(
      <>
        <TerminalHotkey />
        <div contentEditable data-testid="editable" suppressContentEditableWarning />
      </>,
    )
    fireEvent.keyDown(container.querySelector('[contenteditable]')!, {
      key: 't',
    })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it.each([
    ['ctrl', { ctrlKey: true }],
    ['meta', { metaKey: true }],
    ['alt', { altKey: true }],
  ])('ignores "t" when %s is held', (_name, modifier) => {
    render(<TerminalHotkey />)
    fireEvent.keyDown(document.body, { key: 't', ...modifier })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('ignores "t" when already on /terminal', () => {
    mockPathname = '/terminal'
    render(<TerminalHotkey />)
    fireEvent.keyDown(document.body, { key: 't' })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('ignores "t" when already on /terminal/ (trailing slash)', () => {
    mockPathname = '/terminal/'
    render(<TerminalHotkey />)
    fireEvent.keyDown(document.body, { key: 't' })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('ignores keys other than "t"', () => {
    render(<TerminalHotkey />)
    fireEvent.keyDown(document.body, { key: 'x' })
    fireEvent.keyDown(document.body, { key: 'T' })
    fireEvent.keyDown(document.body, { key: 'Enter' })
    expect(pushMock).not.toHaveBeenCalled()
  })
})
