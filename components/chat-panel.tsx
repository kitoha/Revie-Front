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
    if (messages.length === 0) {
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
      <aside className="flex-1 lg:flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-t lg:border-t-0 border-border">
        <header className="h-10 sm:h-12 border-b border-border px-4 sm:px-6 flex items-center gap-2 shadow-soft">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h2 className="text-xs sm:text-sm font-medium text-foreground">AI Assistant</h2>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">리뷰 세션을 시작하면 채팅이 가능합니다</p>
          </div>
        </div>
      </aside>
    )
  }

  if (displayedMessages.length === 0) {
    return (
      <aside className="flex-1 lg:flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-t lg:border-t-0 border-border">
        <header className="h-10 sm:h-12 border-b border-border px-4 sm:px-6 flex items-center gap-2 shadow-soft">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h2 className="text-xs sm:text-sm font-medium text-foreground">AI Assistant</h2>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">코드에 대해 질문해보세요</p>
          </div>
        </div>
      </aside>
    )
  }
  return (
    <aside className="flex-1 lg:flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-t lg:border-t-0 border-border">
      <header className="h-10 sm:h-12 border-b border-border px-4 sm:px-6 flex items-center gap-2 shadow-soft">
        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h2 className="text-xs sm:text-sm font-medium text-foreground">AI Assistant</h2>
        {isStreaming && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>응답 중...</span>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {displayedMessages.map((message, index) => (
          <div key={index} className={cn("flex gap-2 sm:gap-3 transition-smooth", message.role === "USER" ? "flex-row-reverse" : "flex-row")}>
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 shadow-soft">
              {message.role === "ASSISTANT" ? (
                <>
                  <AvatarFallback className="gradient-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  </AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src="/diverse-user-avatars.png" />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs sm:text-sm">You</AvatarFallback>
                </>
              )}
            </Avatar>
            <div
              className={cn(
                "flex-1 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-soft transition-smooth max-w-[85%] sm:max-w-none",
                message.role === "USER" 
                  ? "gradient-primary text-primary-foreground" 
                  : "bg-muted text-foreground hover:shadow-medium",
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
