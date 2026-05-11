/**
 * Official WhatsApp brand glyph — speech bubble with phone, identical to the
 * mark used on wa.me and the WhatsApp Brand Resources kit. Use this anywhere
 * a theme links to WhatsApp (vehicle detail call-out, contact page, modal
 * "WhatsApp us" CTA, footer chat link, etc.).
 *
 * Buyers recognise the official mark instantly; substituting a generic
 * `<MessageCircle />` from lucide reads as "third-party chat" and undermines
 * the trust signal. The colour is intentionally `currentColor` so the icon
 * inherits the surrounding button colour (the iconic green is for the
 * filled-button surface, not the glyph itself).
 *
 * Usage:
 *   import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
 *   <a className="my-whatsapp-btn" href={whatsappUrl}>
 *     <WhatsAppIcon size={18} />
 *     WhatsApp us
 *   </a>
 */

type Props = {
  size?: number
  className?: string
  title?: string
}

export function WhatsAppIcon({ size = 20, className, title }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0c3.18 0 6.167 1.24 8.413 3.488a11.82 11.82 0 0 1 3.48 8.413c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.687-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  )
}

export default WhatsAppIcon
