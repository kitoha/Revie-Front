"use client"

import { useState, useCallback, useEffect } from "react"
import React from "react"
import { TopNavigation } from "../components/top-navigation"
import { CodeViewer } from "../components/code-viewer"
import { ChatPanel } from "../components/chat-panel"
import { MessageInput } from "../components/message-input"
import { EmbeddingProgress } from "../components/embedding-progress"
import { Button } from "../components/ui/button"
import { Code, MessageSquare, AlertCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { analyzePullRequest, getReviewList, getDiffsStream, getDiffs, generateEmbeddings, sendChatMessage, getChatHistory, ApiError } from "../lib/api"
import { DiffItem, ReviewSession, ReviewListDto, Message } from "../lib/types"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"code" | "chat">("code")
  
  const [session, setSession] = useState<ReviewSession | null>(null)
  const [diffs, setDiffs] = useState<DiffItem[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [reviewList, setReviewList] = useState<ReviewListDto[]>([])
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  
  const [isLoadingDiffs, setIsLoadingDiffs] = useState(false)
  const [diffStreamEventSource, setDiffStreamEventSource] = useState<EventSource | null>(null)
  
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false)
  const [embeddingProgress, setEmbeddingProgress] = useState<{ total: number, completed: string[] }>({ total: 0, completed: [] })
  const [showEmbeddingProgress, setShowEmbeddingProgress] = useState(false)

  const handleAnalyzePR = useCallback(async (pullRequestUrl: string) => {
    setIsLoading(true)
    setIsLoadingDiffs(true)
    setError(null)
    setDiffs([])
    
    try {
      const { session: newSession, eventSource } = await analyzePullRequest(
        pullRequestUrl,
        (diff) => {
          setDiffs(prev => {
            const exists = prev.some(existingDiff => existingDiff.id === diff.id)
            if (exists) {
              return prev
            }
            
            const newDiffs = [...prev, diff]

            if (prev.length === 0 && diff) {
              setSelectedFileId(diff.id)
            }
            return newDiffs
          })
        },
        () => {
          setIsLoadingDiffs(false)
        },
        (error) => {
          console.error('Diff streaming error:', error)
          setIsLoadingDiffs(false)
          setError('Diff 로딩 중 오류가 발생했습니다.')
        }
      )
      
      setSession(newSession)
      setCurrentSessionId(newSession.id)
      setDiffStreamEventSource(eventSource)
      
      //임베딩 생성 (현재 비활성화)
      // setIsGeneratingEmbeddings(true)
      // setShowEmbeddingProgress(true)
      // setEmbeddingProgress({ total: newDiffs.length, completed: [] })
      
      // const fileNames = newDiffs.map(diff => diff.filePath)
      
      // const eventSource = generateEmbeddings(
      //   newSession.id,
      //   (fileName) => {
      //     setEmbeddingProgress(prev => ({
      //       ...prev,
      //       completed: [...prev.completed, fileName]
      //     }))
      //   },
      //   () => {
      //     setIsGeneratingEmbeddings(false)
      //     setShowEmbeddingProgress(false)
      //     setActiveTab("chat") // 채팅 탭으로 자동 전환
      //   }
      // )
      
      loadReviewList()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`API 오류 (${err.status}): ${err.message}`)
      } else {
        setError('PR 분석 중 오류가 발생했습니다.')
      }
      console.error('PR 분석 오류:', err)
      setIsLoadingDiffs(false)
      // setIsGeneratingEmbeddings(false)
      // setShowEmbeddingProgress(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFileSelect = useCallback((fileId: string) => {
    setSelectedFileId(fileId)
  }, [])

  const handleReviewSelect = useCallback(async (sessionId: string) => {
    setSelectedReviewId(sessionId)
    setCurrentSessionId(sessionId)
    setIsLoading(true)
    setIsLoadingDiffs(true)
    setError(null)
    setDiffs([])
    
    try {
      const diffs = await getDiffs(sessionId)
      
      const uniqueDiffs = diffs.filter((diff, index, self) => 
        index === self.findIndex(d => d.id === diff.id)
      )
      setDiffs(uniqueDiffs)
      if (uniqueDiffs.length > 0) {
        setSelectedFileId(uniqueDiffs[0].id)
      }
      setIsLoadingDiffs(false)
      setDiffStreamEventSource(null)
      
      const chatHistory = await getChatHistory(sessionId)
      const messages = Array.isArray((chatHistory as any).data?.messages) ? (chatHistory as any).data.messages : []
      setMessages(messages)
    } catch (err) {
      console.error('리뷰 로드 오류:', err)
      setIsLoadingDiffs(false)
      
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_CONNECTION_REFUSED')) {
        setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
      } else if (err instanceof ApiError) {
        setError(`API 오류 (${err.status}): ${err.message}`)
      } else {
        setError('리뷰 로드 중 오류가 발생했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadReviewList = useCallback(async () => {
    try {
      const reviews = await getReviewList()
      setReviewList(reviews)
    } catch (err) {
      console.error('리뷰 목록 로드 오류:', err)
    }
  }, [])

  const handleSendMessage = useCallback(async (message: string) => {
    if (!currentSessionId) return
    
    const userMessage: Message = {
      role: 'USER',
      content: message,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => {
      const currentMessages = Array.isArray(prev) ? prev : []
      return [...currentMessages, userMessage]
    })
    setIsStreaming(true)
    
    const assistantMessage: Message = {
      role: 'ASSISTANT',
      content: '',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => {
      const currentMessages = Array.isArray(prev) ? prev : []
      return [...currentMessages, assistantMessage]
    })
    
    try {
      const eventSource = sendChatMessage(
        currentSessionId,
        message,
        (chunk) => {
          setMessages(prev => {
            const currentMessages = Array.isArray(prev) ? prev : []
            const newMessages = [...currentMessages]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage && lastMessage.role === 'ASSISTANT') {
              newMessages[newMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + chunk
              }
            }
            return newMessages
          })
        },
        () => {
          setIsStreaming(false)
        }
      )
    } catch (err) {
      console.error('메시지 전송 오류:', err)
      setIsStreaming(false)
    }
  }, [currentSessionId])

  useEffect(() => {
    loadReviewList()
  }, [loadReviewList])

  useEffect(() => {
    return () => {
      if (diffStreamEventSource) {
        diffStreamEventSource.close()
      }
    }
  }, [diffStreamEventSource])

  useEffect(() => {
    return () => {
      if (diffStreamEventSource) {
        diffStreamEventSource.close()
      }
    }
  }, [])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* 상단 네비게이션 */}
      <div className="sticky top-0 z-50">
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
          <div className="mx-4 mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 shadow-soft">
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
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="w-full px-2 py-2">
        <div className="flex flex-col lg:flex-row gap-2 h-[calc(100vh-140px)]">
          {/* 코드 리뷰 영역 - 50% 고정 */}
          <div className={cn(
            "flex flex-col",
            activeTab === "code" ? "flex" : "hidden",
            "lg:flex lg:w-1/2",
            "lg:h-full h-[50%]"
          )}>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/50 shadow-soft overflow-hidden h-full">
              <CodeViewer 
                diffs={diffs}
                selectedFileId={selectedFileId}
                onFileSelect={handleFileSelect}
                sessionTitle={session?.title}
                isLoadingDiffs={isLoadingDiffs}
              />
            </div>
          </div>

          {/* 채팅 영역 - 50% 고정 */}
          <div className={cn(
            "flex flex-col",
            activeTab === "chat" ? "flex" : "hidden",
            "lg:flex lg:w-1/2",
            "lg:h-full h-[50%]"
          )}>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/50 shadow-soft overflow-hidden h-full">
              <ChatPanel 
                sessionId={currentSessionId}
                messages={messages}
                isStreaming={isStreaming}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 메시지 입력 영역 */}
      <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border/50">
        <div className="w-full px-2 py-2">
          <div className="bg-card/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/50 shadow-soft p-3 sm:p-4">
            <MessageInput 
              sessionId={currentSessionId}
              onSendMessage={handleSendMessage}
              disabled={isStreaming}
            />
          </div>
        </div>
      </div>

      {/* 임베딩 진행상황 모달 (현재 비활성화) */}
      {/* <EmbeddingProgress
        isOpen={showEmbeddingProgress}
        files={embeddingProgress.completed}
        completedFiles={embeddingProgress.completed}
        onClose={() => setShowEmbeddingProgress(false)}
      /> */}
    </div>
  )
}
