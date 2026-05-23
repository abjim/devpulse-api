import { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
) => {
  if (data === undefined) {
    return res.status(statusCode).json({
      success: true,
      message
    });
  }

  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors: unknown = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};