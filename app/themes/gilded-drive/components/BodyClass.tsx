"use client"

import { useEffect } from 'react'

type Props = {
  className: string
}

export default function BodyClass({ className }: Props) {
  useEffect(() => {
    if (!className) return
    document.body.classList.add(className)
    return () => { document.body.classList.remove(className) }
  }, [className])

  return null
}
