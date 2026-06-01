# Group Report: Lab 3 - Chatbot vs ReAct Agent

- **Team Name**: ReAct Agent Lab Team
- **Team Members**: Tran Gia Huy, Vo Thanh Hiep
- **Deployment Date**: 2026-06-01

---

## 1. Executive Summary

Dự án xây dựng một prototype so sánh giữa Chatbot thông thường và ReAct Agent trong use case hỗ trợ ôn thi cấp tốc. Chatbot baseline trả lời một lần dựa trên prompt, trong khi ReAct Agent sử dụng vòng lặp `Thought -> Action -> Observation -> Final Answer` để gọi công cụ, đọc kết quả và tổng hợp câu trả lời cuối cùng.

- **Mục tiêu chính**: chứng minh agent có khả năng hành động và quan sát qua tool thay vì chỉ sinh câu trả lời trực tiếp.
- **Kết quả demo**: `DummyProvider` chạy thành công trace 3 bước; các lần chạy với model thật tạo thêm failure trace hữu ích như gọi sai topic, tự sinh Observation hoặc đạt `max_steps`.
- **Đóng góp UI**: nhóm đã tích hợp frontend dashboard trong `src/frontend` để quan sát input, provider, phản hồi Chatbot/ReAct, trace, tool inventory, telemetry và failure analysis bằng giao diện tiếng Việt.

---

## 2. System Architecture & Tooling

### 2.1 ReAct Loop Implementation

Luồng xử lý chính nằm trong `src/agent/agent.py`.

1. Người dùng nhập câu hỏi ôn thi.
2. Agent tạo system prompt mô tả format ReAct và danh sách tool được phép gọi.
3. LLM trả về `Thought` và `Action`.
4. Parser đọc `Action`, kiểm tra tool có trong whitelist không.
5. Tool được gọi qua `_execute_tool()`.
6. Kết quả tool được đưa lại vào prompt dưới dạng `Observation`.
7. Agent lặp đến khi có `Final Answer` hoặc đạt `max_steps`.

### 2.2 Tool Definitions

| Tool Name | Input Format | Use Case |
| :--- | :--- | :--- |
| `summarize` | `topic: string` | Tóm tắt kiến thức cốt lõi của một chủ đề như `calculus` hoặc `algebra`. |
| `list_topics` | `subject: string` | Liệt kê các chủ đề con cần ôn tập. |
| `sample_practice` | `topic: string, n?: int` | Trả về bài tập mẫu để người học luyện tập nhanh. |

### 2.3 LLM Providers Used

- **Primary**: OpenAIProvider (`gpt-4o`) khi có `OPENAI_API_KEY`.
- **Secondary**: GeminiProvider (`gemini-2.0-flash`) khi có `GEMINI_API_KEY`.
- **Offline/Test**: DummyProvider cho trace ổn định và LocalProvider cho model `.gguf` qua `llama-cpp-python`.

---

## 3. Telemetry & Performance Dashboard

Dự án ghi log JSON vào `logs/YYYY-MM-DD.log` bằng `src/telemetry/logger.py`. Các event chính gồm `AGENT_START`, `LLM_RESPONSE`, `THOUGHT`, `ACTION`, `OBSERVATION`, `GUARDRAIL`, `AGENT_END` và `DEMO_COMPLETE`.

Frontend dashboard trong `src/frontend` hiển thị:

- **Control panel**: nhập câu hỏi, chọn provider OpenAI/Gemini/Local/Dummy.
- **Response comparison**: so sánh Chatbot cơ sở và ReAct Agent.
- **Trace ReAct**: hiển thị từng bước suy nghĩ, hành động và quan sát.
- **Tool inventory**: danh sách `summarize`, `list_topics`, `sample_practice`.
- **Metrics cards**: độ trễ, token, số vòng lặp, chi phí ước tính, trạng thái.
- **Failure analysis**: phân loại lỗi như ảo giác công cụ, lỗi parser, vượt số bước.
- **Export report**: xuất kết quả demo dạng JSON hoặc Markdown.

Metrics demo đại diện trên dashboard:

- **Chatbot latency**: 1240ms
- **ReAct latency**: 3420ms
- **Chatbot tokens**: 892
- **ReAct tokens**: 2156
- **ReAct loop count**: 4
- **Estimated cost**: $0.0018 cho Chatbot, $0.0043 cho ReAct

---

## 4. Root Cause Analysis - Failure Traces

### Case Study 1: Topic không khớp dữ liệu

