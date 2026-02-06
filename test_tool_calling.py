#!/usr/bin/env python
"""Test script to verify tool calling works with multiple languages"""

import sys
sys.path.insert(0, 'd:\\phase_3_chatbot\\backend')

from ai_chatbot.agent.cohere_provider import LanguageDetector

# Test cases for English
test_cases = [
    # English tasks
    ("Add a task to buy groceries", "add_task"),
    ("Create a new task: Call mom", "add_task"),
    ("Show me my tasks", "list_tasks"),
    ("List my pending tasks", "list_tasks"),
    ("Mark task 1 as complete", "complete_task"),
    ("Delete task 2", "delete_task"),
    ("Update task 3 with high priority", "update_task"),
    
    # Hindi/Hinglish tasks
    ("nayi task banao groceries", "add_task"),
    ("Ek task add karo call mom ko", "add_task"),
    ("Mera task dikha do", "list_tasks"),
    ("Mere pending kaam batao", "list_tasks"),
    ("Task 1 complete karo", "complete_task"),
    ("Task 2 delete karo", "delete_task"),
    ("Task 3 ko update karo", "update_task"),
    
    # General queries
    ("Hello, how are you?", "general_query"),
    ("What can you do?", "general_query"),
]

print("Testing Language Detection and Intent Recognition:")
print("=" * 80)

passed = 0
failed = 0

for message, expected_intent in test_cases:
    result = LanguageDetector.detect_intent(message)
    actual_intent = result.get('intent', 'general_query')
    
    status = "✅ PASS" if actual_intent == expected_intent else "❌ FAIL"
    
    print(f"{status} | Message: '{message}'")
    print(f"       Expected: {expected_intent}, Got: {actual_intent}")
    
    if actual_intent == expected_intent:
        if result.get('intent') in ['add_task', 'list_tasks', 'complete_task', 'delete_task', 'update_task']:
            print(f"       Details: {result}")
        passed += 1
    else:
        failed += 1
    print()

print("=" * 80)
print(f"Summary: {passed} passed, {failed} failed out of {len(test_cases)} tests")
