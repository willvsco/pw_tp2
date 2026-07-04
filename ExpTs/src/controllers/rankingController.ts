import { Request, Response } from "express";
import * as userService from "../services/userService";

export async function showRanking(req: Request, res: Response): Promise<void> {
    const ranking = await userService.getTopRanking();
    res.render("ranking", { ranking, user: req.session.user });
}
