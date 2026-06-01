# Individual Report: Lab 3 - Chatbot vs ReAct Agent

- **Student Name**:  Nguyễn Tuấn Minh
- **Student ID**: 2A202600692
- **Date**: 01/06/2026

---

## I. Technical Contribution (15 Points)

- **Modules Implemented**:
    - `tests/test_chatbot_vs_agent.pythe `Designed and implemented 5 test cases comparing a baseline Chatbot and a ReAct Agent across different scenarios, including simple questions, tool usage, multi-tool reasoning, tool failure recovery, and complex study planning.
    - `src/agent/agent.py` — CReviewed and tested the ReActAgent execution flow, including the Thought → Action → Observation → Final Answer cycle.
    - `src/data/toy_dataset.py` — Tested the deterministic toy dataset outputs containing calculus and algebra evaluation records.
    - `src/core/gemini_provider.py` — Integrated and resolved configuration setups for the local Gemini client provider instance.
    - `run_agent.py` — Conducted local runtime deployments, configured environment synchronization profiles, and executed target multi-turn demonstration flows.

- **Code Highlights**:
    - Implemented a standalone testing suite that compares Chatbot and ReAct Agent behavior under five different scenarios.
    - Created custom mock providers (SimpleDummy and ScriptedProvider) to simulate deterministic LLM responses without relying on external APIs.
    - Tested the ReActAgent.run() workflow to ensure that LLM responses were correctly parsed into actions and tool calls.
    - Verified that observations returned from tools were properly appended to the reasoning history and used in subsequent agent decisions.

- **Documentation**:
    - Documented the behavioral differences between Chatbot and ReAct Agent through structured test outputs.
    - Reviewed the system prompt instructions defining the ReAct workflow and tool usage constraints.
    - Verified that execution logs were correctly generated inside the logs/ directory for debugging and monitoring purposes.
    - Conducted multiple testing scenarios to validate the interaction between reasoning, tool execution, and final answer generation.

---

## II. Debugging Case Study (10 Points)

- **Problem Description**:
    - While developing the comparison test suite, the custom provider class (SimpleDummy) could not be instantiated and caused the test execution to fail.

- **Log Source (representative snippets)**:
    - Fault output recorded from the active terminal workspace:
      ```text
      TypeError: Can't instantiate abstract class SimpleDummy without an implementation for abstract method 'stream'
      ```

- **Diagnosis**:
    - TThe LLMProvider base class defines abstract methods that must be implemented by all subclasses. The custom SimpleDummy provider only implemented the generate() method, while the required stream() method was missing. Because of this, Python treated the class as abstract and prevented object creation.

- **Solution**:
    - Implemented the missing stream() method inside the custom provider class to satisfy the abstract interface requirements.
    - Re-ran the test suite to confirm that the provider could be instantiated correctly and that all test scenarios executed as expected.

---

## III. Personal Insights: Chatbot vs ReAct (10 Points)

1. **Reasoning**: The Thought step enables the agent to explicitly plan its actions before generating a final answer. Unlike a traditional Chatbot that produces a single response, the ReAct Agent can break a complex problem into smaller tasks and use tools when needed.

2. **Reliability**: The Agent may perform worse than a Chatbot when tool definitions are incomplete, tool outputs are unavailable, or action parsing fails. In these situations, a simple Chatbot can still provide a direct response without depending on external components.

3. **Observation**: Observations provide real-time feedback from tools and directly influence subsequent decisions. The agent can use retrieved information to refine its reasoning process, making responses more accurate and structured than a single-shot Chatbot answer.

---

## IV. Future Improvements (5 Points)

- **Scalability**: Introduce asynchronous execution for tool calls to support multiple concurrent requests efficiently.
- **Safety**: Add validation layers and tool-access restrictions to reduce the risk of invalid actions or prompt injection attempts.
- **Performance**: Implement caching and vector-based retrieval (e.g., FAISS) to improve tool selection and reduce repeated computations.
- **Observability**: Enhance logging and monitoring with structured telemetry to simplify debugging and system maintenance.


---

> [!NOTE]
> Submit this report by renaming it to `REPORT_NGUYEN_TUAN_MINH.md` and placing it in this folder.
