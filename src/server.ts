import express, { json, Application } from "express";
import cors from "cors";
import "dotenv/config"
import router from "./router";

const app: Application = express();

app.use(cors());
app.use(json());
app.use("/api", router);

export default app;
