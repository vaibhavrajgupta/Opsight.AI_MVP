import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
// import router from "./routes";

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(compression());
app.use(cookieParser());
dotenv.config();

import apis from "../infrastructure/routes/index.js";

app.use("/api", apis);
export default app;
