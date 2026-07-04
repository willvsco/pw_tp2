import { Request, Response } from "express";

export function getAbout(req: Request, res: Response): void {
    res.render("about");
}

export function getLorem(req: Request, res: Response): void {
    const qtd = Number(req.params.qtd);

    if (isNaN(qtd) || qtd <= 0) {
        res.status(400).send("Quantidade inválida.");
        return;
    }

    const { LoremIpsum } = require("lorem-ipsum");
    const lorem = new LoremIpsum({
        sentencesPerParagraph: { min: 3, max: 7 },
        wordsPerSentence: { min: 5, max: 12 }
    });

    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lorem Ipsum</title>
</head>
<body>`;

    for (let i = 0; i < qtd; i++) {
        html += `<p>${lorem.generateParagraphs(1)}</p>`;
    }

    html += `</body>
</html>`;

    res.send(html);
}

export function getHb1(req: Request, res: Response): void {
    res.render("hb1", { variavel: "Olá, Handlebars!" });
}

export function getHb2(req: Request, res: Response): void {
    res.render("hb2", { condicao: true });
}

export function getHb3(req: Request, res: Response): void {
    res.render("hb3", { itens: ["Item 1", "Item 2", "Item 3", "Item 4"] });
}

export function getHb4(req: Request, res: Response): void {
    const technologies = [
        { name: 'Express', type: 'Framework', poweredByNodejs: true },
        { name: 'Laravel', type: 'Framework', poweredByNodejs: false },
        { name: 'React', type: 'Library', poweredByNodejs: true },
        { name: 'Handlebars', type: 'Engine View', poweredByNodejs: true },
        { name: 'Django', type: 'Framework', poweredByNodejs: false },
        { name: 'Docker', type: 'Virtualization', poweredByNodejs: false },
        { name: 'Sequelize', type: 'ORM tool', poweredByNodejs: true },
    ];
    res.render("hb4", { tecnologias: technologies });
}

export function getHome(req: Request, res: Response): void {
    if (!req.session.user) {
        res.redirect("/login");
        return;
    }
    res.render("game", { layout: false, user: req.session.user });
}
