"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import { Eye, Edit, ExternalLink, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Invitation {
  id: string
  title: string
  content: string
  eventDate?: string
  eventLocation?: string
  slug: string
  isPublished: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    slug: string
  }
  theme: {
    id: string
    name: string
    slug: string
    thumbnail?: string
  }
}

export function RecentInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchInvitations() {
      if (!session?.user) return

      try {
        const response = await fetch("/api/invitations")
        if (response.ok) {
          const data = await response.json()
          // Get only the 5 most recent invitations
          setInvitations(data.slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching invitations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()
  }, [session])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Belum ada undangan yang dibuat
        </p>
        <Link href="/dashboard/invitations/new">
          <Button>Buat Undangan Pertama</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{invitation.title}</h3>
                  <Badge variant={invitation.isPublished ? "default" : "secondary"}>
                    {invitation.isPublished ? "Dipublikasi" : "Draft"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {invitation.eventDate
                      ? format(new Date(invitation.eventDate), "dd MMM yyyy", { locale: id })
                      : "Tanggal belum ditetapkan"
                    }
                  </span>
                  {invitation.eventLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {invitation.eventLocation}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Kategori: {invitation.category.name}
                  </span>
                  <span className="text-muted-foreground">
                    Tema: {invitation.theme.name}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {invitation.viewCount} views
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Link href={`/dashboard/invitations/${invitation.id}`}>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </Link>

                {invitation.isPublished && (
                  <Link href={`/invites/${invitation.slug}`} target="_blank">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Lihat
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {invitations.length >= 5 && (
        <div className="text-center pt-4">
          <Link href="/dashboard/invitations">
            <Button variant="outline">Lihat Semua Undangan</Button>
          </Link>
        </div>
      )}
    </div>
  )
}