import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5002", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const ChatBox = ({ blogId, username }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [joined, setJoined] = useState(true);

  const joinedRef = useRef(false);
  const storageKey = `chat-history-${blogId}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, [storageKey]);


  useEffect(() => {
    if (!blogId || !username || !joined) return;

    const joinRoom = () => {
      if (joinedRef.current) return;

      socket.emit("join", { room: blogId, username });
      joinedRef.current = true;
    };

   
    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

    const handleMessage = (msg) => {
      setMessages((prev) => {
        const updated = [...prev, msg];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    };

    socket.on("message", handleMessage);

    
    socket.on("reconnect", () => {
      joinedRef.current = false;
      joinRoom();
    });

    return () => {
      socket.off("message", handleMessage);
      socket.off("reconnect");
    };
  }, [blogId, username, joined, storageKey]);

 
  const sendMessage = () => {
    if (!text.trim()) return;
    socket.emit("send_message", { text });
    setText("");
  };

  const leaveChat = () => {
    socket.emit("leave", { room: blogId, username });
    joinedRef.current = false;
    setJoined(false);
  };

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
