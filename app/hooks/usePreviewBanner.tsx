import { useEffect, useState } from 'react'

/**
 * usePreviewBanner: manages preview banner visibility based on NEXT_PUBLIC_PREVIEW env var
 * @returns {boolean} whether the preview banner should be displayed
 */
export function usePreviewBanner(): boolean {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const apply = () => {
      const gateEnabled = document.documentElement.hasAttribute('data-preview-gate-enabled')
      setShow(!gateEnabled && process.env.NEXT_PUBLIC_PREVIEW === '1')
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-preview-gate-enabled'],
    })

    return () => observer.disconnect()
  }, [])

  return show
}
