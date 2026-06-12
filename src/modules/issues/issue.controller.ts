import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../../types";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middlewares/errorHandler";

import {
  validateCreateIssue,
  validateIssueFilters,
  parseIssueId
} from "./issue.validation";

import {
  insertIssue,
  findIssues,
  findIssueById
} from "./issue.service";

export const createIssue = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  const payload = validateCreateIssue(req.body);
  const issue = await insertIssue(payload, req.user.id);

  sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
};

export const getIssues = async (req: AuthRequest, res: Response) => {
  const filters = validateIssueFilters(req.query);
  const issues = await findIssues(filters);

  sendSuccess(res, StatusCodes.OK, "Issues retrived successfully", issues);
};

export const getIssue = async (req: AuthRequest, res: Response) => {
  const issueId = parseIssueId(req.params.id);
  const issue = await findIssueById(issueId);

  sendSuccess(res, StatusCodes.OK, "Issue retrived successfully", issue);
};

