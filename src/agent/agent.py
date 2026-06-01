import os
import re
import json
from typing import List, Dict, Any, Optional
from src.core.llm_provider import LLMProvider
from src.telemetry.logger import logger

class ReActAgent:
    """
    ReAct-style Agent that follows the Thought -> Action -> Observation -> Final Answer loop.

    This implementation is beginner-friendly, uses a tools registry, prints traces,
    and maintains internal history. Tools are simple callables provided as a list.
    """

    def __init__(self, llm: LLMProvider, tools: List[Dict[str, Any]], max_steps: int = 6):
        self.llm = llm
        self.tools = tools
        self.max_steps = max_stepsgit
        self.history: List[Dict[str, Any]] = []

    def get_system_prompt(self) -> str:
        """
        System prompt that clearly instructs the model to produce ReAct-formatted output.
        """
        # Build descriptions if tools provided as dicts
        desc_lines = []
        for t in self.tools:
            if isinstance(t, dict):
                name = t.get("name")
                desc = t.get("description", "")
                desc_lines.append(f"- {name}: {desc}")
            else:
                # callable tool
                desc_lines.append(f"- {getattr(t, '__name__', str(t))}: (callable)")

        tool_descriptions = "\n".join(desc_lines)

        return (
            "You are an assistant that must think step-by-step using the ReAct pattern.\n"
            "When reasoning, follow this exact format:\n"
            "Thought: <your thought about what to do next>\n"
            "Action: tool_name(arg1,arg2)  # call one available tool with arguments\n"
            "Observation: <result from the tool>\n"
            "...repeat Thought/Action/Observation as needed...\n"
            "Final Answer: <the final user-facing plan or answer>\n\n"
            "Available tools:\n"
            f"{tool_descriptions}\n\n"
            "Guardrails:\n"
            "- Only call tools listed above.\n"
            "- Keep answers concise and actionable.\n"
            "- If unsure, ask one clarifying question instead of guessing.\n"
        )

    

    def _parse_args(self, raw: str) -> List[Any]:
        """Very small argument parser: splits by comma and strips quotes/spaces."""
        if not raw:
            return []
        parts = [p.strip() for p in raw.split(",")]
        parsed = []
        for p in parts:
            if p.startswith('"') and p.endswith('"') or p.startswith("'") and p.endswith("'"):
                parsed.append(p[1:-1])
            else:
                # try to parse int
                if p.isdigit():
                    parsed.append(int(p))
                else:
                    parsed.append(p)
        return parsed
