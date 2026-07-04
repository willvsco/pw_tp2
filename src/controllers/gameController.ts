import { Request, Response } from "express";
import * as userService from "../services/userService";

export function showGame(req: Request, res: Response): void {
    res.render("game", { layout: false, user: req.session.user });
}

export async function saveScore(req: Request, res: Response): Promise<void> {
    const { score } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
        res.status(401).json({ error: "Não autorizado." });
        return;
    }

    if (typeof score !== "number" || score < 0) {
        res.status(400).json({ error: "Pontuação inválida." });
        return;
    }

    await userService.saveScore(userId, score);
    res.json({ success: true });
}
