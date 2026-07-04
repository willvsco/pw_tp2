import { Request, Response } from "express";
import * as majorService from "../services/majorService";

export async function listMajors(req: Request, res: Response): Promise<void> {
    const majors = await majorService.getAllMajors();
    res.render("majors/index", { majors, user: req.session.user });
}

export async function showCreateForm(req: Request, res: Response): Promise<void> {
    res.render("majors/create", { user: req.session.user });
}

export async function createMajor(req: Request, res: Response): Promise<void> {
    const { name } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        res.status(400).send("Nome inválido.");
        return;
    }
    await majorService.createMajor(name.trim());
    res.redirect("/majors");
}

export async function showEditForm(req: Request, res: Response): Promise<void> {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
        res.status(400).send("ID inválido.");
        return;
    }
    const major = await majorService.getMajorById(id);
    if (!major) {
        res.status(404).send("Curso não encontrado.");
        return;
    }
    res.render("majors/edit", { major, user: req.session.user });
}

export async function updateMajor(req: Request, res: Response): Promise<void> {
    const id = parseInt(String(req.params.id), 10);
    const { name } = req.body;
    if (isNaN(id) || !name || typeof name !== "string" || name.trim().length === 0) {
        res.status(400).send("Dados inválidos.");
        return;
    }
    await majorService.updateMajor(id, name.trim());
    res.redirect("/majors");
}

export async function deleteMajor(req: Request, res: Response): Promise<void> {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
        res.status(400).json({ error: "ID inválido." });
        return;
    }
    try {
        await majorService.deleteMajor(id);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: "Não é possível excluir o curso, pois existem usuários vinculados a ele." });
    }
}
