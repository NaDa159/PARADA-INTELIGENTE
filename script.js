/* =====================================
   DADOS GLOBAIS DO SISTEMA & CENTRALIZAÇÃO
===================================== */

const paradasSistema = [
    { id: "parada_central", nome: "Parada Central (Praça da Bandeira)", coords: [-27.6356, -52.2744], principal: true },
    { id: "parada_uri", nome: "Câmpus URI Erechim", coords: [-27.6210, -52.2850], principal: false },
    { id: "parada_atlantico", nome: "Bairro Atlântico (Av. Sete)", coords: [-27.6450, -52.2600], principal: false },
    { id: "parada_bela_vista", nome: "Bairro Bela Vista (R. Itália)", coords: [-27.6280, -52.2900], principal: false },
    { id: "parada_tres_vendas", nome: "Três Vendas (Av. Caldas Júnior)", coords: [-27.6150, -52.2650], principal: false }
];

const rotas = [
    {
        id: "linha_1",
        nome: "Linha 01 — Centro",
        destino: "Terminal Central — Av. Maurício Cardoso",
        cor: "#0284c7",
        coordenadasTrajeto: [
            [-27.6356, -52.2744],
            [-27.6400, -52.2680],
            [-27.6450, -52.2600]
        ]
    },
    {
        id: "linha_2",
        nome: "Linha 02 — Atlântico",
        destino: "Bairro Atlântico via Av. Sete de Setembro",
        cor: "#16a34a",
        coordenadasTrajeto: [
            [-27.6356, -52.2744],
            [-27.6400, -52.2650],
            [-27.6450, -52.2600]
        ]
    },
    {
        id: "linha_3",
        nome: "Linha 03 — Bela Vista",
        destino: "Bairro Bela Vista via R. Itália",
        cor: "#d97706",
        coordenadasTrajeto: [
            [-27.6356, -52.2744],
            [-27.6300, -52.2820],
            [-27.6280, -52.2900]
        ]
    },
    {
        id: "linha_4",
        nome: "Linha 04 — URI / Câmpus",
        destino: "Universidade URI Erechim",
        cor: "#8b5cf6",
        coordenadasTrajeto: [
            [-27.6356, -52.2744],
            [-27.6280, -52.2800],
            [-27.6210, -52.2850]
        ]
    },
    {
        id: "linha_5",
        nome: "Linha 05 — Três Vendas",
        destino: "Bairro Três Vendas via Av. Caldas Júnior",
        cor: "#ec4899",
        coordenadasTrajeto: [
            [-27.6356, -52.2744],
            [-27.6220, -52.2680],
            [-27.6150, -52.2650]
        ]
    }
];

let dadosOnibus = [
    { id: "onibus_1", linhaIdx: 0, linha: "Linha 01 — Centro", destino: "Terminal Central", horario: "15:35", minutos: 4, status: "No horário", cor: "#0284c7", progresso: 0.2 },
    { id: "onibus_2", linhaIdx: 1, linha: "Linha 02 — Atlântico", destino: "Bairro Atlântico", horario: "15:42", minutos: 11, status: "No horário", cor: "#16a34a", progresso: 0.5 },
    { id: "onibus_3", linhaIdx: 2, linha: "Linha 03 — Bela Vista", destino: "Bairro Bela Vista", horario: "15:50", minutos: 19, status: "Adiantado", cor: "#d97706", progresso: 0.8 },
    { id: "onibus_4", linhaIdx: 3, linha: "Linha 04 — URI / Câmpus", destino: "Universidade URI Erechim", horario: "16:05", minutos: 34, status: "No horário", cor: "#8b5cf6", progresso: 0.3 },
    { id: "onibus_5", linhaIdx: 4, linha: "Linha 05 — Três Vendas", destino: "Bairro Três Vendas", horario: "16:20", minutos: 49, status: "Atrasado", cor: "#ec4899", progresso: 0.6 }
];

