import time
from typing import Dict, Any, Optional, Generator
from src.core.llm_provider import LLMProvider

class DummyProvider(LLMProvider):
    """A deterministic dummy LLM provider for testing.

    It returns a preset sequence of responses that follow the ReAct format:
    - Thought: ...\nAction: tool(args)\n
    The provider counts calls to produce predictable multi-step traces.
    """
    def __init__(self, model_name: str = "dummy"):
        super().__init__(model_name, api_key=None)
        self.call_count = 0

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        self.call_count += 1
        time.sleep(0.05)

        # Simple deterministic behavior based on how many times called
        if self.call_count == 1:
            content = (
                "Thought: I should identify the subject and list key topics to cover.\n"
                "Action: summarize(calculus)"
            )
        elif self.call_count == 2:
            content = (
                "Thought: I have a summary; next I should propose a short study plan.\n"
                "Action: sample_practice(calculus,1)"
            )
        elif self.call_count == 3:
            content = (
                "Thought: With practice sample in hand, now allocate time and produce final plan.\n"
                "Action: list_topics(calculus)"
            )
        else:
            content = (
                "Thought: I will synthesize the information into a final plan.\n"
                "Final Answer: Here's your emergency overnight study plan based on summaries and practice."
            )

        return {"content": content, "usage": {}, "latency_ms": 1, "provider": "dummy"}

    def stream(self, prompt: str, system_prompt: Optional[str] = None) -> Generator[str, None, None]:
        # For demo, stream the full generate content as one chunk
        result = self.generate(prompt, system_prompt)
        yield result["content"]
