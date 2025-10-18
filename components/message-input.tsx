"use client"

import { Send, Paperclip } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { useState } from "react"

interface MessageInputProps {
  sessionId?: string | null
  onSendMessage?: (message: string) => void
  disabled?: boolean
}

export function MessageInput({ sessionId, onSendMessage, disabled = false }: MessageInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled && onSendMessage) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!sessionId) {
    return null
  }

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 sm:gap-3">
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 shadow-soft">
          <AvatarImage src="/diverse-user-avatars.png" />
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs sm:text-sm">You</AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to review your code..."
            disabled={disabled}
            className="min-h-[50px] sm:min-h-[60px] pr-20 sm:pr-24 resize-none bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl sm:rounded-2xl shadow-soft text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
          <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 flex gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-accent/50 rounded-lg sm:rounded-xl">
              <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button 
              type="submit"
              size="icon" 
              disabled={!input.trim() || disabled}
              className="h-7 w-7 sm:h-8 sm:w-8 gradient-primary hover:shadow-medium disabled:opacity-50 rounded-lg sm:rounded-xl"
              onClick={handleSubmit}
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
