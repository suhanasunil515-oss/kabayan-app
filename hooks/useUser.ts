'use client'

import { useEffect, useState } from 'react'

interface User {
  id?: number
  full_name?: string
  email?: string
  phone_number?: string
  credit_score?: number
  wallet_balance?: number
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/account/profile')
        if (response.ok) {
          const data = await response.json()
          setUser(data.profile)
        } else if (response.status !== 401) {
          setError('Failed to fetch user data')
        }
      } catch (err) {
        console.error('[v0] Error fetching user:', err)
        setError('An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, isLoading, error }
}
