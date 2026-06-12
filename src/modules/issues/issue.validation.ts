import { StatusCodes } from "http-status-codes";
import { IssueStatus, IssueType } from "../../types";
import { AppError } from "../../middlewares/errorHandler";

export interface CreateIssueBody {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

export interface IssueFilters {
  sort: "newest" | "oldest";
  type?: IssueType;
  status?: IssueStatus;
}

const issueTypes: IssueType[] = ["bug", "feature_request"];
const statuses: IssueStatus[] = ["open", "in_progress", "resolved"];


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

const parseStatus = (status: unknown): IssueStatus => {
  if (!statuses.includes(status as IssueStatus)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Status must be open, in_progress, or resolved");
  }

  return status as IssueStatus;
};



export const validateCreateIssue = (body: Record<string, unknown>): CreateIssueBody => {
  return {
    title: parseTitle(body.title),
    description: parseDescription(body.description),
    type: parseType(body.type)
  };
};

export const validateUpdateIssue = (body: Record<string, unknown>): UpdateIssueBody => {
  const payload: UpdateIssueBody = {};

  if (body.title !== undefined) payload.title = parseTitle(body.title);
  if (body.description !== undefined) payload.description = parseDescription(body.description);
  if (body.type !== undefined) payload.type = parseType(body.type);
  if (body.status !== undefined) payload.status = parseStatus(body.status);

  if (Object.keys(payload).length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "No valid update field was provided");
  }

  return payload;
};

export const validateIssueFilters = (query: Record<string, unknown>): IssueFilters => {
  const filters: IssueFilters = {
    sort: query.sort === "oldest" ? "oldest" : "newest"
  };

  if (query.type !== undefined) filters.type = parseType(query.type);
  if (query.status !== undefined) filters.status = parseStatus(query.status);

  return filters;
};

export const parseIssueId = (id: string): number => {
  const issueId = Number(id);

  if (!Number.isInteger(issueId) || issueId <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid issue id");
  }

  return issueId;
};