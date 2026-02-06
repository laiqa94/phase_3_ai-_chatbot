#!/usr/bin/env python
"""Integration test to verify the complete chatbot flow with tasks"""

import sys
sys.path.insert(0, 'd:\\phase_3_chatbot\\backend')
sys.path.insert(0, 'd:\\phase_3_chatbot')

from sqlmodel import Session, SQLModel, create_engine, select
from ai_chatbot.database.models import User, Task
from ai_chatbot.agent.agent import TodoAgent
from app.models.user import User as AppUser

# Create in-memory database for testing
engine = create_engine("sqlite:///:memory:")
SQLModel.metadata.create_all(engine)

def test_chatbot_with_tasks():
    """Test the chatbot with various task operations"""
    
    with Session(engine) as session:
        # Create a test user directly
        user = AppUser(
            email="test@example.com",
            full_name="Test User",
            hashed_password="hash"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
        print(f"[OK] Created test user: {user.email} (ID: {user.id})")
        print("=" * 80)
        
        # Test cases
        test_messages = [
            "Hello! Can you help me manage my tasks?",
            "Add a task to buy groceries with high priority",
            "Create another task: Study Python for tomorrow",
            "Show me my tasks", 
            "Mark task 1 as complete",
            "Mera pending task dikha do",  # Hindi: Show me my pending tasks
            "Task 2 ko delete karo",  # Hindi: Delete task 2
            "nayi task banao: Meeting at 2 PM",  # Hindi: Create new task
        ]
        
        agent = TodoAgent(session)
        
        for i, message in enumerate(test_messages, 1):
            print(f"\n{'='*80}")
            print(f"Test {i}: User Message")
            print(f"{'='*80}")
            print(f"Message: {message}")
            
            try:
                result = agent.process_message(
                    user_message=message,
                    user_id=user.id,
                    conversation_id=None
                )
                
                print(f"\n[OK] Bot Response:")
                response = result.get('response_text', 'No response')
                print(f"  Text: {response[:150]}{'...' if len(response) > 150 else ''}")
                print(f"  Tools Executed: {result.get('has_tools_executed', False)}")
                
                if result.get('tool_results'):
                    print(f"  Tool Results ({len(result['tool_results'])} tools):")
                    for tool_result in result['tool_results']:
                        tool_name = tool_result.get('tool_name', 'unknown')
                        is_success = tool_result.get('result', {}).get('success', False)
                        message_text = tool_result.get('result', {}).get('message', 'No message')
                        status = '[OK]' if is_success else '[FAIL]'
                        print(f"    {status} {tool_name}: {message_text}")
                
            except Exception as e:
                print(f"[ERROR] {str(e)}")
                import traceback
                traceback.print_exc()
        
        # Verify tasks were created
        print(f"\n{'='*80}")
        print("Final Tasks in Database:")
        print(f"{'='*80}")
        
        tasks = session.exec(
            select(Task).where(Task.user_id == user.id)
        ).all()
        
        print(f"[OK] Total tasks created: {len(tasks)}")
        for task in tasks:
            status = "[DONE]" if task.completed else "[PENDING]"
            print(f"  {status} | ID {task.id}: {task.title} (Priority: {task.priority})")

if __name__ == "__main__":
    test_chatbot_with_tasks()
    print("\n" + "="*80)
    print("[OK] Integration test completed!")
