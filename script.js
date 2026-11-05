/* =====================================
   PARADA INTELIGENTE — ERECHIM
   Protótipo interativo: mapa, ônibus em movimento
   contínuo (estilo Waze), painéis e acessibilidade.
===================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* =====================================================================
       1. MAPA BASE (Esri Light Gray Canvas)
    ===================================================================== */
    const mapaErechim = L.map('mapa-erechim', {
        zoomControl: false,
        minZoom: 12,
        maxZoom: 18
    }).setView([-27.6356, -52.2744], 16); // Zoom aumentado para 16

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    }).addTo(mapaErechim);

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => mapaErechim.zoomIn());
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => mapaErechim.zoomOut());

    /* =====================================================================
       2. PARADA PRINCIPAL E PARADAS SECUNDÁRIAS
    ===================================================================== */
    const coordenadaParada = [-27.6356, -52.2744];

    L.marker(coordenadaParada, {
        icon: L.divIcon({
            className: 'icone-mapa',
            html: '<div class="marcador-parada">🚏 Parada Inteligente (Central)</div>',
            iconSize: [240, 32],
            iconAnchor: [120, 16]
        }),
        zIndexOffset: 1000,
        interactive: false,
        keyboard: false
    }).addTo(mapaErechim);

    const paradasSecundarias = [
        { coord: [-27.6410, -52.2800], rotulo: 'Parada Secundária 01' },
        { coord: [-27.6290, -52.2660], rotulo: 'Parada Secundária 02' }
    ];

    paradasSecundarias.forEach((parada) => {
        L.marker(parada.coord, {
            icon: L.divIcon({
                className: 'icone-mapa',
                html: `<div class="marcador-parada-secundaria">🚏 ${parada.rotulo}</div>`,
                iconSize: [180, 26],
                iconAnchor: [90, 13]
            }),
            zIndexOffset: 500,
            interactive: false,
            keyboard: false
        }).addTo(mapaErechim);
    });

    /* =====================================================================
       3. ROTAS DAS LINHAS
    ===================================================================== */
    const rotaLinha02 = [
        [-27.6450, -52.2850],
        [-27.6410, -52.2800],
        [-27.6380, -52.2770],
        [-27.6356, -52.2744], // Parada Inteligente
        [-27.6330, -52.2710],
        [-27.6290, -52.2660],
        [-27.6250, -52.2620]
    ];

    const rotaLinha01 = [
        [-27.6420, -52.2670],
        [-27.6385, -52.2705],
        [-27.6356, -52.2744], // Parada Inteligente
        [-27.6320, -52.2772],
        [-27.6275, -52.2805],
        [-27.6230, -52.2835]
    ];

    // Linha 02 — traço azul
    L.polyline(rotaLinha02, {
        color: '#2563eb',
        weight: 6,
        opacity: 0.85,
        dashArray: '10 10',
        interactive: false
    }).addTo(mapaErechim);

    // Linha 01 — traço laranja
    L.polyline(rotaLinha01, {
        color: '#ea580c',
        weight: 6,
        opacity: 0.85,
        dashArray: '3 11',
        lineCap: 'round',
        interactive: false
    }).addTo(mapaErechim);

    /* =====================================================================
       4. SIMULAÇÃO DE ÔNIBUS — MOVIMENTO CONTÍNUO
    ===================================================================== */
    function calcularRumo(a, b) {
        const phi1 = (a.lat * Math.PI) / 180;
        const phi2 = (b.lat * Math.PI) / 180;
        const deltaLambda = ((b.lng - a.lng) * Math.PI) / 180;
        const y = Math.sin(deltaLambda) * Math.cos(phi2);
        const x = Math.cos(phi1) * Math.sin(phi2) -
                  Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
        return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    }

    function construirCaminho(coords) {
        const pontos = coords.map((c) => L.latLng(c));
        const segmentos = [];
        let total = 0;

        for (let i = 1; i < pontos.length; i++) {
            const a = pontos[i - 1];
            const b = pontos[i];
            const d = a.distanceTo(b);
            segmentos.push({ a, b, d, inicio: total, rumo: calcularRumo(a, b) });
            total += d;
        }

        return { segmentos, total };
    }

    function posicaoNoCaminho(caminho, distancia) {
        if (!caminho.segmentos.length) {
            return { latlng: [0, 0], rumo: 0 };
        }

        const d = Math.max(0, Math.min(distancia, caminho.total));
        const ultimo = caminho.segmentos.length - 1;

        for (let i = 0; i < caminho.segmentos.length; i++) {
            const seg = caminho.segmentos[i];

            if (d <= seg.inicio + seg.d || i === ultimo) {
                const t = seg.d === 0
                    ? 0
                    : Math.min(1, Math.max(0, (d - seg.inicio) / seg.d));

                return {
                    latlng: [
                        seg.a.lat + (seg.b.lat - seg.a.lat) * t,
                        seg.a.lng + (seg.b.lng - seg.a.lng) * t
                    ],
                    rumo: seg.rumo
                };
            }
        }

        return { latlng: [0, 0], rumo: 0 };
    }

    function criarIconeOnibus(classe, rotulo) {
        return L.divIcon({
            className: 'icone-mapa',
            html: `
                <div class="marcador-onibus ${classe}">
                    <span class="onibus-rumo" data-rumo aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="12" height="12">
                            <path d="M12 1.5 L21.5 21 L12 16.5 L2.5 21 Z" fill="currentColor"/>
                        </svg>
                    </span>
                    <span class="onibus-texto">🚌 ${rotulo}</span>
                </div>`,
            iconSize: [240, 34],
            iconAnchor: [120, 17]
        });
    }

    const veiculos = [];

    function criarVeiculo({ coords, rotulo, classe, duracaoTravessia, offsetFracao = 0 }) {
        const caminho = construirCaminho(coords);

        const marcador = L.marker(coords[0], {
            icon: criarIconeOnibus(classe, rotulo),
            zIndexOffset: 2000,
            interactive: false,
            keyboard: false
        }).addTo(mapaErechim);

        const veiculo = {
            marcador,
            caminho,
            distancia: caminho.total * offsetFracao,
            sentido: 1,
            velocidade: caminho.total / duracaoTravessia,
            elementoRumo: null
        };

        veiculos.push(veiculo);
        atualizarVeiculo(veiculo, 0);
        return veiculo;
    }

    function atualizarVeiculo(veiculo, deltaSegundos) {
        const { caminho } = veiculo;

        if (deltaSegundos !== 0) {
            veiculo.distancia += veiculo.velocidade * deltaSegundos * veiculo.sentido;

            if (veiculo.distancia >= caminho.total) {
                veiculo.distancia = caminho.total;
                veiculo.sentido = -1;
            } else if (veiculo.distancia <= 0) {
                veiculo.distancia = 0;
                veiculo.sentido = 1;
            }
        }

        const { latlng, rumo } = posicaoNoCaminho(caminho, veiculo.distancia);
        veiculo.marcador.setLatLng(latlng);

        if (!veiculo.elementoRumo) {
            const icone = veiculo.marcador.getElement();
            veiculo.elementoRumo = icone ? icone.querySelector('[data-rumo]') : null;
        }

        if (veiculo.elementoRumo) {
            const angulo = veiculo.sentido === 1 ? rumo : (rumo + 180) % 360;
            veiculo.elementoRumo.style.transform = `rotate(${angulo}deg)`;
        }
    }

    criarVeiculo({
        coords: rotaLinha02,
        rotulo: 'Linha 02 — Atlântico Expresso',
        classe: 'linha-02',
        duracaoTravessia: 55,
        offsetFracao: 0.15 // Começa mais à frente na rota
    });

    criarVeiculo({
        coords: rotaLinha01,
        rotulo: 'Linha 01 — Centro / Atlântico',
        classe: 'linha-01',
        duracaoTravessia: 75,
        offsetFracao: 0.75 // Começa noutra secção da rota
    });

    let ultimoTimestamp = null;

    function animar(ts) {
        if (ultimoTimestamp === null) ultimoTimestamp = ts;
        let delta = (ts - ultimoTimestamp) / 1000;
        ultimoTimestamp = ts;

        if (delta > 0.1) delta = 0.1;

        veiculos.forEach((veiculo) => atualizarVeiculo(veiculo, delta));
        requestAnimationFrame(animar);
    }

    const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefereMenosMovimento.matches) {
        window.setInterval(() => {
            veiculos.forEach((veiculo) => atualizarVeiculo(veiculo, 2));
        }, 2000);
    } else {
        requestAnimationFrame(animar);
    }

    /* =====================================================================
       5. PAINÉIS DESDOBRÁVEIS
    ===================================================================== */
    const botoesMenu = Array.from(document.querySelectorAll('.botao-lateral'));
    const paineis = Array.from(document.querySelectorAll('.painel-funcionalidade'));
    const botoesFechar = Array.from(document.querySelectorAll('.fechar-painel'));

    let botaoOrigem = null;

    function fecharTodosPaineis() {
        paineis.forEach((painel) => {
            painel.classList.remove('aberto');
            painel.setAttribute('aria-hidden', 'true');
        });
        botoesMenu.forEach((botao) => botao.setAttribute('aria-expanded', 'false'));
    }

    function abrirPainel(nome, origem) {
        fecharTodosPaineis();

        const painel = document.getElementById(`painel-${nome}`);
        if (!painel) return;

        painel.classList.add('aberto');
        painel.setAttribute('aria-hidden', 'false');

        botaoOrigem = origem || null;
        if (origem) origem.setAttribute('aria-expanded', 'true');

        const alvoFoco = painel.querySelector('.fechar-painel') || painel;
        window.setTimeout(() => {
            try { alvoFoco.focus({ preventScroll: true }); } catch (erro) { }
        }, 80);
    }

    function fecharPainelAtual() {
        const aberto = document.querySelector('.painel-funcionalidade.aberto');
        if (!aberto) return;

        aberto.classList.remove('aberto');
        aberto.setAttribute('aria-hidden', 'true');
        botoesMenu.forEach((botao) => botao.setAttribute('aria-expanded', 'false'));

        if (botaoOrigem) {
            try { botaoOrigem.focus({ preventScroll: true }); } catch (erro) { }
            botaoOrigem = null;
        }
    }

    botoesMenu.forEach((botao) => {
        botao.addEventListener('click', () => {
            const nome = botao.getAttribute('data-painel');
            const painel = nome ? document.getElementById(`painel-${nome}`) : null;
            const jaAberto = painel && painel.classList.contains('aberto');

            if (jaAberto) {
                fecharPainelAtual();
            } else if (nome) {
                abrirPainel(nome, botao);
            }
        });
    });

    botoesFechar.forEach((botao) => {
        botao.addEventListener('click', fecharPainelAtual);
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') fecharPainelAtual();
    });

    /* =====================================================================
       6. RELÓGIO E DATA
    ===================================================================== */
    function atualizarRelogio() {
        const agora = new Date();

        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        const segundos = String(agora.getSeconds()).padStart(2, '0');

        const elementoHora = document.getElementById('hora-atual');
        if (elementoHora) {
            elementoHora.textContent = `${horas}:${minutos}:${segundos}`;
        }

        const opcoesData = { weekday: 'long', day: '2-digit', month: 'long' };
        const dataFormatada = agora.toLocaleDateString('pt-BR', opcoesData).toUpperCase();

        const elementoData = document.getElementById('data-atual');
        if (elementoData) {
            elementoData.textContent = dataFormatada;
        }
    }

    window.setInterval(atualizarRelogio, 1000);
    atualizarRelogio();

    /* =====================================================================
       7. ALTO CONTRASTE
    ===================================================================== */
    const btnAltoContraste = document.getElementById('btn-contraste-alto');
    const btnContrastePadrao = document.getElementById('btn-contraste-padrao');

    function aplicarContraste(ativo) {
        document.body.classList.toggle('alto-contraste', ativo);

        btnAltoContraste?.setAttribute('aria-pressed', String(ativo));
        btnContrastePadrao?.setAttribute('aria-pressed', String(!ativo));

        try {
            localStorage.setItem('parada-contraste', ativo ? 'alto' : 'padrao');
        } catch (erro) { }
    }

    btnAltoContraste?.addEventListener('click', () => aplicarContraste(true));
    btnContrastePadrao?.addEventListener('click', () => aplicarContraste(false));

    let contrasteSalvo = 'padrao';
    try {
        contrasteSalvo = localStorage.getItem('parada-contraste') || 'padrao';
    } catch (erro) { }
    aplicarContraste(contrasteSalvo === 'alto');

    /* =====================================================================
       8. ASSISTENTE IA
    ===================================================================== */
    const chatLog = document.getElementById('chat-log');
    const chatInput = document.getElementById('chat-input');
    const chatEnviar = document.getElementById('chat-enviar');

    function adicionarMensagem(texto, autor) {
        if (!chatLog) return;

        const mensagem = document.createElement('div');
        mensagem.className = `chat-mensagem ${autor === 'usuario' ? 'chat-usuario' : 'chat-ia'}`;

        const rotulo = document.createElement('span');
        rotulo.className = 'chat-autor';
        rotulo.textContent = autor === 'usuario' ? 'Você' : 'Assistente';

        const paragrafo = document.createElement('p');
        paragrafo.textContent = texto;

        mensagem.append(rotulo, paragrafo);
        chatLog.appendChild(mensagem);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function respostaDemo(texto) {
        const t = texto.toLowerCase();

        if (t.includes('uri')) {
            return 'Para a URI: pegue a Linha 01 no sentido Centro, desça na Praça da Bandeira e siga na Linha 03. Tempo estimado: 18 minutos.';
        }
        if (t.includes('ônibus') || t.includes('onibus') || t.includes('próximo') || t.includes('proximo')) {
            return 'O próximo veículo é a Linha 02 — Atlântico Expresso, chegando em 5 minutos nesta parada.';
        }
        if (t.includes('horário') || t.includes('horario')) {
            return 'A Linha 01 opera hoje às 06:30, 07:15, 08:00 e 09:30. Consulte o painel “Horários” para o quadro completo.';
        }
        return 'Modo demonstração: posso informar próximos ônibus, linhas, horários e a infraestrutura desta parada.';
    }

    function enviarMensagem() {
        const texto = (chatInput?.value || '').trim();
        if (!texto) return;

        adicionarMensagem(texto, 'usuario');
        if (chatInput) chatInput.value = '';

        window.setTimeout(() => adicionarMensagem(respostaDemo(texto), 'ia'), 500);
    }

    chatEnviar?.addEventListener('click', enviarMensagem);

    chatInput?.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
            evento.preventDefault();
            enviarMensagem();
        }
    });

    document.querySelectorAll('.botao-sugestao').forEach((botao) => {
        botao.addEventListener('click', () => {
            if (chatInput) {
                chatInput.value = botao.getAttribute('data-sugestao') || botao.textContent.trim();
            }
            enviarMensagem();
        });
    });

    /* =====================================================================
       9. PLANEJADOR
    ===================================================================== */
    const btnCalcular = document.getElementById('btn-calcular');
    const resultadoPlano = document.getElementById('resultado-plano');

    btnCalcular?.addEventListener('click', () => {
        if (!resultadoPlano) return;

        resultadoPlano.hidden = false;
        resultadoPlano.innerHTML = `
            <strong>Melhor opção: Linha 02 — Atlântico Expresso</strong>
            <span>2 paradas • 8 min • desembarque na Praça da Bandeira</span>
            <span>Alternativa: Linha 01 — Centro / Atlântico (13 min)</span>`;
    });
});
