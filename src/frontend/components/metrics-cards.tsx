"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Clock,
  Hash,
  RefreshCw,
  DollarSign,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import type { Metrics } from "@/lib/types"
import { cn } from "@/lib/utils"

interface MetricsCardsProps {
  chatbotMetrics: Metrics | null
  reactMetrics: Metrics | null
}

interface MetricCardProps {
  title: string
  icon: React.ElementType
  chatbotValue: string | number
  reactValue: string | number
  comparison?: "lower-better" | "higher-better" | "neutral"
  suffix?: string
}

function MetricCard({
  title,
  icon: Icon,
  chatbotValue,
  reactValue,
  comparison = "neutral",
  suffix = "",
}: MetricCardProps) {
  const chatbotNum = typeof chatbotValue === "number" ? chatbotValue : parseFloat(String(chatbotValue))
  const reactNum = typeof reactValue === "number" ? reactValue : parseFloat(String(reactValue))

  let diff: number | null = null
  let diffDisplay = ""
  let isPositive = true

  if (!isNaN(chatbotNum) && !isNaN(reactNum) && chatbotNum !== 0) {
    diff = ((reactNum - chatbotNum) / chatbotNum) * 100
    const sign = diff > 0 ? "+" : ""
    diffDisplay = `${sign}${diff.toFixed(0)}%`

    if (comparison === "lower-better") {
      isPositive = diff < 0
    } else if (comparison === "higher-better") {
      isPositive = diff > 0
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Chatbot</div>
            <div className="text-lg font-semibold tabular-nums">
              {chatbotValue}{suffix}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">ReAct</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold tabular-nums">
                {reactValue}{suffix}
              </span>
              {diff !== null && comparison !== "neutral" && (
                <span className={cn(
                  "text-xs font-medium flex items-center",
                  isPositive ? "text-emerald-600" : "text-destructive"
                )}>
                  {diffDisplay}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusCard({
  chatbotSuccess,
  reactSuccess,
}: {
  chatbotSuccess: boolean | null
  reactSuccess: boolean | null
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Trạng thái
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Chatbot</div>
            <StatusValue success={chatbotSuccess} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">ReAct</div>
            <StatusValue success={reactSuccess} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusValue({ success }: { success: boolean | null }) {
  if (success === null) {
    return <span className="text-sm text-muted-foreground">-</span>
  }

  return success ? (
    <div className="flex items-center gap-1.5">
      <CheckCircle2 className="size-4 text-emerald-600" />
      <span className="text-sm font-medium text-emerald-600">Thành công</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5">
      <XCircle className="size-4 text-destructive" />
      <span className="text-sm font-medium text-destructive">Thất bại</span>
    </div>
  )
}

export function MetricsCards({ chatbotMetrics, reactMetrics }: MetricsCardsProps) {
  const cb = chatbotMetrics || { latency: 0, tokenCount: 0, loopCount: 0, costEstimate: 0, success: null }
  const ra = reactMetrics || { latency: 0, tokenCount: 0, loopCount: 0, costEstimate: 0, success: null }
  const hasData = chatbotMetrics !== null || reactMetrics !== null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <MetricCard
        title="Độ trễ"
        icon={Clock}
        chatbotValue={hasData ? cb.latency : "-"}
        reactValue={hasData ? ra.latency : "-"}
        comparison="lower-better"
        suffix={hasData ? "ms" : ""}
      />
      <MetricCard
        title="Token"
        icon={Hash}
        chatbotValue={hasData ? cb.tokenCount : "-"}
        reactValue={hasData ? ra.tokenCount : "-"}
        comparison="lower-better"
      />
      <MetricCard
        title="Số vòng lặp"
        icon={RefreshCw}
        chatbotValue={hasData ? cb.loopCount : "-"}
        reactValue={hasData ? ra.loopCount : "-"}
      />
      <MetricCard
        title="Chi phí"
        icon={DollarSign}
        chatbotValue={hasData ? `$${cb.costEstimate.toFixed(4)}` : "-"}
        reactValue={hasData ? `$${ra.costEstimate.toFixed(4)}` : "-"}
        comparison="lower-better"
      />
      <StatusCard
        chatbotSuccess={hasData ? cb.success : null}
        reactSuccess={hasData ? ra.success : null}
      />
    </div>
  )
}
