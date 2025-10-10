"use client"

import { useState } from "react"
import { TopNavigation } from "../components/top-navigation"
import { CodeViewer } from "../components/code-viewer"
import { ChatPanel } from "../components/chat-panel"
import { MessageInput } from "../components/message-input"
import { Button } from "../components/ui/button"
import { Code, MessageSquare } from "lucide-react"
import { cn } from "../lib/utils"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"code" | "chat">("code")

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <TopNavigation />

      {/* 모바일 탭 네비게이션 */}
      <div className="lg:hidden border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex">
          <Button
            variant={activeTab === "code" ? "default" : "ghost"}
            className={cn(
              "flex-1 rounded-none border-0 h-12 gap-2",
              activeTab === "code" ? "gradient-primary text-primary-foreground" : "hover:bg-accent/50"
            )}
            onClick={() => setActiveTab("code")}
          >
            <Code className="h-4 w-4" />
            Code
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            className={cn(
              "flex-1 rounded-none border-0 h-12 gap-2",
              activeTab === "chat" ? "gradient-primary text-primary-foreground" : "hover:bg-accent/50"
            )}
            onClick={() => setActiveTab("chat")}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
        </div>
      </div>

      {/* 모바일에서는 탭 전환, 데스크톱에서는 가로 분할 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className={cn(
          "flex-1 flex flex-col",
          activeTab === "code" ? "flex" : "hidden",
          "lg:flex"
        )}>
          <CodeViewer />
        </div>
        <div className={cn(
          "flex-1 flex flex-col",
          activeTab === "chat" ? "flex" : "hidden",
          "lg:flex"
        )}>
          <ChatPanel />
        </div>
      </div>

      <MessageInput />
    </div>
  )
}
