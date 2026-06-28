import { Router } from "express";
import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        min: 3,
        max: 7
    },
    wordsPerSentence: {
        min: 5,
        max: 12
    }
});

const router = Router();

router.get("/about", (req, res) => {
    res.render("about");
});
router.get("/lorem/:qtd", (req, res) => {

    const qtd = Number(req.params.qtd);

    if (isNaN(qtd) || qtd <= 0) {
        return res.status(400).send("Quantidade inválida.");
    }

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Lorem Ipsum</title>
        </head>
        <body>
    `;

    for (let i = 0; i < qtd; i++) {
        html += `<p>${lorem.generateParagraphs(1)}</p>`;
    }

    html += `
        </body>
        </html>
    `;

    res.send(html);

});

export default router;