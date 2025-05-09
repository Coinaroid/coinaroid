import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

// Initialize Supabase client with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data, error } = await supabase
      .from('coins')
      .insert([req.body])
      .select()

    if (error) {
      throw error
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('Error saving coin:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return res.status(500).json({ error: errorMessage })
  }
} 