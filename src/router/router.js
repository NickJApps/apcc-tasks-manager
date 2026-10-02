import express from "express";
// import * as controller from "../controllers/сontroller.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.render("pages/home");
});

// router.get("/catalog", controller.catalog);

export default router;