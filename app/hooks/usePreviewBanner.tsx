import { useEffect, useState } from 'react'

/**
 * usePreviewBanner: manages preview banner visibility based on NEXT_PUBLIC_PREVIEW env var
 * @returns {boolean} whether the preview banner should be displayed
 */
export function usePreviewBanner(): boolean {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Read environment variable at runtime (available as window.__NEXT_PUBLIC_PREVIEW if injected)
    // or check directly from process.env in browser context (SSR-safe)
    const previewEnabled = process.env.NEXT_PUBLIC_PREVIEW === '1'
    setShow(previewEnabled)
  }, [])

  return show
}
