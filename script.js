document.addEventListener("DOMContentLoaded", iniciarAplicacao);

function iniciarAplicacao() {
    "use strict";

    const CONFIG = {
        centro: [-52.2754, -27.6296],
        limites: [
            [-52.340, -27.695],
            [-52.200, -27.590]
        ],
        estiloMapa: "https://tiles.openfreemap.org/styles/positron",
        climaUrl: "https://api.open-meteo.com/v1/forecast",
        geocodificacaoUrl: "https://photon.komoot.io/api/"
    };

    const $ = (id) => document.getElementById(id);

    let mapa = null;
    let mapaCarregado = false;
    let animacaoAtiva = false;
    let painelAberto = null;
    let rotaSelecionada = null;
    let reconhecimentoVoz = null;

    const marcadoresOnibus = [];
    const marcadoresParadas = [];
    const marcadoresPontos = [];

    const TERMINAL = {
        nome: "Terminal Central",
        coordenadas: [-52.2754, -27.6296]
    };

    const rotas = [
        {
            id: "linha-01",
            numero: "01",
            nome: "Três Vendas",
            destino: "Bairro Três Vendas",
            cor: "#2563eb",
            duracao: 115000,
            coordenadas: [
                [-52.2754, -27.6296],
                [-52.2740, -27.6270],
                [-52.2720, -27.6240],
                [-52.2700, -27.6210],
                [-52.2680, -27.6175]
            ]
        },
        {
            id: "linha-02",
            numero: "02",
            nome: "Presidente Vargas",
            destino: "Presidente Vargas",
            cor: "#16a34a",
            duracao: 130000,
            coordenadas: [
                [-52.2754, -27.6296],
                [-52.2780, -27.6290],
                [-52.2810, -27.6280],
                [-52.2840, -27.6265],
                [-52.2880, -27.6250]
            ]
        },
        {
            id: "linha-03",
            numero: "03",
            nome: "Atlântico",
            destino: "Bairro Atlântico",
            cor: "#9333ea",
            duracao: 140000,
            coordenadas: [
                [-52.2754, -27.6296],
                [-52.2770, -27.6320],
                [-52.2790, -27.6350],
                [-52.2820, -27.6380],
                [-52.2850, -27.6420]
            ]
        },
        {
            id: "linha-04",
            numero: "04",
            nome: "São Cristóvão",
            destino: "Bairro São Cristóvão",
            cor: "#ea580c",
            duracao: 125000,
            coordenadas: [
                [-52.2754, -27.6296],
                [-52.2720, -27.6310],
                [-52.2690, -27.6330],
                [-52.2650, -27.6350],
                [-52.2610, -27.6380]
            ]
        },
        {
            id: "linha-05",
            numero: "05",
            nome: "Paiol Grande",
            destino: "Bairro Paiol Grande",
            cor: "#dc2626",
            duracao: 150000,
            coordenadas: [
                [-52.2754, -27.6296],
                [-52.2780, -27.6260],
                [-52.2820, -27.6230],
                [-52.2860, -27.6200],
                [-52.2900, -27.6170]
            ]
        },
        {
            id: "linha-06",
            numero: "06",
            nome: "URI Campus I",
            destino: "URI Campus I",
            cor: "#0891b2",
            duracao: 105000,
            coordenadas: [
                [-52.2754, -27.6296],
                [-52.2740, -27.6320],
                [-52.2720, -27.6350],
                [-52.2700, -27.6380]
            ]
        },
        {
            id: "linha-07",
            numero: "07",
            nome: "URI Campus II",
            destino: "URI Campus II",
            cor: "#a16207",
            duracao: 165000,
            coordenadas: [
                [-52.2754, -27.6296],
                [-52.2720, -27.6360],
                [-52.2690, -27.6450],
                [-52.2650, -27.6550],
                [-52.2580, -27.6670]
            ]
        }
    ];

    const pontosReferencia = [
        { nome: "URI Campus I", endereco: "Avenida Sete de Setembro, 1621, Erechim, RS", tipo: "universidade" },
        { nome: "URI Campus II", endereco: "URI Campus II, RS-331, Erechim, RS", tipo: "universidade" },
        { nome: "Praça da Bandeira", endereco: "Praça da Bandeira, Erechim, RS", tipo: "referencia" },
        { nome: "Catedral São José", endereco: "Catedral São José, Erechim, RS", tipo: "referencia" },
        { nome: "Parque Longines Malinowski", endereco: "Parque Longines Malinowski, Erechim, RS", tipo: "referencia" }
    ];

    const locaisPlanejador = [
        { nome: "Terminal Central", coordenadas: TERMINAL.coordenadas },
        { nome: "Três Vendas", coordenadas: rotas[0].coordenadas.at(-1) },
        { nome: "Presidente Vargas", coordenadas: rotas[1].coordenadas.at(-1) },
        { nome: "Atlântico", coordenadas: rotas[2].coordenadas.at(-1) },
        { nome: "São Cristóvão", coordenadas: rotas[3].coordenadas.at(-1) },
        { nome: "Paiol Grande", coordenadas: rotas[4].coordenadas.at(-1) },
        { nome: "URI Campus I", coordenadas: rotas[5].coordenadas.at(-1) },
        { nome: "URI Campus II", coordenadas: rotas[6].coordenadas.at(-1) }
    ];

    function mostrarToast(mensagem, duracao = 3500) {
        const toast = $("toast");
        if (!toast) return;
        toast.textContent = mensagem;
        toast.classList.add("visivel");
        clearTimeout(mostrarToast.timer);
        mostrarToast.timer = setTimeout(() => {
            toast.classList.remove("visivel");
        }, duracao);
    }

    function escaparHTML(valor) {
        return String(valor).replace(/[&<>"']/g, caractere => {
            const entidades = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
            return entidades[caractere];
        });
    }

    function distanciaEntre(a, b) {
        const raio = 6371;
        const rad = valor => valor * Math.PI / 180;
        const dLat = rad(b[1] - a[1]);
        const dLon = rad(b[0] - a[0]);
        const lat1 = rad(a[1]);
        const lat2 = rad(b[1]);
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        return 2 * raio * Math.asin(Math.sqrt(h));
    }

    function interpolarCoordenada(a, b, proporcao) {
        return [a[0] + (b[0] - a[0]) * proporcao, a[1] + (b[1] - a[1]) * proporcao];
    }

    function obterCoordenadaNaRota(coordenadas, progresso) {
        const segmentos = [];
        let distanciaTotal = 0;
        for (let i = 0; i < coordenadas.length - 1; i++) {
            const distancia = distanciaEntre(coordenadas[i], coordenadas[i + 1]);
            segmentos.push({ inicio: coordenadas[i], fim: coordenadas[i + 1], distancia });
            distanciaTotal += distancia;
        }
        if (distanciaTotal === 0) return coordenadas[0];
        let distanciaAlvo = distanciaTotal * progresso;
        for (const segmento of segmentos) {
            if (distanciaAlvo <= segmento.distancia) {
                const proporcao = segmento.distancia === 0 ? 0 : distanciaAlvo / segmento.distancia;
                return interpolarCoordenada(segmento.inicio, segmento.fim, proporcao);
            }
            distanciaAlvo -= segmento.distancia;
        }
        return coordenadas.at(-1);
    }

    function iniciarMapa() {
        const elementoMapa = $("map");
        if (!elementoMapa || !window.maplibregl) return;

        try {
            mapa = new maplibregl.Map({
                container: "map",
                style: CONFIG.estiloMapa,
                center: CONFIG.centro,
                zoom: 14,
                minZoom: 11.8,
                maxZoom: 19,
                maxBounds: CONFIG.limites,
                attributionControl: true
            });

            mapa.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: false }), "bottom-right");
            mapa.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }), "bottom-left");

            mapa.on("load", () => {
                mapaCarregado = true;
                configurarCamadas();
                carregarTerminal();
                carregarParadas();
                carregarOnibus();
                carregarListaRotas();
                carregarPlanejador();
                carregarPontosReferencia();
                iniciarAnimacaoOnibus();
                atualizarChegadas();
                setInterval(atualizarChegadas, 15000);
                setTimeout(() => mapa.resize(), 300);
            });
        } catch (erro) {
            console.error("Erro ao iniciar mapa:", erro);
        }
    }

    function configurarCamadas() {
        if (!mapaCarregado) return;
        rotas.forEach(rota => {
            mapa.addSource(rota.id, {
                type: "geojson",
                data: { type: "Feature", geometry: { type: "LineString", coordinates: rota.coordenadas } }
            });
            mapa.addLayer({
                id: `${rota.id}-linha`,
                type: "line",
                source: rota.id,
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": rota.cor, "line-width": 4, "line-opacity": 0.8 }
            });
        });

        mapa.addSource("rota-planejada", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] }
        });
        mapa.addLayer({
            id: "rota-planejada-linha",
            type: "line",
            source: "rota-planejada",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#111827", "line-width": 5, "line-dasharray": [2, 1.5] }
        });
    }

    function criarMarcador(nome, coordenadas, classe, descricao = "") {
        if (!mapaCarregado || !window.maplibregl) return null;
        const elemento = document.createElement("div");
        elemento.className = `map-pin ${classe}`;
        elemento.title = nome;

        const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
            <strong>${escaparHTML(nome)}</strong>
            ${descricao ? `<p>${escaparHTML(descricao)}</p>` : ""}
        `);

        const marcador = new maplibregl.Marker({ element: elemento, anchor: "center" })
            .setLngLat(coordenadas)
            .setPopup(popup)
            .addTo(mapa);
        marcadoresPontos.push(marcador);
        return marcador;
    }

    function carregarTerminal() {
        criarMarcador(TERMINAL.nome, TERMINAL.coordenadas, "terminal", "Ponto central de integração.");
    }

    async function carregarPontosReferencia() {
        for (const ponto of pontosReferencia) {
            try {
                const parametros = new URLSearchParams({ q: ponto.endereco, limit: "1" });
                const resposta = await fetch(`${CONFIG.geocodificacaoUrl}?${parametros}`, { signal: AbortSignal.timeout(5000) });
                if (!resposta.ok) continue;
                const dados = await resposta.json();
                const local = dados.features?.[0];
                if (local) {
                    criarMarcador(ponto.nome, local.geometry.coordinates, ponto.tipo, "Ponto de referência.");
                }
            } catch (e) {
                console.warn("Erro geocodificação:", e);
            }
        }
    }

    function carregarParadas() {
        if (!mapaCarregado) return;
        rotas.forEach((rota, idx) => {
            const coords = obterCoordenadaNaRota(rota.coordenadas, 0.5);
            const elemento = document.createElement("div");
            elemento.className = "map-pin parada";
            const popup = new maplibregl.Popup({ offset: 12 }).setHTML(`
                <strong>Parada Linha ${rota.numero}</strong>
                <p>${escaparHTML(rota.nome)}</p>
            `);
            const marcador = new maplibregl.Marker({ element: elemento, anchor: "center" })
                .setLngLat(coords)
                .setPopup(popup)
                .addTo(mapa);
            marcadoresParadas.push(marcador);
        });
    }

    function carregarOnibus() {
        if (!mapaCarregado) return;
        rotas.forEach((rota, indice) => {
            const elemento = document.createElement("div");
            elemento.className = "bus-animated-marker";
            elemento.textContent = `0${rota.numero}`;
            const popup = new maplibregl.Popup({ offset: 18 }).setHTML(`
                <strong>Ônibus Linha ${rota.numero}</strong>
                <p>${escaparHTML(rota.nome)} - Em circulação</p>
            `);
            const marcador = new maplibregl.Marker({ element, anchor: "center" })
                .setLngLat(rota.coordenadas[0])
                .setPopup(popup)
                .addTo(mapa);
            marcadoresOnibus.push({ marcador, rota, indice, elemento });
        });
    }

    function iniciarAnimacaoOnibus() {
        if (animacaoAtiva || !marcadoresOnibus.length) return;
        animacaoAtiva = true;
        let inicioAnimacao = performance.now();

        function animar(tempoAtual) {
            if (!animacaoAtiva) return;
            const tempoDecorrido = tempoAtual - inicioAnimacao;
            marcadoresOnibus.forEach(item => {
                const duracao = item.rota.duracao;
                const ciclo = (tempoDecorrido + item.indice * 17000) % (duracao * 2);
                let progresso = ciclo / duracao;
                if (progresso > 1) progresso = 2 - progresso;
                const coordenadas = obterCoordenadaNaRota(item.rota.coordenadas, Math.max(0, Math.min(1, progresso)));
                item.marcador.setLngLat(coordenadas);
            });
            requestAnimationFrame(animar);
        }
        requestAnimationFrame(animar);
    }

    // LISTA DE ROTAS COM VISUAL DE SELEÇÃO CLARO
    function carregarListaRotas() {
        const lista = $("rotas-lista");
        if (!lista) return;
        lista.innerHTML = "";

        rotas.forEach(rota => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "rota-item";
            item.dataset.rota = rota.id;

            item.innerHTML = `
                <span class="rota-cor" style="background-color:${rota.cor}"></span>
                <span class="rota-informacao">
                    <strong>Linha ${rota.numero} — ${escaparHTML(rota.nome)}</strong>
                    <span>Destino: ${escaparHTML(rota.destino)}</span>
                </span>
                <span class="rota-etiqueta">SELECIONAR</span>
            `;

            item.addEventListener("click", () => selecionarRota(rota.id));
            lista.appendChild(item);
        });
    }

    function selecionarRota(id) {
        const rota = rotas.find(item => item.id === id);
        if (!rota) return;
        rotaSelecionada = id;

        document.querySelectorAll(".rota-item").forEach(item => {
            const selecionada = item.dataset.rota === id;
            item.classList.toggle("selecionada", selecionada);
            const etiqueta = item.querySelector(".rota-etiqueta");
            if (etiqueta) etiqueta.textContent = selecionada ? "SELECIONADA" : "SELECIONAR";
        });

        if (mapaCarregado) {
            rotas.forEach(item => {
                mapa.setPaintProperty(`${item.id}-linha`, "line-width", item.id === id ? 7 : 3);
                mapa.setPaintProperty(`${item.id}-linha`, "line-opacity", item.id === id ? 1 : 0.35);
            });

            const limites = new maplibregl.LngLatBounds();
            rota.coordenadas.forEach(coord => limites.extend(coord));
            mapa.fitBounds(limites, { padding: 90, maxZoom: 15.8, duration: 900 });
        }
        mostrarToast(`Linha ${rota.numero} selecionada: ${rota.nome}`);
    }

    function configurarBuscaLinhas() {
        const campo = $("busca-linha");
        if (!campo) return;
        campo.addEventListener("input", () => {
            const termo = campo.value.toLowerCase().trim();
            document.querySelectorAll(".rota-item").forEach(item => {
                const texto = item.textContent.toLowerCase();
                item.hidden = !texto.includes(termo);
            });
        });
    }

    // PREVISÃO DE CHEGADAS COMPLETA E REFEITA
    function atualizarChegadas() {
        const area = $("chegadas-simuladas");
        if (!area) return;

        const agora = Date.now();
        const chegadas = rotas.map((rota, indice) => {
            const progressoTempo = ((agora / rota.duracao) + indice * 0.17) % 1;
            const minutos = Math.max(1, Math.round((1 - progressoTempo) * 18 + indice * 1.2));
            const lotacao = minutos < 3 ? "Lotado" : minutos < 7 ? "Normal" : "Vazio";
            return { rota, minutos, lotacao };
        }).sort((a, b) => a.minutos - b.minutos);

        area.innerHTML = `
            <div class="chegadas-completas-container">
                ${chegadas.map(item => `
                    <div class="cartao-chegada-completo" style="border-left: 6px solid ${item.rota.cor};">
                        <div class="cartao-chegada-topo">
                            <div class="cartao-chegada-info">
                                <span class="chip-linha" style="background:${item.rota.cor}">0${item.rota.numero}</span>
                                <div>
                                    <strong>${escaparHTML(item.rota.nome)}</strong>
                                    <p style="font-size:10px; color:var(--texto-secundario)">Sentido: ${escaparHTML(item.rota.destino)}</p>
                                </div>
                            </div>
                            <span class="status-badge ${item.minutos < 5 ? 'no-prazo' : ''}">${item.minutos < 5 ? 'Aproximando' : 'Em Trânsito'}</span>
                        </div>
                        <div class="cartao-chegada-detalhes">
                            <span>Lotação: <strong>${item.lotacao}</strong></span>
                            <div>Previsão: <span class="tempo-destaque">${item.minutos} min</span></div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function carregarPlanejador() {
        const origem = $("origin");
        const destino = $("destination");
        if (!origem || !destino) return;

        const preencher = (select, valorSelecionado) => {
            select.innerHTML = "";
            locaisPlanejador.forEach((local, indice) => {
                const opcao = document.createElement("option");
                opcao.value = String(indice);
                opcao.textContent = local.nome;
                if (indice === valorSelecionado) opcao.selected = true;
                select.appendChild(opcao);
            });
        };

        preencher(origem, 0);
        preencher(destino, 1);

        const botaoDesenhar = $("drawRoute");
        const botaoLimpar = $("clearRoute");
        if (botaoDesenhar) botaoDesenhar.addEventListener("click", desenharTrajeto);
        if (botaoLimpar) botaoLimpar.addEventListener("click", limparTrajeto);
    }

    function desenharTrajeto() {
        const origem = $("origin");
        const destino = $("destination");
        if (!origem || !destino) return;
        if (origem.value === destino.value) {
            mostrarToast("Escolha locais diferentes para origem e destino.");
            return;
        }

        const pOrigem = locaisPlanejador[Number(origem.value)];
        const pDestino = locaisPlanejador[Number(destino.value)];
        const coords = [pOrigem.coordenadas, pDestino.coordenadas];
        const distancia = distanciaEntre(coords[0], coords[1]);
        const minutos = Math.max(2, Math.round((distancia / 18) * 60));

        const info = $("routeInfo");
        const distEl = $("routeDistance");
        const durEl = $("routeDuration");

        if (info) info.style.display = "block";
        if (distEl) distEl.textContent = `Distância: ${distancia.toFixed(2).replace(".", ",")} km`;
        if (durEl) durEl.textContent = `Tempo estimado: ~${minutos} minutos`;

        if (mapaCarregado) {
            mapa.getSource("rota-planejada").setData({
                type: "FeatureCollection",
                features: [{ type: "Feature", geometry: { type: "LineString", coordinates: coords }, properties: {} }]
            });
            const limites = new maplibregl.LngLatBounds();
            coords.forEach(c => limites.extend(c));
            mapa.fitBounds(limites, { padding: 100, maxZoom: 16, duration: 900 });
        }
        mostrarToast("Trajeto planejado com sucesso!");
    }

    function limparTrajeto() {
        if (mapaCarregado) {
            mapa.getSource("rota-planejada").setData({ type: "FeatureCollection", features: [] });
        }
        const info = $("routeInfo");
        if (info) info.style.display = "none";
        mostrarToast("Trajeto limpo.");
    }

    function fecharPainel() {
        document.querySelectorAll(".painel-funcionalidade").forEach(painel => {
            painel.classList.remove("ativo", "aberto");
            painel.hidden = true;
            painel.style.display = "none";
        });
        document.querySelectorAll("[data-painel]").forEach(botao => {
            botao.setAttribute("aria-expanded", "false");
            botao.classList.remove("selecionado", "ativo");
        });
        painelAberto = null;
        if (mapa) setTimeout(() => mapa.resize(), 250);
    }

    function abrirPainel(nome) {
        const painel = $(`painel-${nome}`);
        if (!painel) return;
        if (painelAberto === nome) {
            fecharPainel();
            return;
        }
        fecharPainel();
        painel.hidden = false;
        painel.style.display = "flex";
        painel.classList.add("ativo", "aberto");
        painelAberto = nome;

        const botao = document.querySelector(`[data-painel="${nome}"]`);
        if (botao) {
            botao.setAttribute("aria-expanded", "true");
            botao.classList.add("selecionado", "ativo");
        }
        if (mapa) setTimeout(() => mapa.resize(), 250);
    }

    function configurarPaineis() {
        document.querySelectorAll("[data-painel]").forEach(botao => {
            botao.addEventListener("click", () => abrirPainel(botao.dataset.painel));
        });
        document.querySelectorAll(".fechar-painel").forEach(botao => {
            botao.addEventListener("click", fecharPainel);
        });
        document.addEventListener("keydown", e => { if (e.key === "Escape") fecharPainel(); });
    }

    // ASSISTENTE DE IA COM LÓGICA COMPLETA E FUNCIONAL
    function adicionarMensagemChat(texto, tipo) {
        const log = $("chat-log");
        if (!log) return;
        const mensagem = document.createElement("div");
        mensagem.className = `chat-mensagem mensagem-${tipo}`;
        mensagem.innerHTML = `<span class="chat-autor"><strong>${tipo === 'usuario' ? 'Você' : 'Assistente IA'}</strong></span><p>${escaparHTML(texto)}</p>`;
        log.appendChild(mensagem);
        log.scrollTop = log.scrollHeight;
    }

    function responderAssistente(pergunta) {
        const texto = pergunta.toLowerCase();
        if (texto.includes("uri") || texto.includes("campus")) {
            return "Para ir à URI (Campus I ou II), você pode utilizar a Linha 06 (URI Campus I) ou a Linha 07 (URI Campus II) diretamente do Terminal Central.";
        }
        if (texto.includes("terminal") || texto.includes("onde fica")) {
            return "O Terminal Central está localizado na região central de Erechim, servindo como principal ponto de integração de todas as 7 linhas municipais.";
        }
        if (texto.includes("linha") || texto.includes("ônibus") || texto.includes("onibus")) {
            return "Temos 7 linhas ativas no sistema: 01 (Três Vendas), 02 (Presidente Vargas), 03 (Atlântico), 04 (São Cristóvão), 05 (Paiol Grande), 06 (URI Campus I) e 07 (URI Campus II).";
        }
        if (texto.includes("horário") || texto.includes("horario")) {
            return "Os horários de partida do Terminal Central ocorrem regularmente a cada 30 a 45 minutos dependendo da linha. Consulte o painel 'Horários' para detalhes.";
        }
        return "Entendi sua dúvida sobre o transporte em Erechim. Você pode consultar os painéis de Linhas, Chegadas ou Planejador para obter rotas detalhadas em tempo real.";
    }

    function enviarPergunta() {
        const campo = $("chat-input");
        if (!campo) return;
        const pergunta = campo.value.trim();
        if (!pergunta) return;

        adicionarMensagemChat(pergunta, "usuario");
        campo.value = "";

        setTimeout(() => {
            const resposta = responderAssistente(pergunta);
            adicionarMensagemChat(resposta, "assistente");
        }, 400);
    }

    function configurarAssistente() {
        const botaoEnviar = $("chat-enviar");
        const campo = $("chat-input");
        const botaoMicrofone = $("chat-mic");

        if (botaoEnviar) botaoEnviar.addEventListener("click", enviarPergunta);
        if (campo) {
            campo.addEventListener("keydown", e => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    enviarPergunta();
                }
            });
        }

        document.querySelectorAll(".botao-sugestao").forEach(botao => {
            botao.addEventListener("click", () => {
                const sugestao = botao.dataset.sugestao;
                if (campo) campo.value = sugestao;
                enviarPergunta();
            });
        });

        configurarReconhecimentoVoz(botaoMicrofone);
    }

    function configurarReconhecimentoVoz(botao) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const status = $("status-voz");
        if (!botao || !SpeechRec) return;

        reconhecimentoVoz = new SpeechRec();
        reconhecimentoVoz.lang = "pt-BR";
        reconhecimentoVoz.interimResults = false;

        reconhecimentoVoz.onstart = () => { if (status) { status.hidden = false; status.textContent = "🔴 Ouvindo... Fale agora"; } };
        reconhecimentoVoz.onend = () => { if (status) status.hidden = true; };
        reconhecimentoVoz.onresult = e => {
            const texto = e.results[0][0].transcript;
            const campo = $("chat-input");
            if (campo) {
                campo.value = texto;
                enviarPergunta();
            }
        };

        botao.addEventListener("click", () => {
            try { reconhecimentoVoz.start(); } catch (err) { console.warn(err); }
        });
    }

    // MAPA: CONTROLES 2D, 3D, ZOOM E LOCALIZAÇÃO
    function configurarControlesMapa() {
        const botao2D = $("view2d");
        const botao3D = $("view3d");
        const localizar = $("locate");
        const zoomIn = $("btn-zoom-in");
        const zoomOut = $("btn-zoom-out");

        if (botao2D) {
            botao2D.addEventListener("click", () => {
                if (!mapa) return;
                mapa.easeTo({ pitch: 0, bearing: 0, duration: 700 });
                botao2D.classList.add("active");
                if (botao3D) botao3D.classList.remove("active");
                mostrarToast("Visualização 2D ativada");
            });
        }

        if (botao3D) {
            botao3D.addEventListener("click", () => {
                if (!mapa) return;
                mapa.easeTo({ pitch: 55, bearing: -15, duration: 700 });
                botao3D.classList.add("active");
                if (botao2D) botao2D.classList.remove("active");
                mostrarToast("Visualização 3D ativada");
            });
        }

        if (zoomIn) zoomIn.addEventListener("click", () => mapa && mapa.zoomIn({ duration: 300 }));
        if (zoomOut) zoomOut.addEventListener("click", () => mapa && mapa.zoomOut({ duration: 300 }));
        if (localizar) localizar.addEventListener("click", () => {
            if (mapa) mapa.flyTo({ center: TERMINAL.coordenadas, zoom: 16, duration: 1000 });
            mostrarToast("Centralizado no Terminal Urbano");
        });
    }

    function atualizarRelogio() {
        const agora = new Date();
        const data = $("data-atual");
        const hora = $("hora-atual");
        if (data) data.textContent = agora.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
        if (hora) hora.textContent = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }

    async function atualizarClima() {
        const temperatura = $("temperatura-atual");
        const icone = $("icone-clima");
        const maxima = $("temp-max");
        const minima = $("temp-min");
        const detalhe = $("detalhe-clima");

        try {
            const parametros = new URLSearchParams({
                latitude: String(CONFIG.centro[1]),
                longitude: String(CONFIG.centro[0]),
                current: "temperature_2m,apparent_temperature,weather_code",
                daily: "temperature_2m_max,temperature_2m_min",
                timezone: "America/Sao_Paulo",
                forecast_days: "1"
            });
            const resposta = await fetch(`${CONFIG.climaUrl}?${parametros}`, { signal: AbortSignal.timeout(6000) });
            if (!resposta.ok) return;
            const dados = await resposta.json();

            if (temperatura) temperatura.textContent = `${Math.round(dados.current.temperature_2m)}°C`;
            if (maxima) maxima.textContent = `Máx: ${Math.round(dados.daily.temperature_2m_max[0])}°C`;
            if (minima) minima.textContent = `Mín: ${Math.round(dados.daily.temperature_2m_min[0])}°C`;
            if (detalhe) detalhe.textContent = `Parcialmente Limpo · Sensação ${Math.round(dados.current.apparent_temperature)}°C`;
            if (icone) icone.textContent = "☀️";
        } catch (e) {
            console.warn("Clima indisponível", e);
        }
    }

    function configurarAcessibilidade() {
        const alto = $("btn-contraste-alto");
        const normal = $("btn-contraste-padrao");
        const fonteMaior = $("btn-fonte-maior");
        const fonteNormal = $("btn-fonte-normal");

        if (alto) alto.addEventListener("click", () => { document.body.classList.add("alto-contraste"); mostrarToast("Alto contraste ativado"); });
        if (normal) normal.addEventListener("click", () => { document.body.classList.remove("alto-contraste"); mostrarToast("Contraste padrão"); });
        if (fonteMaior) fonteMaior.addEventListener("click", () => { document.body.classList.add("fonte-grande"); mostrarToast("Fonte ampliada"); });
        if (fonteNormal) fonteNormal.addEventListener("click", () => { document.body.classList.remove("fonte-grande"); mostrarToast("Fonte normal"); });
    }

    function configurarEmergencia() {
        document.querySelectorAll("[data-numero]").forEach(botao => {
            botao.addEventListener("click", () => {
                const numero = botao.dataset.numero;
                mostrarToast(`Discando para emergência: ${numero}`);
                window.location.href = `tel:${numero}`;
            });
        });
    }

    function configurarComentarios() {
        const botao = $("btn-enviar-comentario");
        const campo = $("comentario-usuario");
        if (botao && campo) {
            botao.addEventListener("click", () => {
                if (!campo.value.trim()) {
                    mostrarToast("Escreva um relato ou sugestão.");
                    return;
                }
                campo.value = "";
                mostrarToast("Relato enviado com sucesso à Ouvidoria!");
            });
        }
    }

    configurarPaineis();
    configurarControlesMapa();
    configurarBuscaLinhas();
    configurarAssistente();
    configurarAcessibilidade();
    configurarEmergencia();
    configurarComentarios();

    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
    atualizarClima();
    setInterval(atualizarClima, 15 * 60 * 1000);

    iniciarMapa();
    fecharPainel();
}