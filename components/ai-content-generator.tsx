"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Send, Copy, ThumbsUp, ThumbsDown, RotateCcw, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AIContentGeneratorProps {
  category?: string
  onContentGenerated?: (content: string) => void
  initialContent?: string
  placeholder?: string
  className?: string
}

const predefinedPrompts = {
  wedding: [
    "Buat undangan pernikahan yang romantis dan elegan",
    "Tulis ucapan selamat datang untuk tamu undangan",
    "Buat narasi perkenalan mempelai",
    "Tulis informasi detail acara pernikahan",
  ],
  meeting: [
    "Buat undangan meeting bisnis yang profesional",
    "Tulis agenda meeting untuk rapat tim",
    "Buat undangan reuni sekolah/kantor",
    "Tulis konfirmasi kehadiran meeting",
  ],
  celebration: [
    "Buat undangan ulang tahun yang ceria",
    "Tulis undangan syukuran hari raya",
    "Buat undangan tasyakuran aqiqah",
    "Tulis ucapan selamat dan terima kasih",
  ],
}

export function AIContentGenerator({
  category,
  onContentGenerated,
  initialContent = "",
  placeholder = "Minta AI untuk membuat konten undangan Anda...",
  className,
}: AIContentGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentContent, setCurrentContent] = useState(initialContent)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ [key: number]: 'up' | 'down' | null }>({})

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    stop,
  } = useChat({
    api: '/api/chat',
    body: {
      category: category,
    },
    onFinish: (message) => {
      if (message.content) {
        setCurrentContent(message.content)
        onContentGenerated?.(message.content)
      }
    },
    onError: (error) => {
      console.error('AI Error:', error)
      toast.error('Terjadi kesalahan pada AI. Silakan coba lagi.')
    },
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  const handleCopyContent = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      toast.success('Konten berhasil disalin!')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      toast.error('Gagal menyalin konten')
    }
  }

  const handleUseContent = (content: string) => {
    onContentGenerated?.(content)
    setIsOpen(false)
    toast.success('Konten berhasil digunakan!')
  }

  const handleFeedback = (messageIndex: number, type: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, [messageIndex]: type }))
    toast.success(`Terima kasih atas feedback Anda!`)
  }

  const handlePresetPrompt = (prompt: string) => {
    handleInputChange({
      target: { value: prompt }
    } as any)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn("w-full gap-2", className)}
        variant="outline"
      >
        <Sparkles className="h-4 w-4" />
        AI Content Generator
      </Button>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Content Generator
            </CardTitle>
            <CardDescription>
              Dapatkan bantuan AI untuk membuat konten undangan yang menarik
              {category && (
                <span className="ml-2">
                  <Badge variant="secondary">{category}</Badge>
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset Prompts */}
        {category && predefinedPrompts[category as keyof typeof predefinedPrompts] && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Prompt Cepat:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedPrompts[category as keyof typeof predefinedPrompts].map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetPrompt(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="flex-1 min-h-[80px] resize-none"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <RotateCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            {isLoading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stop}
              >
                Stop
              </Button>
            )}
          </div>
        </form>

        {/* Messages */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {messages
            .filter((message) => message.role === 'assistant')
            .map((message, index) => (
              <div key={message.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">AI Response</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyContent(message.content, index)}
                    >
                      {copiedIndex === index ? (
                        <span className="text-green-500 text-xs">Copied!</span>
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => reload()}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <pre className="whitespace-pre-wrap text-sm">{message.content}</pre>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Apakah ini membantu?</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(index, 'up')}
                      className={cn(
                        "h-6 w-6 p-0",
                        feedback[index] === 'up' && "text-green-500"
                      )}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback(index, 'down')}
                      className={cn(
                        "h-6 w-6 p-0",
                        feedback[index] === 'down' && "text-red-500"
                      )}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseContent(message.content)}
                  >
                    Gunakan Konten
                  </Button>
                </div>
                {index < messages.filter(m => m.role === 'assistant').length - 1 && (
                  <Separator />
                )}
              </div>
            ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RotateCcw className="h-4 w-4 animate-spin" />
            AI sedang berpikir...
          </div>
        )}

        {/* Current Content Display */}
        {currentContent && !isLoading && (
          <div className="space-y-2">
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Konten yang akan digunakan:</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyContent(currentContent, -1)}
                >
                  {copiedIndex === -1 ? (
                    <span className="text-green-500 text-xs">Copied!</span>
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentContent("")}
                >
                  Hapus
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <pre className="whitespace-pre-wrap text-sm">{currentContent}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}