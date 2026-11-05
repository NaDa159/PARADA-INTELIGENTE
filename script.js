/* =====================================
   1. BASE DE DADOS INTEGRADA E ESTRUTURADA
===================================== */

let historicoConversaAssistente = [];
let mapa = null;
let servicoEmergenciaSelecionado = null;
let marcadoresOnibusNoMapa = {};
let marcadoresParadasNoMapa = {};
let ultimaAtualizacaoSimulacao = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

// Cadastro de Paradas (Editável para inclusão de novos pontos)
const paradasSistema = [
    { id: "parada_central", nome: "Parada Central (Praça da Bandeira)", coords: [-27.6356, -52.2744], principal: true },
    { id: "parada_uri", nome: "Câmpus URI Erechim", coords: [-27.6210, -52.2850], principal: false },
    { id: "parada_atlantico", nome: "Bairro Atlântico (Av. Sete)", coords: [-27.6450, -52.2600], principal: false },
    { id: "parada_bela_vista", nome: "Bairro Bela Vista (R. Itália)", coords: [-27.6280, -52.2900], principal: false },
    { id: "parada_tres_vendas", nome: "Três Vendas (Av. Caldas Júnior)", coords: [-27.6150, -52.2650], principal: false }
];

// Linhas e Trajetos Cadastrados
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

// Dados dos Ônibus (Simulação de GPS)
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

// Informações de Hardware (ESP32 / Sensores)
let configParadaHardware = {
    painelEletronico: "Normal",
    conexaoInternet: "Online (Wi-Fi 98%)",
    alimentacaoEletrica: "Solar / Bateria (100%)",
    funcionamentoSistema: "Operacional",
    temperaturaAmbiente: "22°C",
    ultimaAtualizacao: "Há 1 minuto"
};

// Configurações da IA e Locais
const INFO_TARIFA = { inteira: null, estudante: null, observacao: "" };

const PONTOS_REFERENCIA = [
    { nome: "URI Erechim", apelidos: ["uri", "universidade", "faculdade", "campus"], linha: 3, dica: "Ela leva direto ao câmpus da universidade." },
    { nome: "IFRS Câmpus Erechim", apelidos: ["ifrs", "instituto federal"], linha: 4, dica: "No protótipo, o acesso é pela linha dos bairros da região de Três Vendas." },
    { nome: "Hospitais e UPA", apelidos: ["hospital", "hospitais", "upa", "pronto socorro", "pronto atendimento", "caridade", "santa terezinha", "posto de saude", "ubs"], linha: 0, dica: "No protótipo, o acesso é pela linha do Centro. Em urgência, ligue 192 (SAMU)." },
    { nome: "Centro / Terminal Central", apelidos: ["centro", "terminal", "terminal central", "rodoviaria", "praca da bandeira", "calcadao", "catedral"], linha: 0, dica: "Ela passa pelo coração da cidade e termina no Terminal Central." },
    { nome: "Bairro Atlântico", apelidos: ["atlantico"], linha: 1, dica: "O trajeto segue pela Avenida Sete de Setembro." },
    { nome: "Bairro Bela Vista", apelidos: ["bela vista"], linha: 2, dica: "O trajeto passa pela Rua Itália." },
    { nome: "Bairro Três Vendas", apelidos: ["tres vendas"], linha: 4, dica: "O trajeto segue pela Avenida Caldas Júnior." }
];

const BAIRROS_SEM_LINHA = ["koller", "presidente vargas", "aeroporto", "industrial", "linho", "fatima"];

/* =====================================
   2. MAPA INTERATIVO & SIMULAÇÃO LEAFLET
===================================== */

const CENTRO_MAPA = [-27.6356, -52.2744];
const ZOOM_INICIAL = 13.5;

function redimensionarMapa(atrasos = [0, 260]) {
    atrasos.forEach(tempo => {
        setTimeout(() => { if (mapa) mapa.invalidateSize({ pan: false }); }, tempo);
    });
}

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
        attribution: "Tiles &copy; Esri &mdash; Esri, OpenStreetMap contributors"
    }).addTo(mapa);

    L.control.zoom({ position: "bottomright" }).addTo(mapa);

    renderizarParadasElinhasNoMapa();
    renderizarOnibusNoMapa();

    setInterval(atualizarMovimentacaoOnibusSimulados, 4000);
}

