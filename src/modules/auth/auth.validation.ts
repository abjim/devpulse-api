import { StatusCodes } from "http-status-codes";
import { Role } from "../../types";
import { AppError } from "../../middlewares/errorHandler";

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginBody {
  email: string;
  password: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateSignup = (body: Record<string, unknown>): SignupBody => {
  const name = body.name;
  const email = body.email;
  const password = body.password;
  const role = body.role || "contributor";

  if (typeof name !== "string" || name.trim().length < 2) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Name must be at least 2 characters long");
  }

  if (typeof email !== "string" || !emailRegex.test(email)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Valid email is required");
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password must be at least 6 characters long");
  }

  if (role !== "contributor" && role !== "maintainer") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Role must be contributor or maintainer");
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role
  };
};

export const validateLogin = (body: Record<string, unknown>): LoginBody => {
  const email = body.email;
  const password = body.password;

  if (typeof email !== "string" || !emailRegex.test(email)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Valid email is required");
  }

  if (typeof password !== "string" || password.length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password is required");
  }

  return {
    email: email.trim().toLowerCase(),
    password
  };
};