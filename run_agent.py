import os
from src.core.gemini_provider import GeminiProvider
from src.agent.agent import ReActAgent
from src.agent import tools
from src.telemetry.logger import logger


def _load_env():
    """Manually load .env file into os.environ"""
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    key, value = line.split("=", 1)
                    os.environ[key.strip()] = value.strip()


_load_env()

# Build tools list (dict style with descriptions)
TOOLS = [
    {"name": "summarize", "function": tools.summarize, "description": "Return a short deterministic summary for a topic."},
    {"name": "sample_practice", "function": tools.sample_practice, "description": "Return sample practice problems for a topic."},
    {"name": "list_topics", "function": tools.list_topics, "description": "List subtopics for a subject."},
]


def run_demo(user_input: str):
    # Instantiate Gemini LLM and agent
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not set in .env file.")
        print("Please add your Gemini API key to .env and try again.")
        return

    llm = GeminiProvider(api_key=api_key)
    agent = ReActAgent(llm=llm, tools=TOOLS)

    print("\n--- Running Chatbot baseline (single-shot) ---\n")
    # Chatbot baseline: single LLM call without tools
    chatbot_resp = llm.generate(user_input, system_prompt="You are a helpful chatbot. Give a concise plan.")
    print("Chatbot reply:\n", chatbot_resp.get("content"))

    print("\n--- Running ReAct Agent ---\n")
    agent_result = agent.run(user_input)

    print("\n--- Agent Result Summary ---\n")
    print(agent_result)

    # Log the agent run
    logger.log_event("DEMO_COMPLETE", {"user_input": user_input, "agent_result": str(agent_result)})


if __name__ == "__main__":
    example = (
        "Sáng mai tôi phải thi cuối kỳ môn Giải tích, nhưng cả kỳ rồi tôi chưa học gì cả. "
        "Hãy giúp tôi ôn tập để cố đạt điểm cao nhất."
    )
    run_demo(example)
