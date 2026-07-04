/**
 * Classe que representa o disco (puck) do jogo.
 */
export class Disco {
    /**
     * Cria uma nova instância de Disco.
     * @param {string} id - O ID do elemento HTML do disco.
     * @param {number} x - Posição inicial no eixo X.
     * @param {number} y - Posição inicial no eixo Y.
     */
    constructor(id, x, y) {
        /** @type {HTMLElement} Referência ao elemento DOM do disco. */
        this.id = document.getElementById(id);
        
        /** @type {number} Raio do disco em pixels. */
        this.raio = 30;
        /** @type {number} Posição X atual. */
        this.x = x;
        /** @type {number} Posição Y atual. */
        this.y = y + this.raio;

        /** @type {number} Velocidade no eixo X. */
        this.vx = 0;
        /** @type {number} Velocidade no eixo Y. */
        this.vy = 0;

        /** @type {number} Coeficiente de atrito aplicado à velocidade a cada frame. */
        this.atrito = 0.998;
        /** @type {number} Velocidade máxima permitida para o disco. */
        this.velocidadeMaxima = 100;
        /** @type {number} Limite abaixo do qual a velocidade é zerada. */
        this.limiteParada = 0.15;

        /** @type {string} Cor de fundo do disco. */
        this.cor = "black";
        if (this.id) {
            this.id.style.backgroundColor = this.cor;
        }
        
        /** @type {?number} ID do timeout/intervalo para controle de retorno após ponto. */
        this.timeoutRetorno = null;
    }

    /**
     * Atualiza a posição visual do disco no DOM com base nas coordenadas (x, y).
     */
    desenhar() {
        if (this.id) {
            this.id.style.left = `${this.x - this.raio}px`;
            this.id.style.top = `${this.y - this.raio}px`;
        }
    }
}
