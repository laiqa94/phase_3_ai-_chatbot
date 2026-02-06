"""
MCP tool for adding tasks
Implements the add_task functionality for the AI agent
"""

from typing import Dict, Any
from pydantic import BaseModel, Field
from ..database.repositories import TaskRepository
from ..database.models import TaskCreate
from sqlmodel import Session


class AddTaskInput(BaseModel):
    """Input schema for add_task tool"""
    user_id: int = Field(..., description="ID of the user creating the task")
    title: str = Field(..., min_length=1, max_length=255, description="Title of the task")
    description: str = Field(default="", description="Optional description of the task")
    priority: str = Field(default="medium", description="Priority of the task (low, medium, high)")
    due_date: str = Field(default="", description="Due date in ISO format (YYYY-MM-DD)")


class AddTaskTool:
    """MCP Tool for adding tasks to a user's list"""

    @staticmethod
    def name() -> str:
        return "add_task"

    @staticmethod
    def description() -> str:
        return "Add a new task to the user's task list"

    @staticmethod
    def parameters() -> Dict[str, Any]:
        return AddTaskInput.schema()

    @staticmethod
    def execute(input_data: Dict[str, Any], session: Session) -> Dict[str, Any]:
        """
        Execute the add_task operation

        Args:
            input_data: Dictionary containing user_id, title, description, priority, due_date
            session: Database session

        Returns:
            Dictionary with result of the operation
        """
        try:
            # Validate input
            params = AddTaskInput(**input_data)

            # Create task repository
            task_repo = TaskRepository(session)

            # Prepare task data - Don't include user_id here, it's handled by create_task
            task_data = {
                "title": params.title,
                "description": params.description if params.description else None,
                "priority": params.priority if params.priority else "medium",
                "due_date": None,
                "user_id": params.user_id  # Include it so TaskCreate validates it
            }

            # Add due_date if provided
            if params.due_date:
                from datetime import datetime
                task_data["due_date"] = datetime.fromisoformat(params.due_date.replace('Z', '+00:00'))

            # Create TaskCreate object
            task_create = TaskCreate(**task_data)

            # Create the task (repository will handle user_id extraction)
            task = task_repo.create_task(task_create, params.user_id)

            return {
                "success": True,
                "task_id": task.id,
                "title": task.title,
                "message": f"Task '{task.title}' has been added successfully"
            }

        except TypeError as e:
            # Handle the user_id duplicate issue
            if "user_id" in str(e):
                # Try alternative approach - create task directly
                try:
                    from ..database.models import Task
                    task = Task(
                        title=params.title,
                        description=params.description if params.description else None,
                        priority=params.priority if params.priority else "medium",
                        due_date=None,
                        user_id=params.user_id
                    )
                    if params.due_date:
                        from datetime import datetime
                        task.due_date = datetime.fromisoformat(params.due_date.replace('Z', '+00:00'))
                    
                    session.add(task)
                    session.commit()
                    session.refresh(task)
                    
                    return {
                        "success": True,
                        "task_id": task.id,
                        "title": task.title,
                        "message": f"Task '{task.title}' has been added successfully"
                    }
                except Exception as e2:
                    return {
                        "success": False,
                        "error": str(e2),
                        "message": f"Failed to add task: {str(e2)}"
                    }
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to add task: {str(e)}"
            }
        except Exception as e:
            import traceback
            print(f"DEBUG: Error in add_task: {str(e)}")
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e),
                "message": f"Failed to add task: {str(e)}"
            }