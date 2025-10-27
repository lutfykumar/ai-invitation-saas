"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CalendarIcon,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  Share2,
  Settings,
  Palette,
  Sparkles,
  Copy,
  CheckCircle
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { z } from "zod"
import { updateInvitationSchema } from "@/lib/validations/invitation"
import { AIContentGenerator } from "@/components/ai-content-generator"
import { InvitationPreview } from "@/components/invitation-preview"

interface Invitation {
  id: string
  title: string
  content: string
  eventDate?: string
  eventLocation?: string
  recipientEmail?: string
  recipientName?: string
  senderName?: string
  customMessage?: string
  slug: string
  isPublished: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  userId: string
  category: {
    id: string
    name: string
    slug: string
  }
  theme: {
    id: string
    name: string
    slug: string
    cssVariables: string
    templateHtml: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Theme {
  id: string
  name: string
  slug: string
  thumbnail?: string
  categoryId: string
  category: {
    id: string
    name: string
    slug: string
  }
}

export default function InvitationEditorPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [eventDate, setEventDate] = useState<Date>()
  const [activeTab, setActiveTab] = useState("editor")
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    eventLocation: "",
    recipientEmail: "",
    recipientName: "",
    senderName: "",
    customMessage: "",
    categoryId: "",
    themeId: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchInvitation() {
      if (!session?.user || !params.id) return

      try {
        const response = await fetch(`/api/invitations/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setInvitation(data)
          setFormData({
            title: data.title || "",
            content: data.content || "",
            eventLocation: data.eventLocation || "",
            recipientEmail: data.recipientEmail || "",
            recipientName: data.recipientName || "",
            senderName: data.senderName || "",
            customMessage: data.customMessage || "",
            categoryId: data.category?.id || "",
            themeId: data.theme?.id || "",
          })
          if (data.eventDate) {
            setEventDate(new Date(data.eventDate))
          }
        } else if (response.status === 404) {
          toast.error("Undangan tidak ditemukan")
          router.push("/dashboard/invitations")
        } else if (response.status === 403) {
          toast.error("Anda tidak memiliki akses ke undangan ini")
          router.push("/dashboard/invitations")
        }
      } catch (error) {
        console.error("Error fetching invitation:", error)
        toast.error("Gagal memuat undangan")
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [session, params.id, router])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchThemes() {
      if (!formData.categoryId) return

      try {
        const response = await fetch(`/api/themes?categoryId=${formData.categoryId}`)
        if (response.ok) {
          const data = await response.json()
          setThemes(data)
        }
      } catch (error) {
        console.error("Error fetching themes:", error)
      }
    }

    fetchThemes()
  }, [formData.categoryId])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleAIGeneratedContent = (content: string) => {
    handleInputChange("content", content)
    toast.success("Konten dari AI berhasil ditambahkan!")
  }

  const validateForm = () => {
    try {
      const dataToValidate = {
        ...formData,
        eventDate: eventDate?.toISOString(),
      }
      updateInvitationSchema.parse(dataToValidate)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Mohon perbaiki kesalahan pada form")
      return
    }

    setSaving(true)

    try {
      const dataToSubmit = {
        ...formData,
        eventDate: eventDate?.toISOString(),
      }

      const response = await fetch(`/api/invitations/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })

      if (response.ok) {
        const updatedInvitation = await response.json()
        setInvitation(updatedInvitation)
        toast.success("Perubahan berhasil disimpan!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Gagal menyimpan perubahan")
      }
    } catch (error) {
      console.error("Error saving invitation:", error)
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!invitation) return

    try {
      const response = await fetch(`/api/invitations/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: !invitation.isPublished }),
      })

      if (response.ok) {
        const updatedInvitation = await response.json()
        setInvitation(updatedInvitation)
        toast.success(`Undangan berhasil ${!invitation.isPublished ? "dipublikasi" : "disembunyikan"}`)
      } else {
        toast.error("Gagal mengubah status publikasi")
      }
    } catch (error) {
      console.error("Error toggling publish:", error)
      toast.error("Terjadi kesalahan")
    }
  }

  const handleCopyLink = async () => {
    if (!invitation?.slug) return

    const shareUrl = `${window.location.origin}/invites/${invitation.slug}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link undangan berhasil disalin!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Gagal menyalin link")
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Undangan tidak ditemukan</h2>
          <p className="text-muted-foreground mb-4">
            Undangan yang Anda cari tidak ada atau telah dihapus.
          </p>
          <Button onClick={() => router.push("/dashboard/invitations")}>
            Kembali ke Daftar Undangan
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Undangan</h1>
            <p className="text-muted-foreground">
              Edit dan kelola undangan digital Anda
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={invitation.isPublished ? "default" : "secondary"}>
            {invitation.isPublished ? "Dipublikasi" : "Draft"}
          </Badge>
          <Button
            variant="outline"
            onClick={handleTogglePublish}
          >
            {invitation.isPublished ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Sembunyikan
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Publikasi
              </>
            )}
          </Button>
          {invitation.isPublished && (
            <>
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Tersalin!" : "Salin Link"}
              </Button>
              <Link href={`/invites/${invitation.slug}`} target="_blank">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Lihat
                </Button>
              </Link>
            </>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              "Menyimpan..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Published Alert */}
      {invitation.isPublished && (
        <Alert>
          <Share2 className="h-4 w-4" />
          <AlertDescription>
            Undangan ini telah dipublikasi dan dapat diakses melalui link:{" "}
            <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
              {`${window.location.origin}/invites/${invitation.slug}`}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="design">Desain</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                  <CardDescription>
                    Edit informasi utama untuk undangan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Judul Undangan *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className={cn(errors.title && "border-red-500")}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="content">Konten Undangan *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      rows={6}
                      className={cn(errors.content && "border-red-500")}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detail Acara</CardTitle>
                  <CardDescription>
                    Informasi tambahan tentang acara
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Tanggal Acara</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !eventDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {eventDate ? (
                              format(eventDate, "dd MMMM yyyy", { locale: id })
                            ) : (
                              "Pilih tanggal"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={eventDate}
                            onSelect={setEventDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="eventLocation">Lokasi Acara</Label>
                      <Input
                        id="eventLocation"
                        value={formData.eventLocation}
                        onChange={(e) => handleInputChange("eventLocation", e.target.value)}
                        placeholder="Contoh: Hotel Grand Ballroom"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="senderName">Nama Pengirim</Label>
                      <Input
                        id="senderName"
                        value={formData.senderName}
                        onChange={(e) => handleInputChange("senderName", e.target.value)}
                        placeholder="Nama Anda atau panitia"
                      />
                    </div>

                    <div>
                      <Label htmlFor="recipientName">Nama Penerima</Label>
                      <Input
                        id="recipientName"
                        value={formData.recipientName}
                        onChange={(e) => handleInputChange("recipientName", e.target.value)}
                        placeholder="Nama yang diundang (opsional)"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recipientEmail">Email Penerima</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={formData.recipientEmail}
                      onChange={(e) => handleInputChange("recipientEmail", e.target.value)}
                      placeholder="email@example.com (opsional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customMessage">Pesan Kustom</Label>
                    <Textarea
                      id="customMessage"
                      value={formData.customMessage}
                      onChange={(e) => handleInputChange("customMessage", e.target.value)}
                      rows={3}
                      placeholder="Pesan personal tambahan..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Category & Theme Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Kategori & Tema</CardTitle>
                  <CardDescription>
                    Ubah kategori dan tema undangan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Kategori</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => {
                        handleInputChange("categoryId", value)
                        // Reset theme when category changes
                        handleInputChange("themeId", "")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.categoryId && (
                    <div>
                      <Label>Tema</Label>
                      <Select
                        value={formData.themeId}
                        onValueChange={(value) => handleInputChange("themeId", value)}
                        disabled={themes.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            themes.length === 0 ? "Memuat tema..." : "Pilih tema"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {themes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                              {theme.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Assistant */}
              <AIContentGenerator
                category={invitation.category.slug}
                onContentGenerated={handleAIGeneratedContent}
                initialContent={formData.content}
                placeholder="Minta AI untuk memperbaiki konten undangan..."
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Pengaturan Desain
              </CardTitle>
              <CardDescription>
                Kustomisasi tampilan undangan Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pengaturan Desain</h3>
                <p className="text-muted-foreground mb-4">
                  Fitur kustomisasi desain akan segera hadir.
                </p>
                <p className="text-sm text-muted-foreground">
                  Saat ini, Anda dapat mengubah tampilan dengan memilih tema yang berbeda di tab Editor.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview Undangan</CardTitle>
              <CardDescription>
                Lihat tampilan undangan Anda seperti yang akan dilihat oleh tamu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationPreview
                invitation={invitation}
                theme={invitation.theme}
                formData={formData}
                eventDate={eventDate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}