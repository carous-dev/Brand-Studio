import { redirect } from 'next/navigation'

// `/faqs` is not a registered themed route — themes that surface FAQs
// inline them on `/finance` (see the `feedback_carous_platform_port_misread`
// memory). Header / Footer "FAQs" links now point at `/finance#faqs`, but
// catch any direct typed visits or legacy bookmarks here.
export default function FaqsRedirectPage() {
  redirect('/finance#faqs')
}
