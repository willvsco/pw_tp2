/**
 * @fileoverview Lógica principal do jogo de Hóquei de Mesa.
 * Gerencia o loop do jogo, colisões, menus e estado global.
 */

import {Barra} from './barra.js'
import {Disco} from './disco.js'
import {SuperPoder} from './superpoder.js';
import {pontuacao1, pontuacao2, incrementarPontuacao, zerarPontuacao} from "./placar.js"

/** @type {Barra} Instância da barra do Jogador 1 (Esquerda). */
const barra1 = new Barra("barra1",{cima: 'w', baixo: 's', esquerda: 'a', direita: 'd'});

/** @type {Barra} Instância da barra do Jogador 2 (Direita). */
const barra2 = new Barra("barra2",{cima: 'ArrowUp', baixo: 'ArrowDown', esquerda: 'ArrowLeft', direita: 'ArrowRight'});

/** @type {boolean} Flag para travar a movimentação das barras. */
var barraTravar = false;

/** @type {HTMLElement} Elemento DOM do contador de contagem regressiva. */
let contadordiv = document.getElementById("contador");

/** @type {HTMLAudioElement} Áudio de impacto. */
const audioHit = new Audio('/assets/efeitos_sonoros/hit.mp3');
audioHit.volume = 0.5;

/** @type {HTMLAudioElement} Áudio de ponto marcado. */
const audioPonto = new Audio('/assets/efeitos_sonoros/ponto.mp3');
audioPonto.volume = 1.0;

/** @type {HTMLAudioElement} Áudio de início de jogo. */
const audioIniciar = new Audio('/assets/efeitos_sonoros/iniciar.mp3');
audioIniciar.volume = 1.0;

/** @type {HTMLAudioElement} Áudio de pausa/retomada. */
const audioPausar = new Audio('/assets/efeitos_sonoros/pausar.mp3');
audioPausar.volume = 1.0;

/** @type {HTMLAudioElement} Áudio do super shot. */
const audioSuperShot = new Audio('/assets/efeitos_sonoros/supershot.mp3');
audioSuperShot.volume = 1.0;

/** @type {HTMLAudioElement} Áudio da contagem regressiva. */
const audioContar = new Audio('/assets/efeitos_sonoros/contagem.mp3');
audioContar.volume = 1.0;

/** @type {HTMLAudioElement} Áudio de início de rodada (Fight). */
const audioFight = new Audio('/assets/efeitos_sonoros/fight.mp3');
audioFight.volume = 1.0;

/** @type {number} Limite de pontos para vencer a partida. */
let limitePontos = 10;

/** @type {boolean} Indica se a tela de vitória está ativa. */
let vitoriaAtiva = false;

/** @type {number} Timestamp do início da partida. */
let tempoInicioPartida = 0;

/** @type {number} Acúmulo de tempo em que o jogo ficou pausado. */
let tempoTotalPausado = 0;

/** @type {number} Timestamp do momento em que o jogo foi pausado. */
let tempoInicioPausa = 0;

/**
 * Formata um tempo em milissegundos para string mm:ss.
 * @param {number} ms - Tempo em milissegundos.
 * @returns {string} Tempo formatado.
 */
function formatarTempo(ms) {
    const totalSegundos = Math.floor(ms / 1000);
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
}

/**
 * Salva o resultado da partida no LocalStorage e atualiza a interface.
 * @param {string} vencedor - Nome do jogador vencedor.
 */
function salvarPartidaNoHistorico(vencedor) {
    const nome1 = document.getElementById("nomeDisplay1").innerText;
    const nome2 = document.getElementById("nomeDisplay2").innerText;
    const p1 = document.getElementById("pontuacao1").textContent;
    const p2 = document.getElementById("pontuacao2").textContent;
    
    const duracao = Date.now() - tempoInicioPartida - tempoTotalPausado;
    const tempoFormatado = formatarTempo(duracao);
    
    const partida = {
        nome1, nome2, p1, p2, vencedor, tempoFormatado, data: new Date().toLocaleString()
    };

    let historico = JSON.parse(localStorage.getItem("historicoHoquei") || "[]");
    historico.unshift(partida);
    if (historico.length > 50) historico.pop();
    localStorage.setItem("historicoHoquei", JSON.stringify(historico));

    renderizarHistorico();
}

/**
 * Renderiza a lista de histórico de partidas no menu inicial.
 */
