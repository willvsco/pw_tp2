import express from "express";
import { engine } from "express-handlebars";
import dotenv from "dotenv";
import path from "path";
import { env } from "./utils/validateEnv";
import { logger } from "./middlewares/logger";
import router from "./router/router";

const publicPath = `${process.cwd()}/public`;



dotenv.config();

const app = express();

const PORT = env.PORT || 3000;

app.use(router);
app.use(logger("complete"));
app.use("/css", express.static(`${publicPath}/css`));
app.use("/js", express.static(`${publicPath}/js`));
app.use("/img", express.static(`${publicPath}/img`));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.send("Servidor funcionando!");
});

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "../public")));

app.get("/about", (req, res) => {
    res.render("about");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});