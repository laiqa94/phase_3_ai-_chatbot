#!/usr/bin/env python
"""Debug chatbot responses"""

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
        'mera pending task dikhao',
        'task 1 complete kro',
        'show my tasks',
    ]
    
    for msg in tests:
        result = agent.process_message(msg, user.id)
        resp = result.get('response_text', 'NO RESPONSE')[:120]
        tools = result.get('has_tools_executed', False)
        tool_count = len(result.get('tool_results', []))
        print(f"Message: {msg}")
        print(f"Response: {resp}")
        print(f"Tools Executed: {tools} ({tool_count})")
        print()
