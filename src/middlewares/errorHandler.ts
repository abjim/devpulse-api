import { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { sendError } from "../utils/response";
import { env } from "../config/env";

export class AppError extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(statusCode: number, message: string, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.message, error.errors || null);
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    sendError(res, StatusCodes.CONFLICT, "Duplicate resource found", error);
    return;
  }

  sendError(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Internal Server Error",
    env.nodeEnv === "development" ? error : null
  );

  next;
};