const horarios = [
    { linha: "Centro (Linha 01)", partidas: ["06:30", "07:15", "08:00", "11:45", "12:15", "13:30", "15:35", "17:15", "18:20", "19:10"] },
    { linha: "Atlântico (Linha 02)", partidas: ["06:45", "07:30", "08:15", "11:50", "12:30", "13:45", "15:42", "17:30", "18:40", "19:25"] },
    { linha: "Bela Vista (Linha 03)", partidas: ["07:00", "07:45", "08:30", "12:00", "12:45", "14:00", "15:50", "17:45", "19:00", "20:00"] },
    { linha: "URI Câmpus (Linha 04)", partidas: ["07:10", "07:35", "11:30", "13:15", "16:05", "18:00", "19:00", "22:30"] },
    { linha: "Três Vendas (Linha 05)", partidas: ["06:40", "07:20", "12:10", "13:20", "16:20", "17:50", "18:30"] }
];

let configParadaHardware = {
    painelEletronico: "Normal",
    conexaoInternet: "Online (Wi-Fi 98%)",
    alimentacaoEletrica: "Solar / Bateria (100%)",
    funcionamentoSistema: "Operacional",
    temperaturaAmbiente: "22°C",
    ultimaAtualizacao: "Há 1 minuto"
};

let historicoConversaAssistente = [];
let mapa = null;
let marcadoresOnibusNoMapa = {};
let marcadoresParadasNoMapa = {};
let ultimaAtualizacaoSimulacao = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
let servicoEmergenciaSelecionado = null;

/* =====================================
   INICIALIZAÇÃO & GESTÃO DE PAINÉIS
===================================== */

const painel = document.getElementById("painel-funcionalidade");
const painelTitulo = document.getElementById("painel-titulo");
const painelConteudo = document.getElementById("painel-conteudo");

function abrirPainel(titulo, conteudo) {
    if (painelTitulo) painelTitulo.textContent = titulo;
    if (painelConteudo) painelConteudo.innerHTML = conteudo;
    if (painel) {
        painel.classList.add("aberto");
        painel.setAttribute("aria-hidden", "false");
    }
    redimensionarMapa([0, 260]);
}

function fecharPainel() {
    if (painel) {
        painel.classList.remove("aberto");
        painel.setAttribute("aria-hidden", "true");
    }
    redimensionarMapa([0, 260]);
}

function exibirAviso(mensagem) {
    const aviso = document.getElementById("aviso-sistema");
    if (!aviso) return;
    aviso.textContent = mensagem;
    aviso.classList.add("visivel");
    setTimeout(() => aviso.classList.remove("visivel"), 3800);
}

function redimensionarMapa(atrasos = [0, 260]) {
    atrasos.forEach(tempo => {
        setTimeout(() => { if (mapa) mapa.invalidateSize({ pan: false }); }, tempo);
    });
}

/* =====================================
   MAPA LEAFLET & SIMULAÇÃO DE ÔNIBUS
===================================== */

const CENTRO_MAPA = [-27.6356, -52.2744];
const ZOOM_INICIAL = 13.5;

function inicializarMapa() {
    const elementoMapa = document.getElementById("mapa-erechim");
    if (!elementoMapa || mapa !== null) return;
    if (typeof L === "undefined") return;

    const limitesErechim = L.latLngBounds(L.latLng(-27.700, -52.340), L.latLng(-27.580, -52.200));

    mapa = L.map("mapa-erechim", {
        zoomControl: false,
        scrollWheelZoom: true,
        dragging: true,
        minZoom: 12,
        maxZoom: 18,
        maxBounds: limitesErechim
    }).setView(CENTRO_MAPA, ZOOM_INICIAL);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 18,
        attribution: "Tiles &copy; Esri &mdash; OpenStreetMap contributors"
    }).addTo(mapa);

    L.control.zoom({ position: "bottomright" }).addTo(mapa);

    renderizarParadasElinhasNoMapa();
    renderizarOnibusNoMapa();

    setInterval(atualizarMovimentacaoOnibusSimulados, 4000);
}

