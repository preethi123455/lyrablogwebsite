import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const ChatBox = ({ blogId, username }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [joined, setJoined] = useState(true);

  const socketRef = useRef(null);
  const joinedRef = useRef(false);
  const storageKey = `chat-history-${blogId}`;

  /* ================= SOCKET CONNECTION ================= */
  useEffect(() => {
    socketRef.current = io(
      "https://lyrablogwebsite-backend-1.onrender.com",
      {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    socketRef.current.on("connect", () => {
      console.log("🟢 Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("🔴 Socket connection error:", err.message);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      joinedRef.current = false;
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  /* ================= LOAD SAVED CHAT ================= */
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, [storageKey]);

  /* ================= JOIN ROOM & LISTEN ================= */
  useEffect(() => {
    if (!blogId || !username || !joined || !socketRef.current) return;

    if (!joinedRef.current) {
      socketRef.current.emit("join", {
        room: blogId,
        username,
      });
      joinedRef.current = true;
    }

    const handleMessage = (msg) => {
      setMessages((prev) => {
        const updated = [...prev, msg];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    };

    socketRef.current.on("message", handleMessage);

    return () => {
      socketRef.current.off("message", handleMessage);
    };
  }, [blogId, username, joined, storageKey]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return;

    socketRef.current.emit("send_message", { text });
    setText("");
  };

  /* ================= LEAVE CHAT ================= */
  const leaveChat = () => {
    if (!socketRef.current) return;

    socketRef.current.emit("leave");
    joinedRef.current = false;
    setJoined(false);
  };

  /* ================= UI ================= */
  if (!joined) {
    return (
      <button
        onClick={() => setJoined(true)}
        style={{
          padding: "12px 24px",
          borderRadius: "999px",
          background: "white",
          color: "#1f2937",
          fontWeight: "600",
          border: "none",
          cursor: "pointer",
        }}
      >
        🚀 Rejoin Chat
      </button>
    );
  }

  return (
    <div className="chat-box">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <strong style={{ color: "white" }}>Live Chat</strong>
        <button
          onClick={leaveChat}
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.2)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.3)",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Leave
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.user === "system"
                ? "chat-system-message"
                : "chat-user-message"
            }
          >
            {msg.user !== "system" && (
              <strong className="chat-username">{msg.user}:</strong>
            )}
            <span className="chat-text">{msg.text}</span>
            {msg.time && <span className="chat-time"> {msg.time}</span>}
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <style>{`
        .chat-box {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 16px;
          backdrop-filter: blur(14px);
          color: white;
        }

        .chat-messages {
          max-height: 260px;
          overflow-y: auto;
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .chat-user-message {
          color: white;
          font-size: 14px;
        }

        .chat-system-message {
          color: white;
          font-size: 13px;
          text-align: center;
          opacity: 0.85;
          font-style: italic;
        }

        .chat-username {
          margin-right: 6px;
          font-weight: 600;
        }

        .chat-text {
          color: white;
        }

        .chat-time {
          font-size: 11px;
          opacity: 0.7;
          margin-left: 6px;
        }

        .chat-input-row {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .chat-input-row input {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.2);
          color: white;
          outline: none;
        }

        .chat-input-row input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .chat-input-row button {
          padding: 10px 16px;
          border-radius: 10px;
          border: none;
          background: white;
          color: #1f2937;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
