"use client"

import { useState } from "react"
import { cn } from "../lib/utils"
import { DiffItem } from "../lib/types"
import { FileTabs } from "./file-tabs"
import { GitPullRequest } from "lucide-react"

interface CodeViewerProps {
  diffs: DiffItem[]
  selectedFileId: string | null
  onFileSelect: (fileId: string) => void
  sessionTitle?: string
}

// Diff 내용을 파싱하여 라인별 정보 추출
const parseDiffContent = (diffContent: string) => {
  const lines = diffContent.split('\n')
  const parsedLines: Array<{
    num: number
    content: string
    type: 'added' | 'removed' | 'context' | 'header'
    originalLineNum?: number
    newLineNum?: number
  }> = []

  let lineNumber = 1
  let originalLineNum = 0
  let newLineNum = 0

  for (const line of lines) {
    if (line.startsWith('@@')) {
      // 헤더 라인 (예: @@ -10,5 +10,8 @@)
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/)
      if (match) {
        originalLineNum = parseInt(match[1]) - 1
        newLineNum = parseInt(match[2]) - 1
      }
      parsedLines.push({
        num: lineNumber++,
        content: line,
        type: 'header'
      })
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      // 추가된 라인
      newLineNum++
      parsedLines.push({
        num: lineNumber++,
        content: line.substring(1),
        type: 'added',
        originalLineNum,
        newLineNum
      })
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      // 삭제된 라인
      originalLineNum++
      parsedLines.push({
        num: lineNumber++,
        content: line.substring(1),
        type: 'removed',
        originalLineNum,
        newLineNum
      })
    } else {
      // 컨텍스트 라인
      originalLineNum++
      newLineNum++
      parsedLines.push({
        num: lineNumber++,
        content: line,
        type: 'context',
        originalLineNum,
        newLineNum
      })
    }
  }

  return parsedLines
}

export function CodeViewer({ diffs, selectedFileId, onFileSelect, sessionTitle }: CodeViewerProps) {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null)

  const selectedDiff = diffs.find(diff => diff.id === selectedFileId)
  const parsedLines = selectedDiff ? parseDiffContent(selectedDiff.diffContent) : []

  if (diffs.length === 0) {
    return (
      <main className="flex-1 lg:flex-1 flex flex-col bg-code-bg border-r-0 lg:border-r border-border">
        <header className="h-10 sm:h-12 border-b border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 flex items-center shadow-soft">
          <h2 className="text-xs sm:text-sm font-medium text-foreground truncate">Code Viewer</h2>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <GitPullRequest className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">PR을 분석하면 코드가 표시됩니다</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 lg:flex-1 flex flex-col bg-code-bg border-r-0 lg:border-r border-border">
      {/* 파일 탭 */}
      <FileTabs 
        diffs={diffs} 
        selectedFileId={selectedFileId} 
        onFileSelect={onFileSelect} 
      />
      
      {/* 헤더 */}
      <header className="h-10 sm:h-12 border-b border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 flex items-center shadow-soft">
        <h2 className="text-xs sm:text-sm font-medium text-foreground truncate">
          {selectedDiff ? selectedDiff.filePath : sessionTitle || "Code Viewer"}
        </h2>
      </header>

      {/* 코드 내용 */}
      <div className="flex-1 overflow-auto">
        {parsedLines.length > 0 ? (
          <div className="font-mono text-xs sm:text-sm">
            {parsedLines.map((line) => (
              <div
                key={line.num}
                onMouseEnter={() => setHoveredLine(line.num)}
                onMouseLeave={() => setHoveredLine(null)}
                className={cn(
                  "flex transition-smooth cursor-pointer group",
                  line.type === 'added' && "bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500",
                  line.type === 'removed' && "bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500",
                  line.type === 'header' && "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500",
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
                      line.type === 'added' && "text-green-700 dark:text-green-300",
                      line.type === 'removed' && "text-red-700 dark:text-red-300",
                      line.type === 'header' && "text-blue-700 dark:text-blue-300 font-semibold",
                    )}
                  >
                    {line.content}
                  </code>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <GitPullRequest className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">파일을 선택하면 코드가 표시됩니다</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