function renderizarParadasElinhasNoMapa() {
    rotas.forEach(r => {
        L.polyline(r.coordenadasTrajeto, { color: r.cor, weight: 4, opacity: 0.75 }).addTo(mapa);
    });

    paradasSistema.forEach(parada => {
        const iconeHtml = `<div style="background:${parada.principal ? '#0284c7' : '#475569'}; width:14px; height:14px; border-radius:50%; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`;
        const customIcon = L.divIcon({ html: iconeHtml, className: 'marcador-parada-custom', iconSize: [14, 14] });

        const marker = L.marker(parada.coords, { icon: customIcon }).addTo(mapa);
        marker.bindPopup(`<strong>${parada.nome}</strong><br><small>${parada.principal ? 'Parada Principal (Protótipo)' : 'Ponto Cadastrado'}</small>`);
        marcadoresParadasNoMapa[parada.id] = marker;
    });
}

function renderizarOnibusNoMapa() {
    dadosOnibus.forEach(onibus => {
        const rota = rotas[onibus.linhaIdx];
        const coordsIniciais = rota.coordenadasTrajeto[0];

        const iconeBusHtml = `<div style="background:${onibus.cor}; color:#fff; padding:2px 6px; border-radius:6px; font-size:10px; font-weight:800; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); white-space:nowrap;">🚌 ${onibus.linha.split('—')[0]}</div>`;
        const customIcon = L.divIcon({ html: iconeBusHtml, className: 'marcador-bus-custom', iconSize: [70, 24] });

        const marker = L.marker(coordsIniciais, { icon: customIcon }).addTo(mapa);
        marker.bindPopup(`
            <strong>${onibus.linha}</strong><br>
            Destino: ${onibus.destino}<br>
            Situação: <strong>${onibus.status}</strong><br>
            Chegada prevista: <strong>${onibus.minutos} min</strong> (${onibus.horario})<br>
            <small style="color:#64748b">*Dados simulados em tempo real</small>
        `);
        
        marcadoresOnibusNoMapa[onibus.id] = marker;
    });
}

function atualizarMovimentacaoOnibusSimulados() {
    ultimaAtualizacaoSimulacao = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    dadosOnibus.forEach(onibus => {
        const rota = rotas[onibus.linhaIdx];
        onibus.progresso += 0.15;
        if (onibus.progresso >= 1) {
            onibus.progresso = 0;
            onibus.minutos = Math.max(2, onibus.minutos - 4);
            if (onibus.minutos <= 1) onibus.minutos = 15;
        }

        const coords = rota.coordenadasTrajeto;
        const idxCoord = Math.min(Math.floor(onibus.progresso * coords.length), coords.length - 1);
        const novaLatLon = coords[idxCoord];

        if (marcadoresOnibusNoMapa[onibus.id]) {
            marcadoresOnibusNoMapa[onibus.id].setLatLng(novaLatLon);
        }
    });

    const elContador = document.getElementById("relogio-atualizacao-simulacao");
    if (elContador) elContador.textContent = ultimaAtualizacaoSimulacao;
}

/* =====================================
   FUNCIONALIDADES DA INTERFACE
===================================== */

