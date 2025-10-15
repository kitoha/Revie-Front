"use client"

import { DiffItem, FileType } from "../lib/types"
import { cn } from "../lib/utils"
import { 
  FileCode2, 
  FileText, 
  File, 
  Database,
  Plus,
  Minus
} from "lucide-react"

interface FileTabsProps {
  diffs: DiffItem[]
  selectedFileId: string | null
  onFileSelect: (fileId: string) => void
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
      return <FileCode2 {...iconProps} />
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
      return <FileCode2 {...iconProps} />
    case 'sql':
      return <Database {...iconProps} />
    case 'json':
    case 'yaml':
    case 'yml':
    case 'xml':
      return <FileText {...iconProps} />
    case 'html':
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode2 {...iconProps} />
    case 'md':
    case 'txt':
      return <FileText {...iconProps} />
    default:
      return <File {...iconProps} />
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

export function FileTabs({ diffs, selectedFileId, onFileSelect }: FileTabsProps) {
  if (diffs.length === 0) {
    return null
  }

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex overflow-x-auto scrollbar-hide">
        {diffs.map((diff) => {
          const fileType = getFileIcon(diff.fileExtension)
          const stats = getDiffStats(diff.diffContent)
          const isSelected = selectedFileId === diff.id
          
          return (
            <button
              key={diff.id}
              onClick={() => onFileSelect(diff.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 transition-smooth whitespace-nowrap",
                "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                isSelected 
                  ? "border-primary bg-primary/5 text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <FileTypeIcon fileType={fileType} />
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {diff.filePath.split('/').pop()}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
            </button>
          )
        })}
      </div>
    </div>
  )
}
