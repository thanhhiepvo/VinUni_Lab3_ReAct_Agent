"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, FileJson, FileText } from "lucide-react"
import type { RunResult } from "@/lib/types"

interface ExportButtonProps {
  result: RunResult | null
}

const stepLabels = {
  thought: "Suy nghĩ",
  action: "Hành động",
  observation: "Quan sát",
}

export function ExportButton({ result }: ExportButtonProps) {
  const [open, setOpen] = useState(false)

  const exportAsJSON = () => {
    if (!result) return
    const dataStr = JSON.stringify(result, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `bao-cao-react-agent-${result.id}.json`
    link.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const exportAsMarkdown = () => {
    if (!result) return

    const md = `# Báo cáo Lab ReAct Agent
**Mã lần chạy:** ${result.id}
**Nhà cung cấp:** ${result.provider}
**Thời điểm:** ${result.timestamp.toISOString()}

## Câu hỏi
${result.query}

## Phản hồi Chatbot cơ sở
${result.chatbotResponse}

### Chỉ số Chatbot
- Độ trễ: ${result.chatbotMetrics.latency}ms
- Token: ${result.chatbotMetrics.tokenCount}
- Chi phí: $${result.chatbotMetrics.costEstimate.toFixed(4)}
- Trạng thái: ${result.chatbotMetrics.success ? "Thành công" : "Thất bại"}

## Phản hồi ReAct Agent
${result.reactResponse}

### Chỉ số Agent
- Độ trễ: ${result.reactMetrics.latency}ms
- Token: ${result.reactMetrics.tokenCount}
- Số vòng lặp: ${result.reactMetrics.loopCount}
- Chi phí: $${result.reactMetrics.costEstimate.toFixed(4)}
- Trạng thái: ${result.reactMetrics.success ? "Thành công" : "Thất bại"}

## Trace ReAct
${result.reactSteps.map((step, i) => `
### Bước ${i + 1}: ${stepLabels[step.type]}
${step.toolName ? `**Công cụ:** \`${step.toolName}\`\n` : ""}${step.content}
`).join("\n")}

## Phân tích lỗi
- Loại: ${result.failure.type}
- Chi tiết: ${result.failure.details}
${result.failure.step ? `- Bước: ${result.failure.step}` : ""}
`

    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `bao-cao-react-agent-${result.id}.md`
    link.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!result}>
          <Download className="size-4" />
          Xuất báo cáo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xuất báo cáo</DialogTitle>
          <DialogDescription>
            Chọn định dạng để tải kết quả so sánh.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={exportAsJSON}
          >
            <FileJson className="size-6 text-primary" />
            <span className="text-sm font-medium">JSON</span>
            <span className="text-xs text-muted-foreground">Dữ liệu thô</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={exportAsMarkdown}
          >
            <FileText className="size-6 text-primary" />
            <span className="text-sm font-medium">Markdown</span>
            <span className="text-xs text-muted-foreground">Dễ đưa vào báo cáo</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
