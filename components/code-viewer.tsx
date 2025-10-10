"use client"

import { useState } from "react"
import { cn } from "../lib/utils"

const codeLines = [
  { num: 1, content: "", highlight: false },
  {
    num: 2,
    content: "function calculateTotalPrice(items) {",
    highlight: false,
  },
  { num: 3, content: "  let total = 0;", highlight: false },
  {
    num: 4,
    content: "  for (let i = 0; i < items.length; i++) {",
    highlight: false,
  },
  {
    num: 5,
    content: "    // This line has a potential bug",
    highlight: true,
    comment: true,
  },
  {
    num: 6,
    content: "    total += items[i].price * items[i].quanity; // 'quanity' is a typo",
    highlight: true,
    error: true,
  },
  { num: 7, content: "  }", highlight: false },
  { num: 8, content: "  return total;", highlight: false },
  { num: 9, content: "}", highlight: false },
  { num: 10, content: "", highlight: false },
  { num: 11, content: "const order = {", highlight: false },
  {
    num: 12,
    content: "  items: [{ price: 10, quantity: 2 }]",
    highlight: false,
  },
  { num: 13, content: "};", highlight: false },
  {
    num: 14,
    content: "console.log(calculateTotalPrice(order.items));",
    highlight: false,
  },
]

export function CodeViewer() {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null)

  return (
    <main className="flex-1 lg:flex-1 flex flex-col bg-code-bg border-r-0 lg:border-r border-border">
      <header className="h-10 sm:h-12 border-b border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 flex items-center shadow-soft">
        <h2 className="text-xs sm:text-sm font-medium text-foreground truncate">Pull Request #42: Fix for API Bug</h2>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="font-mono text-xs sm:text-sm">
          {codeLines.map((line) => (
            <div
              key={line.num}
              onMouseEnter={() => setHoveredLine(line.num)}
              onMouseLeave={() => setHoveredLine(null)}
              className={cn(
                "flex transition-smooth cursor-pointer group",
                line.highlight && "bg-code-highlight shadow-soft",
                hoveredLine === line.num && "bg-code-line",
              )}
            >
              <div className="w-12 sm:w-16 flex-shrink-0 text-right pr-2 sm:pr-4 py-1.5 sm:py-2 text-muted-foreground select-none group-hover:text-foreground transition-smooth text-xs sm:text-sm">
                {line.num}
              </div>
              <div className="flex-1 py-1.5 sm:py-2 pr-2 sm:pr-4">
                <code
                  className={cn(
                    "text-foreground transition-smooth break-words",
                    line.comment && "text-muted-foreground italic",
                    line.error && "text-destructive font-medium",
                  )}
                >
                  {line.content}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
