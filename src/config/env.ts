import dotenv from "dotenv";

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is missing from environment variables`);
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  nodeEnv: process.env.NODE_ENV || "development"
};