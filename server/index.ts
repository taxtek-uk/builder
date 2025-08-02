import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { saveWallConfig, getWallConfig, getAllWallConfigs } from "./routes/wall-configs";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Wall configuration routes
  app.post("/api/wall-configs", saveWallConfig);
  app.get("/api/wall-configs/:id", getWallConfig);
  app.get("/api/wall-configs", getAllWallConfigs);

  return app;
}
