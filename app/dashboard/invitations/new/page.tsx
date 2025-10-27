"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save, ArrowLeft, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { z } from "zod"
import { createInvitationSchema } from "@/lib/validations/invitation"
import { AIContentGenerator } from "@/components/ai-content-generator"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

interface Theme {
  id: string
  name: string
  slug: string
  description?: string
  thumbnail?: string
  categoryId: string
  category: {
    id: string
    name: string
    slug: string
  }
}

export default function NewInvitationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [eventDate, setEventDate] = useState<Date>()
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
        toast.error("Gagal memuat kategori")
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchThemes() {
      if (!selectedCategory) return

      try {
        const response = await fetch(`/api/themes?categoryId=${selectedCategory}`)
        if (response.ok) {
          const data = await response.json()
          setThemes(data)
        }
      } catch (error) {
        console.error("Error fetching themes:", error)
        toast.error("Gagal memuat tema")
      }
    }

    fetchThemes()
  }, [selectedCategory])

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
      createInvitationSchema.parse(dataToValidate)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Mohon perbaiki kesalahan pada form")
      return
    }

    setLoading(true)

    try {
      const dataToSubmit = {
        ...formData,
        eventDate: eventDate?.toISOString(),
      }

      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })

      if (response.ok) {
        const newInvitation = await response.json()
        toast.success("Undangan berhasil dibuat!")
        router.push(`/dashboard/invitations/${newInvitation.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || "Gagal membuat undangan")
      }
    } catch (error) {
      console.error("Error creating invitation:", error)
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Undangan Baru</h1>
          <p className="text-muted-foreground">
            Buat undangan digital yang menakjubkan dengan bantuan AI
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
                <CardDescription>
                  Masukkan informasi utama untuk undangan Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Undangan *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Contoh: Undangan Pernikahan John & Jane"
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
                    placeholder="Tulis pesan utama undangan Anda..."
                    rows={6}
                    className={cn(errors.content && "border-red-500")}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    💡 Tip: Anda bisa menggunakan bantuan AI untuk membuat konten yang lebih menarik
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Acara</CardTitle>
                <CardDescription>
                  Informasi tambahan tentang acara Anda
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
                    className={cn(errors.recipientEmail && "border-red-500")}
                  />
                  {errors.recipientEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.recipientEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customMessage">Pesan Kustom</Label>
                  <Textarea
                    id="customMessage"
                    value={formData.customMessage}
                    onChange={(e) => handleInputChange("customMessage", e.target.value)}
                    placeholder="Pesan personal tambahan..."
                    rows={3}
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
                  Pilih kategori dan tema untuk undangan Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value)
                      handleInputChange("categoryId", value)
                      // Reset theme when category changes
                      handleInputChange("themeId", "")
                    }}
                  >
                    <SelectTrigger className={cn(errors.categoryId && "border-red-500")}>
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
                  {errors.categoryId && (
                    <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>
                  )}
                </div>

                {selectedCategory && (
                  <div>
                    <Label htmlFor="theme">Tema *</Label>
                    <Select
                      value={formData.themeId}
                      onValueChange={(value) => handleInputChange("themeId", value)}
                      disabled={themes.length === 0}
                    >
                      <SelectTrigger className={cn(errors.themeId && "border-red-500")}>
                        <SelectValue placeholder={
                          themes.length === 0
                            ? "Memuat tema..."
                            : "Pilih tema"
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
                    {errors.themeId && (
                      <p className="text-sm text-red-500 mt-1">{errors.themeId}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <AIContentGenerator
              category={
                categories.find(c => c.id === selectedCategory)?.slug ||
                (selectedCategory ? 'general' : undefined)
              }
              onContentGenerated={handleAIGeneratedContent}
              initialContent={formData.content}
              placeholder="Minta AI untuk membuat konten undangan..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              "Menyimpan..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Buat Undangan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}