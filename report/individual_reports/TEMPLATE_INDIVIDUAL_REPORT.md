# Individual Report: Lab 3 - Chatbot vs ReAct Agent

* **Student Name**: Nguyễn Công Tuấn Anh
* **Student ID**: 2A202600977
* **Date**: 01/06/2026

---

# I. Technical Contribution (15 Points)

## Modules Implemented

* `src/agent/react_agent.py`

  * Implemented the ReAct Agent architecture.
  * Added Thought → Action → Observation workflow.
  * Added action execution and observation tracking.

* `src/tools/tools.py`

  * Implemented study-planning tools:

    * `calculate_priority()`
    * `analyze_exam()`
    * `create_study_plan()`

* `src/safeguards/validator.py`

  * Input validation.
  * Prompt injection detection.
  * User data sanity checking.

* `src/telemetry/logger.py`

  * Logging system.
  * Agent activity tracking.
  * Error logging.

* `src/main.py`

  * User interaction.
  * Agent initialization.
  * Runtime execution.

---

## Code Highlights

### ReAct Loop

The agent follows a ReAct workflow:

Thought → Action → Observation → Final Answer

Example:

```python
thought = "Calculate subject priorities"

action = "calculate_priority"

priority = self.tools[action](subjects)

observation = priority
```

### Logging

Every agent action is recorded:

```python
logger.info(f"Thought: {thought}")
logger.info(f"Action: {action}")
logger.info(f"Observation: {observation}")
```

### Safeguards

Input validation:

```python
validate_subjects(subjects)
validate_days(days_left)
```

Prompt injection protection:

```python
if detect_prompt_injection(user_input):
    return "Unsafe request detected"
```

---

## Documentation

The system receives user exam information, analyzes study urgency, calculates priorities, and generates a study plan.

The agent uses a deterministic set of tools and records every reasoning step through logs for traceability and debugging.

---

# II. Debugging Case Study (10 Points)

## Problem Description

While implementing the logging system, the application crashed before the agent started.

Error:

```text
FileNotFoundError:
No such file or directory:
logs/agent.log
```

## Log Source

```text
logging.basicConfig(
    filename="logs/agent.log"
)
```

Python attempted to create the log file inside a folder that did not exist.

## Diagnosis

The logging configuration expected a directory named `logs`.

However, the project structure did not contain that folder.

Because Python's FileHandler does not automatically create directories, the application failed during startup.

## Solution

Created the directory automatically:

```python
import os

os.makedirs("logs", exist_ok=True)
```

Improved version:

```python
from pathlib import Path

LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)
```

After the fix, the agent successfully generated logs and continued execution.

---

# III. Personal Insights: Chatbot vs ReAct (10 Points)

## 1. Reasoning

A traditional chatbot directly produces an answer from the prompt.

The ReAct Agent first reasons about the problem, decides which tool to use, executes the tool, observes the result, and then continues reasoning.

This makes the decision-making process transparent and easier to debug.

## 2. Reliability

The ReAct Agent can perform worse than a chatbot when:

* Tools contain bugs.
* Invalid actions are generated.
* Tool outputs are incomplete.

In those situations, the chatbot may still provide a reasonable answer because it does not depend on external tools.

## 3. Observation

Observations are the most important part of the ReAct architecture.

For example:

* Tool returns study priority.
* Agent observes the result.
* Agent decides how to allocate study hours.

Without observations, the agent cannot adapt its future actions.

---

# IV. Future Improvements (5 Points)

## Scalability

* Add more educational tools.
* Support multiple exams simultaneously.
* Connect to external educational APIs.

## Safety

* Implement a supervisor agent.
* Add tool execution permissions.
* Expand prompt injection detection rules.

## Performance

* Cache previous study plans.
* Add vector search for educational content.
* Reduce repeated tool executions.

## Observability

* Structured JSON logs.
* Request IDs for tracing.
* Monitoring dashboard integration.

---

# Conclusion

This project demonstrates the implementation of a simple ReAct Agent for exam preparation planning.

Compared to a traditional chatbot, the ReAct Agent provides a more transparent reasoning process through Thought, Action, and Observation steps. The addition of logging, safeguards, and validation mechanisms improves reliability and makes debugging significantly easier.
