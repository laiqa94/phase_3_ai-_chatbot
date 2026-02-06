import requests
import json

# Test the chat API
url = "http://localhost:8000/api/v1/1/chat"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer mock-token"
}
data = {
    "message": "hello"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
