import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db";
import { env } from "../../config/env";
import { PublicUser, TokenUser, UserRow } from "../../types";
import { AppError } from "../../middlewares/errorHandler";
import { LoginBody, SignupBody } from "./auth.validation";

const userPublicFields = "id, name, email, role, created_at, updated_at";

export const createUser = async (payload: SignupBody): Promise<PublicUser> => {
  const duplicateCheck = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1",
    [payload.email]
  );

  if (duplicateCheck.rows.length > 0) {
    throw new AppError(StatusCodes.CONFLICT, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, env.saltRounds);

  const result = await pool.query<PublicUser>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${userPublicFields}`,
    [payload.name, payload.email, hashedPassword, payload.role]
  );

  return result.rows[0];
};

export const loginUser = async (payload: LoginBody) => {
  const result = await pool.query<UserRow>(
    "SELECT * FROM users WHERE email = $1",
    [payload.email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const matched = await bcrypt.compare(payload.password, user.password);

  if (!matched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const tokenPayload: TokenUser = {
    id: user.id,
    name: user.name,
    role: user.role
  };

  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
  };

  const token = jwt.sign(tokenPayload, env.jwtSecret, options);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};