// 1. Próximas Chegadas
function mostrarChegadas() {
    let conteudo = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <p class="painel-subtitulo" style="margin:0;">PREVISÃO INTELIGENTE DE CHEGADA</p>
            <small style="font-size:0.68rem; color:#64748b;">Atualizado às: <strong id="relogio-atualizacao-simulacao">${ultimaAtualizacaoSimulacao}</strong></small>
        </div>
    `;

    const ordenados = [...dadosOnibus].sort((a, b) => a.minutos - b.minutos);

    ordenados.forEach(onibus => {
        let classeEtiqueta = "etiqueta";
        if (onibus.status === "Atrasado") classeEtiqueta += " atrasado";
        if (onibus.status === "Adiantado") classeEtiqueta += " adiantado";

        conteudo += `
            <div class="item-informacao">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${onibus.linha}</strong>
                    <span class="destaque-horario">${onibus.minutos} min</span>
                </div>
                <small>Destino: ${onibus.destino}</small>
                <small>Horário previsto: ${onibus.horario}</small>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                    <span class="${classeEtiqueta}">${onibus.status}</span>
                    <button class="btn-acao-primaria" style="padding:4px 8px; font-size:0.68rem;" onclick="focarOnibusNoMapa('${onibus.id}')">Ver no mapa</button>
                </div>
            </div>
        `;
    });

    abrirPainel("Próximas Chegadas", conteudo);
}

function focarOnibusNoMapa(idOnibus) {
    if (!mapa || !marcadoresOnibusNoMapa[idOnibus]) return;
    const marker = marcadoresOnibusNoMapa[idOnibus];
    mapa.setView(marker.getLatLng(), 15);
    marker.openPopup();
    exibirAviso("Veículo localizado no mapa.");
}

// 2. Rotas e Itinerários
function mostrarRotas() {
    let conteudo = `
        <div class="grupo-input" style="margin-bottom:12px;">
            <label for="filtro-linha-rota">Filtrar por Linha</label>
            <select id="filtro-linha-rota" onchange="filtrarExibicaoRotas(this.value)">
                <option value="todas">Todas as Linhas</option>
                ${rotas.map(r => `<option value="${r.id}">${r.nome}</option>`).join('')}
            </select>
        </div>
        <div id="container-lista-rotas"></div>
    `;

    abrirPainel("Rotas e Itinerários", conteudo);
    filtrarExibicaoRotas("todas");
}

function filtrarExibicaoRotas(idLinha) {
    const container = document.getElementById("container-lista-rotas");
    if (!container) return;

    let filtradas = rotas;
    if (idLinha !== "todas") {
        filtradas = rotas.filter(r => r.id === idLinha);
    }

    let html = "";
    filtradas.forEach(rota => {
        html += `
            <div class="item-informacao">
                <div class="lista-rota">
                    <div class="cor-rota" style="background:${rota.cor}"></div>
                    <div>
                        <strong>${rota.nome}</strong>
                        <small>${rota.destino}</small>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// 3. Quadro de Horários
function mostrarHorarios() {
    let conteudo = `<p class="painel-subtitulo">QUADRO COMPLETO DE PARTIDAS</p>`;
    horarios.forEach(item => {
        conteudo += `
            <div class="item-informacao">
                <strong>${item.linha.toUpperCase()}</strong>
                <p style="margin-top:6px; font-weight:700; color:#0284c7;">
                    ${item.partidas.join(" • ")}
                </p>
            </div>
        `;
    });
    abrirPainel("Quadro de Horários", conteudo);
}

// 4. Planejador de Viagens
function mostrarPlanejador() {
    let conteudo = `
        <p class="painel-subtitulo">PLANEJADOR INTELIGENTE DE ROTAS</p>
        <div class="form-planejador">
            <div class="grupo-input">
                <label for="origem-viagem">Local de Origem</label>
                <select id="origem-viagem">
                    ${paradasSistema.map(p => `<option value="${p.id}">${p.nome}</option>`).join('')}
                </select>
            </div>
            <div class="grupo-input">
                <label for="destino-viagem">Local de Destino</label>
                <select id="destino-viagem">
                    ${paradasSistema.map((p, idx) => `<option value="${p.id}" ${idx === 1 ? 'selected' : ''}>${p.nome}</option>`).join('')}
                </select>
            </div>
            <button class="btn-acao-primaria" onclick="calcularRotaViagem()">Calcular Trajeto Recomendado</button>
        </div>
        <div id="resultado-planejamento"></div>
    `;
    abrirPainel("Planejador de Viagens", conteudo);
}

function calcularDistanciaGeoKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calcularRotaViagem() {
    const idOrigem = document.getElementById("origem-viagem").value;
    const idDestino = document.getElementById("destino-viagem").value;
    const containerRes = document.getElementById("resultado-planejamento");

    if (idOrigem === idDestino) {
        containerRes.innerHTML = `
            <div class="item-informacao" style="border-color:#ef4444;">
                <strong style="color:#ef4444;">Origem e destino iguais</strong>
                <small>Escolha locais diferentes para calcular o itinerário.</small>
            </div>
        `;
        return;
    }

    const pOrigem = paradasSistema.find(p => p.id === idOrigem);
    const pDestino = paradasSistema.find(p => p.id === idDestino);

    let linhaSugerida = rotas[0];
    if (idDestino === "parada_uri") linhaSugerida = rotas[3];
    if (idDestino === "parada_atlantico") linhaSugerida = rotas[1];
    if (idDestino === "parada_bela_vista") linhaSugerida = rotas[2];
    if (idDestino === "parada_tres_vendas") linhaSugerida = rotas[4];

    const distKm = calcularDistanciaGeoKm(
        pOrigem.coords[0], pOrigem.coords[1],
        pDestino.coords[0], pDestino.coords[1]
    );

    const distFormatada = Math.max(1.2, distKm * 1.4).toFixed(1);
    const tempoEstimado = Math.round(distFormatada * 3.5 + 4);

    containerRes.innerHTML = `
        <div class="item-informacao" style="border-color:#16a34a;">
            <strong style="color:#16a34a;">Trajeto Recomendado Calculado</strong>
            <p style="margin-top:6px;">
                🚌 <strong>Linha Sugerida:</strong> ${linhaSugerida.nome}<br>
                📍 <strong>Embarque:</strong> ${pOrigem.nome}<br>
                🏁 <strong>Desembarque:</strong> ${pDestino.nome}<br>
                ⏱️ <strong>Tempo Estimado:</strong> ~${tempoEstimado} minutos<br>
                📏 <strong>Distância Estimada:</strong> ~${distFormatada} km
            </p>
        </div>
    `;

    if (mapa) {
        const bounds = L.latLngBounds([pOrigem.coords, pDestino.coords]);
        mapa.fitBounds(bounds, { padding: [50, 50] });
    }

    exibirAviso("Viagem calculada com sucesso!");
}

// 5. Acessibilidade
function carregarPreferenciasAcessibilidade() {
    const altoContraste = localStorage.getItem("pi_alto_contraste") === "true";
    const tamanhoFonte = localStorage.getItem("pi_tamanho_fonte");

    if (altoContraste) document.body.classList.add("alto-contraste");
    if (tamanhoFonte) document.body.style.fontSize = tamanhoFonte;
}

function alternarAltoContraste(ativar) {
    if (ativar) {
        document.body.classList.add("alto-contraste");
        localStorage.setItem("pi_alto_contraste", "true");
        exibirAviso("Alto Contraste ativado.");
    } else {
        document.body.classList.remove("alto-contraste");
        localStorage.setItem("pi_alto_contraste", "false");
        exibirAviso("Alto Contraste desativado.");
    }
}

function mudarTamanhoFonte(fator) {
    const valor = fator === 1 ? "100%" : "115%";
    document.body.style.fontSize = valor;
    localStorage.setItem("pi_tamanho_fonte", valor);
    exibirAviso(fator === 1 ? "Fonte padrão." : "Fonte ampliada.");
}

function mostrarAcessibilidade() {
    let conteudo = `
        <p class="painel-subtitulo">RECURSOS DE ACESSIBILIDADE</p>
        <div class="item-informacao">
            <strong>Tamanho do Texto</strong>
            <div style="display:flex; gap:8px; margin-top:8px;">
                <button class="btn-acao-primaria" style="flex:1;" onclick="mudarTamanhoFonte(1)">Padrão</button>
                <button class="btn-acao-primaria" style="flex:1;" onclick="mudarTamanhoFonte(1.15)">Ampliada</button>
            </div>
        </div>
        <div class="item-informacao">
            <strong>Contraste Visual</strong>
            <div style="display:flex; gap:8px; margin-top:8px;">
                <button class="btn-acao-primaria" style="flex:1;" onclick="alternarAltoContraste(false)">Padrão</button>
                <button class="btn-acao-primaria" style="flex:1;" onclick="alternarAltoContraste(true)">Alto Contraste</button>
            </div>
        </div>
        <div class="item-informacao">
            <strong>Leitura por Voz</strong>
            <p>O assistente de IA lê automaticamente as respostas emitidas pelo sistema.</p>
        </div>
    `;
    abrirPainel("Acessibilidade", conteudo);
}

// 6. Monitoramento da Parada (ESP32)
function mostrarMonitoramento() {
    let conteudo = `
        <p class="painel-subtitulo">INFRAESTRUTURA DA PARADA (MONITORAMENTO ESP32)</p>
        <div class="grid-monitores">
            <div class="card-monitor">
                <span>Painel Eletrônico</span>
                <strong>${configParadaHardware.painelEletronico}</strong>
            </div>
            <div class="card-monitor">
                <span>Conexão Internet</span>
                <strong>${configParadaHardware.conexaoInternet}</strong>
            </div>
            <div class="card-monitor">
                <span>Alimentação Elétrica</span>
                <strong>${configParadaHardware.alimentacaoEletrica}</strong>
            </div>
            <div class="card-monitor">
                <span>Temperatura Ambiente</span>
                <strong>${configParadaHardware.temperaturaAmbiente}</strong>
            </div>
        </div>
        <div class="item-informacao">
            <strong>Telemetria do Protótipo</strong>
            <p>Estrutura pronta para recebimento de dados via MQTT/API de módulos ESP32. Operando com simulador de telemetria.</p>
            <span class="etiqueta">Funcionamento Normal</span>
        </div>
    `;
    abrirPainel("Infraestrutura da Parada", conteudo);
}

// 7. Assistente com IA
function mostrarIA() {
    const conteudo = `
        <div class="assistente-apresentacao">
            <div class="assistente-avatar">IA</div>
            <div>
                <span class="assistente-etiqueta">ASSISTENTE VIRTUAL DA PARADA</span>
                <p style="font-size:0.76rem; color:#64748b;">Consulte ônibus, rotas, horários e funcionamento.</p>
            </div>
        </div>

        <div class="sugestoes-assistente">
            <button onclick="enviarSugestaoIA('Qual o próximo ônibus?')">⏱️ Próximo Ônibus</button>
            <button onclick="enviarSugestaoIA('Como chegar na URI?')">🎓 Como chegar na URI</button>
            <button onclick="enviarSugestaoIA('Como funciona a energia solar?')">☀️ Energia Solar</button>
        </div>

        <div id="historico-chat" class="historico-chat"></div>

        <form class="campo-chat" id="form-chat" onsubmit="processarConversaIA(event)">
            <input type="text" id="entrada-chat" placeholder="Pergunte sobre ônibus, rotas..." required autocomplete="off">
            <button type="submit" class="botao-enviar" title="Enviar">Enviar</button>
        </form>

        <div class="estado-assistente">Assistente Informativo Local</div>
    `;

    abrirPainel("Assistente com IA", conteudo);

    if (historicoConversaAssistente.length > 0) {
        historicoConversaAssistente.forEach(msg => adicionarMensagemChat(msg.texto, msg.tipo, false));
    } else {
        adicionarMensagemChat("Olá! Sou o assistente da parada. Posso informar próximos ônibus, rotas, horários e detalhes da infraestrutura. Como posso ajudar?", "ia");
    }
}

function enviarSugestaoIA(texto) {
    const input = document.getElementById("entrada-chat");
    if (input) {
        input.value = texto;
        document.getElementById("form-chat").requestSubmit();
    }
}

function adicionarMensagemChat(texto, tipo, salvar = true) {
    const historico = document.getElementById("historico-chat");
    if (!historico) return;

    const divMsg = document.createElement("div");
    divMsg.className = `mensagem-chat ${tipo === "usuario" ? "mensagem-usuario" : "mensagem-ia"}`;
    divMsg.innerHTML = texto;

    historico.appendChild(divMsg);
    historico.scrollTop = historico.scrollHeight;
    if (salvar) historicoConversaAssistente.push({ texto, tipo });
}

function processarConversaIA(e) {
    e.preventDefault();
    const input = document.getElementById("entrada-chat");
    const pergunta = input.value.trim();
    if (!pergunta) return;

    adicionarMensagemChat(pergunta, "usuario");
    input.value = "";

    setTimeout(() => {
        const resposta = gerarRespostaIA(pergunta);
        adicionarMensagemChat(resposta, "ia");
        falarTextoVoz(resposta);
    }, 250);
}

function gerarRespostaIA(pergunta) {
    const p = pergunta.toLowerCase();

    if (p.includes("uri") || p.includes("universidade") || p.includes("campus")) {
        return `Para chegar à URI, pegue a <strong>Linha 04 — URI / Câmpus</strong>. O veículo chega nesta parada em <strong>${dadosOnibus[3].minutos} minutos</strong> (${dadosOnibus[3].horario}).`;
    }
    if (p.includes("centro")) {
        return `Para o Centro, utilize a <strong>Linha 01 — Centro</strong>. O próximo veículo passa em <strong>${dadosOnibus[0].minutos} minutos</strong>.`;
    }
    if (p.includes("proximo") || p.includes("chegando") || p.includes("tempo")) {
        const ordenados = [...dadosOnibus].sort((a, b) => a.minutos - b.minutos);
        const o = ordenados[0];
        return `O ônibus mais próximo é o da <strong>${o.linha}</strong>, destino ${o.destino}, previsto para <strong>${o.minutos} minutos</strong> (${o.horario}).`;
    }
    if (p.includes("solar") || p.includes("esp32") || p.includes("energia") || p.includes("bateria")) {
        return `Esta parada utiliza energia solar com baterias de lítio e um microcontrolador <strong>ESP32</strong> com Wi-Fi para telemetria dos sensores em tempo real.`;
    }

    return `Informação não encontrada na base de dados cadastrada. Consulte as opções de Próximas Chegadas ou Quadro de Horários.`;
}

function falarTextoVoz(texto) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const limpo = texto.replace(/<[^>]*>/g, '');
    const ut = new SpeechSynthesisUtterance(limpo);
    ut.lang = "pt-BR";
    window.speechSynthesis.speak(ut);
}

