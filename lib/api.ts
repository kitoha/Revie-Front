import { ReviewSession, DiffResponse, ReviewListDto, FetchPRResponse, ChatHistoryResponse, Message, CompressionStats, DiffCountResponse } from './types'

const BASE_URL = 'http://localhost:8080/api'
const USER_ID = 'user-123'

// API 에러 클래스
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// 공통 fetch 래퍼
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-User-Id': USER_ID,
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new ApiError(response.status, errorText || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(0, error instanceof Error ? error.message : 'Unknown error')
  }
}

export async function createReviewSession(pullRequestUrl: string): Promise<ReviewSession> {
  return apiRequest<ReviewSession>('/reviews', {
    method: 'POST',
    body: JSON.stringify({ 
      userId: USER_ID,
      pullRequestUrl 
    }),
  })
}

export async function fetchPRData(sessionId: string): Promise<FetchPRResponse> {
  return apiRequest<FetchPRResponse>(`/reviews/${sessionId}/fetch-pr`, {
    method: 'POST',
  })
}

export async function importPRDiff(sessionId: string, pullRequestUrl: string): Promise<void> {
  const params = new URLSearchParams({
    sessionId,
    pullRequestUrl,
  })
  
  await apiRequest<void>(`/github/pr/import?${params}`, {
    method: 'POST',
  })
}


export async function getDiffs(sessionId: string): Promise<DiffItem[]> {
  const response = await apiRequest<any>(`/diffs/${sessionId}`)
  
  if (response && response.success && Array.isArray(response.data)) {
    return response.data
  }
  
  if (Array.isArray(response)) {
    return response
  }
  
  console.warn('Unexpected response format:', response)
  return []
}


export async function getFileDiff(sessionId: string, filePath: string): Promise<DiffItem> {
  const params = new URLSearchParams({ filePath })
  return apiRequest<DiffItem>(`/diffs/${sessionId}/files?${params}`)
}

export async function getDiffCount(sessionId: string): Promise<DiffCountResponse> {
  return apiRequest<DiffCountResponse>(`/diffs/${sessionId}/count`)
}

export function generateEmbeddings(
  sessionId: string, 
  onProgress: (file: string) => void, 
  onComplete: () => void
): EventSource {
  const eventSource = new EventSource(`${BASE_URL}/reviews/${sessionId}/generate-embeddings`, {
    withCredentials: false
  })

  eventSource.onmessage = (event) => {
    const data = event.data
    if (data.startsWith('✓ ')) {
      const fileName = data.substring(2)
      onProgress(fileName)
    } else if (data.startsWith('Completed: ')) {
      onComplete()
      eventSource.close()
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE error:', error)
    eventSource.close()
  }

  return eventSource
}

export function sendChatMessage(
  sessionId: string,
  message: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void
): EventSource {
  const eventSource = new EventSource(`${BASE_URL}/chat/${sessionId}/stream`, {
    withCredentials: false
  })

  fetch(`${BASE_URL}/chat/${sessionId}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': USER_ID,
    },
    body: JSON.stringify({ message })
  }).catch(error => {
    console.error('Failed to send message:', error)
    eventSource.close()
  })

  eventSource.onmessage = (event) => {
    const data = event.data
    if (data === '[DONE]') {
      onComplete()
      eventSource.close()
    } else {
      onChunk(data)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE error:', error)
    eventSource.close()
  }

  return eventSource
}

export async function getChatHistory(sessionId: string): Promise<ChatHistoryResponse> {
  return apiRequest<ChatHistoryResponse>(`/chat/${sessionId}/history`)
}

export async function getReviewList(): Promise<ReviewListDto[]> {
  return apiRequest<ReviewListDto[]>('/reviews')
}

export async function getCompressionStats(sessionId: string): Promise<CompressionStats> {
  return apiRequest<CompressionStats>(`/reviews/${sessionId}/compression-stats`)
}

export async function deleteChatHistory(sessionId: string): Promise<void> {
  return apiRequest<void>(`/chat/${sessionId}/history`, {
    method: 'DELETE',
  })
}

export async function analyzePullRequest(pullRequestUrl: string): Promise<{
  session: ReviewSession
  diffs: DiffItem[]
}> {
  try {
    
    const session = await createReviewSession(pullRequestUrl)
    
    await importPRDiff(session.id, pullRequestUrl)
    
    const diffs = await getDiffs(session.id)
    
    return { session, diffs }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Failed to analyze pull request')
  }
}
