import { Request, Response } from "express";
import * as userService from "../services/userService";
import * as majorService from "../services/majorService";

export async function showRegisterForm(req: Request, res: Response): Promise<void> {
    const majors = await majorService.getAllMajors();
    res.render("register", { majors, user: req.session.user });
}

export async function register(req: Request, res: Response): Promise<void> {
    const { fullName, email, password, confirmPassword, majorId } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !majorId) {
        const majors = await majorService.getAllMajors();
        res.status(400).render("register", { majors, error: "Todos os campos são obrigatórios.", user: req.session.user });
        return;
    }

    if (password !== confirmPassword) {
        const majors = await majorService.getAllMajors();
        res.status(400).render("register", { majors, error: "As senhas não coincidem.", user: req.session.user });
        return;
    }

    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
        const majors = await majorService.getAllMajors();
        res.status(400).render("register", { majors, error: "Este email já está cadastrado.", user: req.session.user });
        return;
    }

    const majorIdNum = parseInt(majorId, 10);
    if (isNaN(majorIdNum)) {
        const majors = await majorService.getAllMajors();
        res.status(400).render("register", { majors, error: "Curso inválido selecionado.", user: req.session.user });
        return;
    }

    await userService.createUser(fullName, email, password, majorIdNum);
    res.redirect("/login");
}

export async function showLoginForm(req: Request, res: Response): Promise<void> {
    res.render("login", { user: req.session.user });
}

export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).render("login", { error: "Email e senha são obrigatórios.", user: req.session.user });
        return;
    }

    const user = await userService.findByEmail(email);
    if (!user) {
        res.status(400).render("login", { error: "Email ou senha inválidos.", user: req.session.user });
        return;
    }

    const valid = await userService.validatePassword(password, user.password);
    if (!valid) {
        res.status(400).render("login", { error: "Email ou senha inválidos.", user: req.session.user });
        return;
    }

    req.session.user = { id: user.id, fullName: user.fullName, email: user.email, majorId: user.majorId };
    res.redirect("/");
}

export function logout(req: Request, res: Response): void {
    req.session.destroy(() => {
        res.redirect("/");
    });
}
