'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'

export function UserProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useUserStore(state => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return <>{children}</>
}

