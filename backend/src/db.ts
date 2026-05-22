import mongoose from "mongoose";
import { logger } from "./lib/logger";

let connected = false;

export async function connectDB(): Promise<void> {
  if (connected) return;

  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    logger.warn("MONGODB_URI not set — Daya RSVP feature will be unavailable");
    return;
  }

  try {
    await mongoose.connect(uri);
    connected = true;
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
  }
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
