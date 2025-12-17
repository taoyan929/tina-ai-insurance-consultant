import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const chatWindowRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Smart auto-switch base URL
  const BASE_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:4000"
      : "http://backend:4000";

  //Use useEffect to listen for messages and scroll each time there is an update
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  //When component loads -> start a new session
  useEffect(() => {
    async function startSession() {
      const response = await fetch(`${BASE_URL}/api/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      setSessionId(data.sessionId);

      // Add Tina's first greeting
      setMessages([{ sender: "tina", text: data.message }]);
    }

    startSession();
  }, [BASE_URL]);

  async function handleSubmit() {
    if (!input.trim() || !sessionId) return;

    // Add user's message to UI
    const userMessage = input;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");

    // Show typing animation
    setIsTyping(true);

    try {
      // Call backend with sessionId + message
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: userMessage }),
      });

      const data = await response.json();

      setIsTyping(false);

      //Add AI reply
      setMessages((prev) => [...prev, { sender: "tina", text: data.reply }]);
      //If the back end returns 500 or 400
      if (!response.ok) {
        throw new Error("Backend error");
      }
    } catch (err) {
      console.error("Frontend Error:", err);

      setIsTyping(false);
      // Network error or backend failure
      setMessages((prev) => [
        ...prev,
        {
          sender: "tina",
          text: "Oops! Something went wrong. Please try again.",
        },
      ]);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="app-wrapper">
      <div className="chat-card">
        <div className="chat-container">
          <h1 className="title">Tina 🤖 - Insurance AI Assistant</h1>

          <div className="chat-window" ref={chatWindowRef}>
            {messages.map((message, index) => {
             return ( // Use the different className to render different style
              <div
                key={index}
                className={`message ${
                  message.sender === "user" ? "user" : "tina"
                }`}
              >
                <div className="bubble">{message.text}</div>
              </div>
            );
            })}

            {isTyping && (
              <div className="message tina">
                <div className="bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
          </div>

          <div className="input-area">
            <textarea
              rows={1}
              value={input}
              className="input-box"
              placeholder="Type your message..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="send-btn" onClick={handleSubmit}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
