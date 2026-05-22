import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import aiEnhanceRouter from "./ai-enhance";
import dayaRouter from "./daya";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/contact", contactRouter);
router.use("/ai-enhance", aiEnhanceRouter);
router.use("/daya", dayaRouter);

export default router;
