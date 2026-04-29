import type { BusinessConfig } from '@/types'
import { printcoConfig } from './printco'

/**
 * Mikai — Business config registry.
 * The key must exactly match the slug in the Supabase businesses table.
 *
 * To onboard a new client:
 *   1. Copy _template.ts → yourclient.ts and fill it in
 *   2. Import it below and add it to the map
 *   3. Insert the matching row in Supabase businesses table
 *   4. Replace REPLACE_WITH_SUPABASE_ID with the real UUID
 */
const businessConfigs: Record<string, BusinessConfig> = {
  printco: printcoConfig,
}

export function getBusinessConfig(slug: string): BusinessConfig | null {
  return businessConfigs[slug] ?? null
}
