
export interface ReviewSession {
  id: string  
  userId: string
  pullRequestUrl: string
  title: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface DiffItem {
  id: string
  sessionId: string
  filePath: string
  fileName: string
  fileExtension: string
  directoryPath: string
  diffContent: string
  contentHash: string
  embedding?: number[] | null
  createdAt: string
  updatedAt: string
}

export interface DiffResponse {
  sessionId: string
  totalFiles: number
  diffs: DiffItem[]
}

export interface DiffCountResponse {
  sessionId: string
  totalCount: number
}

export interface Message {
  role: 'USER' | 'ASSISTANT'
  content: string
  timestamp: string
}

export interface ChatHistoryResponse {
  sessionId: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface FetchPRResponse {
  sessionId: string
  filesChanged: number
  totalAdditions: number
  totalDeletions: number
  files: string[]
}

export interface CompressionStats {
  fileCount: number
  totalOriginalSize: number
  totalCompressedSize: number
  compressionRatio: number
  savedBytes: number
  compressionPercentage: number
}

export interface ReviewListDto {
  sessionId: string
  title: string
  pullRequestUrl: string
  status: string
  messageCount: number
  lastMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface ReviewState {
  sessionId: string | null
  pullRequestUrl: string
  diffs: DiffItem[]
  selectedFileId: string | null
  isLoading: boolean
  error: string | null
}

export type FileType = 'js' | 'ts' | 'tsx' | 'jsx' | 'py' | 'java' | 'go' | 'rs' | 'php' | 'rb' | 'cpp' | 'c' | 'cs' | 'swift' | 'kt' | 'scala' | 'sh' | 'sql' | 'json' | 'yaml' | 'yml' | 'xml' | 'html' | 'css' | 'scss' | 'sass' | 'less' | 'md' | 'txt' | 'other'
