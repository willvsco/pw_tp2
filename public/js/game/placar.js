/**
 * @fileoverview Gerencia os elementos de pontuação e lógica do placar.
 */

/** @type {HTMLElement} Elemento DOM da pontuação do Jogador 1. */
export const pontuacao1 = document.getElementById("pontuacao1");

/** @type {HTMLElement} Elemento DOM da pontuação do Jogador 2. */
export const pontuacao2 = document.getElementById("pontuacao2");

/**
 * Incrementa a pontuação de um jogador.
 * @param {HTMLElement} pontuacao - O elemento DOM da pontuação a ser incrementado.
 * @param {number} [ponto=1] - A quantidade de pontos a adicionar.
 */
export function incrementarPontuacao(pontuacao, ponto = 1){
    pontuacao.textContent = parseInt(pontuacao.textContent) + ponto;
    console.log(`${pontuacao.id} incrementado em ${ponto} ponto(s).\nvalor atual: ${pontuacao.textContent}`)
}

/**
 * Redefine ambas as pontuações para zero.
 */
export function zerarPontuacao(){
    pontuacao1.textContent = 0;
    pontuacao2.textContent = 0;
    console.log("placares zerados");
}