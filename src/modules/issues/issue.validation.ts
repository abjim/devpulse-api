import { StatusCodes } from "http-status-codes";
import { IssueStatus, IssueType } from "../../types";
import { AppError } from "../../middlewares/errorHandler";

export interface CreateIssueBody {
  title: string;
  description: string;
  type: IssueType;
}

const issueTypes: IssueType[] = ["bug", "feature_request"];


const parseTitle = (title: unknown): string => {
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Title is required");
  }

  if (title.trim().length > 150) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Title can not be more than 150 characters");
  }

  return title.trim();
};

const parseDescription = (description: unknown): string => {
  if (typeof description !== "string" || description.trim().length < 20) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Description must be at least 20 characters long");
  }

  return description.trim();
};

const parseType = (type: unknown): IssueType => {
  if (!issueTypes.includes(type as IssueType)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Type must be bug or feature_request");
  }

  return type as IssueType;
};

export const validateCreateIssue = (body: Record<string, unknown>): CreateIssueBody => {
  return {
    title: parseTitle(body.title),
    description: parseDescription(body.description),
    type: parseType(body.type)
  };
};
