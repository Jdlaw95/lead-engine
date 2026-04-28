import type { BusinessConfig } from '@/types'
import { printcoConfig } from './printco'

/**
 * Register all business configs here.
 * The key must exactly match the slug in the Supabase businesses table.
 *
 * To add a new client:
 *   1. Copy _template.ts → yourclient.ts and fill it in
 *   2. Import it below
 *   3. Add it to the map
 */
const businessConfigs: Record<string, BusinessConfig> = {
  printco: printcoConfig,
}

export function getBusinessConfig(slug: string): BusinessConfig | null {
  return businessConfigs[slug] ?? null
}
