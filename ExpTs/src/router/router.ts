import { Router } from "express";
import {
    getAbout,
    getLorem,
    getHb1,
    getHb2,
    getHb3,
    getHb4,
    getHome
} from "../controllers/main";
import {
    listMajors,
    showCreateForm,
    createMajor,
    showEditForm,
    updateMajor,
    deleteMajor
} from "../controllers/majorController";
import {
    showRegisterForm,
    register,
    showLoginForm,
    login,
    logout
} from "../controllers/authController";
import {
    showGame,
    saveScore
} from "../controllers/gameController";
import { showRanking } from "../controllers/rankingController";

const router = Router();

router.get("/", getHome);
router.get("/about", getAbout);
router.get("/lorem/:qtd", getLorem);
router.get("/hb1", getHb1);
router.get("/hb2", getHb2);
router.get("/hb3", getHb3);
router.get("/hb4", getHb4);

router.get("/majors", listMajors);
router.get("/majors/create", showCreateForm);
router.post("/majors/create", createMajor);
router.get("/majors/:id/edit", showEditForm);
router.post("/majors/:id/edit", updateMajor);
router.post("/majors/:id/delete", deleteMajor);

router.get("/register", showRegisterForm);
router.post("/register", register);
router.get("/login", showLoginForm);
router.post("/login", login);
router.get("/logout", logout);

router.get("/game", showGame);
router.post("/game/save-score", saveScore);

router.get("/ranking", showRanking);

export default router;
