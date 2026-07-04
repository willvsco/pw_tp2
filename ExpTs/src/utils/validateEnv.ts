import dotenv from "dotenv";
import { cleanEnv, port, str } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
    PORT: port(),
    NODE_ENV: str({
        choices: ["development", "production", "test"],
    }),
    LOGS_PATH: str(),
    DATABASE_URL: str(),
});