import express from "express";
import dotenv from "dotenv";
import expressLayouts from "express-ejs-layouts";
import router from "./src/router/router.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 4500;

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(expressLayouts);
app.set("layout", "layouts/main");
app.use("/", router);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    console.log('Server shutting down...');
    process.exit();
});
