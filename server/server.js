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
    origin: ["http://localhost:3000", "http://localhost:3001","https://lyrablogwebsite-frontend.onrender.com/"],
    credentials: true,
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
  .connect("mongodb+srv://preethi:preethi123@cluster0.csk7ao8.mongodb.net/")
  .then(() => {
    console.log("connected to db");
  })
  .catch((error) => {
    console.log(error);
  });
app.listen(5001, () => {
  console.log("server started on port 5001");
});

export default app;
