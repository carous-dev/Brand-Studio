/**
 * Locks body scroll for an overlay and compensates for the vanished
 * scrollbar's width with body padding-right, so the page content doesn't
 * shift sideways when the overlay opens (~15px on Windows browsers).
 * Returns an unlock function that restores the previous inline styles.
 */
export function lockBodyScroll(): () => void {
  if (typeof document === "undefined" || typeof window === "undefined") return () => {}
  const body = document.body
  const prevOverflow = body.style.overflow
  const prevPaddingRight = body.style.paddingRight
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  body.style.overflow = "hidden"
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`
  }
  return () => {
    body.style.overflow = prevOverflow
    body.style.paddingRight = prevPaddingRight
  }
}
