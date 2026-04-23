import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

/**
 * Trust the first proxy hop (Replit edge). Without this, every client appears
 * to share the proxy's IP and rate-limiting is meaningless. With it, X-Forwarded-For
 * is parsed correctly and per-IP buckets actually work.
 */
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : true;

app.use(
  cors({
    origin: allowedOrigins as string[] | boolean,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Use the library's IPv6-safe key generator so v4 + v6 both bucket correctly.
const ipKey = (req: express.Request, res: express.Response): string =>
  ipKeyGenerator(req.ip ?? "unknown", 56) || "unknown";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  message: { error: "Too many requests, please try again later." },
});

/**
 * Contact form: 5 successful submissions per 15min per IP. We deliberately do NOT
 * skip failed requests — failed validation also counts so a bot probing the form
 * burns its budget the same as a real user.
 */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  message: {
    error: "You have sent several messages recently. Please try again in 15 minutes, or email hello@airfnssoftwares.com directly.",
  },
});

/**
 * Burst limiter on top of the contact limiter — 1 attempt per 8 seconds per IP.
 * Catches automated form-fillers that loop without honoring delays.
 */
const contactBurstLimiter = rateLimit({
  windowMs: 8 * 1000,
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  message: { error: "Please slow down and try again in a few seconds." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKey,
  message: {
    error: "You've reached the hourly limit for AI enhancements (20 per hour). Please send your message as written, or try again later.",
  },
});

app.use("/api", globalLimiter);
app.use("/api/contact", contactBurstLimiter, contactLimiter);
app.use("/api/ai-enhance", aiLimiter);

app.use("/api", router);

export default app;
