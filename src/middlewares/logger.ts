import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { env } from "../utils/validateEnv";

type LogType = "simple" | "complete";

export function logger(type: LogType) {

    return (req: Request, res: Response, next: NextFunction) => {

        const data = new Date().toLocaleString();

        let mensagem =
            `[${data}] ${req.method} ${req.originalUrl}`;

        if (type === "complete") {

            mensagem +=
                ` HTTP/${req.httpVersion} User-Agent: ${req.get("User-Agent")}`;
        }

        mensagem += "\n";

        const arquivo = path.resolve(env.LOGS_PATH);

        fs.mkdirSync(path.dirname(arquivo), { recursive: true });

        fs.appendFileSync(arquivo, mensagem);

        next();
    };

}