import { useCallback, useRef, useState } from 'react'

/**
 * Form state driven by a shared validator ({ values, errors }).
 * Errors appear after the first submit attempt, then update as the person types.
 */
export function useForm(validate, initial) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const submitted = useRef(false)

  const onChange = useCallback((e) => {
    const next = { ...values, [e.target.name]: e.target.value }
    setValues(next)
    if (submitted.current) setErrors(validate(next).errors)
  }, [validate, values])

  /** Returns cleaned values when valid, or null after showing errors. */
  const check = useCallback(() => {
    submitted.current = true
    const result = validate(values)
    setErrors(result.errors)
    return Object.keys(result.errors).length ? null : result.values
  }, [validate, values])

  const reset = useCallback(() => {
    submitted.current = false
    setValues(initial)
    setErrors({})
  }, [initial])

  return { values, errors, setErrors, onChange, check, reset }
}
