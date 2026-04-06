"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { isWithinWorkingHours, WorkingHoursConfig } from '@/app/lib/working-status'

export function useWorkingHours(config: WorkingHoursConfig) {
  const computeStatus = useCallback(() => {
    return isWithinWorkingHours(config)
  }, [config])

  const [isOnline, setIsOnline] = useState(() => computeStatus())

  useEffect(() => {
    setIsOnline(computeStatus())
    const handle = window.setInterval(() => {
      setIsOnline(computeStatus())
    }, 60_000)

    return () => window.clearInterval(handle)
  }, [computeStatus])

  return useMemo(() => ({ isOnline }), [isOnline])
}