function renderizarHistorico() {
    const lista = document.getElementById("listaHistorico");
    let historico = JSON.parse(localStorage.getItem("historicoHoquei") || "[]");

    if (historico.length === 0) {
        lista.innerHTML = '<li style="text-align: center; color: #555;">Nenhuma partida registrada</li>';
        return;
    }

    lista.innerHTML = historico.map(partida => `
        <li style="padding: 5px; border-bottom: 1px solid rgba(0,0,0,0.1);">
            <strong>${partida.nome1}</strong> ${partida.p1} x ${partida.p2} <strong>${partida.nome2}</strong> <br>
            <small>Vencedor: ${partida.vencedor} | Duração: ${partida.tempoFormatado} | ${partida.data}</small>
        </li>
    `).join('');
}

// Inicializa o histórico ao carregar
renderizarHistorico();

/**
 * Verifica se algum jogador atingiu o limite de pontos e finaliza a partida.
 * @returns {boolean} True se houver um vencedor, false caso contrário.
 */
function verificarVencedor() {
    const p1 = parseInt(document.getElementById("pontuacao1").textContent);
    const p2 = parseInt(document.getElementById("pontuacao2").textContent);
    
    if (p1 >= limitePontos || p2 >= limitePontos) {
        const nome1 = document.getElementById("nomeDisplay1").innerText;
        const nome2 = document.getElementById("nomeDisplay2").innerText;
        const vencedor = p1 >= limitePontos ? nome1 : nome2;
        
        gameState.gamePausado = true;
        vitoriaAtiva = true;
        
        salvarPartidaNoHistorico(vencedor);
        
        const maxScore = Math.max(p1, p2);
        fetch("/game/save-score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score: maxScore })
        }).catch(function(err) { console.error("Erro ao salvar pontuação:", err); });
        
        const menuVitoria = document.getElementById("menuvitoria");
        const textoVitoria = document.getElementById("textoVitoria");
        textoVitoria.innerText = vencedor + " Venceu!";
        menuVitoria.style.display = "flex";
        
        document.getElementById("menujogo").style.display = "none";
        contadordiv.style.zIndex = -1;
        contadordiv.textContent = "";
        
        if (gameState.discos[0].timeoutRetorno) {
            clearInterval(gameState.discos[0].timeoutRetorno);
            clearTimeout(gameState.discos[0].timeoutRetorno);
        }
        return true;
    }
    return false;
}

/**
 * Reseta o estado do jogo e retorna para o menu inicial.
 */
function voltarAoMenuInicial() {
    vitoriaAtiva = false;
    gameState.gamePausado = true;
    
    document.getElementById("menuvitoria").style.display = "none";
    document.getElementById("menujogo").style.display = "none";
    
    const menuInicial = document.getElementById("menuinicial");
    menuInicial.style.display = "flex";
    menuInicial.style.zIndex = 300; 
    
    contadordiv.style.zIndex = -1;
    contadordiv.textContent = "";
    
    if (gameState.discos[0].timeoutRetorno) {
        clearInterval(gameState.discos[0].timeoutRetorno);
        clearTimeout(gameState.discos[0].timeoutRetorno);
        gameState.discos[0].timeoutRetorno = null;
    }
    
    gameState.discos[0].vx = 0;
    gameState.discos[0].vy = 0;
    
    zerarPontuacao();
}

document.getElementById("buttonJogarNovamente").addEventListener("click", function() {
    vitoriaAtiva = false;
    document.getElementById("menuvitoria").style.display = "none";
    gameState.gamePausado = false;
    zerarPontuacao();
    tempoInicioPartida = Date.now();
    tempoTotalPausado = 0;
    resetarEstadoJogo();
});

document.getElementById("buttonVoltarMenu").addEventListener("click", voltarAoMenuInicial);

/**
 * Objeto de estado global do jogo.
 * @type {Object}
 */
const gameState = {
    /** @type {Disco[]} Lista de discos ativos. */
    discos: [new Disco("disco", window.innerWidth/2, 0)],
    /** @type {boolean} Flag de jogo pausado. */
    gamePausado: false,
    /** @type {?Function} Callback disparado no reset do jogo. */
    onReset: null,
    /** @type {boolean} Indica se o efeito super shot está ativo. */
    superShotAtivo: false,
    /** @type {?string} ID da barra que detém o super shot. */
    quemPegouSuperShot: null,
    /** @type {?string} ID da última barra a rebater o disco. */
    ultimoRebatedor: null
};

/** @type {SuperPoder} Gerenciador de power-ups. */
const superPoder = new SuperPoder(gameState, barra1, barra2);
superPoder.agendarSpawn();

/**
 * Reseta o estado dos superpoderes.
 */
function resetarSuperPoder(){
    superPoder.reset();
}

gameState.onReset = resetarSuperPoder;

