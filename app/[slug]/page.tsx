import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBusinessConfig } from '@/config/businesses'
import { LeadForm } from '@/components/forms/LeadForm'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = getBusinessConfig(slug)

  return {
    title: business ? `${business.name} — Get a Quote` : 'Enquiry',
    description: business?.branding.tagline,
  }
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params
  const business = getBusinessConfig(slug)

  if (!business) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">

        {/* Business header */}
        <div className="text-center mb-8">
          {business.branding.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.branding.logoUrl}
              alt={business.name}
              className="h-12 mx-auto mb-4 object-contain"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {business.name}
          </h1>
          {business.branding.tagline && (
            <p className="text-gray-500 mt-1 text-sm">{business.branding.tagline}</p>
          )}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Send an Enquiry</h2>
          <LeadForm business={business} />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Your information is kept private and never shared with third parties.
        </p>
      </div>
    </main>
  )
}
