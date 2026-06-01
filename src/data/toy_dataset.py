"""
Toy dataset for the Emergency Exam Cramming Agent.
Loads structured exam data from JSON for deterministic benchmarking and tool responses.
"""
import json
from pathlib import Path

DATA_FILE = Path(__file__).with_suffix('.json')
with DATA_FILE.open('r', encoding='utf-8') as f:
    DATA = json.load(f)