/**
 * Mapeamento local das teclas de controle (duplicado para facilidade de acesso).
 * @type {Object.<string, boolean>}
 */
const teclas = {
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
 * Verifica colisões entre os discos e os power-ups.
 * @param {Disco[]} listaDiscos - Lista de discos a verificar.
 */
function atualizarSuperPoder(listaDiscos) {
    listaDiscos.forEach(d => superPoder.checarColisao(d));
}

/**
 * Reseta o estado do jogo para uma nova rodada (após ponto ou reinício).
 */
export function resetarEstadoJogo() {
    gameState.superShotAtivo = false;
    gameState.quemPegouSuperShot = null;
    gameState.ultimoRebatedor = null;

    for (let i = 1; i < gameState.discos.length; i++) {
        if (gameState.discos[i].id) gameState.discos[i].id.remove();
    }
    const primeiroDisco = gameState.discos[0];
    gameState.discos.length = 1;
    
    if (gameState.onReset) {
        gameState.onReset();
    }
    primeiroDisco.x = window.innerWidth / 2;
    primeiroDisco.y = primeiroDisco.raio;
    primeiroDisco.vx = 0;
    primeiroDisco.vy = 0;
    barra1.resetar();
    barra2.resetar();
    barra1.elemento.style.transform = "translate(" + 0 + "px," + 0 + "px)";
    barra2.elemento.style.transform = "translate(" + 0 + "px," + 0 + "px)";

    clearInterval(primeiroDisco.timeoutRetorno);
    clearTimeout(primeiroDisco.timeoutRetorno);
    primeiroDisco.timeoutRetorno = null;
    
    contadordiv.style.zIndex = -1;
    contadordiv.textContent = "";

    barra1.travado = true;
    barra2.travado = true;

    primeiroDisco.timeoutRetorno = setTimeout(() => {
        var seg = 3;
        contadordiv.textContent = seg;
        contadordiv.style.zIndex = 100;
        tocarAudio(audioContar);
        primeiroDisco.timeoutRetorno = setInterval(()=>{
            if (gameState.gamePausado) return;
            if(seg>1){
                seg--;
                tocarAudio(audioContar);    
                contadordiv.textContent = seg;
            }else{
                contadordiv.style.zIndex = -1;
                tocarAudio(audioFight);    
                clearInterval(primeiroDisco.timeoutRetorno);
                primeiroDisco.vx = 0;
                primeiroDisco.vy = 5;
                barra1.travado = false;
                barra2.travado = false;
            }
        },1000)
    },1500);
}

document.addEventListener("keyup", function(event){
    if(teclas.hasOwnProperty(event.key)){
        teclas[event.key] = false;
    }
});

/** @type {boolean} Indica se o game loop já foi iniciado. */
let jogoIniciado = false;
/** @type {boolean} Indica se os listeners de eventos fixos já foram adicionados. */
let listenersAdicionados = false;

/**
 * Reinicia e toca um áudio.
 * @param {HTMLAudioElement} audio - O áudio a ser tocado.
 */
function tocarAudio(audio){
    audio.currentTime = 0;
    audio.play().catch(err => console.error("Erro:", err));
}

document.getElementById("buttonIniciar").addEventListener("click", function(){
    const input1 = document.getElementById("inputNome1").value.trim();
    const input2 = document.getElementById("inputNome2").value.trim();
    document.getElementById("nomeDisplay1").innerText = input1 !== "" ? input1 : "Jogador 1";
    document.getElementById("nomeDisplay2").innerText = input2 !== "" ? input2 : "Jogador 2";

    limitePontos = parseInt(document.getElementById("inputLimitePontos").value) || 5;

    if (!listenersAdicionados) {
        document.getElementById("buttonRetomar").addEventListener("click", function(){
            tocarAudio(audioPausar);
            gameState.gamePausado = false;
            tempoTotalPausado += (Date.now() - tempoInicioPausa);
        });

        document.getElementById("buttonReiniciar").addEventListener("click", function(){
            tocarAudio(audioPausar);
            gameState.gamePausado = false;
            barra1.x=0;
            barra1.y=0;
            barra2.x=0;
            barra2.y=0;
            tempoInicioPartida = Date.now();
            tempoTotalPausado = 0;
            resetarEstadoJogo();
            zerarPontuacao();
        });
        document.addEventListener("keydown", function(event){
            const menuInicial = document.getElementById("menuinicial");
            const isMenuInicialVisivel = parseInt(window.getComputedStyle(menuInicial).zIndex) > 0;
            
            if(event.key === "Escape" && !isMenuInicialVisivel && !vitoriaAtiva){
                gameState.gamePausado = !gameState.gamePausado;
                tocarAudio(audioPausar);
                if (gameState.gamePausado) {
                    tempoInicioPausa = Date.now();
                } else {
                    tempoTotalPausado += (Date.now() - tempoInicioPausa);
                }
            }
            if(teclas.hasOwnProperty(event.key)){
                teclas[event.key] = true;
            }
        });
        
        document.getElementById("buttonSair").addEventListener("click", voltarAoMenuInicial);
        
        listenersAdicionados = true;
    }
    
    if (!jogoIniciado) {
        jogoIniciado = true;
        const areaJogo = document.getElementById("jogo");
        if (areaJogo) gameState.discos[0].x = areaJogo.clientWidth / 2;
        gameLoop();
    }
    
    tocarAudio(audioIniciar);
    gameState.discos[0].vx = 0;
    gameState.discos[0].vy = 5;
    document.getElementById("menuinicial").style.zIndex = -1;
    gameState.gamePausado = false;
    tempoInicioPartida = Date.now();
    tempoTotalPausado = 0;
    zerarPontuacao();
    resetarEstadoJogo();
})

/**
 * Atualiza a física de um disco.
 * @param {Disco} discoL - O disco a ser atualizado.
 */
function atualizarDisco(discoL){
    discoL.vx = Math.max(-discoL.velocidadeMaxima, Math.min(discoL.velocidadeMaxima, discoL.vx));
    discoL.vy = Math.max(-discoL.velocidadeMaxima, Math.min(discoL.velocidadeMaxima, discoL.vy));
    discoL.x += discoL.vx;
    discoL.y += discoL.vy;

    discoL.vx *= discoL.atrito;
    discoL.vy *= discoL.atrito;

    if(Math.abs(discoL.vx) < discoL.limiteParada) discoL.vx = 0;
    if(Math.abs(discoL.vy) < discoL.limiteParada) discoL.vy = 0;
}

/**
 * Verifica colisões do disco com as paredes e detecta gols.
 * @param {Disco} discoL - O disco a ser verificado.
 */
function checarColisaoParedes(discoL){
    const jogo = document.getElementById("jogo");
    const larguraTela = jogo.clientWidth;
    const alturaTela = jogo.clientHeight;
    var bateu = false;
    if(discoL.x + discoL.raio > larguraTela){
        discoL.x = larguraTela - discoL.raio;
        discoL.vx *= -1;
        bateu = true;
    } else if(discoL.x - discoL.raio < 0){
        discoL.x = discoL.raio;
        discoL.vx *= -1;
        bateu = true;
    }

    if(discoL.y + discoL.raio > alturaTela){
        discoL.y = alturaTela - discoL.raio;
        discoL.vy *= -1;
        bateu = true;
    } else if(discoL.y - discoL.raio < 0){
        discoL.y = discoL.raio;
        discoL.vy *= -1;
        bateu = true;
    }
    if(bateu){
        tocarAudio(audioHit);
        bateu = false;
    }

    if(discoL.x + discoL.raio >= larguraTela && (discoL.y - discoL.raio >= alturaTela * 0.35 
    && discoL.y + discoL.raio <= alturaTela * 0.65 )){
        console.log("Ponto Direita!")        
        tocarAudio(audioPonto);
        incrementarPontuacao(pontuacao1);
        if (!verificarVencedor()) {
            resetarEstadoJogo();
        }
    }else if(discoL.x - discoL.raio <= 0 && (discoL.y - discoL.raio >= alturaTela * 0.35 
    && discoL.y + discoL.raio <= alturaTela * 0.65)){
        console.log("Ponto Esquerda!")
        tocarAudio(audioPonto);
        incrementarPontuacao(pontuacao2);
        if (!verificarVencedor()) {
            resetarEstadoJogo();
        }
    }
}

/**
 * Verifica colisão entre um disco e uma barra.
 * @param {Disco} discoL - O disco.
 * @param {Barra} barraL - A barra.
 */
function checarColisaoComBarra(discoL, barraL) {
    const elementoBarra = barraL.elemento;
    if (!elementoBarra) return; 

    const barra = elementoBarra.getBoundingClientRect();
    const discoRect = discoL.id.getBoundingClientRect();

    if (discoRect.left < barra.right && discoRect.right > barra.left &&
        discoRect.top < barra.bottom && discoRect.bottom > barra.top) {
        
        gameState.ultimoRebatedor = elementoBarra.id;
        const overlapX = Math.min(discoRect.right - barra.left, barra.right - discoRect.left);
        const overlapY = Math.min(discoRect.bottom - barra.top, barra.bottom - discoRect.top);

        const centroDoDiscoX = discoRect.left + (discoRect.width / 2);
        const centroDoDiscoY = discoRect.top + (discoRect.height / 2);
        const centroDaBarraX = barra.left + (barra.width / 2);
        const centroDaBarraY = barra.top + (barra.height / 2);

        const forcaMinimaY = barraL.velocidadeY + 2; 
        const forcaMinimaX = barraL.velocidadeX + 2; 
        
        if (overlapX < overlapY) {
            if (centroDoDiscoX < centroDaBarraX) {
                discoL.x -= overlapX;
                discoL.vx = -Math.max(Math.abs(discoL.vx), forcaMinimaX);
            } else {
                discoL.x += overlapX;
                discoL.vx = Math.max(Math.abs(discoL.vx), forcaMinimaX);
            }
            discoL.vy += barraL.velocidadeYInstantanea * 0.5;
        }else{
            if (centroDoDiscoY < centroDaBarraY) {
                discoL.y -= overlapY;
                discoL.vy = -Math.max(Math.abs(discoL.vy), forcaMinimaY);
            } else {
                discoL.y += overlapY;
                discoL.vy = Math.max(Math.abs(discoL.vy), forcaMinimaY);
            }
            discoL.vx += barraL.velocidadeXInstantanea * 0.5;
        }

        if (gameState.superShotAtivo && gameState.quemPegouSuperShot === elementoBarra.id) {
            discoL.vx = Math.sign(discoL.vx) * (discoL.velocidadeMaxima * 2);
            discoL.vy = Math.sign(discoL.vy) * (discoL.velocidadeMaxima * 2);
            
            gameState.superShotAtivo = false;
            gameState.quemPegouSuperShot = null;
            tocarAudio(audioSuperShot);
        }
        tocarAudio(audioHit);
    }
}

/**
 * Loop principal do jogo, executado a cada frame.
 */
function gameLoop(){
    const alturaTela = document.getElementById("jogo").clientHeight;
    const larguraTela = document.getElementById("jogo").clientWidth;
    if(!gameState.gamePausado){
        superPoder.update(100/6);
        document.getElementById("menujogo").style.zIndex = -1;
        document.getElementById("menujogo").style.display = "none";
        atualizarSuperPoder(gameState.discos);
        superPoder.checarColisaoBarra(barra1);
        superPoder.checarColisaoBarra(barra2);

        const limiteBarra1MaxX = barra1.podeInvadir ? (larguraTela - barra1.elemento.clientWidth) : ((larguraTela/2) - barra1.elemento.clientWidth);
        const limiteBarra2MinX = barra2.podeInvadir ? -(larguraTela - barra2.elemento.clientWidth) : -((larguraTela/2) -barra2.elemento.clientWidth);

        barra1.atualizarPosicao(teclas, 0, limiteBarra1MaxX, 0, (alturaTela - barra1.elemento.clientHeight));
        barra2.atualizarPosicao(teclas, limiteBarra2MinX, 0, 0, (alturaTela - barra2.elemento.clientHeight));
        for (let i = 0; i < gameState.discos.length; i++) {
            const d = gameState.discos[i];
            d.desenhar();
            atualizarDisco(d);
            checarColisaoParedes(d);
            checarColisaoComBarra(d,barra1);
            checarColisaoComBarra(d,barra2);
        }

        const b1 = document.getElementById("barra1");
        const b2 = document.getElementById("barra2");
        if (b1 && b2) {
            if (gameState.superShotAtivo && gameState.quemPegouSuperShot) {
                b1.style.boxShadow = gameState.quemPegouSuperShot === "barra1" ? "0 0 20px #ffcc00" : "none";
                b1.style.border = gameState.quemPegouSuperShot === "barra1" ? "2px solid #ffcc00" : "none";
                b2.style.boxShadow = gameState.quemPegouSuperShot === "barra2" ? "0 0 20px #ffcc00" : "none";
                b2.style.border = gameState.quemPegouSuperShot === "barra2" ? "2px solid #ffcc00" : "none";
            } else {
                b1.style.boxShadow = "none";
                b1.style.border = "none";
                b2.style.boxShadow = "none";
                b2.style.border = "none";
            }
        }

    }else{
        const menuInicial = document.getElementById("menuinicial");
        if (parseInt(window.getComputedStyle(menuInicial).zIndex) > 0 || vitoriaAtiva) {
            document.getElementById("menujogo").style.display = "none";
        } else {
            document.getElementById("menujogo").style.zIndex = 200; 
            document.getElementById("menujogo").style.display = "flex";
        }
    }
    requestAnimationFrame(gameLoop);
}
