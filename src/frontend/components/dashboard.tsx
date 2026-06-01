"use client"

import { useState, useCallback } from "react"
import { ControlPanel } from "@/components/control-panel"
import { ResponseComparison } from "@/components/response-comparison"
import { ReActTrace } from "@/components/react-trace"
import { ToolInventory } from "@/components/tool-inventory"
import { MetricsCards } from "@/components/metrics-cards"
import { FailureAnalysisPanel } from "@/components/failure-analysis"
import { ExportButton } from "@/components/export-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FlaskConical } from "lucide-react"
import {
  mockTools,
  mockChatbotResponse,
  mockReactResponse,
  mockChatbotMetrics,
  mockReactMetrics,
  mockReActSteps,
  mockFailure,
} from "@/lib/mock-data"
import type { Provider, RunResult, Tool } from "@/lib/types"

export function Dashboard() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [tools] = useState<Tool[]>(mockTools)

  const chatbotResponse = result?.chatbotResponse ?? null
  const reactResponse = result?.reactResponse ?? null
  const chatbotMetrics = result?.chatbotMetrics ?? null
  const reactMetrics = result?.reactMetrics ?? null
  const reactSteps = result?.reactSteps ?? []
  const failure = result?.failure ?? null

  const handleRun = useCallback(async (query: string, provider: Provider) => {
    setIsRunning(true)
    setResult(null)

    // Mô phỏng độ trễ khi gọi backend agent.
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const newResult: RunResult = {
      id: `run-${Date.now()}`,
      provider,
      query,
      chatbotResponse: mockChatbotResponse,
      reactResponse: mockReactResponse,
      reactSteps: mockReActSteps,
      chatbotMetrics: mockChatbotMetrics,
      reactMetrics: mockReactMetrics,
      failure: mockFailure,
      timestamp: new Date(),
    }

    setResult(newResult)
    setIsRunning(false)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="size-5 text-primary" />
              <span className="font-semibold text-sm">Lab ReAct Agent</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              v1.0.0
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton result={result} />
            <Separator orientation="vertical" className="h-5" />
            <Badge variant="outline" className="text-xs">
              Chatbot vs ReAct
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
          <aside className="xl:sticky xl:top-20 xl:self-start">
            <ControlPanel onRun={handleRun} isRunning={isRunning} />
          </aside>

          <div className="flex flex-col gap-6 min-w-0">
            <section>
              <MetricsCards
                chatbotMetrics={chatbotMetrics}
                reactMetrics={reactMetrics}
              />
            </section>

            <section>
              <ResponseComparison
                chatbotResponse={chatbotResponse}
                reactResponse={reactResponse}
                chatbotMetrics={chatbotMetrics}
                reactMetrics={reactMetrics}
                isRunning={isRunning}
              />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReActTrace steps={reactSteps} isRunning={isRunning} />
              <div className="flex flex-col gap-6">
                <ToolInventory tools={tools} />
                <FailureAnalysisPanel failure={failure} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
            <span>Bảng điều khiển so sánh Chatbot và ReAct Agent cho bài lab ôn thi cấp tốc</span>
            <span>Theo dõi trace, telemetry và phân tích lỗi</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
