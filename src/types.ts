import { Request } from "express";

export type Role = "contributor" | "maintainer";
export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface TokenUser {
  id: number;
  name: string;
  role: Role;
}

export interface IssueRow {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

export interface ReporterInfo {
  id: number;
  name: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: TokenUser;
}