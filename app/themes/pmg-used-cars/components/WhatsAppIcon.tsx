type WhatsAppIconProps = {
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
};

/**
 * WhatsApp glyph — Lucide dropped brand marks, so the fleet ships this
 * dependency-free component (mirrors apps/carsofmanchester/.../WhatsAppIcon.tsx).
 * Fills with `currentColor`; size is overridable but CSS width/height wins.
 */
export default function WhatsAppIcon({
  size = 20,
  className,
  "aria-hidden": ariaHidden = true,
}: WhatsAppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden={ariaHidden}
      focusable="false"
      fill="currentColor"
      className={className}
    >
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.06 2C6.61 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.33 4.94L2 22l5.36-1.4a9.84 9.84 0 0 0 4.69 1.2h.01c5.45 0 9.86-4.41 9.86-9.85 0-2.63-1.02-5.11-2.87-6.99Zm-6.99 15.22h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.18.83.85-3.1-.2-.31a8.16 8.16 0 0 1-1.25-4.37c0-4.52 3.68-8.2 8.21-8.2a8.2 8.2 0 0 1 8.21 8.2c0 4.53-3.69 8.2-8.2 8.2Zm4.5-6.16c-.25-.12-1.49-.74-1.72-.82-.23-.09-.4-.13-.57.12-.16.24-.65.82-.79.98-.14.17-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.2-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.01-.37.1-.49.11-.11.24-.29.36-.43.12-.15.16-.24.24-.4.08-.17.04-.31-.02-.43-.06-.12-.57-1.37-.77-1.88-.2-.49-.4-.42-.57-.43h-.49c-.16 0-.43.06-.66.31-.23.24-.87.85-.87 2.06 0 1.22.89 2.39 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.25 1.05.4 1.41.52.59.18 1.13.15 1.56.09.48-.08 1.49-.61 1.7-1.2.21-.59.21-1.1.15-1.2-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}
