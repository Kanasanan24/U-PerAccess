import "./types/express/index.js";

import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import express from "express";
import { readdirSync } from "fs";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
dotenv.config();
// initial app
const app = express();
const port = process.env.PORT ?? 8000;
// middleware
app.use(cors({
    origin: process.env.FRONT_DOMAIN,
    credentials: true
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
// rate limit
const limit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many attempts. Please wait a moment (15 minutes) and try again."
});
app.use("/api", limit);
// routes
const routesPath = path.join(__dirname, "routes");
const routes = readdirSync(routesPath);
routes.forEach(async(route:string) => {
    if (route.endsWith(".js")) {
        app.use("/api", require("./routes/" + route));
    }
});
// listen server
app.listen(port, () => console.log(`The server is running on http://localhost:${port}`))