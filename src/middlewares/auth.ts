import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";
import { AuthRequest, Role, TokenUser } from "../types";
import { AppError } from "./errorHandler";

const isTokenUser = (payload: unknown): payload is TokenUser => {
  if (!payload || typeof payload !== "object") return false;

  const data = payload as Record<string, unknown>;

  return (
    typeof data.id === "number" &&
    typeof data.name === "string" &&
    (data.role === "contributor" || data.role === "maintainer")
  );
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next(new AppError(StatusCodes.UNAUTHORIZED, "Authorization token is required"));
    return;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (!isTokenUser(decoded)) {
      throw new Error("Token payload did not match expected shape");
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role
    };

    next();
  } catch (error) {
    next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired token", error));
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(StatusCodes.UNAUTHORIZED, "Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(StatusCodes.FORBIDDEN, "You are not allowed to perform this action"));
      return;
    }

    next();
  };
};