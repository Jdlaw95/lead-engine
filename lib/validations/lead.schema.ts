import { z } from 'zod'
import type { FieldConfig } from '@/types'

// Base fields present on every lead form regardless of business type
export const baseLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().optional(),
})

// Builds a dynamic metadata schema from a business's custom field definitions.
// Required fields fail with a readable message; optional fields pass through as-is.
export function buildMetadataSchema(fields: FieldConfig[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    if (field.required) {
      shape[field.name] = z.string().min(1, `${field.label} is required`)
    } else {
      shape[field.name] = z.string().optional()
    }
  }

  return z.object(shape)
}

// Combines the base schema with the dynamic metadata schema for a specific business.
// This is the schema you pass to react-hook-form's zodResolver.
export function buildLeadSchema(fields: FieldConfig[]) {
  return baseLeadSchema.extend({
    metadata: buildMetadataSchema(fields),
  })
}

export type BaseLeadFormValues = z.infer<typeof baseLeadSchema>
export type LeadFormValues = BaseLeadFormValues & {
  metadata: Record<string, string>
}
