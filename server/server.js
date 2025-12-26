import userroutes from "./routes/userroutes.js";
import express from "express";
import cookieParser from "cookie-parser";
import blogroutes from "./routes/blogroutes.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "https://lyrablogwebsite-frontend.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());
app.use(cookieParser());


app.use("/api/blogs", (req, res, next) => {
  console.log(`Blog Route: ${req.method} ${req.path}`);
  next();
});

app.use("/api/users", userroutes);
app.use("/api/blogs", blogroutes);

mongoose
  .connect("mongodb+srv://preethi:preethi123@cluster0.csk7ao8.mongodb.net/blogtalentio")
  .then(() => {
    console.log("connected to db");
  })
  .catch((error) => {
    console.log(error);
  });
import { Server } from "socket.io";
import http from "http";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://lyrablogwebsite-frontend.onrender.com",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app;
