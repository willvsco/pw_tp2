/**
 * @fileoverview Gerencia o sistema de power-ups e seus efeitos.
 */

import {Disco} from './disco.js';

/**
 * Reinicia e toca um áudio.
 * @param {HTMLAudioElement} audio - O áudio a ser tocado.
 */
function tocarAudio(audio){
    audio.currentTime = 0;
    audio.play().catch(err => console.error("Erro:", err));
}

/**
 * Representa uma instância individual de um Power-Up na tela.
 */
class PowerUpInstance {
    /**
     * Cria uma nova instância de PowerUpInstance.
     * @param {string} tipo - O tipo do power-up (ex: 'duplicar', 'lentidao', 'supershot', 'aumentar_barra', 'invasao').
     * @param {Object} gameState - O estado global do jogo.
     * @param {Function} onCollect - Callback chamado quando o power-up é coletado.
     */
    constructor(tipo, gameState, onCollect) {
        this.tipo = tipo;
        this.gameState = gameState;
        this.onCollect = onCollect;
        this.x = 0;
        this.y = 0;
        this.raio = 20;
        /** @type {?HTMLElement} */
        this.elemento = null;
        this.ativoEmTela = false;
    }

    /**
     * Faz o spawn do power-up em uma posição aleatória do jogo.
     */
    spawn() {
        const jogo = document.getElementById("jogo");
        if (!jogo) return;

        const margin = 100;
        this.x = margin + Math.random() * (jogo.clientWidth - 2 * margin);
        this.y = margin + Math.random() * (jogo.clientHeight - 2 * margin);

        this.elemento = document.createElement("div");
        this.elemento.className = `superpoder ${this.tipo}`;
        
        if (this.tipo === 'duplicar') {
            this.elemento.innerHTML = "2x";
            this.elemento.style.backgroundColor = "gold";
        } else if (this.tipo === 'lentidao') {
            this.elemento.innerHTML = "S";
            this.elemento.style.backgroundColor = "blue";
        } else if (this.tipo === 'supershot') {
            this.elemento.innerHTML = "⚡";
            this.elemento.style.backgroundColor = "#ffcc00";
        } else if (this.tipo === 'aumentar_barra') {
            this.elemento.innerHTML = "↕"; 
            this.elemento.style.backgroundColor = "#00ffcc"; 
        } else if (this.tipo === 'invasao') {
            this.elemento.innerHTML = "↔";
            this.elemento.style.backgroundColor = "purple";
        }

        this.elemento.style.left = `${this.x - this.raio}px`;
        this.elemento.style.top = `${this.y - this.raio}px`;
        
        jogo.appendChild(this.elemento);
        this.ativoEmTela = true;
    }

    /**
     * Remove o elemento do power-up do DOM.
     */
    remover() {
        if (this.elemento) {
            this.elemento.remove();
            this.elemento = null;
        }
        this.ativoEmTela = false;
    }

    /**
     * Verifica colisão entre o power-up e um disco.
     * @param {Disco} disco - O disco a ser verificado.
     * @returns {boolean} True se colidiu, false caso contrário.
     */
    checarColisaoDisco(disco) {
        if (!this.ativoEmTela) return false;
        
        const dx = this.x - disco.x;
        const dy = this.y - disco.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia < this.raio + disco.raio) {
            this.onCollect(this, { tipo: 'disco', objeto: disco });
            return true;
        }
        return false;
    }

    /**
     * Verifica colisão entre o power-up e uma barra (atualmente não utilizado).
     * @param {Barra} barraL - A barra a ser verificada.
     * @returns {boolean} Sempre false nesta implementação.
     */
    checarColisaoBarra(barraL) {
        return false;
    }
}

/**
 * Classe principal que gerencia o sistema de superpoderes (power-ups).
 */
export class SuperPoder {
    /**
     * Cria o gerenciador de superpoderes.
     * @param {Object} gameState - O estado global do jogo.
     * @param {Barra} barra1 - Instância da barra 1.
     * @param {Barra} barra2 - Instância da barra 2.
     */
    constructor(gameState, barra1, barra2) {
            this.gameState = gameState;
            this.instancias = [];
            this.slowMoAtivo = false;
            /** @type {?number} */
            this.slowMoTimeout = null;
            this.superPoderAtivo = false;
            /** @type {?number} */
            this.timeoutBarra1 = null; 
            /** @type {?number} */
            this.timeoutBarra2 = null;
            /** @type {?number} */
            this.timeoutInvasao1 = null;
            /** @type {?number} */
            this.timeoutInvasao2 = null;
            this.timersSpawn = {
                duplicar: 0,
                lentidao: 0,
                supershot: 0,
                aumentar_barra: 0,
                invasao: 0
            };
            this.audioDouble = new Audio('/assets/efeitos_sonoros/double.mp3');
            this.audioDouble.volume = 1.0;
            this.audioSuperShotAtivado = new Audio('/assets/efeitos_sonoros/supershotativado.mp3');
            this.audioSuperShotAtivado.volume = 1.0;
            this.audioSlow = new Audio('/assets/efeitos_sonoros/slow.mp3');
            this.audioSlow.volume = 1.0;
            this.audioCrescer = new Audio('/assets/efeitos_sonoros/crescer.mp3');
            this.audioCrescer.volume = 1.0;
            this.barra1 = barra1;
            this.barra2 = barra2;
    }

