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
  isLoadingDiffs?: boolean
}

const parseDiffContent = (diffContent: string) => {
  const lines = diffContent.split('\n')
  
  const parsedLines: Array<{
    num: number
    content: string
    type: 'added' | 'removed' | 'context' | 'header'
    originalLineNum?: number
    newLineNum?: number
    isHunkHeader?: boolean
  }> = []

  let lineNumber = 1
  let originalLineNum = 0
  let newLineNum = 0
  let currentHunkStart = 0

  for (const line of lines) {
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/)
      if (match) {
        originalLineNum = parseInt(match[1]) - 1
        newLineNum = parseInt(match[2]) - 1
        currentHunkStart = lineNumber
      }
      parsedLines.push({
        num: lineNumber++,
        content: line,
        type: 'header',
        isHunkHeader: true
      })
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      newLineNum++
      parsedLines.push({
        num: lineNumber++,
        content: line.substring(1),
        type: 'added',
        originalLineNum,
        newLineNum
      })
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      originalLineNum++
      parsedLines.push({
        num: lineNumber++,
        content: line.substring(1),
        type: 'removed',
        originalLineNum,
        newLineNum
      })
    } else {
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

export function CodeViewer({ diffs, selectedFileId, onFileSelect, sessionTitle, isLoadingDiffs = false }: CodeViewerProps) {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null)

  const safeDiffs = Array.isArray(diffs) ? diffs : []
  const selectedDiff = safeDiffs.find(diff => diff.id === selectedFileId)
  const parsedLines = selectedDiff ? parseDiffContent(selectedDiff.diffContent) : []

  if (safeDiffs.length === 0) {
    return (
      <main className="flex-1 lg:flex-1 flex flex-col bg-code-bg border-r-0 lg:border-r border-border h-full">
        <header className="h-10 sm:h-12 border-b border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 flex items-center shadow-soft flex-shrink-0">
          <h2 className="text-xs sm:text-sm font-medium text-foreground truncate">Code Viewer</h2>
        </header>
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="text-center text-muted-foreground">
            <GitPullRequest className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">PR을 분석하면 코드가 표시됩니다</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 lg:flex-1 flex flex-col bg-code-bg border-r-0 lg:border-r border-border h-full">
      {/* 파일 탭 */}
      <FileTabs 
        diffs={diffs} 
        selectedFileId={selectedFileId} 
        onFileSelect={onFileSelect} 
      />
      
      {/* 헤더 */}
      <header className="h-10 sm:h-12 border-b border-border bg-card/50 backdrop-blur-sm px-4 sm:px-6 flex items-center shadow-soft flex-shrink-0">
        <h2 className="text-xs sm:text-sm font-medium text-foreground truncate">
          {selectedDiff ? selectedDiff.filePath : sessionTitle || "Code Viewer"}
        </h2>
        {isLoadingDiffs && (
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>파일 로딩 중...</span>
          </div>
        )}
      </header>

      {/* 코드 내용 - 개선된 스크롤바와 레이아웃 */}
      <div className="flex-1 code-viewer-container relative overflow-hidden min-h-0">
        {parsedLines.length > 0 ? (
          <div className="font-mono text-xs sm:text-sm h-full w-full">
            {/* 가로 스크롤을 위한 컨테이너 - 스크롤바 겹침 방지 */}
            <div className="overflow-x-auto overflow-y-auto code-scrollbar scrollbar-thin h-full w-full">
              <div className="min-w-max pr-2">
                <div 
                  key={selectedFileId}
                  className="animate-in fade-in-0 slide-in-from-right-2 duration-300"
                >
                  {parsedLines.map((line, index) => (
                  <div
                    key={line.num}
                    onMouseEnter={() => setHoveredLine(line.num)}
                    onMouseLeave={() => setHoveredLine(null)}
                    className={cn(
                      "flex transition-all duration-200 cursor-pointer group relative min-w-max border-l-2 border-transparent hover:border-l-primary/30",
                      line.type === 'added' && "bg-emerald-50/50 dark:bg-emerald-950/10 border-l-emerald-400/50",
                      line.type === 'removed' && "bg-rose-50/50 dark:bg-rose-950/10 border-l-rose-400/50",
                      line.type === 'header' && "bg-blue-50/50 dark:bg-blue-950/10 border-l-blue-400/50 font-semibold",
                      hoveredLine === line.num && "bg-accent/30 dark:bg-accent/20 shadow-sm",
                    )}
                  >
                    {/* 라인 번호 컬럼 - 개선된 디자인 */}
                    <div className="flex-shrink-0 w-12 sm:w-16 text-right pr-2 sm:pr-4 py-1.5 sm:py-2 text-muted-foreground/60 select-none group-hover:text-muted-foreground transition-all duration-200 text-xs sm:text-sm border-r border-border/50 bg-muted/20">
                      {line.originalLineNum !== undefined && line.originalLineNum > 0 ? line.originalLineNum : ''}
                    </div>
                    <div className="flex-shrink-0 w-12 sm:w-16 text-right pr-2 sm:pr-4 py-1.5 sm:py-2 text-muted-foreground/60 select-none group-hover:text-muted-foreground transition-all duration-200 text-xs sm:text-sm border-r border-border/50 bg-muted/20">
                      {line.newLineNum !== undefined && line.newLineNum > 0 ? line.newLineNum : ''}
                    </div>
                    
                    {/* 라인 타입 인디케이터 - 세련된 디자인 */}
                    <div className="flex-shrink-0 w-4 flex items-center justify-center py-1.5 sm:py-2">
                      {line.type === 'added' && (
                        <div className="w-1 h-full bg-emerald-400 rounded-full shadow-sm"></div>
                      )}
                      {line.type === 'removed' && (
                        <div className="w-1 h-full bg-rose-400 rounded-full shadow-sm"></div>
                      )}
                      {line.type === 'header' && (
                        <div className="w-1 h-full bg-blue-400 rounded-full shadow-sm"></div>
                      )}
                    </div>
                    
                    {/* 코드 컨텐츠 - 가로 스크롤 허용 */}
                    <div className="flex-1 py-1.5 sm:py-2 pr-2 sm:pr-4 min-w-0 overflow-x-auto">
                      <code
                        className={cn(
                          "text-foreground transition-all duration-200 whitespace-pre block min-w-max leading-relaxed",
                          line.type === 'added' && "text-emerald-700 dark:text-emerald-300 font-medium",
                          line.type === 'removed' && "text-rose-700 dark:text-rose-300 font-medium",
                          line.type === 'header' && "text-blue-700 dark:text-blue-300 font-bold",
                          line.type === 'context' && "text-foreground/90",
                        )}
                      >
                        {line.content}
                      </code>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
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
