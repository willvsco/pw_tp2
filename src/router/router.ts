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

const router = Router();

router.get("/", getHome);
router.get("/about", getAbout);
router.get("/lorem/:qtd", getLorem);
router.get("/hb1", getHb1);
router.get("/hb2", getHb2);
router.get("/hb3", getHb3);
router.get("/hb4", getHb4);

export default router;
