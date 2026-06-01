import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.agent.agent import ReActAgent


from src.agent.agent import ReActAgent
from src.core.dummy_provider import DummyProvider

def test_react_flow():
    # Sử dụng DummyProvider tại đây, KHÔNG ảnh hưởng đến OpenAIProvider ở file run_agent.py
    llm = DummyProvider()
    agent = ReActAgent(llm=llm, tools=[])
    
    # Test logic
    query = "Tính toán cho tôi"
    result = agent.run(query)
    
    # Kiểm tra xem agent có trả về kết quả không
    assert result is not None
    print(" Test Case Logic thành công!")

if __name__ == "__main__":
    test_react_flow()