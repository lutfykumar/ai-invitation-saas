"use client"

import { useState, useEffect } from "react"
import { CSSProperties } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, MapPinIcon, UserIcon, Share2, Heart, Download } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface InvitationViewClientProps {
  invitation: {
    id: string
    title: string
    content: string
    eventDate?: string
    eventLocation?: string
    recipientName?: string
    senderName?: string
    customMessage?: string
    category: {
      name: string
      slug: string
    }
    theme: {
      name: string
      cssVariables: string
      templateHtml: string
    }
  }
}

export function InvitationViewClient({ invitation }: InvitationViewClientProps) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Parse CSS variables from theme
  let cssVariables: CSSProperties = {}
  try {
    if (invitation.theme.cssVariables) {
      const parsed = JSON.parse(invitation.theme.cssVariables)
      cssVariables = parsed
    }
  } catch (error) {
    console.error("Error parsing CSS variables:", error)
  }

  // Default styling if no theme variables
  const defaultStyles: CSSProperties = {
    backgroundColor: "#ffffff",
    color: "#333333",
    fontFamily: "Georgia, serif",
    borderRadius: "16px",
    border: "1px solid #e5e5e5",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  }

  const finalStyles = { ...defaultStyles, ...cssVariables }

  // Process template with invitation data
  const processTemplate = (template: string) => {
    let processed = template

    // Replace placeholders with actual data
    processed = processed.replace(/\{\{title\}\}/g, invitation.title)
    processed = processed.replace(/\{\{content\}\}/g, invitation.content)
    processed = processed.replace(/\{\{event_date\}\}/g,
      invitation.eventDate
        ? format(new Date(invitation.eventDate), "dd MMMM yyyy, HH:mm", { locale: id })
        : "Tanggal akan diinformasikan"
    )
    processed = processed.replace(/\{\{event_location\}\}/g,
      invitation.eventLocation || "Lokasi akan diinformasikan"
    )
    processed = processed.replace(/\{\{sender_name\}\}/g,
      invitation.senderName || "Pengirim"
    )
    processed = processed.replace(/\{\{recipient_name\}\}/g,
      invitation.recipientName || "Yang terhormat"
    )

    return processed
  }

  const processedTemplate = processTemplate(invitation.theme.templateHtml)

  const handleShare = async () => {
    const shareUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: invitation.title,
          text: invitation.content.substring(0, 100) + "...",
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Link undangan berhasil disalin!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    toast.success(liked ? "Like dihapus" : "Undangan disukai!")
  }

  const handleDownload = () => {
    // Simple implementation - in a real app, you might generate a PDF
    toast.info("Fitur unduh PDF akan segera hadir!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            {copied ? "Tersalin!" : "Bagikan"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className={cn(
              "gap-2",
              liked && "text-red-500 border-red-200 hover:bg-red-50"
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            {liked ? "Disukai" : "Sukai"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Unduh
          </Button>
        </div>

        {/* Main Invitation Card */}
        <Card className="overflow-hidden" style={finalStyles}>
          <CardContent className="p-0">
            <div
              className="p-8 md:p-12"
              dangerouslySetInnerHTML={{ __html: processedTemplate }}
              style={{
                color: finalStyles.color as string,
                fontSize: "clamp(16px, 2vw, 20px)",
                lineHeight: "1.7",
              }}
            />

            {/* Custom Message */}
            {invitation.customMessage && (
              <div className="px-8 md:px-12 pb-8">
                <Separator className="mb-4" />
                <div
                  className="italic text-center"
                  style={{
                    color: finalStyles.color as string,
                    opacity: 0.8,
                  }}
                >
                  "{invitation.customMessage}"
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Event Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Detail Acara</h3>

                {invitation.eventDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(invitation.eventDate), "EEEE, dd MMMM yyyy, HH:mm", {
                        locale: id,
                      })}
                    </span>
                  </div>
                )}

                {invitation.eventLocation && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{invitation.eventLocation}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium">Kategori:</span>
                  <Badge variant="secondary">{invitation.category.name}</Badge>
                </div>
              </div>

              {/* Sender Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Informasi Pengirim</h3>

                {invitation.senderName && (
                  <div className="flex items-center gap-3 text-sm">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Dari: {invitation.senderName}</span>
                  </div>
                )}

                {invitation.recipientName && (
                  <div className="flex items-center gap-3 text-sm">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Untuk: {invitation.recipientName}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium">Tema:</span>
                  <span className="text-muted-foreground">{invitation.theme.name}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Dibuat dengan ❤️ menggunakan{" "}
            <a href="/" className="font-medium hover:underline">
              InvitationAI
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Buat undangan digital yang menakjubkan dengan bantuan AI
          </p>
        </div>
      </div>
    </div>
  )
}