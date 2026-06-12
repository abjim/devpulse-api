import express from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { authRoutes } from "./modules/auth/auth.routes";
import { issueRoutes } from "./modules/issues/issue.routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "DevPulse API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

app.use(notFound);
app.use(errorHandler);