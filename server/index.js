import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000",
      "https://lyrablogwebsite-frontend.onrender.com",

    ],
    methods: ["GET", "POST"],
  },
     
  pingTimeout: 60000,
  pingInterval: 25000,
});


const users = new Map();

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  
  socket.on("join", ({ username, room }, ack) => {
    if (!username || !room) {
      return ack?.({ ok: false });
    }

    if (users.has(socket.id)) {
      const prev = users.get(socket.id);
      socket.leave(prev.room);
      users.delete(socket.id);
    }

    users.set(socket.id, { username, room });
    socket.join(room);

    socket.to(room).emit("message", {
      user: "system",
      text: `${username} joined the chat`,
      time: new Date().toLocaleTimeString(),
    });


    ack?.({ ok: true });
  });


  socket.on("send_message", ({ text }) => {
    const user = users.get(socket.id);
    if (!user || !text?.trim()) return;

    io.to(user.room).emit("message", {
      user: user.username,
      text,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("leave", () => {
    const user = users.get(socket.id);
    if (!user) return;

    socket.leave(user.room);
    users.delete(socket.id);

    socket.to(user.room).emit("message", {
      user: "system",
      text: `${user.username} left the chat`,
      time: new Date().toLocaleTimeString(),
    });
  });


  socket.on("disconnect", (reason) => {
    const user = users.get(socket.id);
    if (!user) return;

    socket.to(user.room).emit("message", {
      user: "system",
      text: `${user.username} left the chat`,
      time: new Date().toLocaleTimeString(),
    });

    users.delete(socket.id);
    console.log("❌ Disconnected:", socket.id, reason);
  });
});

server.listen(5002, () => {
  console.log("🚀 Chat server running on port 5002");
});
