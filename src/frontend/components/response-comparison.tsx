"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Cpu, Clock, Hash } from "lucide-react"
import type { Metrics } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ResponseComparisonProps {
  chatbotResponse: string | null
  reactResponse: string | null
  chatbotMetrics: Metrics | null
  reactMetrics: Metrics | null
  isRunning: boolean
}

function MetricBadge({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3" />
      <span>{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function ResponseCard({
  title,
  icon: Icon,
  response,
  metrics,
  variant,
  isRunning,
}: {
  title: string
  icon: React.ElementType
  response: string | null
  metrics: Metrics | null
  variant: "baseline" | "agent"
  isRunning: boolean
}) {
  return (
    <Card className={cn("flex-1 min-w-0", variant === "agent" && "border-primary/30")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Icon className={cn("size-4", variant === "agent" ? "text-primary" : "text-muted-foreground")} />
            {title}
          </CardTitle>
          {variant === "agent" && (
            <Badge variant="secondary" className="text-xs">
              ReAct
            </Badge>
          )}
        </div>
        {metrics && (
          <div className="flex flex-wrap gap-3 mt-2">
            <MetricBadge icon={Clock} label="Độ trễ" value={`${metrics.latency}ms`} />
            <MetricBadge icon={Hash} label="Token" value={metrics.tokenCount} />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        <ScrollArea className="h-[280px]">
          {isRunning ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Đang xử lý...
            </div>
          ) : response ? (
            <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              {response}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Chạy một câu hỏi để xem kết quả
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function ResponseComparison({
  chatbotResponse,
  reactResponse,
  chatbotMetrics,
  reactMetrics,
  isRunning,
}: ResponseComparisonProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ResponseCard
        title="Chatbot cơ sở"
        icon={Bot}
        response={chatbotResponse}
        metrics={chatbotMetrics}
        variant="baseline"
        isRunning={isRunning}
      />
      <ResponseCard
        title="ReAct Agent"
        icon={Cpu}
        response={reactResponse}
        metrics={reactMetrics}
        variant="agent"
        isRunning={isRunning}
      />
    </div>
  )
}
