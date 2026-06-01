import type { Tool, RunResult, ReActStep, Metrics, FailureAnalysis } from "./types"

export const mockTools: Tool[] = [
  {
    name: "summarize",
    description: "Tóm tắt nội dung cốt lõi của một chủ đề.",
    calls: 12,
    avgLatency: 340,
    status: "ready",
  },
  {
    name: "list_topics",
    description: "Liệt kê các chủ đề con cần ôn tập.",
    calls: 8,
    avgLatency: 210,
    status: "ready",
  },
  {
    name: "sample_practice",
    description: "Trả về bài tập mẫu để luyện nhanh.",
    calls: 15,
    avgLatency: 520,
    status: "ready",
  },
]

export const mockReActSteps: ReActStep[] = [
  {
    id: "1",
    type: "thought",
    content:
      "Người học cần ôn thi Giải tích gấp. Trước hết cần xác định các mảng kiến thức chính để tránh học lan man.",
    timestamp: Date.now() - 4500,
  },
  {
    id: "2",
    type: "action",
    content: "list_topics",
    toolName: "list_topics",
    toolInput: JSON.stringify({ subject: "calculus" }),
    timestamp: Date.now() - 4200,
    duration: 210,
  },
  {
    id: "3",
    type: "observation",
    content: "Các chủ đề tìm thấy: limits, derivatives, integrals.",
    timestamp: Date.now() - 3990,
  },
  {
    id: "4",
    type: "thought",
    content:
      "Đã có danh sách chủ đề. Tiếp theo nên lấy tóm tắt ngắn cho calculus để người học có khung ôn tập.",
    timestamp: Date.now() - 3800,
  },
  {
    id: "5",
    type: "action",
    content: "summarize",
    toolName: "summarize",
    toolInput: JSON.stringify({ topic: "calculus" }),
    timestamp: Date.now() - 3600,
    duration: 340,
  },
  {
    id: "6",
    type: "observation",
    content:
      "Giải tích gồm giới hạn, đạo hàm, tích phân cơ bản và định lý nền tảng. Công thức trọng tâm: d/dx x^n = n x^(n-1).",
    timestamp: Date.now() - 3260,
  },
  {
    id: "7",
    type: "thought",
    content:
      "Để chuyển từ đọc lý thuyết sang ghi nhớ chủ động, cần lấy một bài tập mẫu ngắn.",
    timestamp: Date.now() - 3100,
  },
  {
    id: "8",
    type: "action",
    content: "sample_practice",
    toolName: "sample_practice",
    toolInput: JSON.stringify({ topic: "calculus", n: 1 }),
    timestamp: Date.now() - 2900,
    duration: 520,
  },
  {
    id: "9",
    type: "observation",
    content: "Bài tập mẫu: Tính giới hạn của sin(x)/x khi x tiến về 0. Đáp án: 1.",
    timestamp: Date.now() - 2380,
  },
]

export const mockChatbotMetrics: Metrics = {
  latency: 1240,
  tokenCount: 892,
  loopCount: 1,
  costEstimate: 0.0018,
  success: true,
}

export const mockReactMetrics: Metrics = {
  latency: 3420,
  tokenCount: 2156,
  loopCount: 4,
  costEstimate: 0.0043,
  success: true,
}

export const mockFailure: FailureAnalysis = {
  type: "none",
  details: "Quá trình chạy hoàn tất, không phát hiện lỗi.",
}

export const mockChatbotResponse = `Bạn nên ôn Giải tích theo ba phần chính: giới hạn, đạo hàm và tích phân.

1. Giới hạn: học các giới hạn cơ bản và quy tắc biến đổi.
2. Đạo hàm: nhớ quy tắc lũy thừa, tích, thương và dây chuyền.
3. Tích phân: ôn nguyên hàm cơ bản và tích phân xác định.

Hãy dành nhiều thời gian làm bài tập vì chỉ đọc công thức sẽ khó nhớ lâu.`

export const mockReactResponse = `Dựa trên các công cụ của agent, kế hoạch ôn cấp tốc nên đi theo thứ tự sau:

1. Xác định phạm vi: tập trung vào limits, derivatives và integrals.
2. Nắm công thức lõi: d/dx x^n = n x^(n-1), tích phân của x^n = x^(n+1)/(n+1) + C.
3. Luyện chủ động:
   - Tính giới hạn sin(x)/x khi x tiến về 0.
   - Đạo hàm x^3.
   - Tính tích phân của 2x.

Ưu tiên 30 phút đọc công thức, 90 phút làm bài cơ bản, 45 phút chữa lỗi sai và 15 phút tổng kết lại các dạng hay gặp.`

export const mockRunResult: RunResult = {
  id: "run-001",
  provider: "openai",
  query: "Sáng mai tôi thi cuối kỳ môn Giải tích, hãy giúp tôi ôn tập cấp tốc",
  chatbotResponse: mockChatbotResponse,
  reactResponse: mockReactResponse,
  reactSteps: mockReActSteps,
  chatbotMetrics: mockChatbotMetrics,
  reactMetrics: mockReactMetrics,
  failure: mockFailure,
  timestamp: new Date(),
}

export const mockFailureScenarios: FailureAnalysis[] = [
  {
    type: "hallucinated_tool",
    details: "Agent cố gọi generate_flashcards nhưng công cụ này không có trong danh sách.",
    step: 3,
  },
  {
    type: "parser_error",
    details: "Không phân tích được Action vì model trả về chuỗi sai định dạng.",
    step: 5,
  },
  {
    type: "max_steps",
    details: "Agent đạt giới hạn số vòng lặp mà chưa tạo Final Answer.",
    step: 10,
  },
]
