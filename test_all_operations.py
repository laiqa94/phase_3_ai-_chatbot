#!/usr/bin/env python
"""Test all chatbot operations with enhanced responses"""

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
    
    print("\n" + "="*70)
    print("TEST 1: Add tasks (English & Hindi)")
    print("="*70)
    
    tests = [
        'Add task: buy groceries',
        'nayi task banao: Study for exam',
        'task banao: Call mom',
    ]
    
    for msg in tests:
        result = agent.process_message(msg, user.id)
        print(f"\nMessage: {msg}")
        print(f"Response:\n{result.get('response_text')}\n")
    
    print("\n" + "="*70)
    print("TEST 2: List tasks")
    print("="*70)
    
    msg = "show my tasks"
    result = agent.process_message(msg, user.id)
    print(f"Message: {msg}")
    print(f"Response:\n{result.get('response_text')}\n")
    
    print("\n" + "="*70)
    print("TEST 3: Complete task")
    print("="*70)
    
    msg = "mark task 1 as complete"
    result = agent.process_message(msg, user.id)
    print(f"Message: {msg}")
    print(f"Response:\n{result.get('response_text')}\n")
    
    print("\n" + "="*70)
    print("TEST 4: List pending tasks (Hindi)")
    print("="*70)
    
    msg = "Mere pending kaam dikha do"
    result = agent.process_message(msg, user.id)
    print(f"Message: {msg}")
    print(f"Response:\n{result.get('response_text')}\n")
    
    print("\n" + "="*70)
    print("TEST 5: Delete task")
    print("="*70)
    
    msg = "task 2 delete karo"
    result = agent.process_message(msg, user.id)
    print(f"Message: {msg}")
    print(f"Response:\n{result.get('response_text')}\n")
    
    print("\n" + "="*70)
    print("TEST 6: Final status")
    print("="*70)
    
    msg = "show all tasks"
    result = agent.process_message(msg, user.id)
    print(f"Message: {msg}")
    print(f"Response:\n{result.get('response_text')}\n")
