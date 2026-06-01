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

    def run(self, user_input: str) -> Dict[str, Any]:
        """
        Execute the ReAct loop until a Final Answer is produced or max_steps reached.

        Returns a dict with final answer (if any), step count, and history.
        Also prints traces to terminal and logs structured events.
        """

        conversation_append = ""  # observations appended for the LLM
        steps = 0

        while steps < self.max_steps:
            prompt = user_input + "\n" + conversation_append
            # Call the LLM
            try:
                response = self.llm.generate(prompt, system_prompt=self.get_system_prompt())
                content = response.get("content") if isinstance(response, dict) else str(response)
            except Exception as e:
                return {"error": "LLM call failed", "exc": str(e)}
            self.history.append({"llm_output": content})

            # Parse lines for Thought/Action/Observation/Final Answer
            thought = None
            action_text = None
            final_answer = None

            for line in content.splitlines():
                s = line.strip()
                if not s:
                    continue
                low = s.lower()
                if low.startswith("thought:"):
                    thought = s[len("thought:"):].strip()
                elif low.startswith("action:"):
                    action_text = s[len("action:"):].strip()
                elif low.startswith("final answer:") or low.startswith("final:"):
                    final_answer = s.split(":", 1)[1].strip() if ":" in s else s

            if thought:
                logger.log_event("THOUGHT", {"text": thought})
                print(f"Thought: {thought}")

            if action_text:
                logger.log_event("ACTION", {"text": action_text})
                print(f"Action: {action_text}")

                # Parse action: tool_name(args)
                m = re.match(r"^([a-zA-Z0-9_\-]+)\s*\((.*)\)$", action_text)
                if m:
                    tool_name = m.group(1)
                    raw_args = m.group(2).strip()
                else:
                    tool_name = action_text.strip()
                    raw_args = ""

                # Simple safety: only allow known tools
                allowed = [t.get("name") if isinstance(t, dict) else getattr(t, "__name__", None) for t in self.tools]
                allowed = [a for a in allowed if a]
                if tool_name not in allowed:
                    obs = f"Tool {tool_name} not allowed."
                    logger.log_event("GUARDRAIL", {"reason": "unknown_tool", "tool": tool_name})
                    print(f"Observation: {obs}")
                    conversation_append += f"\nObservation: {obs}\n"
                    self.history.append({"observation": obs})
                    steps += 1
                    continue

                # Execute the tool
                obs = self._execute_tool(tool_name, raw_args)
                # Normalize
                obs_str = obs if isinstance(obs, str) else json.dumps(obs)
                print(f"Observation: {obs_str}")

                # Append observation for next iteration
                conversation_append += f"\nObservation: {obs_str}\n"
                self.history.append({"tool": tool_name, "args": raw_args, "observation": obs_str})

                steps += 1
                continue

            if final_answer:
                logger.log_event("AGENT_END", {"steps": steps + 1, "final": final_answer})
                print(f"Final Answer: {final_answer}")
                return {"final_answer": final_answer, "steps": steps + 1, "history": self.history}

            # Nothing actionable: return LLM raw output as fallback
            steps += 1
            print("No Action or Final Answer found in LLM response; continuing...")

        logger.log_event("AGENT_END", {"steps": steps})
        return {"note": "max steps reached", "steps": steps, "history": self.history}

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

    
