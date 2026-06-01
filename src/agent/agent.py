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

    
    def _execute_tool(self, tool_name: str, args: str) -> Any:
        """
        Execute a tool from the provided tools list. Tools can be dicts with 'name' and 'function', or direct callables.
        Args string is passed raw and tool implementations are responsible for parsing it.
        """
        # Try to find the tool
        for t in self.tools:
            if isinstance(t, dict) and t.get("name") == tool_name:
                func = t.get("function") or t.get("func")
                if callable(func):
                    try:
                        # Basic parsing: if args looks like comma-separated values, split
                        parsed_args = self._parse_args(args)
                        return func(*parsed_args)
                    except Exception as e:
                        logger.error(f"Tool {tool_name} error: {e}")
                        return f"Tool {tool_name} error: {e}"
            elif callable(t) and getattr(t, "__name__", None) == tool_name:
                try:
                    parsed_args = self._parse_args(args)
                    return t(*parsed_args)
                except Exception as e:
                    logger.error(f"Tool {tool_name} error: {e}")
                    return f"Tool {tool_name} error: {e}"

        return f"Tool {tool_name} not found."

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
