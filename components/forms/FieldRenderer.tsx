'use client'

import { Controller, type Control, type UseFormRegister, type FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FieldConfig } from '@/types'

interface FieldRendererProps {
  field: FieldConfig
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>
}

/**
 * Renders a single dynamic form field based on its FieldConfig definition.
 * Supports: text, email, phone, number, textarea, select, checkbox.
 */
export function FieldRenderer({ field, register, control, errors }: FieldRendererProps) {
  const fieldPath = `metadata.${field.name}` as const
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metadataErrors = errors?.metadata as Record<string, any> | undefined
  const error = metadataErrors?.[field.name]?.message as string | undefined

  const inputType = (() => {
    switch (field.type) {
      case 'email': return 'email'
      case 'phone': return 'tel'
      case 'number': return 'number'
      default: return 'text'
    }
  })()

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1" aria-hidden>*</span>}
      </Label>

      {field.type === 'select' && field.options ? (
        <Controller
          name={fieldPath}
          control={control}
          defaultValue=""
          render={({ field: ctrl }) => (
            <Select onValueChange={ctrl.onChange} value={ctrl.value ?? ''}>
              <SelectTrigger id={field.name}>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options!.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      ) : field.type === 'textarea' ? (
        <Textarea
          id={field.name}
          placeholder={field.placeholder}
          rows={3}
          {...register(fieldPath)}
        />
      ) : (
        <Input
          id={field.name}
          type={inputType}
          placeholder={field.placeholder}
          {...register(fieldPath)}
        />
      )}

      {error && (
        <p className="text-red-500 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
