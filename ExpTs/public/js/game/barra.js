/**
 * @fileoverview Define o estado das teclas de controle.
 */

/**
 * Objeto que mapeia o estado (pressionada ou não) das teclas de controle.
 * @type {Object.<string, boolean>}
 */
export const teclas = {
    w: false,
    s: false,
    a: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
}

/**
 * Classe que representa a barra controlada pelo jogador.
 */
export class Barra {
    /**
     * Cria uma nova instância de Barra.
     * @param {string} id - O ID do elemento HTML da barra.
     * @param {Object} controles - Objeto contendo os mapeamentos de teclas (cima, baixo, esquerda, direita).
     */
    constructor(id, controles) {
        /** @type {HTMLElement} */
        this.elemento = document.getElementById(id);
        /** @type {number} Posição X da barra. */
        this.x = 0;
        /** @type {number} Posição Y da barra. */
        this.y = 0;
        /** @type {number} Velocidade base no eixo X. */
        this.velocidadeX = 12;
        /** @type {number} Velocidade base no eixo Y. */
        this.velocidadeY = 12;
        /** @type {number} Acúmulo de força no impacto X. */
        this.forcaImpactoX = 0;
        /** @type {number} Acúmulo de força no impacto Y. */
        this.forcaImpactoY = 0;
        /** @type {Object} Mapeamento de teclas de controle. */
        this.controles = controles;
        /** @type {number} Velocidade instantânea calculada para colisão no eixo X. */
        this.velocidadeXInstantanea = 0;
        /** @type {number} Velocidade instantânea calculada para colisão no eixo Y. */
        this.velocidadeYInstantanea = 0;
        /** @type {boolean} Indica se a movimentação da barra está travada. */
        this.travado = false;
        /** @type {boolean} Indica se a barra tem permissão para invadir o campo adversário. */
        this.podeInvadir = false;
        
        this.alterarTamanho(100, 25);
        this.alterarCor("black");
    }

    /**
     * Altera o tamanho da barra no DOM.
     * @param {number} altura - Altura em pixels.
     * @param {number} largura - Largura em pixels.
     */
    alterarTamanho(altura, largura) {
        this.elemento.style.height = altura + "px";
        this.elemento.style.width = largura + "px";
    }

    /**
     * Reseta a posição e os atributos de velocidade da barra.
     */
    resetar(){
        this.x = 0;
        this.y = 0;
        this.velocidadeX = 12;
        this.velocidadeY = 12;
        this.forcaImpactoX = 0;
        this.forcaImpactoY = 0;
    }

    /**
     * Altera a cor de fundo da barra.
     * @param {string} cor - String da cor (hex, rgb, nome).
     */
    alterarCor(cor) {
        this.elemento.style.backgroundColor = cor;
    }

    /**
     * Altera as velocidades base da barra.
     * @param {number} velocidadeX - Velocidade no eixo X.
     * @param {number} velocidadeY - Velocidade no eixo Y.
     */
    alterarVelocidade(velocidadeX, velocidadeY) {
        this.velocidadeX = velocidadeX;
        this.velocidadeY = velocidadeY;
    }

    /**
     * Atualiza a posição da barra com base nas teclas pressionadas e nos limites de campo.
     * @param {Object.<string, boolean>} teclasPressionadas - Estado atual das teclas.
     * @param {number} minX - Limite mínimo no eixo X.
     * @param {number} maxX - Limite máximo no eixo X.
     * @param {number} minY - Limite mínimo no eixo Y.
     * @param {number} maxY - Limite máximo no eixo Y.
     */
    atualizarPosicao(teclasPressionadas, minX, maxX, minY, maxY) {
        if (this.travado){
            return;
        }
        if (teclasPressionadas[this.controles.cima]) {
            this.y -= this.velocidadeY / 2;
            this.forcaImpactoY -= 0.5; 
        } else if (teclasPressionadas[this.controles.baixo]) {
            this.y += this.velocidadeY / 2;
            this.forcaImpactoY += 0.5;
        } else {
            this.forcaImpactoY = 0; 
        }

        if (teclasPressionadas[this.controles.esquerda]) {
            this.x -= this.velocidadeX / 2;
            this.forcaImpactoX -= 0.5;
        } else if (teclasPressionadas[this.controles.direita]) {
            this.x += this.velocidadeX / 2;
            this.forcaImpactoX += 0.5;
        } else {
            this.forcaImpactoX = 0;
        }

        this.forcaImpactoX = Math.max(-15, Math.min(15, this.forcaImpactoX));
        this.forcaImpactoY = Math.max(-15, Math.min(15, this.forcaImpactoY));

        this.x = Math.max(minX, Math.min(maxX, this.x));
        this.y = Math.max(minY, Math.min(maxY, this.y));

        this.elemento.style.transform = "translate(" + this.x + "px," + this.y + "px)";
        
        this.velocidadeXInstantanea = this.forcaImpactoX;
        this.velocidadeYInstantanea = this.forcaImpactoY;
    }
}