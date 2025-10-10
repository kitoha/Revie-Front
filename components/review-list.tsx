"use client"

import { Search, FileCode2, GitPullRequest, Database } from "lucide-react"
import { Input } from "./ui/input"
import { cn } from "../lib/utils"
import { useState } from "react"

const reviews = [
  {
    id: 1,
    title: "Pull Request #42: Fix for API Bug",
    file: "src/utils/calculations.js",
    time: "2 hours ago",
    type: "pr",
  },
  {
    id: 2,
    title: "Feature: User Profile Page",
    file: "src/components/Profile.jsx",
    time: "1 day ago",
    type: "feature",
  },
  {
    id: 3,
    title: "Refactor: Database Schema",
    file: "prisma/schema.prisma",
    time: "3 days ago",
    type: "refactor",
  },
]

export function ReviewList() {
  const [selectedId, setSelectedId] = useState(1)

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Code Reviews</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {reviews.map((review) => (
          <button
            key={review.id}
            onClick={() => setSelectedId(review.id)}
            className={cn(
              "w-full text-left p-4 border-b border-border transition-colors hover:bg-muted",
              selectedId === review.id && "bg-muted",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {review.type === "pr" && <GitPullRequest className="h-4 w-4 text-primary" />}
                {review.type === "feature" && <FileCode2 className="h-4 w-4 text-accent" />}
                {review.type === "refactor" && <Database className="h-4 w-4 text-chart-2" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground mb-1 text-balance">{review.title}</h3>
                <p className="text-xs text-muted-foreground truncate mb-1">{review.file}</p>
                <p className="text-xs text-muted-foreground">Reviewed {review.time}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
