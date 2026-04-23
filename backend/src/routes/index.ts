import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import aiEnhanceRouter from "./ai-enhance";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/contact", contactRouter);
router.use("/ai-enhance", aiEnhanceRouter);

export default router;
