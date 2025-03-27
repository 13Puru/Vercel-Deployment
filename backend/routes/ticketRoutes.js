import express from "express";
import { authMiddleware } from "../middleware/middleware.js";
import multer from "multer";
import {
  assignTickets,
  closeTicket,
  createTicket,
  getTickets,
  getTicketStatus,
  replyToResponse,
  resolveTicket,
  selfAssignTicket,
  updateTicket,
} from "../controllers/ticketControllers.js";

const ticketRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Updated route to handle file uploads for ticket creation
ticketRouter.post("/create-ticket", authMiddleware, upload.single("attachment"), createTicket);
ticketRouter.get("/get-ticket", authMiddleware, getTickets);
ticketRouter.post("/assign", authMiddleware, assignTickets);
ticketRouter.post("/self-assign", authMiddleware, selfAssignTicket);
ticketRouter.post("/resolve", authMiddleware, resolveTicket);
ticketRouter.post("/close", authMiddleware, closeTicket);
ticketRouter.post("/respond", authMiddleware, updateTicket);
ticketRouter.post("/reply", authMiddleware, replyToResponse);
ticketRouter.get("/ticket-stat/:user_id", authMiddleware, getTicketStatus);
ticketRouter.get("/fetch-ticket-details", authMiddleware, (req, res) => {
  console.log("✅ Access granted to:", req.user);
  res.json({ message: "Success", data: [] });
});

export default ticketRouter;
