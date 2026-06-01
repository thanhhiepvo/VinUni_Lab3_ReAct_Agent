"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CircleHelp, Code2, Timer, CheckCircle2 } from "lucide-react"
import type { FailureAnalysis } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FailureAnalysisPanelProps {
  failure: FailureAnalysis | null
}

const failureConfig = {
  none: {
    icon: CheckCircle2,
    label: "Không có lỗi",
    description: "Quá trình chạy hoàn tất thành công.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  hallucinated_tool: {
    icon: CircleHelp,
    label: "Ảo giác công cụ",
    description: "Agent cố gọi một công cụ không tồn tại.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  parser_error: {
    icon: Code2,
    label: "Lỗi parser",
    description: "Không đọc được hành động hoặc quan sát.",
    color: "text-destructive",
    bgColor: "bg-destructive/5",
    borderColor: "border-destructive/20",
  },
  max_steps: {
    icon: Timer,
    label: "Vượt số bước",
    description: "Agent vượt quá giới hạn lặp tối đa.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  timeout: {
    icon: Timer,
    label: "Quá thời gian",
    description: "Quá trình chạy vượt giới hạn thời gian.",
    color: "text-destructive",
    bgColor: "bg-destructive/5",
    borderColor: "border-destructive/20",
  },
}

export function FailureAnalysisPanel({ failure }: FailureAnalysisPanelProps) {
  const config = failure ? failureConfig[failure.type] : failureConfig.none
  const Icon = config.icon

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="size-4 text-primary" />
          Phân tích lỗi
        </CardTitle>
      </CardHeader>
      <CardContent>
        {failure ? (
          <div className={cn("p-3 rounded-lg border", config.bgColor, config.borderColor)}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex items-center justify-center size-8 rounded-full shrink-0 bg-white border",
                config.borderColor
              )}>
                <Icon className={cn("size-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-sm font-medium", config.color)}>
                    {config.label}
                  </span>
                  {failure.step && (
                    <Badge variant="outline" className="text-xs">
                      Bước {failure.step}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {failure.details || config.description}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            Chạy một câu hỏi để xem phân tích lỗi
          </div>
        )}

        <div className="mt-3 pt-3 border-t">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Các loại lỗi thường gặp
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(["hallucinated_tool", "parser_error", "max_steps"] as const).map((type) => {
              const fc = failureConfig[type]
              const FcIcon = fc.icon
              return (
                <div
                  key={type}
                  className="flex items-center gap-1.5 p-2 rounded-md bg-muted/50 text-xs"
                >
                  <FcIcon className={cn("size-3.5 shrink-0", fc.color)} />
                  <span className="text-muted-foreground truncate">{fc.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
