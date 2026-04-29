'use client'

import { useActionState } from 'react'
import { onboardClient } from './actions'

const PLANS = [
  { value: 'starter', label: 'Starter', description: 'Lead capture + CRM' },
  { value: 'growth',  label: 'Growth',  description: 'Bookings + Payments + Client records' },
  { value: 'pro',     label: 'Pro',     description: 'Everything + Invoicing + Calendar' },
]

export default function NewClientPage() {
  const [state, action, pending] = useActionState(onboardClient, null)

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Onboard New Client</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Creates the business record and login credentials in one step.
        </p>
      </div>

      <form action={action} className="space-y-5">

        {/* Business name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            Business Name <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Lash Studio by Kris"
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            URL Slug <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg overflow-hidden focus-within:border-violet-500">
            <span className="px-3 text-gray-500 text-sm select-none border-r border-gray-700 py-2.5">
              mikai.io/
            </span>
            <input
              name="slug"
              required
              placeholder="lash-studio-kris"
              className="flex-1 bg-transparent text-white px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500">Lowercase letters, numbers, and hyphens only.</p>
        </div>

        {/* Owner email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            Owner Email <span className="text-red-400">*</span>
          </label>
          <input
            name="owner_email"
            type="email"
            required
            placeholder="kris@lashstudio.co.za"
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            Temporary Password <span className="text-red-400">*</span>
          </label>
          <input
            name="owner_password"
            type="password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
          <p className="text-xs text-gray-500">Share this with the client. They can change it after first login.</p>
        </div>

        {/* Plan */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Plan <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {PLANS.map((plan) => (
              <label
                key={plan.value}
                className="flex items-start gap-3 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-gray-600 has-[:checked]:border-violet-500 transition-colors"
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.value}
                  defaultChecked={plan.value === 'starter'}
                  className="mt-0.5 accent-violet-500"
                />
                <div>
                  <p className="text-sm font-medium text-white capitalize">{plan.label}</p>
                  <p className="text-xs text-gray-400">{plan.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">Primary Colour</label>
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
              <input
                type="color"
                name="primary_color"
                defaultValue="#6d28d9"
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-sm text-gray-400">Brand colour</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">Tagline</label>
            <input
              name="tagline"
              placeholder="Optional"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Error */}
        {state?.error && (
          <div className="p-3 bg-red-900/40 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {pending ? 'Creating client…' : 'Create Client & Generate Login'}
        </button>
      </form>
    </div>
  )
}
