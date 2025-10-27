"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"

export function InvitationsOverview() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchInvitationCount() {
      if (!session?.user) return

      try {
        const response = await fetch("/api/invitations")
        if (response.ok) {
          const invitations = await response.json()
          setCount(invitations.length)
        }
      } catch (error) {
        console.error("Error fetching invitation count:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvitationCount()
  }, [session])

  if (loading) {
    return <div className="text-2xl font-bold">...</div>
  }

  return <div className="text-2xl font-bold">{count}</div>
}