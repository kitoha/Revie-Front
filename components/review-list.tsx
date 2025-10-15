"use client"

import { Search, FileCode2, GitPullRequest, Database, Plus, Minus } from "lucide-react"
import { Input } from "./ui/input"
import { cn } from "../lib/utils"
import { useState } from "react"
import { DiffItem, FileType, ReviewListDto } from "../lib/types"

interface ReviewListProps {
  diffs: DiffItem[]
  selectedFileId: string | null
  onFileSelect: (fileId: string) => void
  reviewList?: ReviewListDto[]
  onReviewSelect?: (sessionId: string) => void
  selectedReviewId?: string | null
}

// 파일 확장자별 아이콘 매핑
const getFileIcon = (extension: string): FileType => {
  const ext = extension.toLowerCase()
  
  if (['js', 'jsx'].includes(ext)) return 'js'
  if (['ts', 'tsx'].includes(ext)) return 'ts'
  if (['py'].includes(ext)) return 'py'
  if (['java'].includes(ext)) return 'java'
  if (['go'].includes(ext)) return 'go'
  if (['rs'].includes(ext)) return 'rs'
  if (['php'].includes(ext)) return 'php'
  if (['rb'].includes(ext)) return 'rb'
  if (['cpp', 'c', 'h', 'hpp'].includes(ext)) return 'cpp'
  if (['cs'].includes(ext)) return 'cs'
  if (['swift'].includes(ext)) return 'swift'
  if (['kt'].includes(ext)) return 'kt'
  if (['scala'].includes(ext)) return 'scala'
  if (['sh', 'bash'].includes(ext)) return 'sh'
  if (['sql'].includes(ext)) return 'sql'
  if (['json'].includes(ext)) return 'json'
  if (['yaml', 'yml'].includes(ext)) return 'yaml'
  if (['xml'].includes(ext)) return 'xml'
  if (['html', 'htm'].includes(ext)) return 'html'
  if (['css'].includes(ext)) return 'css'
  if (['scss', 'sass'].includes(ext)) return 'scss'
  if (['less'].includes(ext)) return 'less'
  if (['md'].includes(ext)) return 'md'
  if (['txt'].includes(ext)) return 'txt'
  
  return 'other'
}

// 파일 타입별 아이콘 컴포넌트
const FileTypeIcon = ({ fileType, className }: { fileType: FileType; className?: string }) => {
  const iconProps = { className: cn("h-4 w-4", className) }
  
  switch (fileType) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'java':
    case 'go':
    case 'rs':
    case 'php':
    case 'rb':
    case 'cpp':
    case 'c':
    case 'cs':
    case 'swift':
    case 'kt':
    case 'scala':
    case 'sh':
    case 'html':
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode2 {...iconProps} />
    case 'sql':
      return <Database {...iconProps} />
    case 'json':
    case 'yaml':
    case 'yml':
    case 'xml':
    case 'md':
    case 'txt':
      return <FileCode2 {...iconProps} />
    default:
      return <FileCode2 {...iconProps} />
  }
}

// Diff 통계 계산 (추가/삭제 라인 수)
const getDiffStats = (diffContent: string) => {
  const lines = diffContent.split('\n')
  let added = 0
  let removed = 0
  
  lines.forEach(line => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      added++
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      removed++
    }
  })
  
  return { added, removed }
}

export function ReviewList({ 
  diffs, 
  selectedFileId, 
  onFileSelect, 
  reviewList = [], 
  onReviewSelect,
  selectedReviewId 
}: ReviewListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"reviews" | "files">("reviews")

  const filteredDiffs = diffs.filter(diff => 
    diff.filePath.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredReviews = reviewList.filter(review => 
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.pullRequestUrl.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              activeTab === "reviews" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Reviews
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              activeTab === "files" 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Files
          </button>
        </div>
        
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {activeTab === "reviews" ? "Review Sessions" : "Diff Files"}
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={activeTab === "reviews" ? "리뷰 검색..." : "파일 검색..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "reviews" ? (
          // 리뷰 목록 표시
          filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <button
                key={review.sessionId}
                onClick={() => onReviewSelect?.(review.sessionId)}
                className={cn(
                  "w-full text-left p-4 border-b border-border transition-colors hover:bg-muted",
                  selectedReviewId === review.sessionId && "bg-muted",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <GitPullRequest className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground mb-1 text-balance line-clamp-2">
                      {review.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {review.pullRequestUrl}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{review.status}</span>
                      <span>•</span>
                      <span>{review.messageCount} messages</span>
                      <span>•</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <GitPullRequest className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">리뷰 세션이 없습니다</p>
              </div>
            </div>
          )
        ) : (
          // Diff 파일 목록 표시
          filteredDiffs.length > 0 ? (
            filteredDiffs.map((diff) => {
              const fileType = getFileIcon(diff.fileExtension)
              const stats = getDiffStats(diff.diffContent)
              const isSelected = selectedFileId === diff.id
              
              return (
                <button
                  key={diff.id}
                  onClick={() => onFileSelect(diff.id)}
                  className={cn(
                    "w-full text-left p-4 border-b border-border transition-colors hover:bg-muted",
                    isSelected && "bg-muted",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <FileTypeIcon fileType={fileType} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground mb-1 text-balance truncate">
                        {diff.filePath.split('/').pop()}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {diff.filePath}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Plus className="h-3 w-3 text-green-600" />
                          {stats.added}
                        </span>
                        <span className="flex items-center gap-1">
                          <Minus className="h-3 w-3 text-red-600" />
                          {stats.removed}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <GitPullRequest className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">PR을 분석하면 파일 목록이 표시됩니다</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}