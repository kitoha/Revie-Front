"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { cn } from "../lib/utils"
import { Message } from "../lib/types"

function renderMarkdown(text: string) {
  const parts = []
  let remaining = text
  
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/)
    const italicMatch = remaining.match(/\*(.*?)\*/)
    const codeMatch = remaining.match(/`(.*?)`/)
    
    let match = null
    let type = ''
    
    if (boldMatch && (!italicMatch || boldMatch.index! < italicMatch.index!) && (!codeMatch || boldMatch.index! < codeMatch.index!)) {
      match = boldMatch
      type = 'bold'
    } else if (italicMatch && (!codeMatch || italicMatch.index! < codeMatch.index!)) {
      match = italicMatch
      type = 'italic'
    } else if (codeMatch) {
      match = codeMatch
      type = 'code'
    }
    
    if (match) {
      if (match.index! > 0) {
        parts.push(remaining.slice(0, match.index!))
      }
      
      if (type === 'bold') {
        parts.push(<strong key={parts.length} className="font-semibold text-foreground">{match[1]}</strong>)
      } else if (type === 'italic') {
        parts.push(<em key={parts.length} className="italic">{match[1]}</em>)
      } else if (type === 'code') {
        parts.push(<code key={parts.length} className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono border border-blue-200 dark:border-blue-800">{match[1]}</code>)
      }
      
      remaining = remaining.slice(match.index! + match[0].length)
    } else {
      parts.push(remaining)
      break
    }
  }
  
  return parts
}

function parseMessageContent(content: string) {
  const lines = content.split('\n')
  const elements = []
  let inCodeBlock = false
  let codeBlockContent = []
  let listItems = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${elements.length}`} className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg font-mono text-xs mb-3 border border-blue-200 dark:border-blue-800 overflow-x-auto shadow-sm">
            <pre className="whitespace-pre-wrap text-blue-800 dark:text-blue-200">{codeBlockContent.join('\n')}</pre>
          </div>
        )
        codeBlockContent = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line)
      continue
    }
    
    if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
      listItems.push(
        <li key={`list-${i}`} className="ml-4 mb-1 flex items-start">
          <span className="mr-2 text-muted-foreground">•</span>
          <span>{renderMarkdown(line.replace(/^[\*\-\s]+/, ''))}</span>
        </li>
      )
      continue
    }
    
    if (line.trim().startsWith('**') && line.includes(':**')) {
      elements.push(
        <div key={`header-${i}`} className="font-semibold text-foreground mb-2 mt-3 first:mt-0">
          {renderMarkdown(line)}
        </div>
      )
      continue
    }
    
    if (line.trim().startsWith('**') && line.includes('**')) {
      elements.push(
        <div key={`subheader-${i}`} className="font-medium text-foreground mb-2 mt-2">
          {renderMarkdown(line)}
        </div>
      )
      continue
    }
    
    if (line.trim().startsWith('```') || (line.trim().startsWith('@') && (line.includes('class ') || line.includes('interface ') || line.includes('public ') || line.includes('private ') || line.includes('protected ')))) {
      elements.push(
        <div key={`code-${i}`} className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded font-mono text-xs mb-2 border border-blue-200 dark:border-blue-800 overflow-x-auto text-blue-800 dark:text-blue-200 shadow-sm">
          {line}
        </div>
      )
      continue
    }
    
    if (line.trim() === '') {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-group-${elements.length}`} className="mb-3">
            {listItems}
          </ul>
        )
        listItems = []
      }
      elements.push(<br key={`br-${i}`} />)
      continue
    }
    
    elements.push(
      <div key={`text-${i}`} className="mb-2 leading-relaxed">
        {renderMarkdown(line)}
      </div>
    )
  }
  
  if (listItems.length > 0) {
    elements.push(
      <ul key={`list-group-final`} className="mb-3">
        {listItems}
      </ul>
    )
  }
  
  return elements
}

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

    setDisplayedMessages(messages)
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

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
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
                "flex-1 rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft transition-smooth max-w-[90%]",
                message.role === "USER" 
                  ? "gradient-primary text-primary-foreground" 
                  : "bg-muted/50 text-foreground hover:shadow-medium border border-border/30",
              )}
            >
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {parseMessageContent(message.content)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </aside>
  )
}
