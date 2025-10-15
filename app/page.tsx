"use client"

import { useState, useCallback, useEffect } from "react"
import React from "react"
import { TopNavigation } from "../components/top-navigation"
import { CodeViewer } from "../components/code-viewer"
import { ChatPanel } from "../components/chat-panel"
import { MessageInput } from "../components/message-input"
import { Button } from "../components/ui/button"
import { Code, MessageSquare, AlertCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { analyzePullRequest, getReviewList, getDiffs, ApiError } from "../lib/api"
import { DiffItem, ReviewSession, ReviewListDto } from "../lib/types"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"code" | "chat">("code")
  
  // PR 분석 상태
  const [session, setSession] = useState<ReviewSession | null>(null)
  const [diffs, setDiffs] = useState<DiffItem[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 리뷰 목록 상태
  const [reviewList, setReviewList] = useState<ReviewListDto[]>([])
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)

  // PR 분석 시작
  const handleAnalyzePR = useCallback(async (pullRequestUrl: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { session: newSession, diffs: newDiffs } = await analyzePullRequest(pullRequestUrl)
      
      setSession(newSession)
      setDiffs(newDiffs.data)
      
      // 첫 번째 파일 자동 선택
      if (newDiffs.data.length > 0) {
        setSelectedFileId(newDiffs.data[0].id)
      }
      
      // 리뷰 목록 새로고침
      loadReviewList()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`API 오류 (${err.status}): ${err.message}`)
      } else {
        setError('PR 분석 중 오류가 발생했습니다.')
      }
      console.error('PR 분석 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 파일 선택
  const handleFileSelect = useCallback((fileId: string) => {
    setSelectedFileId(fileId)
  }, [])

  // 리뷰 선택
  const handleReviewSelect = useCallback(async (sessionId: string) => {
    setSelectedReviewId(sessionId)
    setIsLoading(true)
    setError(null)
    
    try {
      const diffsResponse = await getDiffs(sessionId)
      setDiffs(diffsResponse.data)
      
      // 첫 번째 파일 자동 선택
      if (diffsResponse.data.length > 0) {
        setSelectedFileId(diffsResponse.data[0].id)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`API 오류 (${err.status}): ${err.message}`)
      } else {
        setError('Diff 가져오기 중 오류가 발생했습니다.')
      }
      console.error('Diff 가져오기 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 리뷰 목록 로드
  const loadReviewList = useCallback(async () => {
    try {
      const reviews = await getReviewList()
      setReviewList(reviews)
    } catch (err) {
      console.error('리뷰 목록 로드 오류:', err)
    }
  }, [])

  // 컴포넌트 마운트 시 리뷰 목록 로드
  useEffect(() => {
    loadReviewList()
  }, [loadReviewList])

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <TopNavigation 
        onAnalyzePR={handleAnalyzePR} 
        isLoading={isLoading}
        diffs={diffs}
        selectedFileId={selectedFileId}
        onFileSelect={handleFileSelect}
        reviewList={reviewList}
        selectedReviewId={selectedReviewId}
        onReviewSelect={handleReviewSelect}
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto text-destructive hover:bg-destructive/20"
          >
            ×
          </Button>
        </div>
      )}

      {/* 모바일 탭 네비게이션 */}
      <div className="lg:hidden border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex">
          <Button
            variant={activeTab === "code" ? "default" : "ghost"}
            className={cn(
              "flex-1 rounded-none border-0 h-12 gap-2",
              activeTab === "code" ? "gradient-primary text-primary-foreground" : "hover:bg-accent/50"
            )}
            onClick={() => setActiveTab("code")}
          >
            <Code className="h-4 w-4" />
            Code
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            className={cn(
              "flex-1 rounded-none border-0 h-12 gap-2",
              activeTab === "chat" ? "gradient-primary text-primary-foreground" : "hover:bg-accent/50"
            )}
            onClick={() => setActiveTab("chat")}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
        </div>
      </div>

      {/* 모바일에서는 탭 전환, 데스크톱에서는 가로 분할 */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className={cn(
          "flex-1 flex flex-col",
          activeTab === "code" ? "flex" : "hidden",
          "lg:flex"
        )}>
          <CodeViewer 
            diffs={diffs}
            selectedFileId={selectedFileId}
            onFileSelect={handleFileSelect}
            sessionTitle={session?.title}
          />
        </div>
        <div className={cn(
          "flex-1 flex flex-col",
          activeTab === "chat" ? "flex" : "hidden",
          "lg:flex"
        )}>
          <ChatPanel />
        </div>
      </div>

      <MessageInput />
    </div>
  )
}
