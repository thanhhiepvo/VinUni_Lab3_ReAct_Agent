# Individual Report: Lab 3 - Chatbot vs ReAct Agent

- **Student Name**: Tran Gia Huy
- **Student ID**: 2A202600812
- **Date**: 01/06/2026

---

## I. Technical Contribution (15 Points)

Đóng góp chính của tôi trong lab là hoàn thành phần **frontend UI dashboard** cho hệ thống so sánh Chatbot và ReAct Agent. Thay vì chỉ chạy agent trong terminal, tôi xây dựng giao diện trực quan để người dùng nhập câu hỏi, chọn provider, xem kết quả song song, theo dõi trace và phân tích lỗi.

### Modules Implemented

- `src/frontend/app/page.tsx`: render màn hình chính của dashboard.
- `src/frontend/app/layout.tsx`: cấu hình metadata tiếng Việt và layout root.
- `src/frontend/components/dashboard.tsx`: bố cục tổng thể gồm header, control panel, metrics, comparison, trace, tool inventory và failure analysis.
- `src/frontend/components/control-panel.tsx`: form nhập câu hỏi, chọn provider OpenAI/Gemini/Local/Dummy và chọn ví dụ ôn thi.
- `src/frontend/components/response-comparison.tsx`: so sánh phản hồi Chatbot cơ sở và ReAct Agent.
- `src/frontend/components/react-trace.tsx`: hiển thị từng bước `Thought`, `Action`, `Observation`.
- `src/frontend/components/metrics-cards.tsx`: hiển thị độ trễ, token, số vòng lặp, chi phí và trạng thái.
- `src/frontend/components/tool-inventory.tsx`: hiển thị danh sách tool `summarize`, `list_topics`, `sample_practice`.
- `src/frontend/components/failure-analysis.tsx`: phân loại lỗi như ảo giác công cụ, lỗi parser và vượt số bước.
- `src/frontend/components/export-button.tsx`: xuất báo cáo demo dạng JSON hoặc Markdown.
- `src/frontend/lib/mock-data.ts`: dữ liệu demo tiếng Việt theo đúng use case ôn thi Giải tích.
- `src/frontend/package.json`: cấu hình dependency và script chạy Next.js dashboard.

### Code Highlights

- Tôi Việt hóa toàn bộ text UI để phù hợp với người dùng trong lab: "Bảng điều khiển", "Câu hỏi", "Chạy so sánh", "Trace ReAct", "Phân tích lỗi", "Danh sách công cụ".
- UI bám sát use case thật của repo: ôn thi Giải tích bằng `summarize`, `list_topics`, `sample_practice`.
- Dashboard cho phép nhìn rõ sự khác nhau giữa Chatbot và ReAct Agent:
  - Chatbot trả lời một lần.
  - ReAct Agent có trace từng bước và có thể giải thích vì sao kết quả được tạo ra.
- Tôi cấu hình build Next.js ổn định hơn bằng cách tránh phụ thuộc font online và dùng system font.
- Tôi đã cài dependency bằng `npm install` và xác minh `npm run build` chạy thành công.

### Documentation

Tôi bổ sung hướng dẫn chạy frontend vào `README.md`:

```bash
cd src/frontend
npm install
npm run dev
```

Sau đó mở `http://localhost:3000` để xem dashboard.

---

## II. Debugging Case Study (10 Points)

### Problem Description

Trong quá trình tích hợp UI từ v0 vào dự án, tôi gặp hai nhóm lỗi chính:

1. Frontend chưa có dependency nên không thể chạy Next.js.
2. Lệnh build bị lỗi vì Next.js cố tải Google Fonts trong môi trường hạn chế network.

### Log Source / Evidence

Khi chạy `npm install` lần đầu trong sandbox:

```text
npm error code ENOTCACHED
request to https://registry.npmjs.org/... failed
cache mode is 'only-if-cached' but no cached response is available
```

Khi chạy `npm run build`:

