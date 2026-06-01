"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Play, Sparkles } from "lucide-react"
import type { Provider } from "@/lib/types"

interface ControlPanelProps {
  onRun: (query: string, provider: Provider) => void
  isRunning: boolean
}

const providers: { value: Provider; label: string }[] = [
  { value: "openai", label: "OpenAI GPT-4" },
  { value: "gemini", label: "Google Gemini" },
  { value: "local", label: "Mô hình cục bộ" },
  { value: "dummy", label: "Dummy mô phỏng" },
]

const exampleQueries = [
  "Sáng mai tôi thi cuối kỳ môn Giải tích, hãy giúp tôi ôn tập cấp tốc",
  "Tóm tắt các chủ đề quan trọng của Giải tích và cho bài tập mẫu",
  "Lập kế hoạch 3 giờ ôn tập đạo hàm, tích phân và giới hạn",
]

export function ControlPanel({ onRun, isRunning }: ControlPanelProps) {
  const [query, setQuery] = useState("")
  const [provider, setProvider] = useState<Provider>("openai")

  const handleRun = () => {
    if (query.trim()) {
      onRun(query, provider)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          Bảng điều khiển
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Nhà cung cấp
          </label>
          <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn nhà cung cấp" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {providers.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Câu hỏi
          </label>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập câu hỏi ôn thi cấp tốc..."
            className="min-h-[120px] resize-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Ví dụ
          </label>
          <div className="flex flex-col gap-1.5">
            {exampleQueries.map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="text-left text-xs text-muted-foreground hover:text-foreground p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleRun}
          disabled={!query.trim() || isRunning}
          className="w-full mt-2"
        >
          {isRunning ? (
            <>
              <Spinner className="text-primary-foreground" />
              Đang chạy...
            </>
          ) : (
            <>
              <Play className="size-4" />
              Chạy so sánh
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
