"use client"

import { Send, Paperclip } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { useState } from "react"

export function MessageInput() {
  const [input, setInput] = useState("")

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-sm shadow-soft">
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <div className="flex items-end gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 mb-1 sm:mb-2 shadow-soft">
            <AvatarImage src="/diverse-user-avatars.png" />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs sm:text-sm">You</AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              placeholder="Ask AI to review your code..."
              className="min-h-[50px] sm:min-h-[60px] pr-20 sm:pr-24 resize-none bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl shadow-soft text-sm"
            />
            <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 flex gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-accent/50">
                <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button size="icon" className="h-7 w-7 sm:h-8 sm:w-8 gradient-primary hover:shadow-medium">
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
