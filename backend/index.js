import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import pool from "./config/database.js";
import authRouter from "./routes/authRoutes.js";
import ticketRouter from "./routes/ticketRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 8383;
const FrontendAccess = process.env.FRONTEND_ACCESS
pool
  .connect()
  .then(() => console.log("Database connected ✅"))
  .catch((err) => console.error("Database connection error ❌", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // <-- Handles form data
app.use(cookieParser());
app.use(cors({ origin: FrontendAccess, credentials: true }));

//api endpoints
app.use("/api/auth", authRouter);//authentication routes
app.use("/api/ticket", ticketRouter);//ticketing routes
app.use("/api/user", userRouter);//user routes

try {
  app.listen(PORT, () => console.log(`🚀 Server is running on port: ${PORT}`));
} catch (err) {
  console.error("❌ Server startup error:", err);
}
