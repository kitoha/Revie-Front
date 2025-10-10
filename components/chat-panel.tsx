"use client"

import { Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { cn } from "../lib/utils"

const messages = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello! I am your AI code review assistant. Select a line of code to get started. How can I help you today?",
  },
  {
    id: 2,
    role: "user",
    content: "Can you review line 5 for potential bugs?",
  },
  {
    id: 3,
    role: "assistant",
    content:
      "In line 5, there's a typo in the property name 'quanity'. It should be 'quantity'. This will likely result in 'NaN' (Not-a-Number) because `items[i].quanity` is `undefined`.",
  },
]

export function ChatPanel() {
  return (
    <aside className="flex-1 lg:flex-1 flex flex-col bg-card/50 backdrop-blur-sm border-t lg:border-t-0 border-border">
      <header className="h-10 sm:h-12 border-b border-border px-4 sm:px-6 flex items-center gap-2 shadow-soft">
        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h2 className="text-xs sm:text-sm font-medium text-foreground">AI Assistant</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-2 sm:gap-3 transition-smooth", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 shadow-soft">
              {message.role === "assistant" ? (
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
                message.role === "user" 
                  ? "gradient-primary text-primary-foreground" 
                  : "bg-muted text-foreground hover:shadow-medium",
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
