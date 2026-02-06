"""
Cohere AI Provider for AI Todo Chatbot
Handles communication with Cohere API
"""

import cohere
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ..config import config
import re
from datetime import datetime


class LanguageDetector:
    """Detect user language and intent for task operations"""
    
    # Hindi/Hinglish keywords for task operations
    TASK_KEYWORDS = {
        # Add task
        'add': ['add', 'create', 'make', 'new', 'nayi', 'naya', 'banana', 'banao', 'add karo', 'ek nayi task'],
        'task': ['task', 'todo', 'item', 'kaam', 'kaam ka', 'task ko'],
        
        # View/List tasks
        'list': ['list', 'show', 'display', 'view', 'mujhe', 'mera', 'mere', 'dikha', 'dikhao', 'batao', 'dekho', 'puche'],
        'all': ['all', 'sab', 'sara', 'saare', 'sabhi'],
        'pending': ['pending', 'incomplete', 'baaki', 'baache', 'abhi', 'awaiting'],
        'completed': ['completed', 'done', 'finished', 'complete', 'hoya', 'ho gaya', 'khatam', 'mukammal'],
        
        # Complete task
        'complete': ['complete', 'finish', 'done', 'mark', 'tick', 'complete karo', 'ho gaya', 'pura kiya', 'khatam'],
        'completed_marker': ['complete', 'finished', 'completed', 'done', 'hua', 'ho gaya', 'kara'],
        
        # Delete task
        'delete': ['delete', 'remove', 'cancel', 'eliminate', 'hatao', 'nikalo', 'uda do', 'mita do'],
        
        # Update task
        'update': ['update', 'change', 'modify', 'edit', 'alter', 'badlo', 'change karo', 'sudharo']
    }
    
    @staticmethod
    def detect_intent(message: str) -> Dict[str, Any]:
        """
        Detect the user's intent and extract parameters
        
        Args:
            message: User message in any language
            
        Returns:
            Dictionary with detected intent and parameters
        """
        msg_lower = message.lower().strip()
        
        # Detect add task intent
        if any(word in msg_lower for word in LanguageDetector.TASK_KEYWORDS['add']) and \
           any(word in msg_lower for word in LanguageDetector.TASK_KEYWORDS['task']):
            title = LanguageDetector._extract_task_title(message)
            return {
                'intent': 'add_task',
                'title': title,
                'description': '',
                'priority': LanguageDetector._extract_priority(message),
                'due_date': LanguageDetector._extract_due_date(message)
            }
        
        # Detect list task intent
        if any(word in msg_lower for word in LanguageDetector.TASK_KEYWORDS['list']):
            if any(word in msg_lower for word in LanguageDetector.TASK_KEYWORDS['completed']):
                return {'intent': 'list_tasks', 'status': 'completed'}
            elif any(word in msg_lower for word in LanguageDetector.TASK_KEYWORDS['pending']):
                return {'intent': 'list_tasks', 'status': 'pending'}
            else:
                return {'intent': 'list_tasks', 'status': 'all'}
        
        # Detect complete task intent
        if any(word in msg_lower for word in LanguageDetector.TASK_KEYWORDS['complete']):
            task_id = LanguageDetector._extract_task_id(message)
            return {
                'intent': 'complete_task',
                'task_id': task_id,
                'completed': True
            }
        
        # Detect delete task intent
        if any(word in msg_lower for word in LanguageDetector.TASK_KEYWORDS['delete']):
            task_id = LanguageDetector._extract_task_id(message)
            return {
                'intent': 'delete_task',
                'task_id': task_id
            }
        
        # Detect update task intent
        if any(word in msg_lower for word in LanguageDetector.TASK_KEYWORDS['update']):
            task_id = LanguageDetector._extract_task_id(message)
            return {
                'intent': 'update_task',
                'task_id': task_id,
                'fields': LanguageDetector._extract_update_fields(message)
            }
        
        return {'intent': 'general_query'}
    
    @staticmethod
    def _extract_task_title(message: str) -> str:
        """Extract task title from message"""
        # Remove common prefixes
        msg = message.lower()
        for prefix in ['add', 'create', 'make', 'nayi', 'naya', 'banana', 'banao', 'task', 'todo', 'item']:
            msg = re.sub(f'^.*?{prefix}\\s+', '', msg, flags=re.IGNORECASE)
        
        # Remove common suffixes and clean up
        msg = re.sub(r'(please|kripaya|please add it|add it).*$', '', msg, flags=re.IGNORECASE)
        return msg.strip()[:100] or "New Task"
    
    @staticmethod
    def _extract_task_id(message: str) -> int:
        """Extract task ID from message"""
        # Look for numbers
        numbers = re.findall(r'\d+', message)
        return int(numbers[0]) if numbers else 1
    
    @staticmethod
    def _extract_priority(message: str) -> str:
        """Extract priority from message"""
        msg_lower = message.lower()
        if any(word in msg_lower for word in ['high', 'urgent', 'acha', 'important', 'zaruri']):
            return 'high'
        elif any(word in msg_lower for word in ['low', 'slow', 'kaam', 'eventually']):
            return 'low'
        return 'medium'
    
    @staticmethod
    def _extract_due_date(message: str) -> str:
        """Extract due date from message"""
        # Simple date extraction - look for patterns like "tomorrow", "next week", dates
        msg_lower = message.lower()
        if any(word in msg_lower for word in ['today', 'aaj']):
            from datetime import date
            return date.today().isoformat()
        elif any(word in msg_lower for word in ['tomorrow', 'kal']):
            from datetime import date, timedelta
            return (date.today() + timedelta(days=1)).isoformat()
        return ""
    
    @staticmethod
    def _extract_update_fields(message: str) -> Dict[str, Any]:
        """Extract fields to update from message"""
        fields = {}
        msg_lower = message.lower()
        
        # Check for title/name change
        if 'title' in msg_lower or 'name' in msg_lower or 'change' in msg_lower or 'new name' in msg_lower:
            title = LanguageDetector._extract_task_title(message)
            if title:
                fields['title'] = title
        
        # Check for priority change
        priority = LanguageDetector._extract_priority(message)
        if priority:
            fields['priority'] = priority
        
        # Check for due date change
        due_date = LanguageDetector._extract_due_date(message)
        if due_date:
            fields['due_date'] = due_date
        
        return fields


