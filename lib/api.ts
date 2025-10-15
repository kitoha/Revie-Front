import { ReviewSession, DiffResponse, ReviewListDto } from './types'

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
    
    // 네트워크 에러 등
    throw new ApiError(0, error instanceof Error ? error.message : 'Unknown error')
  }
}

// 1. 리뷰 세션 생성
export async function createReviewSession(pullRequestUrl: string): Promise<ReviewSession> {
  return apiRequest<ReviewSession>('/reviews', {
    method: 'POST',
    body: JSON.stringify({ pullRequestUrl }),
  })
}

// 2. PR Diff 가져오기
export async function importPRDiff(sessionId: string, pullRequestUrl: string): Promise<void> {
  const params = new URLSearchParams({
    sessionId,
    pullRequestUrl,
  })
  
  await apiRequest<void>(`/github/pr/import?${params}`, {
    method: 'POST',
  })
}

// 3. Diff 목록 조회
export async function getDiffs(sessionId: string): Promise<DiffResponse> {
  return apiRequest<DiffResponse>(`/diffs/${sessionId}`)
}

// 4. 리뷰 목록 조회
export async function getReviewList(): Promise<ReviewListDto[]> {
  return apiRequest<ReviewListDto[]>('/reviews')
}

// 전체 PR 분석 플로우 (세션 생성 → Diff 가져오기 → Diff 목록 조회)
export async function analyzePullRequest(pullRequestUrl: string): Promise<{
  session: ReviewSession
  diffs: DiffResponse
}> {
  try {
    // 1. 세션 생성
    const session = await createReviewSession(pullRequestUrl)
    
    // 2. PR Diff 가져오기
    await importPRDiff(session.id, pullRequestUrl)
    
    // 3. Diff 목록 조회
    const diffs = await getDiffs(session.id)
    
    return { session, diffs }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Failed to analyze pull request')
  }
}
