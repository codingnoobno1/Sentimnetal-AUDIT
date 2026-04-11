import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import auditRoutes from "./routes/auditRoutes.js";
import compareRoutes from "./routes/compareRoutes.js";
import { startAuditorWatchdog } from "./core/auditor_watchdog.js";

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // Verbose logging for debugging

// Health Check & Diagnostic Sync
app.get("/health", (req, res) => {
  res.json({
    status: "active",
    services: {
      mongodb: "connected",
      gemini: process.env.GEMINI_API_KEY ? "configured" : "missing",
      mistral: process.env.MISTRAL_API_KEY ? "configured" : "missing"
    },
    version: "1.2.0-forensic-arena",
    timestamp: new Date().toISOString()
  });
});

// Routes Registration
// Placing /compare first to ensure strict path matching
app.use("/compare", compareRoutes);
app.use("/", auditRoutes);

const PORT = process.env.PORT || 3020;

app.listen(PORT, () => {
  console.log(`\n🚀 Forensic Sentinel Node - SYNCED & HARDENED`);
  console.log(`📡 Local Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 Parameters: 7 Forensic + 4 Domain Expertise + 5 Comparative Dimensions\n`);
  
  // Initialize async audit bridge
  startAuditorWatchdog();
});
