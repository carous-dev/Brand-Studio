"use client"
import React from 'react'

type Props = {
  overlay?: boolean
  className?: string
  'aria-hidden'?: boolean
}

export default function Loader({ overlay = false, className = '', 'aria-hidden': ah = true }: Props) {
  if (overlay) {
    return (
      <div className={`loader-overlay ${className}`} aria-hidden={ah}>
        <span className="loader" />
      </div>
    )
  }
  return <span className={`loader ${className}`} aria-hidden={ah} />
}
