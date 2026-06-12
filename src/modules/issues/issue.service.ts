import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db";
import { IssueRow, ReporterInfo, Role } from "../../types";
import { AppError } from "../../middlewares/errorHandler";
import { CreateIssueBody, IssueFilters, UpdateIssueBody } from "./issue.validation";

const issueFields = "id, title, description, type, status, reporter_id, created_at, updated_at";

export const insertIssue = async (
  payload: CreateIssueBody,
  reporterId: number
): Promise<IssueRow> => {
  const result = await pool.query<IssueRow>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING ${issueFields}`,
    [payload.title, payload.description, payload.type, reporterId]
  );

  return result.rows[0];
};

const getReporterMap = async (reporterIds: number[]) => {
  const map = new Map<number, ReporterInfo>();
  const uniqueIds = [...new Set(reporterIds)];

  if (uniqueIds.length === 0) return map;

  // No JOIN is used because the assignment specifically restricted SQL JOIN.
  const users = await pool.query<ReporterInfo>(
    "SELECT id, name, role FROM users WHERE id = ANY($1::int[])",
    [uniqueIds]
  );

  users.rows.forEach((user) => map.set(user.id, user));
  return map;
};

const addReporterToIssues = async (issues: IssueRow[]) => {
  const reporterMap = await getReporterMap(issues.map((issue) => issue.reporter_id));

  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap.get(issue.reporter_id) || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
};

export const findIssues = async (filters: IssueFilters) => {
  const whereParts: string[] = [];
  const values: string[] = [];

  if (filters.type) {
    values.push(filters.type);
    whereParts.push(`type = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    whereParts.push(`status = $${values.length}`);
  }

  const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
  const sortSql = filters.sort === "oldest" ? "ASC" : "DESC";

  const result = await pool.query<IssueRow>(
    `SELECT ${issueFields}
     FROM issues
     ${whereSql}
     ORDER BY created_at ${sortSql}`,
    values
  );

  return addReporterToIssues(result.rows);
};

export const findIssueById = async (issueId: number) => {
  const result = await pool.query<IssueRow>(
    `SELECT ${issueFields} FROM issues WHERE id = $1`,
    [issueId]
  );

  if (result.rows.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  const issues = await addReporterToIssues(result.rows);
  return issues[0];
};

const findRawIssueById = async (issueId: number): Promise<IssueRow> => {
  const result = await pool.query<IssueRow>(
    `SELECT ${issueFields} FROM issues WHERE id = $1`,
    [issueId]
  );

  if (result.rows.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  return result.rows[0];
};

export const updateIssueById = async (
  issueId: number,
  payload: UpdateIssueBody,
  currentUserId: number,
  currentUserRole: Role
): Promise<IssueRow> => {
  const issue = await findRawIssueById(issueId);

  if (currentUserRole === "contributor") {
    if (issue.reporter_id !== currentUserId) {
      throw new AppError(StatusCodes.FORBIDDEN, "Contributors can update only their own issues");
    }

    if (issue.status !== "open") {
      throw new AppError(StatusCodes.CONFLICT, "Only open issues can be updated by contributors");
    }

    if (payload.status) {
      throw new AppError(StatusCodes.FORBIDDEN, "Contributors can not update issue status");
    }
  }

  const updates: string[] = [];
  const values: string[] = [];

  if (payload.title !== undefined) {
    values.push(payload.title);
    updates.push(`title = $${values.length}`);
  }

  if (payload.description !== undefined) {
    values.push(payload.description);
    updates.push(`description = $${values.length}`);
  }

  if (payload.type !== undefined) {
    values.push(payload.type);
    updates.push(`type = $${values.length}`);
  }

  if (payload.status !== undefined) {
    values.push(payload.status);
    updates.push(`status = $${values.length}`);
  }

  values.push(String(issueId));

  const result = await pool.query<IssueRow>(
    `UPDATE issues
     SET ${updates.join(", ")}
     WHERE id = $${values.length}
     RETURNING ${issueFields}`,
    values
  );

  return result.rows[0];
};

export const deleteIssueById = async (issueId: number): Promise<void> => {
  await findRawIssueById(issueId);
  await pool.query("DELETE FROM issues WHERE id = $1", [issueId]);
};