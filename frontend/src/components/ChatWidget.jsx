import React, { useState } from "react";
import "./ChatWidget.css";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`chat-widget ${open ? "open" : "closed"}`}
        aria-hidden={!open}
      >
        <div className="chat-header">
          <div className="chat-title">AI Assistant</div>
          <button
            className="chat-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        <div className="chat-body">
          <div className="chat-placeholder">
            Chat functionality coming soon!
          </div>
        </div>

        <div className="chat-footer">
          <input
            className="chat-input"
            placeholder="Enter your message..."
            disabled
          />
          <button className="chat-send" disabled>
            ➤
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
