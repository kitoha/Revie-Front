"use client"

import { Menu, Sparkles, Search, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet"
import { ReviewList } from "./review-list"
import { useState } from "react"

import { DiffItem, ReviewListDto } from "../lib/types"

interface TopNavigationProps {
  onAnalyzePR: (url: string) => void
  isLoading?: boolean
  diffs?: DiffItem[]
  selectedFileId?: string | null
  onFileSelect?: (fileId: string) => void
  reviewList?: ReviewListDto[]
  selectedReviewId?: string | null
  onReviewSelect?: (sessionId: string) => void
}

export function TopNavigation({ 
  onAnalyzePR, 
  isLoading = false, 
  diffs = [], 
  selectedFileId = null, 
  onFileSelect = () => {},
  reviewList = [],
  selectedReviewId = null,
  onReviewSelect = () => {}
}: TopNavigationProps) {
  const [prUrl, setPrUrl] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prUrl.trim() && !isLoading) {
      onAnalyzePR(prUrl.trim())
    }
  }

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card/50 backdrop-blur-sm shadow-soft flex items-center justify-between px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-accent/50">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <ReviewList 
            diffs={diffs} 
            selectedFileId={selectedFileId} 
            onFileSelect={onFileSelect}
            reviewList={reviewList}
            selectedReviewId={selectedReviewId}
            onReviewSelect={onReviewSelect}
          />
        </SheetContent>
      </Sheet>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary transition-bounce" />
          <div className="absolute inset-0 blur-lg bg-primary/30 rounded-full animate-pulse" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Revie
        </h1>
      </div>

      {/* PR URL 입력 섹션 */}
      <div className="flex items-center gap-2">
        {isExpanded && (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="GitHub PR URL 입력..."
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                className="pl-9 w-64 bg-background border-border text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!prUrl.trim() || isLoading}
              className="gradient-primary hover:shadow-medium"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "분석"
              )}
            </Button>
          </form>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-accent/50"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </header>
  )
}
