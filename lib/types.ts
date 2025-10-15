// API 응답 타입 정의

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
  filePath: string
  diffContent: string
  fileExtension: string
}

export interface DiffResponse {
  success: boolean
  data: DiffItem[]
}


// 리뷰 목록 타입
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

// UI 상태 타입
export interface ReviewState {
  sessionId: string | null
  pullRequestUrl: string
  diffs: DiffItem[]
  selectedFileId: string | null
  isLoading: boolean
  error: string | null
}

// 파일 확장자별 아이콘 타입
export type FileType = 'js' | 'ts' | 'tsx' | 'jsx' | 'py' | 'java' | 'go' | 'rs' | 'php' | 'rb' | 'cpp' | 'c' | 'cs' | 'swift' | 'kt' | 'scala' | 'sh' | 'sql' | 'json' | 'yaml' | 'yml' | 'xml' | 'html' | 'css' | 'scss' | 'sass' | 'less' | 'md' | 'txt' | 'other'