```text
next/font: error:
Failed to fetch `Geist` from Google Fonts.
Failed to fetch `Geist Mono` from Google Fonts.
```

### Diagnosis

- Lỗi `ENOTCACHED` xảy ra vì môi trường sandbox không được phép tải package từ npm registry.
- Lỗi Google Fonts xảy ra vì `next/font/google` cần network trong lúc build, trong khi môi trường build có thể bị chặn hoặc không ổn định.
- Ngoài ra, trên Windows có lúc build gặp lỗi `EPERM` khi thao tác với thư mục `.next`; đây là lỗi file lock/quyền ghi thường gặp khi Next.js/Turbopack đang xử lý output.

### Solution

- Tôi chạy lại `npm install` với quyền phù hợp để tải dependency cho frontend.
- Tôi sửa `src/frontend/app/layout.tsx` để bỏ import `next/font/google`.
- Tôi cập nhật `src/frontend/app/globals.css` để dùng system font:

```css
--font-sans: Arial, Helvetica, sans-serif;
--font-mono: Consolas, 'Courier New', monospace;
```

- Tôi cấu hình `distDir: ".next-build"` trong `next.config.mjs` và ignore thư mục này trong `.gitignore`.
- Cuối cùng, tôi xác minh `npm run build` thành công và dev server trả `200 OK` tại `http://localhost:3000`.

---

## III. Personal Insights: Chatbot vs ReAct (10 Points)

1. **Reasoning**: Chatbot trả lời nhanh nhưng khó biết nó suy luận thế nào. ReAct Agent có `Thought`, `Action`, `Observation`, vì vậy quá trình suy luận trở nên rõ ràng hơn. Khi đưa trace lên UI, người xem dễ hiểu agent đang làm gì và vì sao nó chọn tool đó.

2. **Reliability**: Agent không phải lúc nào cũng tốt hơn chatbot. Nếu tool thiếu dữ liệu hoặc model gọi sai argument, agent có thể trả kết quả rỗng hoặc bị kẹt vòng lặp. Ví dụ dataset chỉ có `calculus`, nhưng model có thể gọi `"Giải tích"` hoặc `"Integrals"`, dẫn đến tool không tìm được dữ liệu.

3. **Observation**: Observation là điểm khác biệt quan trọng nhất. Nó giúp agent điều chỉnh bước tiếp theo dựa trên kết quả thật từ tool. Tuy nhiên, nếu model tự bịa Observation thay vì chờ tool thật, trace sẽ mất độ tin cậy. Vì vậy UI failure analysis rất cần thiết để phát hiện lỗi này.

4. **UI Insight**: Khi chỉ xem terminal log, khó thuyết trình và khó so sánh. Sau khi có dashboard, trace, metrics và failure trở nên trực quan hơn. UI không chỉ là phần trang trí mà là công cụ debug và báo cáo cho agentic system.

---

## IV. Future Improvements (5 Points)

- **Backend Integration**: nối Next.js frontend với Python agent thật qua API endpoint thay vì dùng mock data.
- **Real Metrics**: lấy latency, token usage, loop count và cost trực tiếp từ `src/telemetry/metrics.py`.
- **Vietnamese Tool Mapping**: thêm alias tiếng Việt như `giải tích -> calculus`, `đạo hàm -> derivatives`, `tích phân -> integrals`.
- **Trace Quality**: ép model chỉ xuất một `Action` mỗi lượt và không tự tạo `Observation`.
- **Production UI**: thêm lịch sử lần chạy, bộ lọc failure, biểu đồ latency/token và chức năng import log JSON từ `logs/`.

---

## V. Summary

Trong lab này, đóng góp chính của tôi là hoàn thành UI frontend để biến prototype ReAct Agent từ một chương trình chạy trong terminal thành một dashboard có thể demo, phân tích và xuất báo cáo. Phần UI giúp thể hiện rõ giá trị của ReAct: không chỉ có câu trả lời cuối cùng, mà còn có toàn bộ quá trình suy nghĩ, hành động, quan sát và lỗi phát sinh.
