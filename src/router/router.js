import express from "express";
import * as controller from "../controllers/сontroller.js";

const router = express.Router();

router.get("/", controller.home);
router.get("/create", controller.create);
router.get("/details", controller.details);
router.get("/upload", controller.upload);

router.get("/details/:itn", controller.details);
router.get("/progress", controller.getProgress);

router.get("/task/byitn/:itn", controller.getSellerDetailsByItn);
router.post("/task/create", controller.createTarget);

router.delete("/task/delete/:itn", controller.deleteCase);

router.get("/search", controller.search);

router.put("/mark/:itn", controller.updateImportant);
router.put("/completed/:itn", controller.updateCompleted);

router.put("/update/:itn", controller.update);
router.post("/export", controller.exportCases);

export default router;