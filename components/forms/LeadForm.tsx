'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
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
import { FieldRenderer } from './FieldRenderer'
import { buildLeadSchema, type LeadFormValues } from '@/lib/validations/lead.schema'
import { submitLead } from '@/app/[slug]/actions'
import type { BusinessConfig } from '@/types'

interface LeadFormProps {
  business: BusinessConfig
}

export function LeadForm({ business }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])

  const schema = buildLeadSchema(business.customFields)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LeadFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: '',
      message: '',
      metadata: {},
    },
  })

  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      let fileUrls: string[] = []

      // Upload files first if present
      if (files.length > 0) {
        const uploadData = new FormData()
        files.forEach((f) => uploadData.append('files', f))
        uploadData.append('businessId', business.id)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? 'File upload failed. Please try again.')
        }

        const json = await res.json()
        fileUrls = json.urls ?? []
      }

      // Submit the lead
      const result = await submitLead({
        businessId: business.id,
        businessSlug: business.slug,
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message,
        metadata: data.metadata ?? {},
        fileUrls,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      setSubmitted(true)
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const maxBytes = business.settings.maxFileSizeMB * 1024 * 1024
    const valid = selected.filter((f) => f.size <= maxBytes)

    if (valid.length < selected.length) {
      setServerError(
        `Some files exceeded the ${business.settings.maxFileSizeMB}MB limit and were removed.`
      )
    }

    setFiles(valid)
  }

  // ── Success state ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Enquiry Received</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Thanks for getting in touch. We&apos;ll be in contact with you shortly.
        </p>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Full Name <span className="text-red-500" aria-hidden>*</span>
        </Label>
        <Input id="name" placeholder="Jane Smith" {...register('name')} />
        {errors.name && (
          <p className="text-red-500 text-sm" role="alert">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">
          Email Address <span className="text-red-500" aria-hidden>*</span>
        </Label>
        <Input id="email" type="email" placeholder="jane@example.com" {...register('email')} />
        {errors.email && (
          <p className="text-red-500 text-sm" role="alert">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" placeholder="+61 4xx xxx xxx" {...register('phone')} />
      </div>

      {/* Service selector */}
      {business.services.length > 0 && (
        <div className="space-y-1.5">
          <Label>Service Required</Label>
          <Controller
            name="service"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {business.services.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      {/* Dynamic custom fields */}
      {business.customFields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          register={register}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          control={control as any}
          errors={errors}
        />
      ))}

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="message">Additional Details</Label>
        <Textarea
          id="message"
          placeholder="Tell us more about your project or requirements..."
          rows={4}
          {...register('message')}
        />
      </div>

      {/* File upload */}
      {business.settings.fileUploadEnabled && (
        <div className="space-y-2">
          <Label>Attach Files</Label>
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-lg p-6 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-8 h-8 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16v-8m0 0l-3 3m3-3l3 3M20 16.5A3.5 3.5 0 0016.5 13H15a5 5 0 10-9.9 1.1"
              />
            </svg>
            <p className="text-sm text-gray-500">
              {files.length > 0
                ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                : 'Drop files here or click to browse'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {business.settings.fileAcceptTypes} &middot; Max {business.settings.maxFileSizeMB}MB per file
            </p>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept={business.settings.fileAcceptTypes}
            className="sr-only"
            onChange={handleFileChange}
          />
          {files.length > 0 && (
            <ul className="space-y-1">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span aria-hidden>📎</span>
                  <span>{f.name}</span>
                  <span className="text-gray-400">({(f.size / 1024).toFixed(0)} KB)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Server error */}
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
          <p className="text-red-600 text-sm">{serverError}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full font-medium"
        style={{ backgroundColor: business.branding.primaryColor }}
      >
        {isSubmitting ? 'Sending…' : 'Send Enquiry'}
      </Button>
    </form>
  )
}