// 8. Ajuda e SOS
function mostrarAjuda() {
    const conteudo = `
        <div class="aviso-sos-banner">
            <div>
                <span class="sos-badge-status"><span class="ponto-pulse"></span> SISTEMA DE DEMONSTRAÇÃO</span>
                <p style="margin-top:6px; font-size:0.78rem; color:#475569; line-height:1.4;">
                    Esta funcionalidade é apenas uma simulação acadêmica e não realiza chamadas reais de emergência.
                </p>
            </div>
        </div>

        <div id="container-confirmacao-sos"></div>

        <p class="painel-subtitulo">SERVIÇOS DE EMERGÊNCIA (SIMULADO)</p>
        <div class="grade-emergencia-completa">
            <div class="card-emergencia-item" onclick="solicitarAtendimento('SAMU', '192')">
                <div class="card-emergencia-topo"><span class="num-emergencia">192</span></div>
                <strong>SAMU</strong><span>Atendimento médico</span>
            </div>
            <div class="card-emergencia-item" onclick="solicitarAtendimento('Polícia Militar', '190')">
                <div class="card-emergencia-topo"><span class="num-emergencia">190</span></div>
                <strong>Polícia Militar</strong><span>Segurança pública</span>
            </div>
            <div class="card-emergencia-item" onclick="solicitarAtendimento('Corpo de Bombeiros', '193')">
                <div class="card-emergencia-topo"><span class="num-emergencia">193</span></div>
                <strong>Bombeiros</strong><span>Resgate e emergência</span>
            </div>
            <div class="card-emergencia-item" onclick="solicitarAtendimento('Guarda Municipal', '153')">
                <div class="card-emergencia-topo"><span class="num-emergencia">153</span></div>
                <strong>Guarda Municipal</strong><span>Apoio e patrulha</span>
            </div>
        </div>

        <div class="secao-enviar-ideia">
            <p class="painel-subtitulo">ENVIAR SUGESTÃO</p>
            <div class="area-ideia-input">
                <textarea id="texto-ideia-usuario" placeholder="Escreva sua sugestão..."></textarea>
                <button class="btn-enviar-ideia" onclick="enviarIdeiaUsuario()">Enviar Sugestão</button>
            </div>
        </div>
    `;
    abrirPainel("Ajuda / SOS", conteudo);
}

