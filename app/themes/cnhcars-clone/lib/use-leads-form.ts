// Thin shim around brandstudio's `useLeadsForm` that adapts the API surface
// expected by source-app form components (handleSubmit / successMessage /
// top-level validate / LeadFormErrors). The source cnhcars app's components
// were written against `@carous/hooks`; rather than rewriting every callsite,
// we re-export this shim and rewire imports to point here.
'use client'

import { useCallback, useState, type FormEvent } from 'react'
import { useLeadsForm as useBaseLeadsForm } from '@/app/hooks/useLeadsForm'

export type LeadFormErrors<T> = Partial<Record<keyof T, string>>

type LeadFormMeta = {
  formTs: number
  recaptchaToken: string | null
  honeypotField: string
  honeypotValue: string
  leadType?: string
  leadSource?: string
  leadOwner?: string
}

type SourceFieldConfig<T> = {
  required?: boolean
  validate?: (value: T[keyof T], values: T) => string | null
}

type SourceOptions<T extends Record<string, any>> = {
  initialValues: T
  endpoint?: string
  leadType: string
  leadSource?: string
  leadOwner?: string
  honeypotField?: string
  fieldConfig?: Partial<Record<keyof T, SourceFieldConfig<T>>>
  validate?: (values: T) => LeadFormErrors<T>
  buildPayload?: (values: T, meta: LeadFormMeta) => any
}

const DEFAULT_SUCCESS = "Thanks! We'll get back to you shortly."

export function useLeadsForm<T extends Record<string, any>>(options: SourceOptions<T>) {
  const {
    validate: topLevelValidate,
    fieldConfig,
    buildPayload,
    leadSource,
    leadOwner,
    ...rest
  } = options

  const composedFieldConfig: SourceOptions<T>['fieldConfig'] = topLevelValidate
    ? Object.fromEntries(
        Object.keys(options.initialValues).map((key) => {
          const existing = (fieldConfig as any)?.[key] || {}
          return [
            key,
            {
              required: existing.required,
              validate: (value: any, values: T) => {
                if (existing.validate) {
                  const perField = existing.validate(value, values)
                  if (perField) return perField
                }
                const errors = topLevelValidate(values)
                return (errors as any)[key] || null
              },
            },
          ]
        }),
      ) as any
    : (fieldConfig as any)

  const base = useBaseLeadsForm<T>({
    ...rest,
    leadSource,
    fieldConfig: composedFieldConfig as any,
    buildPayload: buildPayload
      ? (values, meta) =>
          buildPayload(values, {
            ...meta,
            leadType: options.leadType,
            leadSource,
            leadOwner,
          } as LeadFormMeta)
      : undefined,
  })

  const [successMessage] = useState<string | null>(DEFAULT_SUCCESS)

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      if (event && typeof event.preventDefault === 'function') event.preventDefault()
      return base.submit()
    },
    [base],
  )

  // brandstudio's base.reset() takes no args; source-app callers pass
  // nextValues to seed new defaults. Compose a shim that resets state
  // first (clears errors/status/honeypot) then optionally overwrites values.
  const reset = useCallback(
    (nextValues?: T) => {
      base.reset()
      if (nextValues) base.setValues(nextValues)
    },
    [base],
  )

  return {
    ...base,
    handleSubmit,
    successMessage,
    reset,
  }
}

export default useLeadsForm
