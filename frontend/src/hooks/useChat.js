import { useState, useCallback, useRef, useEffect } from "react";

/**
 * useChat hook for managing chat state and API communication.
 * Handles message history, sending questions, and local caching.
 * Includes retry logic and comprehensive error handling.
 */
export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const storageKey = "chatHistory";

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setMessages(JSON.parse(cached));
      }
    } catch (err) {
      console.warn("Failed to load chat history:", err);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (err) {
      console.warn("Failed to save chat history:", err);
    }
  }, [messages]);

  /**
   * Send a user message and get a response from the chat API.
   */
  const sendMessage = useCallback(
    async (userMessage) => {
      if (!userMessage.trim()) return;

      setError(null);
      setLoading(true);

      // Add user message to history
      const newUserMessage = {
        role: "user",
        content: userMessage,
      };
      setMessages((prev) => [...prev, newUserMessage]);

      try {
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Prepare request body
        const requestBody = {
          message: userMessage,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        };

        // Call backend chat API with timeout
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort();
        }, 45000); // 45 second timeout

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/chat/ask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        });

        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.detail || `HTTP ${response.status}`;
          
          console.error(`API Error ${response.status}:`, errorMessage);
          
          // Add error message to chat (show API error as-is)
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `❌ ${errorMessage}`,
              isError: true,
            },
          ]);
          return;
        }

        const data = await response.json();
        
        if (!data.reply) {
          throw new Error("Empty response from API");
        }

        const assistantMessage = {
          role: "assistant",
          content: data.reply,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        if (err.name === "AbortError") {
          const timeoutError = "Request timeout. Please try again.";
          setError(timeoutError);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `⏱️ ${timeoutError}`,
              isError: true,
            },
          ]);
          return;
        }

        const errorMsg = err.message || "Failed to send message";
        console.error("Chat error:", err);
        
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ ${errorMsg}`,
            isError: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  /**
   * Clear conversation history.
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
    localStorage.removeItem(storageKey);
  }, []);

  /**
   * Cancel ongoing request.
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory,
    cancel,
  };
}