function solicitarAtendimento(servico, numero) {
    servicoEmergenciaSelecionado = { servico, numero };
    const container = document.getElementById("container-confirmacao-sos");
    if (!container) return;

    container.innerHTML = `
        <div class="box-confirmacao-chamada">
            <strong>Simular Chamada: ${servico} (${numero})?</strong>
            <p style="font-size:0.75rem; color:#475569; margin-top:4px;">Simulação acadêmica sem discagem real.</p>
            <div class="botoes-confirmacao-emergencia" style="margin-top:8px;">
                <button class="btn-confirmar-sos" onclick="confirmarChamadaSOS()">Confirmar Simulação</button>
                <button class="btn-cancelar-sos" onclick="cancelarChamadaSOS()">Cancelar</button>
            </div>
        </div>
    `;
}

function confirmarChamadaSOS() {
    if (!servicoEmergenciaSelecionado) return;
    const { servico, numero } = servicoEmergenciaSelecionado;
    cancelarChamadaSOS();
    exibirAviso(`Simulação enviada para ${servico} (${numero}).`);
}

function cancelarChamadaSOS() {
    servicoEmergenciaSelecionado = null;
    const container = document.getElementById("container-confirmacao-sos");
    if (container) container.innerHTML = "";
}

function enviarIdeiaUsuario() {
    const input = document.getElementById("texto-ideia-usuario");
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) {
        exibirAviso("Digite sua mensagem antes de enviar.");
        return;
    }
    input.value = "";
    exibirAviso("Obrigado! Sua sugestão foi registrada.");
}

