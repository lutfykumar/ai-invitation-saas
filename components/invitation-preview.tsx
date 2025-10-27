"use client"

import { CSSProperties } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface InvitationPreviewProps {
  invitation?: {
    title: string
    content: string
    recipientName?: string
    senderName?: string
    customMessage?: string
    category: {
      name: string
    }
  }
  theme: {
    cssVariables: string
    templateHtml: string
  }
  formData: {
    title: string
    content: string
    eventLocation?: string
    recipientName?: string
    senderName?: string
    customMessage?: string
  }
  eventDate?: Date
}

export function InvitationPreview({
  invitation,
  theme,
  formData,
  eventDate,
}: InvitationPreviewProps) {
  // Parse CSS variables from theme
  let cssVariables: CSSProperties = {}
  try {
    if (theme.cssVariables) {
      const parsed = JSON.parse(theme.cssVariables)
      cssVariables = parsed
    }
  } catch (error) {
    console.error("Error parsing CSS variables:", error)
  }

  // Default styling if no theme variables
  const defaultStyles: CSSProperties = {
    backgroundColor: "#ffffff",
    color: "#333333",
    fontFamily: "system-ui, sans-serif",
    borderRadius: "12px",
    border: "1px solid #e5e5e5",
  }

  const finalStyles = { ...defaultStyles, ...cssVariables }

  // Process template with form data
  const processTemplate = (template: string) => {
    let processed = template

    // Replace placeholders with actual data
    processed = processed.replace(/\{\{title\}\}/g, formData.title || invitation?.title || "Judul Undangan")
    processed = processed.replace(/\{\{content\}\}/g, formData.content || invitation?.content || "Konten undangan...")
    processed = processed.replace(/\{\{event_date\}\}/g,
      eventDate ? format(eventDate, "dd MMMM yyyy", { locale: id }) : "Tanggal akan diinformasikan"
    )
    processed = processed.replace(/\{\{event_location\}\}/g, formData.eventLocation || "Lokasi akan diinformasikan")
    processed = processed.replace(/\{\{sender_name\}\}/g, formData.senderName || invitation?.senderName || "Pengirim")
    processed = processed.replace(/\{\{recipient_name\}\}/g, formData.recipientName || invitation?.recipientName || "Yang terhormat")

    return processed
  }

  const processedTemplate = processTemplate(theme.templateHtml)

  return (
    <div className="space-y-4">
      {/* Mobile Preview */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Mobile Preview</h4>
        <div className="mx-auto max-w-sm">
          <Card className="overflow-hidden" style={finalStyles}>
            <div
              className="p-6"
              dangerouslySetInnerHTML={{ __html: processedTemplate }}
              style={{
                color: finalStyles.color as string,
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            />
          </Card>
        </div>
      </div>

      {/* Desktop Preview */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Desktop Preview</h4>
        <div className="mx-auto max-w-2xl">
          <Card className="overflow-hidden" style={finalStyles}>
            <div
              className="p-8"
              dangerouslySetInnerHTML={{ __html: processedTemplate }}
              style={{
                color: finalStyles.color as string,
                fontSize: "16px",
                lineHeight: "1.6",
              }}
            />
          </Card>
        </div>
      </div>

      {/* Theme Information */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Informasi Tema</h4>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Tema: {theme.name}</p>
          <p>Kategori: {invitation?.category.name || "Tidak diketahui"}</p>
        </div>
      </div>

      {/* Custom Message Preview */}
      {(formData.customMessage || invitation?.customMessage) && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Pesan Kustom</h4>
          <p className="text-sm text-blue-700">
            {formData.customMessage || invitation?.customMessage}
          </p>
        </div>
      )}
    </div>
  )
}