- **Input**: "Sáng mai tôi phải thi cuối kỳ môn Giải tích..."
- **Observation**: model gọi `list_topics("Giải tích")`, `summarize("Đạo hàm")` hoặc `sample_practice("Integrals")`.
- **Root Cause**: dataset trong `src/data/toy_dataset.py` chỉ có key lowercase tiếng Anh như `calculus`, `algebra`. Khi model dùng tiếng Việt hoặc tên chủ đề chi tiết, tool trả `[]` hoặc `No summary available`.
- **Fix / Mitigation**: thêm mapping alias như `giải tích -> calculus`, `đạo hàm -> calculus/derivatives`, hoặc hướng dẫn prompt bắt buộc dùng key hợp lệ.

### Case Study 2: Model tự sinh Observation

- **Observation**: một số lần chạy với model thật, LLM tự viết nhiều `Observation` trong cùng một response thay vì chỉ trả một `Action`.
- **Root Cause**: system prompt mô tả format ReAct nhưng chưa đủ nghiêm để yêu cầu "chỉ xuất đúng một Action rồi dừng".
- **Fix / Mitigation**: cải thiện prompt v2: "Never invent Observation. Output exactly one Thought and one Action, then stop."

### Case Study 3: Max steps reached

- **Observation**: log có lần `AGENT_END` với `steps: 6`, nghĩa là agent đạt giới hạn vòng lặp.
- **Root Cause**: agent tiếp tục gọi tool dù output đã chứa nội dung gần giống final answer; parser hiện chỉ lấy action cuối cùng và chưa ưu tiên kết thúc sớm khi response có cả nhiều action/final.
- **Fix / Mitigation**: parser nên ưu tiên `Final Answer`, hoặc chỉ cho phép một action mỗi lượt.

---

## 5. Ablation Studies & Experiments

### Experiment 1: Chatbot vs ReAct Agent

| Case | Chatbot Result | Agent Result | Winner |
| :--- | :--- | :--- | :--- |
| Câu hỏi đơn giản | Trả lời nhanh, ít token | Có thể gọi tool không cần thiết | Chatbot |
| Ôn thi nhiều bước | Dễ trả lời chung chung | Có trace, gọi tool và bài tập mẫu | ReAct Agent |
| Tool/data thiếu | Vẫn có thể trả lời bằng kiến thức model | Có thể trả `[]` hoặc lỗi tool | Chatbot |
| Cần debug | Khó biết vì sao trả lời như vậy | Có log Thought/Action/Observation | ReAct Agent |

### Experiment 2: UI Dashboard vs Terminal-only

| Aspect | Terminal-only | Frontend Dashboard |
| :--- | :--- | :--- |
| Quan sát trace | Phải đọc log hoặc terminal | Hiển thị từng bước rõ ràng |
| So sánh Chatbot/ReAct | Khó nhìn song song | Hai panel đối chiếu trực tiếp |
| Báo cáo | Copy thủ công | Có nút export JSON/Markdown |
| Người dùng không kỹ thuật | Khó tiếp cận | Dễ demo và thuyết trình |

---

## 6. Production Readiness Review

- **Security**: giữ whitelist tool, không cho model gọi function ngoài danh sách; sanitize input trước khi truyền vào tool.
- **Guardrails**: giới hạn `max_steps`, phát hiện tool hallucination, không cho LLM tự tạo Observation.
- **Reliability**: thêm alias/mapping tiếng Việt cho dataset, retry/backoff với provider thật, fallback sang DummyProvider khi API quota lỗi.
- **Observability**: tích hợp `PerformanceTracker` trực tiếp vào agent để log token, latency và cost thật.
- **Frontend**: dashboard đã có khung UI tiếng Việt; bước tiếp theo là nối API thật từ Next.js frontend tới Python agent thay vì dùng mock data.

---

## 7. Team Reflection

Lab này cho thấy khác biệt quan trọng giữa chatbot và agent: chatbot mạnh ở trả lời nhanh, còn agent mạnh khi cần quy trình có hành động, quan sát và debug. Trace là phần có giá trị nhất vì giúp nhóm hiểu agent sai ở đâu: gọi sai tool, sai argument, tự bịa Observation hoặc lặp quá nhiều bước. Frontend dashboard giúp biến các log kỹ thuật này thành một giao diện dễ đọc, phù hợp để demo và viết báo cáo.

---

> Submit this report by renaming it to `GROUP_REPORT_REACT_AGENT_LAB_TEAM.md` and placing it in this folder.
