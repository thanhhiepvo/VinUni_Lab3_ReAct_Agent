"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lightbulb, Wrench, Eye, ChevronRight } from "lucide-react"
import type { ReActStep } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ReActTraceProps {
  steps: ReActStep[]
  isRunning: boolean
}

const stepConfig = {
  thought: {
    icon: Lightbulb,
    label: "Suy nghĩ",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  action: {
    icon: Wrench,
    label: "Hành động",
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
  },
  observation: {
    icon: Eye,
    label: "Quan sát",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
}

function StepCard({ step, index }: { step: ReActStep; index: number }) {
  const config = stepConfig[step.type]
  const Icon = config.icon

  return (
    <div className={cn("relative p-3 rounded-lg border", config.bgColor, config.borderColor)}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex items-center justify-center size-6 rounded-full shrink-0 bg-white border",
          config.color,
          config.borderColor
        )}>
          <Icon className="size-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className={cn("text-xs font-medium", config.color)}>
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Bước {index + 1}
            </span>
            {step.duration && (
              <span className="text-xs text-muted-foreground ml-auto">
                {step.duration}ms
              </span>
            )}
          </div>

          {step.type === "action" && step.toolName && (
            <div className="mb-1.5">
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono">
                {step.toolName}()
              </code>
              {step.toolInput && (
                <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto">
                  {step.toolInput}
                </pre>
              )}
            </div>
          )}

          <p className="text-sm text-foreground/90 leading-relaxed">
            {step.content}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ReActTrace({ steps, isRunning }: ReActTraceProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ChevronRight className="size-4 text-primary" />
            Trace ReAct
          </CardTitle>
          {steps.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {steps.length} bước
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-2">
          {isRunning ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Đang thực thi vòng lặp agent...
            </div>
          ) : steps.length > 0 ? (
            <div className="flex flex-col gap-3">
              {steps.map((step, i) => (
                <div key={step.id}>
                  <StepCard step={step} index={i} />
                  {i < steps.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="w-px h-3 bg-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Chạy một câu hỏi để xem trace của agent
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
