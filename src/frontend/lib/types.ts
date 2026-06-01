export type Provider = "openai" | "gemini" | "local" | "dummy"

export interface Tool {
  name: string
  description: string
  calls: number
  avgLatency: number
  status: "ready" | "error" | "disabled"
}

export interface ReActStep {
  id: string
  type: "thought" | "action" | "observation"
  content: string
  timestamp: number
  toolName?: string
  toolInput?: string
  duration?: number
}

export interface Metrics {
  latency: number
  tokenCount: number
  loopCount: number
  costEstimate: number
  success: boolean
}

export interface FailureAnalysis {
  type: "hallucinated_tool" | "parser_error" | "max_steps" | "timeout" | "none"
  details: string
  step?: number
}

export interface RunResult {
  id: string
  provider: Provider
  query: string
  chatbotResponse: string
  reactResponse: string
  reactSteps: ReActStep[]
  chatbotMetrics: Metrics
  reactMetrics: Metrics
  failure: FailureAnalysis
  timestamp: Date
}
