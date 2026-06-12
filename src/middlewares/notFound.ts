import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { sendError } from "../utils/response";

export const notFound: RequestHandler = (req, res) => {
  sendError(
    res,
    StatusCodes.NOT_FOUND,
    "Route not found",
    `${req.method} ${req.originalUrl}`
  );
};