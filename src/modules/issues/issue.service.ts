import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db";
import { IssueRow, ReporterInfo, Role } from "../../types";
import { AppError } from "../../middlewares/errorHandler";
import { CreateIssueBody, IssueFilters } from "./issue.validation";

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


