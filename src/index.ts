import express from "express";
import { engine } from "express-handlebars";
import dotenv from "dotenv";
import path from "path";
import { env } from "./utils/validateEnv";
import { logger } from "./middlewares/logger";
import router from "./router/router";
import { technologiesHelper } from "./utils/helpers";

dotenv.config();

const app = express();

const PORT = env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");

app.use("/css", express.static(path.join(publicPath, "css")));
app.use("/js", express.static(path.join(publicPath, "js")));
app.use("/img", express.static(path.join(publicPath, "img")));

app.engine("handlebars", engine({
    helpers: {
        technologiesHelper
    }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(logger("complete"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
