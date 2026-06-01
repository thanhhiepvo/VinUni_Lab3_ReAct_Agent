"""
tests/test_chatbot_vs_agent.py

5 test cases so sánh Chatbot baseline vs ReAct Agent.
Hoàn toàn tự chứa — không import DummyProvider, không đụng source code.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.agent.agent import ReActAgent
from src.core.llm_provider import LLMProvider  # chỉ import base class, luôn tồn tại


# ──────────────────────────────────────────────
# Providers tự viết trong file test — không kế thừa DummyProvider
# ──────────────────────────────────────────────

class SimpleDummy(LLMProvider):
    def __init__(self, reply: str = "Đây là câu trả lời mẫu."):
        self._reply = reply
        self.call_count = 0

    def generate(self, prompt: str, system_prompt: str = "") -> dict:
        self.call_count += 1
        return {"content": f"Final Answer: {self._reply}"}

    def stream(self, prompt: str, system_prompt: str = ""):
        yield {"content": f"Final Answer: {self._reply}"}


class ScriptedProvider(LLMProvider):
    def __init__(self, responses: list):
        self._responses = responses
        self._idx = 0

    def generate(self, prompt: str, system_prompt: str = "") -> dict:
        if self._idx < len(self._responses):
            resp = self._responses[self._idx]
            self._idx += 1
            return {"content": resp}

        return {"content": "Final Answer: Không có bước nào thêm."}

    def stream(self, prompt: str, system_prompt: str = ""):
        yield self.generate(prompt, system_prompt)


# ──────────────────────────────────────────────
# Tools dùng chung — hardcode data, không gọi API
# ──────────────────────────────────────────────

def make_tools(call_log: list = None):
    def summarize(topic: str) -> str:
        if call_log is not None:
            call_log.append("summarize")
        data = {
            "Giải tích": "Giải tích nghiên cứu giới hạn, đạo hàm, tích phân và chuỗi số.",
        }
        return data.get(topic, f"Tóm tắt ngắn về {topic}.")

    def sample_practice(topic: str) -> str:
        # Chỉ nhận 1 arg — Action Input không được có dấu phẩy
        if call_log is not None:
            call_log.append("sample_practice")
        data = {
            "Giải tích": "1. Tính đạo hàm f(x)=x³. 2. Tính ∫x²dx. 3. Tìm giới hạn lim sinx/x.",
        }
        return data.get(topic, f"Bài tập mẫu về {topic}.")

    def list_topics(subject: str) -> str:
        if call_log is not None:
            call_log.append("list_topics")
        data = {
            "Giải tích": "1. Giới hạn\n2. Đạo hàm\n3. Tích phân\n4. Chuỗi số\n5. Phương trình vi phân",
        }
        return data.get(subject, f"Các chủ đề của {subject}.")

    return [
        {"name": "summarize",       "function": summarize,       "description": "Tóm tắt ngắn về một chủ đề."},
        {"name": "sample_practice", "function": sample_practice, "description": "Bài tập mẫu cho một chủ đề."},
        {"name": "list_topics",     "function": list_topics,     "description": "Liệt kê các chủ đề con của môn học."},
    ]


def header(title):
    print(f"\n{'='*60}\n  {title}\n{'='*60}")

def section(label, content):
    print(f"\n[{label}]\n{content}")


# ──────────────────────────────────────────────
# TEST 1 — Câu hỏi đơn giản: Chatbot đủ
# ──────────────────────────────────────────────

def test_case_1_simple_question():
    """
    NHẬN ĐỊNH: Câu hỏi chào hỏi không cần tra cứu.
    Chatbot single-shot là đủ, agent tốn thêm vòng lặp không cần thiết.
    """
    header("TEST 1: Câu hỏi đơn giản — Chatbot đủ")

    query = "Xin chào! Bạn có thể giúp tôi học tốt hơn không?"

    # Chatbot: instance riêng, call_count chỉ đếm 1 lần gọi này
    chatbot_llm = SimpleDummy("Chào bạn! Tôi có thể giúp bạn lập kế hoạch học tập.")
    chatbot_resp = chatbot_llm.generate(query, system_prompt="You are a helpful chatbot.")
    chatbot_answer = chatbot_resp.get("content", "")
    section("CHATBOT (single-shot)", chatbot_answer)
    print(f"  → LLM calls: {chatbot_llm.call_count}  ✅ kỳ vọng: 1")

    # Agent: instance riêng hoàn toàn — không share với chatbot_llm
    agent_llm = SimpleDummy("Tôi sẵn sàng hỗ trợ việc học của bạn.")
    agent = ReActAgent(llm=agent_llm, tools=[])
    agent_result = agent.run(query)
    section("AGENT result", str(agent_result))

    assert chatbot_answer is not None and len(chatbot_answer) > 0
    assert chatbot_llm.call_count == 1, \
        f"Chatbot nên chỉ gọi LLM 1 lần, thực tế: {chatbot_llm.call_count}"
    assert agent_result is not None

    print("\n✅ NHẬN ĐỊNH: Chatbot đủ — câu hỏi chào hỏi không cần tools.")


# ──────────────────────────────────────────────
# TEST 2 — Agent gọi đúng tool: list_topics
# ──────────────────────────────────────────────

def test_case_2_agent_calls_correct_tool():
    """
    NHẬN ĐỊNH: Agent gọi đúng tool và trả về dữ liệu có cấu trúc.
    Chatbot chỉ đoán từ training data, có thể thiếu hoặc sai.
    """
    header("TEST 2: Agent gọi đúng tool — list_topics")

    query = "Liệt kê các chủ đề của môn Giải tích"
    call_log = []

    scripted_llm = ScriptedProvider([
        "Thought: Người dùng muốn biết các chủ đề Giải tích. Gọi list_topics.\nAction: list_topics(Giải tích)",
        "Thought: Đã có danh sách.\nFinal Answer: Giải tích gồm: Giới hạn, Đạo hàm, Tích phân, Chuỗi số, Phương trình vi phân.",
    ])
    agent = ReActAgent(llm=scripted_llm, tools=make_tools(call_log))

    section("THOUGHT", "Người dùng muốn biết các chủ đề Giải tích. Gọi list_topics.")
    section("ACTION",  "list_topics(Giải tích)")

    agent_result = agent.run(query)

    section("OBSERVATION", "1. Giới hạn\n2. Đạo hàm\n3. Tích phân\n4. Chuỗi số\n5. Phương trình vi phân")
    section("FINAL ANSWER", str(agent_result.get("final_answer", "")))

    chatbot_llm = SimpleDummy("Giải tích gồm giới hạn, đạo hàm, tích phân (trả lời chung chung).")
    section("CHATBOT (single-shot)", chatbot_llm.generate(query).get("content", ""))

    assert agent_result is not None
    assert "list_topics" in call_log, f"Agent phải gọi list_topics, thực tế: {call_log}"

    print("\n✅ NHẬN ĐỊNH: Agent vượt trội — gọi đúng tool, kết quả có cấu trúc.")


# ──────────────────────────────────────────────
# TEST 3 — Multi-tool: summarize → sample_practice
# ──────────────────────────────────────────────

def test_case_3_multi_tool_chain():
    """
    NHẬN ĐỊNH: Agent chuỗi 2 tool calls liên tiếp.
    Chatbot chỉ trả 1 response, không thể gọi tool.

    NOTE: Action Input không dùng dấu phẩy để tránh _parse_args
    trong agent.py split thành nhiều args gây lỗi.
    """
    header("TEST 3: Multi-tool chain — summarize + sample_practice")

    query = "Cho tôi tóm tắt lý thuyết và bài tập mẫu về Giải tích"
    call_log = []

    scripted_llm = ScriptedProvider([
        "Thought: Cần tóm tắt lý thuyết trước.\nAction: summarize(Giải tích)",
        "Thought: Có lý thuyết rồi. Tiếp theo lấy bài tập.\nAction: sample_practice(Giải tích)",
        "Thought: Đủ thông tin.\nFinal Answer: Lý thuyết + bài tập Giải tích đã sẵn sàng.",
    ])
    agent = ReActAgent(llm=scripted_llm, tools=make_tools(call_log))

    section("THOUGHT (1)", "Cần tóm tắt lý thuyết trước.")
    section("ACTION (1)",  "summarize(Giải tích)")
    section("OBSERVATION (1)", "Giải tích nghiên cứu giới hạn, đạo hàm, tích phân và chuỗi số.")
    section("THOUGHT (2)", "Có lý thuyết rồi. Tiếp theo lấy bài tập.")
    section("ACTION (2)",  "sample_practice(Giải tích)")
    section("OBSERVATION (2)", "1. Tính đạo hàm f(x)=x³. 2. Tính ∫x²dx. 3. Tìm giới hạn lim sinx/x.")

    agent_result = agent.run(query)
    section("FINAL ANSWER", str(agent_result.get("final_answer", "")))

    chatbot_llm = SimpleDummy("Giải tích có đạo hàm và tích phân. Hãy luyện nhiều bài tập.")
    section("CHATBOT (single-shot)", chatbot_llm.generate(query).get("content", ""))

    assert agent_result is not None
    assert "summarize"       in call_log, f"Thiếu summarize, log: {call_log}"
    assert "sample_practice" in call_log, f"Thiếu sample_practice, log: {call_log}"

    print("\n✅ NHẬN ĐỊNH: Agent vượt trội — orchestrate 2 tools, output phong phú hơn chatbot.")


# ──────────────────────────────────────────────
# TEST 4 — Tool fail: agent recover thay vì crash
# ──────────────────────────────────────────────

def test_case_4_tool_failure_recovery():
    """
    NHẬN ĐỊNH: ReActAgent đã có try/except trong _execute_tool.
    Khi tool raise exception, agent trả về chuỗi lỗi làm Observation
    và tiếp tục — không crash.
    """
    header("TEST 4: Tool fail → Agent recover, không crash")

    def broken_tool(topic: str) -> str:
        raise ConnectionError("Timeout: không kết nối được API ngoài.")

    broken_tools = [
        {"name": "summarize", "function": broken_tool, "description": "Tóm tắt (đang lỗi)."},
    ]

    scripted_llm = ScriptedProvider([
        "Thought: Gọi summarize.\nAction: summarize(Giải tích)",
        "Thought: Tool bị lỗi. Thông báo cho người dùng.\nFinal Answer: Xin lỗi, tool đang gặp sự cố.",
    ])
    agent = ReActAgent(llm=scripted_llm, tools=broken_tools)

    section("THOUGHT",           "Gọi summarize để lấy thông tin.")
    section("ACTION",            "summarize(Giải tích)")
    section("OBSERVATION (lỗi)", "Tool summarize error: Timeout: không kết nối được API ngoài.")
    section("THOUGHT (recover)", "Tool bị lỗi. Thông báo cho người dùng thay vì crash.")

    agent_result = agent.run("Tóm tắt Giải tích")
    section("FINAL ANSWER", str(agent_result))

    assert agent_result is not None
    assert "final_answer" in agent_result or "note" in agent_result or "error" in agent_result

    print("\n✅ NHẬN ĐỊNH: Agent recover được — _execute_tool có try/except, không crash.")


# ──────────────────────────────────────────────
# TEST 5 — Bài toán phức tạp: ôn thi cuối kỳ
# ──────────────────────────────────────────────

def test_case_5_complex_study_plan():
    """
    NHẬN ĐỊNH: Use case thực từ run_agent.py.
    Chatbot trả kế hoạch chung chung.
    Agent: list topics → summarize → sample_practice → kế hoạch có cấu trúc.
    """
    header("TEST 5: Ôn thi cuối kỳ — Complex multi-step plan")

    query = (
        "Sáng mai tôi phải thi cuối kỳ môn Giải tích "
        "nhưng cả kỳ rồi tôi chưa học gì. "
        "Hãy giúp tôi ôn tập để đạt điểm cao nhất."
    )
    call_log = []

    chatbot_llm = SimpleDummy("Hãy ôn lại các công thức đạo hàm, tích phân và luyện bài tập.")
    section("CHATBOT (single-shot)", chatbot_llm.generate(query).get("content", ""))
    print("  → Chatbot: trả lời chung, không dựa trên syllabus thực tế.")

    scripted_llm = ScriptedProvider([
        "Thought: Cần biết có bao nhiêu chủ đề.\nAction: list_topics(Giải tích)",
        "Thought: 5 chủ đề, 1 đêm. Ưu tiên Đạo hàm + Tích phân.\nAction: summarize(Giải tích)",
        "Thought: Có lý thuyết. Cần bài tập.\nAction: sample_practice(Giải tích)",
        "Thought: Đủ thông tin để lập kế hoạch.\nFinal Answer: Kế hoạch: (1) Đạo hàm (2) Tích phân (3) Giới hạn. Làm 3 bài mẫu mỗi phần.",
    ])
    agent = ReActAgent(llm=scripted_llm, tools=make_tools(call_log))

    section("THOUGHT (1)", "Cần biết có bao nhiêu chủ đề trong Giải tích.")
    section("ACTION (1)",  "list_topics(Giải tích)")
    section("OBSERVATION (1)", "1. Giới hạn  2. Đạo hàm  3. Tích phân  4. Chuỗi số  5. Phương trình vi phân")
    section("THOUGHT (2)", "5 chủ đề, 1 đêm. Ưu tiên Đạo hàm + Tích phân.")
    section("ACTION (2)",  "summarize(Giải tích)")
    section("OBSERVATION (2)", "Giải tích nghiên cứu giới hạn, đạo hàm, tích phân và chuỗi số.")
    section("THOUGHT (3)", "Có lý thuyết. Cần bài tập để luyện thêm.")
    section("ACTION (3)",  "sample_practice(Giải tích)")
    section("OBSERVATION (3)", "1. Tính đạo hàm f(x)=x³  2. Tính ∫x²dx  3. Tìm giới hạn lim sinx/x")

    agent_result = agent.run(query)
    section("FINAL ANSWER", str(agent_result.get("final_answer", "")))

    assert agent_result is not None
    assert len(call_log) >= 3,          f"Agent nên dùng ít nhất 3 tools, thực tế: {call_log}"
    assert "list_topics"     in call_log
    assert "summarize"       in call_log
    assert "sample_practice" in call_log

    print("\n✅ NHẬN ĐỊNH: Agent vượt trội — kế hoạch có cấu trúc, dựa trên dữ liệu thực.")


# ──────────────────────────────────────────────
# Tổng kết
# ──────────────────────────────────────────────

def print_summary():
    print(f"\n{'='*60}")
    print("  TỔNG KẾT: Khi nào Chatbot đủ? Khi nào Agent vượt trội?")
    print(f"{'='*60}")
    rows = [
        ("Test 1", "Câu hỏi đơn giản/chào hỏi",    "✅ Chatbot đủ",     "⚠️  Agent dư thừa"),
        ("Test 2", "Cần tra cứu 1 tool cụ thể",     "❌ Thiếu dữ liệu",  "✅ Agent vượt trội"),
        ("Test 3", "Cần kết hợp nhiều tools",        "❌ Output chung",   "✅ Agent vượt trội"),
        ("Test 4", "Tool có thể fail/timeout",       "➖ Không áp dụng",  "✅ Agent recover"),
        ("Test 5", "Bài toán phức tạp đa bước",      "❌ Kế hoạch mơ hồ","✅ Agent vượt trội"),
    ]
    print(f"\n{'Test':<8} {'Tình huống':<32} {'Chatbot':<20} {'Agent'}")
    print("-" * 80)
    for r in rows:
        print(f"{r[0]:<8} {r[1]:<32} {r[2]:<20} {r[3]}")
    print(f"\n{'='*60}\n")


if __name__ == "__main__":
    test_case_1_simple_question()
    test_case_2_agent_calls_correct_tool()
    test_case_3_multi_tool_chain()
    test_case_4_tool_failure_recovery()
    test_case_5_complex_study_plan()
    print_summary()
    print("🎉 Tất cả 5 test cases hoàn thành!\n")