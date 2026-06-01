# Individual Report: Lab 3 - Chatbot vs ReAct Agent

- **Student Name**:  Võ Thanh Hiệp
- **Student ID**: 2A202600836
- **Date**: 01/06/2026

---

## I. Technical Contribution (15 Points)

*Describe your specific contribution to the codebase (e.g., implemented a specific tool, fixed the parser, etc.).*

- **Modules Implemented**:
  - `src/agent/agent.py` — `ReActAgent` implementation (ReAct loop, action parsing, tool execution).
  - `src/agent/tools.py` — tool registry: `summarize`, `list_topics`, `sample_practice`.
  - `src/data/toy_dataset.py` — deterministic toy dataset for testing (calculus, algebra).
  - `src/core/gemini_provider.py` — Gemini provider integration (fixed import and API usage).
  - `src/core/openai_provider.py` — OpenAI provider for running with `OPENAI_API_KEY`.
  - `run_agent.py` — demo runner (switched between providers, manual .env loader, demo flow).

- **Code Highlights**:
  - `ReActAgent.run()` — orchestrates Thought → Action → Observation cycle, calls LLM, parses actions, executes tools via `_execute_tool()` and appends observations to the prompt history.
  - Tool registry (`TOOLS`) — dictionary entries `{name, function, description}` enabling dynamic execution and guardrails.
  - `_parse_args()` in `agent.py` — robust parsing for comma/quote-separated tool arguments.

- **Documentation**:
  - The agent uses a system prompt that describes tool names and usage examples. Each LLM response is parsed for `Thought`, `Action(...)`, `Observation`, and `Final Answer`. Tools return deterministic outputs from the toy dataset or call external providers when configured. Logs are written to `logs/YYYY-MM-DD.log` for traceability.

---

## II. Debugging Case Study (10 Points)

*Analyze a specific failure event you encountered during the lab using the logging system.*

- **Problem Description**:
  - While switching to real APIs I encountered runtime failures: missing dependencies and provider import mismatches, and an API quota error when calling Gemini.

- **Log Source (representative snippets)**:
  - `ModuleNotFoundError: No module named 'dotenv'` — when `dotenv` was imported but unavailable.
  - `AttributeError: module 'google.genai' has no attribute 'configure'` — due to incorrect import name.
  - `google.api_core.exceptions.ResourceExhausted: 429 You exceeded your current quota` — Gemini API quota exhausted during a real request.

- **Diagnosis**:
  - Missing `python-dotenv` caused an import error in the demo script. The Gemini client package changed name/usage (`google.generativeai` vs `google.genai`) which caused the attribute error. Finally, the Gemini API key was valid but the project had no free-tier quota left, resulting in a 429 from the remote API.

- **Solution**:
  - Removed unconditional `dotenv` import and added a small `_load_env()` helper that reads `.env` into `os.environ` so the demo works without the package.
  - Updated `src/core/gemini_provider.py` to import `google.generativeai` and use the correct client initialization.
  - Added `src/core/openai_provider.py` usage path and updated `run_agent.py` to support launching with `OPENAI_API_KEY` as a fallback for local testing.
  - Created a venv and installed required packages from `requirements.txt` and verified the runtime flow. For the quota error, the mitigation is to use an API key with sufficient quota or use the provided deterministic `DummyProvider` for offline testing.

---

## III. Personal Insights: Chatbot vs ReAct (10 Points)

*Reflect on the reasoning capability difference.*

1. **Reasoning**: The `Thought` block makes the agent's intentions explicit and enables multi-step planning. Instead of a single-shot answer, the agent lists subgoals, chooses tools, and incrementally builds the final response — producing more structured, actionable study plans.

2. **Reliability**: The Agent can perform worse than a Chatbot when the tool implementations are incomplete or the LLM issues an action referencing an unavailable tool (or uses ambiguous arguments). In those cases the Chatbot's single-shot answer may be more useful because it does not rely on external tool correctness.

3. **Observation**: Observations (tool outputs) directly steer subsequent Thoughts and Actions. For example, if `sample_practice(topic)` returns empty, the agent will pivot to other topics or request clarification; this feedback loop improves correctness but depends on tool coverage.

---

## IV. Future Improvements (5 Points)

- **Scalability**: Introduce an asynchronous task queue for tool execution, and a service layer that can horizontally scale expensive tools (e.g., a microservice serving practice problems).
- **Safety**: Add a supervisor LLM that reviews proposed `Action(...)` calls and blocks unsafe tool invocations; add input sanitization and rate-limit-aware backoff.
- **Performance**: Use a vector DB (FAISS/Weaviate) for retrieval-augmented tool selection and cache common tool outputs. Add retry/backoff and fallback providers (OpenAI/Gemini/Dummy) for resilience.
- **Observability**: Emit structured telemetry to a monitoring backend (Prometheus + Grafana) and keep centralized logs with request IDs for debugging.

---

> This is your personalized report. Rename or edit as needed.
