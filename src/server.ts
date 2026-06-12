import { app } from "./app";
import { pool } from "./config/db";
import { env } from "./config/env";

const main = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database connection successful");

    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Could not start server", error);
    process.exit(1);
  }
};

main();