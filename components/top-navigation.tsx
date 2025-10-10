"use client"

import { Menu, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { ReviewList } from "./review-list"

export function TopNavigation() {
  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card/50 backdrop-blur-sm shadow-soft flex items-center justify-between px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-accent/50">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <ReviewList />
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

      <div className="w-9 sm:w-10" />
    </header>
  )
}
