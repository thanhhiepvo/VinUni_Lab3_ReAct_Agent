"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Wrench, CircleCheck, CircleX, CircleDashed } from "lucide-react"
import type { Tool } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ToolInventoryProps {
  tools: Tool[]
}

const statusConfig = {
  ready: {
    icon: CircleCheck,
    label: "Sẵn sàng",
    className: "text-emerald-600 bg-emerald-50",
  },
  error: {
    icon: CircleX,
    label: "Lỗi",
    className: "text-destructive bg-destructive/10",
  },
  disabled: {
    icon: CircleDashed,
    label: "Tắt",
    className: "text-muted-foreground bg-muted",
  },
}

export function ToolInventory({ tools }: ToolInventoryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wrench className="size-4 text-primary" />
          Danh sách công cụ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs h-8">Công cụ</TableHead>
              <TableHead className="text-xs h-8">Mô tả</TableHead>
              <TableHead className="text-xs h-8 text-right">Lượt gọi</TableHead>
              <TableHead className="text-xs h-8 text-right">Độ trễ TB</TableHead>
              <TableHead className="text-xs h-8 text-center">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((tool) => {
              const status = statusConfig[tool.status]
              const StatusIcon = status.icon
              return (
                <TableRow key={tool.name} className="hover:bg-muted/50">
                  <TableCell className="py-2">
                    <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">
                      {tool.name}
                    </code>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">
                    {tool.description}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-right font-medium">
                    {tool.calls}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-right text-muted-foreground">
                    {tool.avgLatency}ms
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex justify-center">
                      <Badge
                        variant="secondary"
                        className={cn("text-xs gap-1", status.className)}
                      >
                        <StatusIcon className="size-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
