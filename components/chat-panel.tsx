"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { cn } from "../lib/utils"
import { Message } from "../lib/types"

interface ChatPanelProps {
  sessionId?: string | null
  messages: Message[]
  isStreaming?: boolean
}

export function ChatPanel({ sessionId, messages, isStreaming = false }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [displayedMessages])

  useEffect(() => {
    if (!messages || messages.length === 0) {
      setDisplayedMessages([])
      return
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === 'ASSISTANT' && isStreaming) {
      let currentIndex = 0
      const content = lastMessage.content
      
      const timer = setInterval(() => {
        if (currentIndex < content.length) {
          const partialContent = content.substring(0, currentIndex + 1)
          setDisplayedMessages(prev => {
            const newMessages = [...prev]
            if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'ASSISTANT') {
              newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], content: partialContent }
            }
            return newMessages
          })
          currentIndex++
        } else {
          clearInterval(timer)
        }
      }, 20)

      return () => clearInterval(timer)
    } else {
      setDisplayedMessages(messages)
    }
  }, [messages, isStreaming])

  if (!sessionId) {
    return (
      <aside className="flex-1 flex flex-col h-full">
        <header className="h-12 border-b border-border/50 px-6 flex items-center gap-3">
          <div className="relative">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="absolute inset-0 blur-md bg-primary/20 rounded-full" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <div className="relative mb-6">
              <Sparkles className="h-16 w-16 mx-auto opacity-30" />
              <div className="absolute inset-0 blur-xl bg-primary/10 rounded-full" />
            </div>
            <p className="text-sm font-medium">리뷰 세션을 시작하면 채팅이 가능합니다</p>
            <p className="text-xs text-muted-foreground/70 mt-2">코드 분석 후 AI와 대화해보세요</p>
          </div>
        </div>
      </aside>
    )
  }

  if (displayedMessages.length === 0) {
    return (
      <aside className="flex-1 flex flex-col h-full">
        <header className="h-12 border-b border-border/50 px-6 flex items-center gap-3">
          <div className="relative">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="absolute inset-0 blur-md bg-primary/20 rounded-full" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <div className="relative mb-6">
              <Sparkles className="h-16 w-16 mx-auto opacity-30" />
              <div className="absolute inset-0 blur-xl bg-primary/10 rounded-full" />
            </div>
            <p className="text-sm font-medium">코드에 대해 질문해보세요</p>
            <p className="text-xs text-muted-foreground/70 mt-2">AI가 코드를 분석하고 답변해드립니다</p>
          </div>
        </div>
      </aside>
    )
  }
  return (
    <aside className="flex-1 flex flex-col h-full">
      <header className="h-12 border-b border-border/50 px-6 flex items-center gap-3">
        <div className="relative">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="absolute inset-0 blur-md bg-primary/20 rounded-full" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>응답 중...</span>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {displayedMessages.map((message, index) => (
          <div key={index} className={cn("flex gap-3 transition-smooth", message.role === "USER" ? "flex-row-reverse" : "flex-row")}>
            <Avatar className="h-8 w-8 flex-shrink-0 shadow-soft">
              {message.role === "ASSISTANT" ? (
                <>
                  <AvatarFallback className="gradient-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src="/diverse-user-avatars.png" />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">You</AvatarFallback>
                </>
              )}
            </Avatar>
            <div
              className={cn(
                "flex-1 rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft transition-smooth max-w-[85%]",
                message.role === "USER" 
                  ? "gradient-primary text-primary-foreground" 
                  : "bg-muted/50 text-foreground hover:shadow-medium border border-border/30",
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </aside>
  )
}
