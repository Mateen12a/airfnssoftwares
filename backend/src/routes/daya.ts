import { Router } from "express";
import { z } from "zod";
import { Registrant } from "../models/Registrant";
import { isConnected } from "../db";

const router = Router();

const EXPIRY = new Date("2026-05-27T23:59:59Z");

function isExpired(): boolean {
  return new Date() > EXPIRY;
}

function toTitleCase(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function checkAdmin(req: import("express").Request): boolean {
  const pass = process.env["DAYA_ADMIN_PASSWORD"];
  if (!pass) return false;
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token === pass;
}

router.post("/rsvp", async (req, res) => {
  if (!isConnected()) {
    res.status(503).json({ error: "service_unavailable", message: "Database not connected." });
    return;
  }

  if (isExpired()) {
    res.status(410).json({ error: "expired" });
    return;
  }

  const schema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid", message: parsed.error.errors[0]?.message });
    return;
  }

  const name = toTitleCase(parsed.data.name);
  const nameLower = name.toLowerCase();

  try {
    const existing = await Registrant.findOne({ nameLower });
    if (existing) {
      res.status(409).json({ error: "duplicate", name: existing.name });
      return;
    }

    const registrant = await Registrant.create({ name, nameLower });
    res.status(201).json({ success: true, name: registrant.name });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      const existing = await Registrant.findOne({ nameLower });
      res.status(409).json({ error: "duplicate", name: existing?.name ?? name });
      return;
    }
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/admin/verify", (req, res) => {
  const schema = z.object({ password: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid" });
    return;
  }

  const pass = process.env["DAYA_ADMIN_PASSWORD"];
  if (!pass) {
    res.status(503).json({ error: "not_configured" });
    return;
  }

  if (parsed.data.password === pass) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: "unauthorized" });
  }
});

router.get("/registrants", async (req, res) => {
  if (!checkAdmin(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  if (!isConnected()) {
    res.status(503).json({ error: "service_unavailable" });
    return;
  }

  const registrants = await Registrant.find({})
    .sort({ createdAt: -1 })
    .select("name createdAt -_id")
    .lean();

  res.json({ total: registrants.length, registrants });
});

router.get("/status", (_req, res) => {
  res.json({
    expired: isExpired(),
    expiresAt: EXPIRY.toISOString(),
    dbConnected: isConnected(),
  });
});

export default router;
