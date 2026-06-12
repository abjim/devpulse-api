import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../../types";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middlewares/errorHandler";


export const createIssue = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  const payload = validateCreateIssue(req.body);
  const issue = await insertIssue(payload, req.user.id);

  sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
};