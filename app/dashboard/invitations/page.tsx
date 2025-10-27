"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Eye, Edit, Trash2, ExternalLink, Calendar, Filter } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"

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

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [categories, setCategories] = useState<any[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchData() {
      if (!session?.user) return

      try {
        // Fetch invitations
        const invitationsResponse = await fetch("/api/invitations")
        if (invitationsResponse.ok) {
          const data = await invitationsResponse.json()
          setInvitations(data)
        }

        // Fetch categories for filter
        const categoriesResponse = await fetch("/api/categories")
        if (categoriesResponse.ok) {
          const data = await categoriesResponse.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus undangan ini?")) {
      return
    }

    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setInvitations(invitations.filter(inv => inv.id !== id))
        toast.success("Undangan berhasil dihapus")
      } else {
        toast.error("Gagal menghapus undangan")
      }
    } catch (error) {
      console.error("Error deleting invitation:", error)
      toast.error("Terjadi kesalahan")
    }
  }

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: !isPublished }),
      })

      if (response.ok) {
        setInvitations(invitations.map(inv =>
          inv.id === id ? { ...inv, isPublished: !isPublished } : inv
        ))
        toast.success(`Undangan berhasil ${!isPublished ? "dipublikasi" : "disembunyikan"}`)
      } else {
        toast.error("Gagal mengubah status publikasi")
      }
    } catch (error) {
      console.error("Error toggling publish:", error)
      toast.error("Terjadi kesalahan")
    }
  }

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" ||
                         (filterStatus === "published" && invitation.isPublished) ||
                         (filterStatus === "draft" && !invitation.isPublished)
    const matchesCategory = filterCategory === "all" ||
                           invitation.category.id === filterCategory

    return matchesSearch && matchesStatus && matchesCategory
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Semua Undangan</h1>
          <p className="text-muted-foreground">
            Kelola semua undangan digital Anda
          </p>
        </div>
        <Link href="/dashboard/invitations/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Undangan Baru
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari judul atau konten undangan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Dipublikasi</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <div className="space-y-4">
        {filteredInvitations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Filter className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tidak ada undangan ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                {invitations.length === 0
                  ? "Belum ada undangan yang dibuat"
                  : "Coba ubah filter atau pencarian Anda"
                }
              </p>
              {invitations.length === 0 && (
                <Link href="/dashboard/invitations/new">
                  <Button>Buat Undangan Pertama</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredInvitations.map((invitation) => (
            <Card key={invitation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{invitation.title}</h3>
                      <Badge variant={invitation.isPublished ? "default" : "secondary"}>
                        {invitation.isPublished ? "Dipublikasi" : "Draft"}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground line-clamp-2">
                      {invitation.content}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {invitation.eventDate
                          ? format(new Date(invitation.eventDate), "dd MMM yyyy", { locale: id })
                          : "Tanggal belum ditetapkan"
                        }
                      </span>
                      {invitation.eventLocation && (
                        <span>Lokasi: {invitation.eventLocation}</span>
                      )}
                      <span>Kategori: {invitation.category.name}</span>
                      <span>Tema: {invitation.theme.name}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {invitation.viewCount} views
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Dibuat: {format(new Date(invitation.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <Link href={`/dashboard/invitations/${invitation.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePublish(invitation.id, invitation.isPublished)}
                    >
                      {invitation.isPublished ? "Sembunyikan" : "Publikasi"}
                    </Button>

                    {invitation.isPublished && (
                      <Link href={`/invites/${invitation.slug}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Lihat
                        </Button>
                      </Link>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Hapus
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Konfirmasi Hapus</DialogTitle>
                          <DialogDescription>
                            Apakah Anda yakin ingin menghapus undangan "{invitation.title}"?
                            Tindakan ini tidak dapat dibatalkan.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Batal</Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(invitation.id)}
                          >
                            Hapus
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}