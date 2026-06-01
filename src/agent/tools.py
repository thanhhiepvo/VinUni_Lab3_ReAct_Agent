from typing import Dict, Any, List
from src.data.toy_dataset import DATA

def summarize(topic: str) -> str:
    key = topic.strip().lower()
    if key in DATA:
        return DATA[key]["summary"]
    return f"No summary available for {topic}."

def list_topics(subject: str) -> List[str]:
    key = subject.strip().lower()
    if key in DATA:
        return DATA[key]["topics"]
    return []

def sample_practice(topic: str, n: int = 1) -> List[Dict[str, str]]:
    key = topic.strip().lower()
    if key in DATA:
        items = DATA[key]["practice"]
        return items[:n]
    return []

# Tool registry for dynamic execution
TOOLS = {
    "summarize": summarize,
    "list_topics": list_topics,
    "sample_practice": sample_practice,
}