function renderizarParadasElinhasNoMapa() {
    // Desenha linhas de rota
    rotas.forEach(r => {
        L.polyline(r.coordenadasTrajeto, { color: r.cor, weight: 4, opacity: 0.7 }).addTo(mapa);
    });

    // Marcadores de paradas
    paradasSistema.forEach(parada => {
        const iconeHtml = `<div style="background:${parada.principal ? '#0284c7' : '#475569'}; width:14px; height:14px; border-radius:50%; border:2px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`;
        const customIcon = L.divIcon({ html: iconeHtml, className: 'marcador-parada-custom', iconSize: [14, 14] });

        const marker = L.marker(parada.coords, { icon: customIcon }).addTo(mapa);
        marker.bindPopup(`<strong>${parada.nome}</strong><br><small>${parada.principal ? 'Parada Inteligente Principal' : 'Ponto Integrado'}</small>`);
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
        marker.bindPopup(`<strong>${onibus.linha}</strong><br>Destino: ${onibus.destino}<br>Chegada: <strong>${onibus.minutos} min</strong> (${onibus.horario})<br>Situação: <strong>${onibus.status}</strong><br><small style="color:#64748b">*Dados simulados em tempo real</small>`);
        
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
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarMapa);
} else {
    inicializarMapa();
}

window.addEventListener("load", () => { if (mapa) mapa.invalidateSize(); });
window.addEventListener("resize", () => { if (mapa) mapa.invalidateSize(); });

/* =====================================
   3. RELÓGIO E CLIMA EM TEMPO REAL
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
atualizarRelogio();
setInterval(atualizarRelogio, 1000);

let climaAtual = { disponivel: false, temp: 20, max: 21, min: 17, codigo: 3, chuvaProb: null };

async function buscarClimaErechim() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=-27.6339&longitude=-52.2745&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=1";

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error();
        const dados = await resposta.json();
        const temperatura = Math.round(dados.current.temperature_2m);
        const tempMax = Math.round(dados.daily.temperature_2m_max[0]);
        const tempMin = Math.round(dados.daily.temperature_2m_min[0]);
        const codigo = dados.current.weather_code;
        const probChuva = dados.daily.precipitation_probability_max ? dados.daily.precipitation_probability_max[0] : null;

        let icone = "☁️";
        if (codigo === 0) icone = "☀️";
        else if ([1, 2].includes(codigo)) icone = "⛅";
        else if (codigo >= 51 && codigo <= 82) icone = "🌧️";
        else if (codigo >= 95) icone = "⛈️";

        document.getElementById("temperatura-atual").textContent = temperatura + "°C";
        document.getElementById("temperatura-maxima").textContent = tempMax + "°C";
        document.getElementById("temperatura-minima").textContent = tempMin + "°C";
        document.getElementById("icone-clima").textContent = icone;

        climaAtual = { disponivel: true, temp: temperatura, max: tempMax, min: tempMin, codigo, chuvaProb: probChuva };
    } catch {
        document.getElementById("temperatura-atual").textContent = "20°C";
    }
}
buscarClimaErechim();

/* =====================================
   4. CONTROLADOR DE PAINÉIS E REQUISITOS
===================================== */

const painel = document.getElementById("painel-funcionalidade");
const painelTitulo = document.getElementById("painel-titulo");
const painelCategoriaSub = document.getElementById("painel-categoria-sub");
const painelConteudo = document.getElementById("painel-conteudo");

function abrirPainel(titulo, conteudo, categoria = "PARADA INTELIGENTE • ERECHIM") {
    if (painelCategoriaSub) painelCategoriaSub.textContent = categoria;
    painelTitulo.textContent = titulo;
    painelConteudo.innerHTML = conteudo;
    painel.classList.add("aberto");
    painel.setAttribute("aria-hidden", "false");
    redimensionarMapa([0, 260]);
}

function fecharPainel() {
    painel.classList.remove("aberto");
    painel.setAttribute("aria-hidden", "true");
    redimensionarMapa([0, 260]);
}

function exibirAviso(mensagem) {
    const aviso = document.getElementById("aviso-sistema");
    if (!aviso) return;
    aviso.textContent = mensagem;
    aviso.classList.add("visivel");
    setTimeout(() => aviso.classList.remove("visivel"), 3800);
}

// 1. Próximas Chegadas
function mostrarChegadas() {
    let conteudo = `<p class="painel-subtitulo">PREVISÃO INTELIGENTE DE CHEGADA (SIMULAÇÃO DE GPS)</p>`;
    dadosOnibus.forEach(onibus => {
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
                    <small style="color:#64748b">Última atualização: ${ultimaAtualizacaoSimulacao}</small>
                </div>
            </div>
        `;
    });
    abrirPainel("Próximas Chegadas", conteudo);
}

// 2. Rotas e Itinerários
function mostrarRotas() {
    let conteudo = `<p class="painel-subtitulo">ITINERÁRIOS URBANOS DE ERECHIM</p>`;
    rotas.forEach(rota => {
        conteudo += `
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
    abrirPainel("Rotas e Itinerários", conteudo);
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

// 4. Alertas do Sistema
function mostrarAlertas() {
    const conteudo = `
        <p class="painel-subtitulo">INFORMAÇÕES DO SISTEMA</p>
        <div class="item-informacao">
            <strong>Tráfego Urbano</strong>
            <small>Sistema de Mobilidade</small>
            <p>Trânsito fluindo normalmente no centro de Erechim.</p>
            <span class="etiqueta">Operação Normal</span>
        </div>
        <div class="item-informacao">
            <strong>Painel e Conectividade</strong>
            <small>Monitoramento da Parada</small>
            <p>Conexão com os painéis e relógio funcionando corretamente.</p>
            <span class="etiqueta">Sistemas Online</span>
        </div>
    `;
    abrirPainel("Alertas do Sistema", conteudo);
}

// 5. Planejador de Viagens
function mostrarPlanejadorViagens() {
    let conteudo = `
        <p class="painel-subtitulo">PLANEJADOR INTELIGENTE DE ROTAS</p>
        <div class="form-planejador">
            <div class="grupo-input">
                <label for="origem-viagem">Local de Origem</label>
                <select id="origem-viagem">
                    <option value="parada_central">Parada Central (Praça da Bandeira)</option>
                    <option value="parada_uri">Câmpus URI Erechim</option>
                    <option value="parada_atlantico">Bairro Atlântico</option>
                    <option value="parada_bela_vista">Bairro Bela Vista</option>
                    <option value="parada_tres_vendas">Três Vendas</option>
                </select>
            </div>
            <div class="grupo-input">
                <label for="destino-viagem">Local de Destino</label>
                <select id="destino-viagem">
                    <option value="parada_uri">Câmpus URI Erechim</option>
                    <option value="parada_central">Parada Central (Praça da Bandeira)</option>
                    <option value="parada_atlantico">Bairro Atlântico</option>
                    <option value="parada_bela_vista">Bairro Bela Vista</option>
                    <option value="parada_tres_vendas">Três Vendas</option>
                </select>
            </div>
            <button class="btn-acao-primaria" onclick="calcularRotaViagem()">Calcular Trajeto Recomendado</button>
        </div>
        <div id="resultado-planejamento"></div>
    `;
    abrirPainel("Planejador de Viagens", conteudo);
}

function calcularRotaViagem() {
    const origem = document.getElementById("origem-viagem").value;
    const destino = document.getElementById("destino-viagem").value;
    const containerRes = document.getElementById("resultado-planejamento");

    if (origem === destino) {
        containerRes.innerHTML = `<div class="item-informacao" style="border-color:#ef4444;"><strong style="color:#ef4444;">Origem e destino iguais</strong><small>Escolha locais diferentes para calcular a rota.</small></div>`;
        return;
    }

    let linhaSugerida = rotas[3];
    if (destino === "parada_atlantico") linhaSugerida = rotas[1];
    if (destino === "parada_bela_vista") linhaSugerida = rotas[2];
    if (destino === "parada_tres_vendas") linhaSugerida = rotas[4];
    if (destino === "parada_central") linhaSugerida = rotas[0];

    containerRes.innerHTML = `
        <div class="item-informacao" style="border-color:#16a34a;">
            <strong style="color:#16a34a;">Sugestão de Viagem Calculada</strong>
            <p style="margin-top:6px;">
                🚌 <strong>Linha:</strong> ${linhaSugerida.nome}<br>
                📍 <strong>Embarque Recomendado:</strong> Parada Central<br>
                🏁 <strong>Desembarque Recomendado:</strong> Ponto mais próximo do destino<br>
                ⏱️ <strong>Tempo Estimado:</strong> ~18 minutos<br>
                📏 <strong>Distância Aproximada:</strong> 4.2 km
            </p>
        </div>
    `;
    exibirAviso("Trajeto sugerido gerado com sucesso!");
}

// 6. Modo de Acessibilidade
function mostrarAcessibilidade() {
    let conteudo = `
        <p class="painel-subtitulo">RECURSOS DE ACESSIBILIDADE</p>
        <div class="item-informacao">
            <strong>Tamanho do Texto</strong>
            <div style="display:flex; gap:8px; margin-top:8px;">
                <button class="btn-acao-primaria" style="flex:1;" onclick="mudarTamanhoFonte(1)">Fonte Padrão</button>
                <button class="btn-acao-primaria" style="flex:1;" onclick="mudarTamanhoFonte(1.15)">Fonte Aumentada</button>
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
            <strong>Leitura por Voz (SpeechSynthesis)</strong>
            <p>O assistente de IA realiza a síntese vocal automática das respostas emitidas pelo sistema.</p>
        </div>
    `;
    abrirPainel("Acessibilidade", conteudo);
}

function mudarTamanhoFonte(fator) {
    document.body.style.fontSize = fator === 1 ? "100%" : "115%";
    exibirAviso(fator === 1 ? "Tamanho de texto redefinido." : "Texto ampliado com sucesso.");
}

function alternarAltoContraste(ativar) {
    if (ativar) {
        document.body.classList.add("alto-contraste");
        exibirAviso("Modo de Alto Contraste ativado.");
    } else {
        document.body.classList.remove("alto-contraste");
        exibirAviso("Modo visual padrão ativado.");
    }
}

// 7. Informações e Monitoramento da Parada (ESP32)
function mostrarInfoParada() {
    let conteudo = `
        <p class="painel-subtitulo">MONITORAMENTO DA INFRAESTRUTURA (ESP32)</p>
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
                <span>Energia Solar</span>
                <strong>${configParadaHardware.alimentacaoEletrica}</strong>
            </div>
            <div class="card-monitor">
                <span>Temperatura</span>
                <strong>${configParadaHardware.temperaturaAmbiente}</strong>
            </div>
        </div>
        <div class="item-informacao">
            <strong>Status dos Sensores IoT</strong>
            <p>Estrutura pronta para recebimento de requisições API/MQTT do ESP32. Operando com simulador de telemetria em tempo real.</p>
            <span class="etiqueta">Funcionamento Normal</span>
        </div>
    `;
    abrirPainel("Info da Parada (ESP32)", conteudo);
}

// 8. Ajuda e SOS
function mostrarAjuda() {
    const conteudo = `
        <div class="aviso-sos-banner">
            <div>
                <span class="sos-badge-status"><span class="ponto-pulse"></span> SISTEMA DE ATENDIMENTO</span>
                <p style="margin-top:6px; font-size:0.78rem; color:#475569; line-height:1.4;">
                    Selecione o serviço para acionar chamada simulada de emergência.
                </p>
            </div>
        </div>

        <div id="container-confirmacao-sos"></div>

        <p class="painel-subtitulo">SERVIÇOS DE EMERGÊNCIA</p>
        <div class="grade-emergencia-completa">
            <div class="card-emergencia-item" onclick="solicitarAtendimento('SAMU', '192')">
                <div class="card-emergencia-topo">
                    <span class="num-emergencia">192</span>
                </div>
                <strong>SAMU</strong>
                <span>Atendimento médico</span>
            </div>

            <div class="card-emergencia-item" onclick="solicitarAtendimento('Polícia Militar', '190')">
                <div class="card-emergencia-topo">
                    <span class="num-emergencia">190</span>
                </div>
                <strong>Polícia Militar</strong>
                <span>Segurança pública</span>
            </div>

            <div class="card-emergencia-item" onclick="solicitarAtendimento('Corpo de Bombeiros', '193')">
                <div class="card-emergencia-topo">
                    <span class="num-emergencia">193</span>
                </div>
                <strong>Bombeiros</strong>
                <span>Resgate e emergência</span>
            </div>

            <div class="card-emergencia-item" onclick="solicitarAtendimento('Guarda Municipal', '153')">
                <div class="card-emergencia-topo">
                    <span class="num-emergencia">153</span>
                </div>
                <strong>Guarda Municipal</strong>
                <span>Apoio e patrulha</span>
            </div>
        </div>

        <div class="secao-enviar-ideia">
            <p class="painel-subtitulo">ENVIAR SUGESTÃO</p>
            <div class="area-ideia-input">
                <textarea id="texto-ideia-usuario" placeholder="Escreva sua sugestão ou comentário..."></textarea>
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
            <strong>Solicitar Atendimento: ${servico} (${numero})?</strong>
            <p style="font-size:0.75rem; color:#475569; margin-top:4px;">Confirmação de simulação de chamada para emergência.</p>
            <div class="botoes-confirmacao-emergencia" style="margin-top:8px;">
                <button class="btn-confirmar-sos" onclick="confirmarChamadaEmergencia()">Confirmar (Simulação)</button>
                <button class="btn-cancelar-sos" onclick="cancelarChamadaEmergencia()">Cancelar</button>
            </div>
        </div>
    `;
}

function confirmarChamadaEmergencia() {
    if (!servicoEmergenciaSelecionado) return;
    const { servico, numero } = servicoEmergenciaSelecionado;
    cancelarChamadaEmergencia();
    exibirAviso(`Chamada simulada enviada para ${servico} (${numero}).`);
}

function cancelarChamadaEmergencia() {
    servicoEmergenciaSelecionado = null;
    const container = document.getElementById("container-confirmacao-sos");
    if (container) container.innerHTML = "";
}

function enviarIdeiaUsuario() {
    const input = document.getElementById("texto-ideia-usuario");
    if (!input) return;

    const texto = input.value.trim();
    if (!texto) {
        exibirAviso("Por favor, digite sua mensagem antes de enviar.");
        return;
    }

    input.value = "";
    exibirAviso("Obrigado! Sua sugestão foi registrada com sucesso.");
}

/* =====================================
   5. ASSISTENTE INTELIGENTE COM IA
===================================== */

function mostrarIA() {
    const conteudo = `
        <div class="assistente-apresentacao">
            <div class="assistente-avatar">IA</div>
            <div>
                <span class="assistente-etiqueta">ASSISTENTE VIRTUAL DA PARADA</span>
                <p style="font-size:0.76rem; color:#64748b;">Ônibus, rotas, horários, clima, tarifa e a tecnologia da parada.</p>
            </div>
        </div>

        <div class="sugestoes-assistente">
            <button onclick="enviarSugestao('Qual o próximo ônibus?')">⏱️ Próximo Ônibus</button>
            <button onclick="enviarSugestao('Como chego na URI?')">🎓 Como chegar na URI</button>
            <button onclick="enviarSugestao('Vai chover hoje?')">🌦️ Clima e Ônibus</button>
            <button onclick="enviarSugestao('Como funciona a energia solar da parada?')">☀️ Energia Solar</button>
            <button onclick="enviarSugestao('Quanto custa a passagem?')">💳 Tarifa e Pagamento</button>
            <button onclick="enviarSugestao('Como pedir ajuda?')">🆘 Ajuda de Emergência</button>
        </div>

        <div id="historico-chat" class="historico-chat"></div>

        <form class="campo-chat" id="form-chat">
            <input type="text" id="entrada-chat" placeholder="Pergunte sobre ônibus, rotas, clima, tarifa..." required autocomplete="off">
            <button type="button" class="botao-microfone" onclick="iniciarVoz()" title="Falar por voz">🎙️</button>
            <button type="submit" class="botao-enviar" title="Enviar">Enviar</button>
        </form>

        <div class="estado-assistente">
            Assistente Informativa da Parada Inteligente
        </div>
    `;

    abrirPainel("Assistente de IA", conteudo);

    document.getElementById("form-chat").addEventListener("submit", processarPerguntaIA);

    if (historicoConversaAssistente.length > 0) {
        historicoConversaAssistente.forEach(msg => adicionarMensagemChat(msg.texto, msg.tipo, false));
    } else {
        adicionarMensagemChat("Olá! Sou a assistente da parada. Posso informar o próximo ônibus, rotas, clima e como o sistema funciona. O que você precisa?", "ia");
    }
}

function enviarSugestao(texto) {
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

    if (tipo === "usuario") {
        divMsg.textContent = texto;
    } else {
        divMsg.innerHTML = texto;
    }

    historico.appendChild(divMsg);
    historico.scrollTop = historico.scrollHeight;

    if (salvar) historicoConversaAssistente.push({ texto, tipo });
}

function processarPerguntaIA(e) {
    e.preventDefault();
    const input = document.getElementById("entrada-chat");
    const pergunta = input.value.trim();

    if (!pergunta) return;

    adicionarMensagemChat(pergunta, "usuario");
    input.value = "";

    setTimeout(() => {
        const resposta = gerarRespostaInteligenteIA(pergunta);
        adicionarMensagemChat(resposta, "ia");
        falarTexto(resposta);
    }, 250);
}

function normalizar(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function gerarRespostaInteligenteIA(pergunta) {
    const p = normalizar(pergunta);

    if (!p) return "Por favor, digite sua dúvida.";

    if (p.includes("socorro") || p.includes("emergencia") || p.includes("samu") || p.includes("policia") || p.includes("bombeiro") || p.includes("assalto")) {
        return `Em caso de emergência, ligue para os telefones oficiais: SAMU <strong>192</strong>, Polícia Militar <strong>190</strong> ou Bombeiros <strong>193</strong>. Use o botão <strong>Ajuda / SOS</strong> da tela para chamada simulada.`;
    }
    if (p.includes("uri") || p.includes("universidade") || p.includes("faculdade")) {
        return `Para ir à URI, pegue a <strong>Linha 04 — URI / Câmpus</strong>. O veículo chega nesta parada em cerca de <strong>${dadosOnibus[3].minutos} minutos</strong> (${dadosOnibus[3].horario}).`;
    }
    if (p.includes("centro")) {
        return `Para o Centro, pegue a <strong>Linha 01 — Centro</strong>. Ela chega em cerca de <strong>${dadosOnibus[0].minutos} minutos</strong>.`;
    }
    if (p.includes("proximo") || p.includes("chegando") || p.includes("demora") || p.includes("tempo")) {
        const o = [...dadosOnibus].sort((a, b) => a.minutos - b.minutos)[0];
        return `O próximo ônibus é a <strong>${o.linha}</strong>, sentido ${o.destino}, chegando em <strong>${o.minutos} minutos</strong> (${o.horario}).`;
    }
    if (p.includes("linhas") || p.includes("quais")) {
        return `As linhas cadastradas nesta parada são: <strong>Linha 01</strong> (Centro), <strong>Linha 02</strong> (Atlântico), <strong>Linha 03</strong> (Bela Vista), <strong>Linha 04</strong> (URI) e <strong>Linha 05</strong> (Três Vendas).`;
    }
    if (p.includes("clima") || p.includes("chuva") || p.includes("tempo")) {
        return `Agora em Erechim a temperatura é de <strong>${climaAtual.temp}°C</strong>. Mínima de ${climaAtual.min}°C e máxima de ${climaAtual.max}°C.`;
    }
    if (p.includes("solar") || p.includes("esp32") || p.includes("energia") || p.includes("bateria")) {
        return `A parada utiliza uma microrrede solar com controlador de carga, bateria de lítio para autonomia noturna e um microcontrolador <strong>ESP32</strong> monitorando a telemetria via Wi-Fi.`;
    }

    return `Não encontrei essa informação na base de dados cadastrada. Você pode consultar os botões de <strong>Próximas Chegadas</strong>, <strong>Quadro de Horários</strong> ou <strong>Rotas e Itinerários</strong>.`;
}

/* =====================================
   6. SÍNTESE E RECONHECIMENTO DE VOZ
===================================== */

function iniciarVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        exibirAviso("Seu navegador não possui suporte para voz.");
        return;
    }

    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const rec = new SpeechRecognition();
    rec.lang = "pt-BR";
    rec.interimResults = false;

    rec.onresult = (e) => {
        const texto = e.results[0][0].transcript;
        const input = document.getElementById("entrada-chat");
        if (input) {
            input.value = texto;
            document.getElementById("form-chat").requestSubmit();
        }
    };

    rec.onerror = () => {
        exibirAviso("Não consegui ouvir. Tente falar novamente.");
    };

    rec.start();
}

function falarTexto(texto) {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const limpo = texto.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
    const ut = new SpeechSynthesisUtterance(limpo);
    ut.lang = "pt-BR";
    ut.rate = 1.0;
    synth.speak(ut);
}

/* =====================================
   7. ROTEAMENTO DE BOTÕES
===================================== */

function acaoBotao(nome) {
    switch (nome) {
        case "PRÓXIMAS CHEGADAS": mostrarChegadas(); break;
        case "ROTAS E ITINERÁRIOS": mostrarRotas(); break;
        case "QUADRO DE HORÁRIOS": mostrarHorarios(); break;
        case "ALERTAS DO SISTEMA": mostrarAlertas(); break;
        case "PLANEJADOR DE VIAGENS": mostrarPlanejadorViagens(); break;
        case "ACESSIBILIDADE": mostrarAcessibilidade(); break;
        case "INFRAESTRUTURA DA PARADA": mostrarInfoParada(); break;
        case "AJUDA / SOS": mostrarAjuda(); break;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharPainel();
});