import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/response";
import { validateLogin, validateSignup } from "./auth.validation";
import { createUser, loginUser } from "./auth.service";

export const signup = async (req: Request, res: Response) => {
  const payload = validateSignup(req.body);
  const user = await createUser(payload);

  sendSuccess(res, StatusCodes.CREATED, "User registered successfully", user);
};

export const login = async (req: Request, res: Response) => {
  const payload = validateLogin(req.body);
  const result = await loginUser(payload);

  sendSuccess(res, StatusCodes.OK, "Login successful", result);
};