/* =====================================
   RELÓGIO, CLIMA E INICIALIZAÇÃO DO APP
===================================== */

function atualizarRelogio() {
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    const horaFormatada = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });

    const elData = document.getElementById("data-atual");
    const elHora = document.getElementById("hora-atual");
    if (elData) elData.textContent = dataFormatada;
    if (elHora) elHora.textContent = horaFormatada;
}

async function buscarClimaErechim() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=-27.6339&longitude=-52.2745&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo&forecast_days=1";

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error();
        const dados = await resposta.json();

        const temp = Math.round(dados.current.temperature_2m);
        const max = Math.round(dados.daily.temperature_2m_max[0]);
        const min = Math.round(dados.daily.temperature_2m_min[0]);
        const codigo = dados.current.weather_code;

        let icone = "☁️";
        if (codigo === 0) icone = "☀️";
        else if ([1, 2].includes(codigo)) icone = "⛅";
        else if (codigo >= 51 && codigo <= 82) icone = "🌧️";

        document.getElementById("temperatura-atual").textContent = temp + "°C";
        document.getElementById("temperatura-maxima").textContent = max + "°C";
        document.getElementById("temperatura-minima").textContent = min + "°C";
        document.getElementById("icone-clima").textContent = icone;
    } catch {
        document.getElementById("temperatura-atual").textContent = "20°C";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarPreferenciasAcessibilidade();
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
    buscarClimaErechim();
    inicializarMapa();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharPainel();
});