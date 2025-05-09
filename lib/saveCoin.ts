// Types for our coin data
interface CoinData {
  fid: number
  wallet_address: string
  zora_mint_url: string
  zora_token_id: string
  zora_contract_address: string
  name: string
  description: string | null
  image_url: string
  transaction_hash: string
  mint_config: any
  raw_zora_response: any
}

export async function saveCoinToSupabase(data: CoinData) {
  try {
    const response = await fetch('/api/coins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save coin')
    }

    return await response.json()
  } catch (error) {
    console.error('Error saving coin:', error)
    throw error
  }
} 