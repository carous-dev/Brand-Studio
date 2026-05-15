import { useCallback, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'

export type LeadStatus = 'idle' | 'submitting' | 'success' | 'error' | 'rate-limited'

type FieldValidator<T> = (value: T[keyof T], values: T) => string | null

type FieldConfig<T> = {
  required?: boolean
  validate?: FieldValidator<T>
}

type LeadsFormOptions<T extends Record<string, any>> = {
  initialValues: T
  leadType: string
  leadSource?: string
  endpoint?: string
  honeypotField?: string
  fieldConfig?: Partial<Record<keyof T, FieldConfig<T>>>
  buildPayload?: (values: T, meta: LeadsFormMeta) => any
}

type LeadsFormMeta = {
  formTs: number
  recaptchaToken?: string | null
  honeypotField: string
  honeypotValue: string
}

type SubmitResult = {
  success: boolean
  error?: string
}

export function useLeadsForm<T extends Record<string, any>>(options: LeadsFormOptions<T>) {
  const {
    initialValues,
    leadType,
    leadSource,
    endpoint = '/api/send-lead-email',
    honeypotField = 'website',
    fieldConfig,
    buildPayload,
  } = options
  const resolvedFieldConfig = useMemo<Partial<Record<keyof T, FieldConfig<T>>>>(() => fieldConfig ?? {}, [fieldConfig])

  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [status, setStatus] = useState<LeadStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [honeypotValue, setHoneypotValue] = useState('')

  const meta = useMemo<LeadsFormMeta>(() => {
    return {
      formTs: Date.now(),
      recaptchaToken: null,
      honeypotField,
      honeypotValue,
    }
  }, [honeypotField, honeypotValue])

  const validateValues = useCallback((nextValues: T) => {
    const nextErrors: Partial<Record<keyof T, string>> = {}

    Object.keys(nextValues).forEach((key) => {
      const typedKey = key as keyof T
      const config = resolvedFieldConfig[typedKey]
      const value = nextValues[typedKey]
      if (config?.required) {
        const isEmpty = value === null || value === undefined || String(value).trim() === ''
        if (isEmpty) {
          nextErrors[typedKey] = 'This field is required.'
          return
        }
      }
      if (config?.validate) {
        const error = config.validate(value, nextValues)
        if (error) {
          nextErrors[typedKey] = error
        }
      }
    })

    return nextErrors
  }, [resolvedFieldConfig])

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const getFieldProps = useCallback((field: keyof T) => {
    const rawValue = values[field]
    return {
      name: String(field),
      value: rawValue === null || rawValue === undefined || typeof rawValue === 'boolean' ? '' : String(rawValue),
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = event.target as HTMLInputElement
        const nextValue = target.type === 'checkbox' ? target.checked : target.value
        setFieldValue(field, nextValue as T[keyof T])
      },
      onBlur: () => {
        const nextErrors = validateValues(values)
        setErrors(nextErrors)
      },
    }
  }, [setFieldValue, validateValues, values])

  const honeypotProps = useMemo(() => {
    return {
      name: honeypotField,
      value: honeypotValue,
      onChange: (event: ChangeEvent<HTMLInputElement>) => setHoneypotValue(event.target.value),
      autoComplete: 'off',
    }
  }, [honeypotField, honeypotValue])

  const submitValues = useCallback(async (overrideValues?: T): Promise<SubmitResult> => {
    const nextValues = overrideValues || values
    const nextErrors = validateValues(nextValues)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setStatus('error')
      setErrorMessage('Please correct the highlighted fields.')
      return { success: false, error: 'Please correct the highlighted fields.' }
    }

    setStatus('submitting')
    setErrorMessage(null)

    try {
      const payload = buildPayload
        ? buildPayload(nextValues, meta)
        : {
            leadData: {
              leadType,
              leadSource,
              ...nextValues,
              formTs: meta.formTs,
              [meta.honeypotField]: meta.honeypotValue,
            },
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.status === 429) {
        setStatus('rate-limited')
        const message = 'Too many requests. Please try again shortly.'
        setErrorMessage(message)
        return { success: false, error: message }
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        const message = text || 'Failed to submit. Please try again.'
        setStatus('error')
        setErrorMessage(message)
        return { success: false, error: message }
      }

      setStatus('success')
      setErrorMessage(null)
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error. Please try again.'
      setStatus('error')
      setErrorMessage(message)
      return { success: false, error: message }
    }
  }, [buildPayload, endpoint, leadSource, leadType, meta, validateValues, values])

  const submit = useCallback(async () => submitValues(), [submitValues])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setStatus('idle')
    setErrorMessage(null)
    setHoneypotValue('')
  }, [initialValues])

  return {
    values,
    setValues,
    setFieldValue,
    errors,
    status,
    errorMessage,
    getFieldProps,
    honeypotProps,
    submit,
    submitValues,
    reset,
  }
}

export default useLeadsForm
