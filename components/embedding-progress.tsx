"use client"

import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { cn } from "../lib/utils"

interface EmbeddingProgressProps {
  isOpen: boolean
  files: string[]
  completedFiles: string[]
  onClose: () => void
}

export function EmbeddingProgress({ 
  isOpen, 
  files, 
  completedFiles, 
  onClose 
}: EmbeddingProgressProps) {
  const [showComplete, setShowComplete] = useState(false)

  useEffect(() => {
    if (completedFiles.length === files.length && files.length > 0) {
      setShowComplete(true)
      const timer = setTimeout(() => {
        onClose()
        setShowComplete(false)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [completedFiles.length, files.length, onClose])

  if (!isOpen) return null

  const progress = files.length > 0 ? (completedFiles.length / files.length) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            {showComplete ? (
              <Check className="h-6 w-6 text-green-600" />
            ) : (
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {showComplete ? "임베딩 생성 완료" : "임베딩 생성 중..."}
            </h3>
            <p className="text-sm text-muted-foreground">
              {showComplete 
                ? "모든 파일이 처리되었습니다" 
                : `${completedFiles.length}/${files.length} 파일 처리됨`
              }
            </p>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 파일 목록 */}
        <div className="max-h-48 overflow-y-auto space-y-2">
          {files.map((file, index) => {
            const isCompleted = completedFiles.includes(file)
            return (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  isCompleted ? "text-green-600" : "text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <div className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="truncate">{file}</span>
              </div>
            )
          })}
        </div>

        {showComplete && (
          <div className="mt-4 text-center">
            <p className="text-sm text-green-600 font-medium">
              ✓ Completed: {files.length}/{files.length} files processed
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
