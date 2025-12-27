import React, { useState } from "react";
import useChat from "../hooks/useChat";
import "./ChatWidget.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory,
    cooldownRemaining,
  } = useChat();
  const cooldownActive = cooldownRemaining > 0;

  const handleSend = () => {
    if (inputValue.trim() && !loading && !cooldownActive) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading && !cooldownActive) {
      e.preventDefault();
      handleSend();
    }
  };

  const messagesEndRef = React.useRef(null);
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div
        className={`chat-widget ${open ? "open" : "closed"}`}
        aria-hidden={!open}
      >
        <div className="chat-header">
          <div className="chat-title">AI Assistant</div>
          <div className="chat-header-buttons">
            <button
              className="chat-clear-btn"
              onClick={clearHistory}
              aria-label="Clear chat history"
              title="Clear history"
            >
              🗑️
            </button>
            <button
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="chat-body">
          {messages.length === 0 && (
            <div className="chat-placeholder">
              Hello! I'm your AI assistant 🤖
              <br />
              <br />
              You may ask me about:
              <br />
              • backup jobs
              <br />
              • repository status
              <br />
              • free space
              <br />
              <br />
              <small style={{ opacity: 0.7 }}>
                Ask in any language you like!
              </small>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message chat-message--${msg.role}${
                msg.isError ? " chat-message--error" : ""
              }`}
            >
              <div className="chat-message-content">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-message chat-message--assistant">
              <div className="chat-message-content chat-loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="chat-message chat-message--error">
              <div className="chat-message-content">{error}</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <input
            className="chat-input"
            placeholder="Your question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || cooldownActive}
            maxLength={250}
          />
          <button
            className="chat-send"
            onClick={handleSend}
            disabled={loading || cooldownActive || !inputValue.trim()}
            aria-label="Send message"
          >
            {loading
              ? "..."
              : cooldownActive
              ? `${cooldownRemaining}s`
              : "Send"}
          </button>
        </div>
      </div>

      <button
        className={`chat-fab ${open ? "hidden" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Open chat"
      >
        💬
      </button>
    </>
  );
}
