import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from "../../types";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../middlewares/errorHandler";
import {
  parseIssueId,
  validateCreateIssue,
  validateIssueFilters,
  validateUpdateIssue
} from "./issue.validation";
import {
  deleteIssueById,
  findIssueById,
  findIssues,
  insertIssue,
  updateIssueById
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
  const issueId = parseIssueId(req.params.id as string);
  const issue = await findIssueById(issueId);

  sendSuccess(res, StatusCodes.OK, "Issue retrived successfully", issue);
};

export const updateIssue = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required");
  }

  const issueId = parseIssueId(req.params.id as string);
  const payload = validateUpdateIssue(req.body);

  const updatedIssue = await updateIssueById(
    issueId,
    payload,
    req.user.id,
    req.user.role
  );

  sendSuccess(res, StatusCodes.OK, "Issue updated successfully", updatedIssue);
};

export const deleteIssue = async (req: AuthRequest, res: Response) => {
  const issueId = parseIssueId(req.params.id as string);
  await deleteIssueById(issueId);

  sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
};