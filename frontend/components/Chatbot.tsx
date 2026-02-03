'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, ChatRequest } from '@/lib/api';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const Chatbot = ({ userId }: { userId: number }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send message to backend
      const request: ChatRequest = {
        message: inputValue,
      };

      const response = await sendChatMessage(userId, request);
      console.log('Chatbot: Received response from API:', response);

      // Add AI response to chat
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
      };
      console.log('Chatbot: Adding AI message:', aiMessage);

      // Prepare all messages to be added at once (AI response + tool results)
      const newMessages = [aiMessage];

      // If tools were executed, add their results as well
      if (response.tool_results && response.tool_results.length > 0) {
        response.tool_results.forEach((toolResult) => {
          if (toolResult.result?.message) {
            const toolResultMessage: Message = {
              id: Date.now() + Math.floor(Math.random() * 1000),
              role: 'assistant',
              content: `Tool Result: ${toolResult.result.message}`,
              timestamp: new Date().toISOString(),
            };
            newMessages.push(toolResultMessage);
            console.log('Chatbot: Prepared tool result message:', toolResultMessage);
          }
        });
      }

      // Update state with all new messages at once
      setMessages(prev => {
        const updatedMessages = [...prev, ...newMessages];
        console.log('Chatbot: Messages after adding AI response and tool results:', updatedMessages);
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Icon */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white rounded-full p-3 sm:p-4 shadow-lg hover:bg-blue-700 z-50 transition-all duration-200 hover:scale-105"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-4 sm:bottom-6 sm:right-6 sm:inset-auto sm:w-96 sm:h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold text-sm sm:text-base">AI Todo Assistant</h3>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 p-1 rounded-md hover:bg-blue-700 transition-colors"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-4 sm:mt-8">
                <p className="text-sm sm:text-base">Hello! I&apos;m your AI assistant.</p>
                <p className="text-sm sm:text-base mt-1">Ask me to help you manage your tasks:</p>
                <ul className="mt-2 text-xs sm:text-sm text-left space-y-1">
                  <li>• &quot;Add a task to buy groceries&quot;</li>
                  <li>• &quot;Show me my tasks&quot;</li>
                  <li>• &quot;Mark task 1 as complete&quot;</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 max-w-xs px-3 py-2 rounded-lg">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 sm:p-4 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 text-white rounded-lg px-3 sm:px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <span className="hidden sm:inline">Send</span>
                <svg className="sm:hidden h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;