class CohereProvider:
    """Provider class for Cohere API integration"""

    def __init__(self):
        if not config.COHERE_API_KEY or config.COHERE_API_KEY == "your-cohere-api-key-here":
            # In development mode, set client to None to indicate we're using mock mode
            self.client = None
        else:
            self.client = cohere.Client(config.COHERE_API_KEY)

        self.model = config.COHERE_MODEL

    def chat(self,
             messages: List[Dict[str, str]],
             tools: Optional[List[Dict[str, Any]]] = None,
             temperature: float = 0.7) -> Dict[str, Any]:
        """
        Send chat request to Cohere API

        Args:
            messages: List of message dictionaries with 'role' and 'message' keys
            tools: Optional list of tool definitions
            temperature: Temperature for response creativity

        Returns:
            Response dictionary from Cohere API
        """
        # Check if we're in development mode with mock API key
        if not config.COHERE_API_KEY or config.COHERE_API_KEY == "your-cohere-api-key-here" or config.COHERE_API_KEY == "":
            # Return enhanced mock response for development with intelligent tool calling
            import random
            user_message = messages[-1]["content"].strip().lower()
            original_message = messages[-1]["content"]
            
            # Detect user intent 
            intent_result = LanguageDetector.detect_intent(original_message)
            intent = intent_result.get('intent', 'general_query')
            tool_calls = []
            response_text = ""
            
            # Handle different intents with tool calls
            if intent == 'add_task':
                # Create tool call for adding a task
                tool_calls = [{
                    "name": "add_task",
                    "parameters": {
                        "title": intent_result.get('title', 'New Task'),
                        "description": intent_result.get('description', ''),
                        "priority": intent_result.get('priority', 'medium'),
                        "due_date": intent_result.get('due_date', '')
                    }
                }]
                response_text = f"Great! I'm adding a task for you: '{intent_result.get('title', 'New Task')}'. Let me create this for you."
            
            elif intent == 'list_tasks':
                # Create tool call for listing tasks
                tool_calls = [{
                    "name": "list_tasks",
                    "parameters": {
                        "status": intent_result.get('status', 'all')
                    }
                }]
                status = intent_result.get('status', 'all')
                status_text = 'pending' if status == 'pending' else 'completed' if status == 'completed' else 'all your'
                response_text = f"Let me fetch {status_text} tasks for you!"
            
            elif intent == 'complete_task':
                # Create tool call for completing a task
                task_id = intent_result.get('task_id', 1)
                tool_calls = [{
                    "name": "complete_task",
                    "parameters": {
                        "task_id": task_id,
                        "completed": True
                    }
                }]
                response_text = f"Excellent! I'm marking task {task_id} as complete. Great job!"
            
            elif intent == 'delete_task':
                # Create tool call for deleting a task
                task_id = intent_result.get('task_id', 1)
                tool_calls = [{
                    "name": "delete_task",
                    "parameters": {
                        "task_id": task_id
                    }
                }]
                response_text = f"I'm deleting task {task_id} for you."
            
            elif intent == 'update_task':
                # Create tool call for updating a task
                task_id = intent_result.get('task_id', 1)
                fields = intent_result.get('fields', {})
                params = {"task_id": task_id}
                params.update(fields)
                tool_calls = [{
                    "name": "update_task",
                    "parameters": params
                }]
                response_text = f"I'm updating task {task_id} with the new information."
            
            else:
                # General responses for non-task queries
                import time
                import hashlib
                
                # Create unique seed based on message content and timestamp
                message_hash = hashlib.md5(user_message.encode()).hexdigest()[:8]
                unique_seed = int(time.time() * 1000) + int(message_hash, 16)
                random.seed(unique_seed)
                
                if any(greeting in user_message for greeting in ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "namaste", "namaskar"]):
                    responses = [
                        "Hello! 👋 I'm your personal task assistant. I'm here to help you stay organized and productive. What can I help you with today?",
                        "Namaste! 🙏 Great to see you! I'm ready to help you manage your tasks and get things done. What's on your mind?",
                        "Hi there! 😊 I'm your task management buddy. Ready to help you tackle your to-do list! What would you like?",
                        "असलाम-अलैकुम! 👋 Hello! I'm here to assist with your tasks. What can I do for you?",
                    ]
                    response_text = random.choice(responses)
                
                elif any(word in user_message for word in ["help", "what can you do", "assist", "capabilities", "क्या कर सकते", "mujhe madad"]):
                    responses = [
                        "I'm your personal task management assistant! 📝 I can help you:\n\n✅ Add new tasks with details\n📋 View your task list\n✔️ Mark tasks as complete\n✏️ Update task information\n🗑️ Delete tasks you no longer need\n\nJust tell me what you'd like to do in natural language!",
                        "Great question! I'm here to make task management effortless for you. I can:\n\n• Create new tasks with priorities and due dates\n• Show you all your tasks or filter by status\n• Help you complete tasks and celebrate your progress\n• Update task details when things change\n• Remove tasks you no longer need\n\nTry saying something like 'Add a task to call mom' or 'Show me my pending tasks'!",
                    ]
                    response_text = random.choice(responses)
                
                elif any(action in user_message for action in ["add", "create", "make", "new", "nayi", "banana"]) and \
                     any(word in user_message for word in ["task", "todo", "item", "kaam", "work"]):
                    responses = [
                        "Absolutely! I'd love to help you add a new task. 📝 What task would you like me to create for you? You can include details like priority or due date if you'd like!",
                        "Perfect! Let's get that task added to your list. ✨ What's the task you want to create? Feel free to give me as much detail as you want!",
                    ]
                    response_text = random.choice(responses)
                
                else:
                    # More encouraging and helpful general responses
                    responses = [
                        f"I understand you said: '{original_message}' 💭 I'm here to help you manage your tasks effectively! You can ask me to add, view, complete, update, or delete tasks. What would you like to do?",
                        f"Thanks for your message: '{original_message}' 😊 I'm your task management assistant! I can help you stay organized and productive. What task-related help do you need?",
                        f"Got it: '{original_message}' 🎯 I'm ready to help you with your tasks! Whether you want to add something new, check your list, or update existing tasks, just let me know!",
                    ]
                    response_text = random.choice(responses)
            
            # Ensure we always return a non-empty response
            if not response_text or response_text.strip() == "":
                response_text = "I'm your AI assistant for task management. How can I help you today?"

            return {
                "text": response_text,
                "finish_reason": "COMPLETE",
                "tool_calls": tool_calls,  # Now tools are called intelligently
                "meta": {"development_mode": True}
            }

        # Convert messages to Cohere format
        chat_history = []
        for msg in messages:
            role = "USER" if msg["role"] == "user" else "CHATBOT"
            chat_history.append({
                "user_name": role,
                "text": msg["content"]
            })

        # Prepare the request
        kwargs = {
            "message": messages[-1]["content"],  # Last message is the current prompt
            "chat_history": chat_history[:-1],  # All previous messages as history
            "model": self.model,
            "temperature": temperature,
        }

        # Add tools if provided
        if tools:
            kwargs["tools"] = tools

        try:
            response = self.client.chat(**kwargs)
            return {
                "text": response.text,
                "finish_reason": getattr(response, 'finish_reason', 'COMPLETE'),
                "tool_calls": getattr(response, 'tool_calls', []),
                "meta": getattr(response, 'meta', {})
            }
        except Exception as e:
            return {
                "error": str(e),
                "text": "Sorry, I encountered an error processing your request. Please try again.",
                "finish_reason": "ERROR"
            }

    def generate(self,
                 prompt: str,
                 max_tokens: int = 300,
                 temperature: float = 0.7) -> str:
        """
        Generate text using Cohere's generate endpoint

        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate
            temperature: Temperature for response creativity

        Returns:
            Generated text
        """
        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.generations[0].text if response.generations else ""
        except Exception as e:
            return f"Error generating response: {str(e)}"