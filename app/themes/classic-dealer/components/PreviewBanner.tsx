'use client'

import { motion } from 'framer-motion'
import { usePreviewBanner } from '@/app/hooks/usePreviewBanner'
import { useBrand } from '../context/BrandClientWrapper'
import '../styles/preview-banner.css'

export function PreviewBanner() {
  const show = usePreviewBanner()
  const brand = useBrand()

  if (!show) return null

  return (
    <motion.div
      className="preview-banner"
      role="region"
      aria-label="Preview site notice"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="pb-note">
        Preview version of <strong>{brand.name}</strong> - this site is a preview. For the full version contact{' '}
        <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">
          Carous Limited
        </a>
        .
      </div>
    </motion.div>
  )
}
