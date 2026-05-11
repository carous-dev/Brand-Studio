/**
 * MotionFX — brandstudio-global animated keyframes & utility classes.
 *
 * No JS — just a stylesheet themes import in their Shell to get reusable
 * neon-light and motion primitives. Every keyframe and utility class is
 * brand-token-driven (uses var(--color-primary), var(--color-accent), etc.)
 * so the same markup retints automatically per brand.
 *
 * Usage (in any theme component):
 *   <span className="mfx-glow-pulse" />        // pulsing neon glow
 *   <div className="mfx-shimmer">…</div>       // animated linear sweep
 *   <span className="mfx-pulse-dot" />         // status indicator pulse
 *   <div className="mfx-float">…</div>         // gentle vertical float loop
 *
 * Themes can compose these with their own CSS — apply mfx-glow-pulse to a
 * decorative ::before pseudo-element, mfx-shimmer to a button hover state,
 * etc. The classes are designed to be additive, not exclusive.
 *
 * Honours `prefers-reduced-motion`: all infinite-loop animations are
 * disabled when reduced motion is set.
 */

export { default as MotionFX } from './MotionFX'