    /**
     * Atualiza os timers de spawn dos power-ups.
     * @param {number} dt - Delta time desde o último frame.
     */
    update(dt) {
        for (const tipo in this.timersSpawn) {
            if (this.timersSpawn[tipo] > 0) {
                this.timersSpawn[tipo] -= dt;
                if (this.timersSpawn[tipo] <= 0) {
                    this.spawnTipo(tipo);
                }
            }
        }
    }

    /**
     * Spawna um novo power-up de um tipo específico se não houver um do mesmo tipo na tela.
     * @param {string} tipo - Tipo do power-up.
     */
    spawnTipo(tipo) {
        if (this.instancias.some(i => i.tipo === tipo)) {
            this.timersSpawn[tipo] = 2000;
            return;
        }

        const nova = new PowerUpInstance(tipo, this.gameState, (instancia, coletor) => this.coletar(instancia, coletor));
        nova.spawn();
        this.instancias.push(nova);
        this.timersSpawn[tipo] = 0;
    }

    /**
     * Verifica colisão entre discos e power-ups na tela.
     * @param {Disco} disco - O disco a verificar.
     */
    checarColisao(disco) {
        for (let i = this.instancias.length - 1; i >= 0; i--) {
            if (this.instancias[i].checarColisaoDisco(disco)) {
                this.instancias.splice(i, 1);
            }
        }
    }

    /**
     * Verifica colisão entre barras e power-ups na tela.
     * @param {Barra} barra - A barra a verificar.
     */
    checarColisaoBarra(barra) {
        for (let i = this.instancias.length - 1; i >= 0; i--) {
            if (this.instancias[i].checarColisaoBarra(barra)) {
                this.instancias.splice(i, 1);
            }
        }
    }

    /**
     * Processa a coleta de um power-up e ativa seu efeito.
     * @param {PowerUpInstance} instancia - A instância coletada.
     * @param {Object} coletor - O objeto que coletou (disco ou barra).
     */
    coletar(instancia, coletor) {
        const tipo = instancia.tipo;
        instancia.remover();
        
        if (tipo === 'duplicar') {
            this.superPoderAtivo = true;
            this.duplicarDiscos();
        } else if (tipo === 'lentidao') {
            this.ativarLentidao();
        } else if (tipo === 'supershot') {
            if (coletor.tipo === 'disco' && this.gameState.ultimoRebatedor) {
                this.gameState.superShotAtivo = true;
                this.gameState.quemPegouSuperShot = this.gameState.ultimoRebatedor;
                console.log(` Super Shot estocado por: ${this.gameState.quemPegouSuperShot}`);
            }
            this.agendarSpawn('supershot');
            tocarAudio(this.audioSuperShotAtivado);
        } else if (tipo === 'aumentar_barra') {
            if (coletor.tipo === 'disco' && this.gameState.ultimoRebatedor) {
                tocarAudio(this.audioCrescer);
                this.ativarAumentoBarra(this.gameState.ultimoRebatedor);
            }
            this.agendarSpawn('aumentar_barra');
        } else if (tipo === 'invasao') {
            if (coletor.tipo === 'disco' && this.gameState.ultimoRebatedor) {
                this.ativarInvasao(this.gameState.ultimoRebatedor);
            }
            this.agendarSpawn('invasao');
        }
    }

    /**
     * Ativa a permissão de invasão de campo para uma barra.
     * @param {string} idBarra - ID da barra beneficiada.
     */
    ativarInvasao(idBarra) {
        const barra = idBarra === "barra1" ? this.barra1 : this.barra2;
        if (!barra) return;

        barra.podeInvadir = true;
        barra.elemento.style.border = "3px solid purple";

        if (idBarra === "barra1" && this.timeoutInvasao1) clearTimeout(this.timeoutInvasao1);
        if (idBarra === "barra2" && this.timeoutInvasao2) clearTimeout(this.timeoutInvasao2);

        const timeout = setTimeout(() => {
            barra.podeInvadir = false;
            barra.elemento.style.border = "none";
        }, 10000);

        if (idBarra === "barra1") this.timeoutInvasao1 = timeout;
        if (idBarra === "barra2") this.timeoutInvasao2 = timeout;
    }

