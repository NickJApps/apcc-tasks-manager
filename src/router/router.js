import express from "express";
import * as controller from "../controllers/сontroller.js";

const router = express.Router();

router.get("/", controller.home);
router.get("/create", controller.create);
router.get("/details", controller.details);

export default router;