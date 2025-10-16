import { ReviewSession, DiffResponse, ReviewListDto, FetchPRResponse, ChatHistoryResponse, Message, CompressionStats, DiffCountResponse, DiffItem } from './types'

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


export function getDiffsStream(
  sessionId: string,
  onDiff: (diff: DiffItem) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): EventSource {
  const eventSource = new EventSource(`${BASE_URL}/diffs/${sessionId}/content/stream`, {
    withCredentials: false
  })

  // 연결 성공 시 로그
  eventSource.onopen = () => {
    console.log('SSE connection established successfully')
  }

  eventSource.onmessage = (event) => {
    try {
      const diff = JSON.parse(event.data)
      onDiff(diff)
    } catch (error) {
      console.error('Failed to parse diff:', error)
      onError(error as Error)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE error:', error)
    console.error('EventSource readyState:', eventSource.readyState)
    console.error('EventSource URL:', eventSource.url)
    
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log('SSE connection was closed by server')
      onError(new Error('실시간 스트리밍 연결이 서버에 의해 종료되었습니다'))
    } else if (eventSource.readyState === EventSource.CONNECTING) {
      console.log('SSE connection failed to establish - server may be down')
      onError(new Error('실시간 스트리밍 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.'))
    } else {
      console.log('SSE connection error - unknown state')
      onError(new Error('실시간 스트리밍 중 알 수 없는 오류가 발생했습니다'))
    }
    
    eventSource.close()
  }

  eventSource.addEventListener('complete', () => {
    console.log('SSE stream completed successfully')
    onComplete()
    eventSource.close()
  })

  return eventSource
}

export async function getDiffs(sessionId: string): Promise<DiffItem[]> {
  try {
    const response = await fetch(`${BASE_URL}/diffs/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new ApiError(response.status, `API 오류 (${response.status}): ${await response.text()}`)
    }

    const result = await response.json()
    
    if (Array.isArray(result)) {
      return result
    } else if (result.success && Array.isArray(result.data)) {
      return result.data
    } else {
      console.warn('Unexpected response format:', result)
      return []
    }
  } catch (error) {
    console.error('Failed to fetch diffs:', error)
    throw error
  }
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

export async function analyzePullRequest(
  pullRequestUrl: string,
  onDiff: (diff: DiffItem) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<{
  session: ReviewSession
  eventSource: EventSource | null
}> {
  try {
    const session = await createReviewSession(pullRequestUrl)
    
    await importPRDiff(session.id, pullRequestUrl)
    
    try {
      const eventSource = getDiffsStream(
        session.id,
        onDiff,
        onComplete,
        (streamError) => {
          console.warn('SSE stream failed, falling back to REST API:', streamError)
          getDiffs(session.id)
            .then(diffs => {
              const uniqueDiffs = diffs.filter((diff, index, self) => 
                index === self.findIndex(d => d.id === diff.id)
              )
              uniqueDiffs.forEach(onDiff)
              onComplete()
            })
            .catch(restError => {
              console.error('REST API fallback also failed:', restError)
              onError(restError)
            })
        }
      )
      
      return { session, eventSource }
    } catch (streamError) {
      console.warn('SSE stream setup failed, using REST API:', streamError)
      const diffs = await getDiffs(session.id)
      const uniqueDiffs = diffs.filter((diff, index, self) => 
        index === self.findIndex(d => d.id === diff.id)
      )
      uniqueDiffs.forEach(onDiff)
      onComplete()
      
      return { session, eventSource: null }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Failed to analyze pull request')
  }
}
