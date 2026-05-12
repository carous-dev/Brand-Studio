'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'kain-a11y-text-size'

type Size = 'a' | 'a-plus' | 'a-plus-plus'

const SIZE_LABEL: Record<Size, string> = {
  'a': 'A',
  'a-plus': 'A+',
  'a-plus-plus': 'A++',
}
const SIZE_SCALE: Record<Size, string> = {
  'a': '100%',
  'a-plus': '108%',
  'a-plus-plus': '118%',
}

export default function KainA11yToolbar() {
  const [size, setSize] = useState<Size>('a')

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && (localStorage.getItem(STORAGE_KEY) as Size | null)) || 'a'
    setSize(saved)
    document.documentElement.style.fontSize = SIZE_SCALE[saved]
  }, [])

  function apply(next: Size) {
    setSize(next)
    document.documentElement.style.fontSize = SIZE_SCALE[next]
    try { localStorage.setItem(STORAGE_KEY, next) } catch {}
  }

  return (
    <div className="kain-a11y-toolbar" role="group" aria-label="Text size">
      {(Object.keys(SIZE_LABEL) as Size[]).map((s) => (
        <button
          key={s}
          type="button"
          aria-label={`Set text size ${SIZE_LABEL[s]}`}
          aria-pressed={size === s}
          className={size === s ? 'is-active' : ''}
          onClick={() => apply(s)}
        >
          {SIZE_LABEL[s]}
        </button>
      ))}
    </div>
  )
}
