#!/usr/bin/env python
"""Debug chatbot responses with tool results"""

import sys
sys.path.insert(0, 'd:\\phase_3_chatbot\\backend')
sys.path.insert(0, 'd:\\phase_3_chatbot')

from sqlmodel import Session, SQLModel, create_engine
from ai_chatbot.database.models import Task
from ai_chatbot.agent.agent import TodoAgent
from app.models.user import User

engine = create_engine('sqlite:///:memory:')
SQLModel.metadata.create_all(engine)

with Session(engine) as session:
    user = User(email='test@example.com', full_name='Test', hashed_password='hash')
    session.add(user)
    session.commit()
    session.refresh(user)
    
    agent = TodoAgent(session)
    
    tests = [
        'Add task: buy milk',
        'Add task: study hindi',
        'show my tasks',
    ]
    
    for msg in tests:
        result = agent.process_message(msg, user.id)
        print(f"\n=== Message: {msg} ===")
        print(f"Bot Response: {result.get('response_text', 'NO RESPONSE')}")
        print(f"Tools Executed: {result.get('has_tools_executed', False)}")
        
        if result.get('tool_results'):
            print(f"Tool Results:")
            for tool in result['tool_results']:
                print(f"  Tool: {tool.get('tool_name')}")
                print(f"  Result: {tool.get('result')}")
        print()