    /**
     * Ativa o aumento de tamanho para uma barra.
     * @param {string} idBarra - ID da barra beneficiada.
     */
    ativarAumentoBarra(idBarra) {
        const barraElemento = document.getElementById(idBarra);
        if (!barraElemento) return;

        barraElemento.style.height = "300px";

        if (idBarra === "barra1" && this.timeoutBarra1) clearTimeout(this.timeoutBarra1);
        if (idBarra === "barra2" && this.timeoutBarra2) clearTimeout(this.timeoutBarra2);

        const timeout = setTimeout(() => {
            const b = document.getElementById(idBarra);
            if (b) b.style.height = "100px";
        }, 10000);

        if (idBarra === "barra1") this.timeoutBarra1 = timeout;
        if (idBarra === "barra2") this.timeoutBarra2 = timeout;
    }

    /**
     * Ativa o efeito de lentidão na barra do oponente.
     */
    ativarLentidao() {
        tocarAudio(this.audioSlow);
        if (this.slowMoTimeout) clearTimeout(this.slowMoTimeout);
        this.slowMoAtivo = true;
        var barraSlow = null;
        if (!this.gameState.ultimoRebatedor === "barra1"){
            barraSlow = this.barra1;
        }else{
            barraSlow = this.barra2;
        }
        barraSlow.velocidadeX = 4;
        barraSlow.velocidadeY = 4
        this.slowMoTimeout = setTimeout(() => {
            this.slowMoAtivo = false;
            barraSlow.velocidadeX = 12;
            barraSlow.velocidadeY = 12;
            this.agendarSpawn('lentidao');
        }, 10000);
    }

    /**
     * Duplica todos os discos ativos no jogo.
     */
    duplicarDiscos() {
        const novosDiscos = [];
        const jogo = document.getElementById("jogo");
        tocarAudio(this.audioDouble);
        this.gameState.discos.forEach(d => {
            const novoElemento = document.createElement("div");
            novoElemento.id = "disco" + Date.now() + Math.random();
            novoElemento.className = "disco";
            jogo.appendChild(novoElemento);
            
            const novoDisco = new Disco(novoElemento.id, 0, 0);
            novoDisco.x = d.x;
            novoDisco.y = d.y;
            novoDisco.vx = -d.vx + (Math.random() - 0.5) * 4;
            novoDisco.vy = -d.vy + (Math.random() - 0.5) * 4;
            if (this.slowMoAtivo) novoDisco.velocidadeMaxima = 5;
            novosDiscos.push(novoDisco);
        });
        this.gameState.discos.push(...novosDiscos);
        this.agendarSpawn('duplicar');
    }

    /**
     * Remove todos os power-ups da tela.
     */
    removerDaTela() {
        this.instancias.forEach(i => i.remover());
        this.instancias = [];
    }

    /**
     * Reseta todo o sistema de superpoderes, limpando efeitos ativos e timers.
     */
    reset() {
        this.removerDaTela();
        this.superPoderAtivo = false;
        this.slowMoAtivo = false;
        this.gameState.superShotAtivo = false;
        this.gameState.quemPegouSuperShot = null;
        
        if (this.slowMoTimeout) clearTimeout(this.slowMoTimeout);
        if (this.timeoutBarra1) clearTimeout(this.timeoutBarra1);
        if (this.timeoutBarra2) clearTimeout(this.timeoutBarra2);
        if (this.timeoutInvasao1) clearTimeout(this.timeoutInvasao1);
        if (this.timeoutInvasao2) clearTimeout(this.timeoutInvasao2);
        const b1 = document.getElementById("barra1");
        const b2 = document.getElementById("barra2");
        if (b1) {
            b1.style.height = "100px";
            b1.style.border = "none";
        }
        if (b2) {
            b2.style.height = "100px";
            b2.style.border = "none";
        }
        this.barra1.podeInvadir = false;
        this.barra2.podeInvadir = false;
        
        for (let tipo in this.timersSpawn) {
            this.timersSpawn[tipo] = 0;
        }
        
        this.gameState.discos.forEach(d => d.velocidadeMaxima = 25);
        this.agendarSpawn();
    }

    /**
     * Agenda o spawn de um tipo de power-up para o futuro.
     * @param {string} [tipo] - O tipo a agendar. Se omitido, agenda todos.
     */
    agendarSpawn(tipo) {
        if (!tipo) {
            this.agendarSpawn('duplicar');
            this.agendarSpawn('lentidao');
            this.agendarSpawn('supershot');
            this.agendarSpawn('aumentar_barra');
            this.agendarSpawn('invasao');
            return;
        }
        const tempo = 5000 + Math.random() * 10000;
        this.timersSpawn[tipo] = tempo;
    }
}    