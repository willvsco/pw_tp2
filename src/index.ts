import express from "express";
import { engine } from "express-handlebars";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { env } from "./utils/validateEnv";
import { logger } from "./middlewares/logger";
import router from "./router/router";
import { technologiesHelper } from "./utils/helpers";
import "./types/session";

dotenv.config();

const app = express();

const PORT = env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");

app.use("/css", express.static(path.join(publicPath, "css")));
app.use("/js", express.static(path.join(publicPath, "js")));
app.use("/img", express.static(path.join(publicPath, "img")));
app.use("/assets", express.static(path.join(publicPath, "assets")));

app.engine("handlebars", engine({
    helpers: {
        technologiesHelper,
        add: (a: number, b: number) => a + b,
    }
}));
app.set("view engine", "handlebars");
const viewsPath = fs.existsSync(path.join(__dirname, "views")) ? path.join(__dirname, "views") : path.join(__dirname, "../src/views");
app.set("views", viewsPath);

app.use(session({
    secret: "pw-tp2-secret-key",
    resave: false,
    saveUninitialized: false,
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.use(logger("complete"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
