/* =====================================
   DADOS DO SISTEMA
===================================== */
const paradasSistema = [
    { id: "parada_central",     nome: "Parada Central (Praça da Bandeira)", coords: [-27.6356, -52.2744], principal: true },
    { id: "parada_atlantico",   nome: "Bairro Atlântico (Av. Sete)",        coords: [-27.6450, -52.2600], principal: false },
    { id: "parada_bela_vista",  nome: "Bairro Bela Vista (R. Itália)",      coords: [-27.6280, -52.2900], principal: false },
    { id: "parada_uri",         nome: "Câmpus URI Erechim",                 coords: [-27.6210, -52.2850], principal: false },
    { id: "parada_tres_vendas", nome: "Três Vendas (Av. Caldas Júnior)",    coords: [-27.6150, -52.2650], principal: false }
];

const rotas = [
    {
        id: "linha_1", nome: "Linha 01 — Centro / Atlântico", destino: "Bairro Atlântico via Av. Maurício Cardoso",
        cor: "#111111", tempoTotal: 15, horarioOperacao: "06:30 — 19:10",
        paradas: ["Parada Central", "Av. Maurício Cardoso", "Bairro Atlântico"],
        coordenadasTrajeto: [[-27.6356, -52.2744], [-27.6372, -52.2718], [-27.6395, -52.2685], [-27.6418, -52.2650], [-27.6435, -52.2628], [-27.6450, -52.2600]]
    },
    {
        id: "linha_2", nome: "Linha 02 — Atlântico Expresso", destino: "Bairro Atlântico via Av. Sete de Setembro",
        cor: "#444444", tempoTotal: 20, horarioOperacao: "06:45 — 19:25",
        paradas: ["Parada Central", "Av. Sete de Setembro", "Bairro Atlântico"],
        coordenadasTrajeto: [[-27.6356, -52.2744], [-27.6375, -52.2720], [-27.6398, -52.2690], [-27.6420, -52.2658], [-27.6435, -52.2630], [-27.6450, -52.2600]]
    },
    {
        id: "linha_3", nome: "Linha 03 — Bela Vista", destino: "Bairro Bela Vista via R. Itália",
        cor: "#777777", tempoTotal: 25, horarioOperacao: "07:00 — 20:00",
        paradas: ["Parada Central", "R. Itália", "Bairro Bela Vista"],
        coordenadasTrajeto: [[-27.6356, -52.2744], [-27.6340, -52.2780], [-27.6322, -52.2818], [-27.6300, -52.2855], [-27.6280, -52.2900]]
    },
    {
        id: "linha_4", nome: "Linha 04 — URI / Câmpus", destino: "Universidade URI Erechim",
        cor: "#aaaaaa", tempoTotal: 30, horarioOperacao: "07:10 — 22:30",
        paradas: ["Parada Central", "Av. Sete de Setembro", "Câmpus URI"],
        coordenadasTrajeto: [[-27.6356, -52.2744], [-27.6335, -52.2770], [-27.6310, -52.2795], [-27.6280, -52.2820], [-27.6245, -52.2838], [-27.6210, -52.2850]]
    },
    {
        id: "linha_5", nome: "Linha 05 — Três Vendas", destino: "Bairro Três Vendas via Av. Caldas Júnior",
        cor: "#333333", tempoTotal: 35, horarioOperacao: "06:40 — 18:30",
        paradas: ["Parada Central", "Av. Caldas Júnior", "Três Vendas"],
        coordenadasTrajeto: [[-27.6356, -52.2744], [-27.6325, -52.2725], [-27.6290, -52.2710], [-27.6255, -52.2690], [-27.6220, -52.2675], [-27.6185, -52.2662], [-27.6150, -52.2650]]
    }
];

let dadosOnibus = [
    { id: "onibus_1", linhaIdx: 0, linha: "Linha 01 — Centro / Atlântico",  destino: "Bairro Atlântico",  minutos: 4,  status: "No horário", cor: "#111111" },
    { id: "onibus_2", linhaIdx: 1, linha: "Linha 02 — Atlântico Expresso",  destino: "Bairro Atlântico",  minutos: 11, status: "No horário", cor: "#444444" },
    { id: "onibus_3", linhaIdx: 2, linha: "Linha 03 — Bela Vista",          destino: "Bairro Bela Vista", minutos: 19, status: "Adiantado",  cor: "#777777" },
    { id: "onibus_4", linhaIdx: 3, linha: "Linha 04 — URI / Câmpus",        destino: "URI Erechim",       minutos: 25, status: "No horário", cor: "#aaaaaa" },
    { id: "onibus_5", linhaIdx: 4, linha: "Linha 05 — Três Vendas",         destino: "Três Vendas",       minutos: 33, status: "Atrasado",   cor: "#333333" }
];

const horariosOperacao = [
    { linha: "Linha 01 — Centro / Atlântico",  partidas: ["06:30","07:15","08:00","11:45","12:15","13:30","15:35","17:15","18:20","19:10"] },
    { linha: "Linha 02 — Atlântico Expresso",  partidas: ["06:45","07:30","08:15","11:50","12:30","13:45","15:42","17:30","18:40","19:25"] },
    { linha: "Linha 03 — Bela Vista",          partidas: ["07:00","07:45","08:30","12:00","12:45","14:00","15:50","17:45","19:00","20:00"] },
    { linha: "Linha 04 — URI / Câmpus",        partidas: ["07:10","07:35","11:30","13:15","16:05","18:00","19:00","22:30"] },
    { linha: "Linha 05 — Três Vendas",         partidas: ["06:40","07:20","12:10","13:20","16:20","17:50","18:30"] }
];

const configParadaHardware = {
    painelEletronico: "Normal", conexaoInternet: "Online", sinalWiFi: 98,
    alimentacaoEletrica: "Solar / Bateria", bateria: 100, carregando: false,
    temperaturaAmbiente: 22, estadoESP32: "Operacional", ultimaAtualizacao: new Date()
};

/* =====================================
   ESTADO GLOBAL
===================================== */
let mapa = null;
let camadasRotas = {};
let marcadoresOnibusNoMapa = {};
let marcadoresParadasNoMapa = {};
let painelAtual = null;
let linhasOcultas = new Set();
let intervaloMovimento = null;
let intervaloIoT = null;
let servicoEmergenciaSelecionado = null;
let vozAtiva = false;
let filtroFavoritas = false;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TICK_MS = prefersReducedMotion ? 3000 : 1000;
const PASSO_MINUTOS = prefersReducedMotion ? 0.45 : 0.15;

let favoritos = safeParse(localStorage.getItem("pi_favoritos"), []);
let historicoConversaAssistente = safeParse(localStorage.getItem("pi_historico_chat"), []);
let historicoBuscas = safeParse(localStorage.getItem("pi_historico_buscas"), []);
vozAtiva = localStorage.getItem("pi_voz_ativa") === "true";

/* =====================================
   UTILITÁRIOS
===================================== */
function safeParse(raw, fallback) { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function escapeHtml(str) { return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function minutosAgoraStr() { return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
function calcularHorarioChegada(minutos) {
    const d = new Date(); d.setMinutes(d.getMinutes() + Math.round(minutos));
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
}
function coordsIguais(a, b) { return Math.abs(a[0] - b[0]) < 0.0005 && Math.abs(a[1] - b[1]) < 0.0005; }
function debounce(fn, delay) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); }; }
function normalizar(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[?!.,;:]+$/, "").trim(); }

window.addEventListener("error", (e) => { console.error(e); try { exibirAviso("Ocorreu um erro inesperado."); } catch {} });

/* =====================================
   PAINÉIS E NAVEGAÇÃO
===================================== */
const painelEl = document.getElementById("painel-funcionalidade");
const painelTitulo = document.getElementById("painel-titulo");
const painelConteudo = document.getElementById("painel-conteudo");

const MAPA_BOTAO_PAINEL = {
    "Assistente com IA": "Assistente IA", "Próximas Chegadas": "Chegadas",
    "Linhas e Itinerários": "Linhas", "Quadro de Horários": "Horários",
    "Planejador de Viagens": "Planejador", "Acessibilidade": "Acessibilidade",
    "Infraestrutura da Parada": "Info Parada", "Ajuda / SOS": "Ajuda / SOS"
};

function atualizarAriaCurrent(titulo) {
    document.querySelectorAll(".botao-lateral").forEach(b => b.removeAttribute("aria-current"));
    const texto = MAPA_BOTAO_PAINEL[titulo];
    if (!texto) return;
    document.querySelectorAll(".botao-lateral").forEach(b => {
        if (b.textContent.trim() === texto) b.setAttribute("aria-current", "page");
    });
}

function abrirPainel(titulo, conteudo, categoria = "PARADA INTELIGENTE • ERECHIM") {
    if (painelTitulo) painelTitulo.textContent = titulo;
    if (painelConteudo) painelConteudo.innerHTML = conteudo;
    const catEl = document.getElementById("painel-categoria-sub");
    if (catEl) catEl.textContent = categoria;
    if (painelEl) { painelEl.classList.add("aberto"); painelEl.setAttribute("aria-hidden", "false"); }
    painelAtual = titulo;
    atualizarAriaCurrent(titulo);
    redimensionarMapa();
    setTimeout(() => { painelEl?.querySelector(".fechar-painel")?.focus(); }, 50);
}

function fecharPainel() {
    if (painelEl) { painelEl.classList.remove("aberto"); painelEl.setAttribute("aria-hidden", "true"); }
    painelAtual = null;
    atualizarAriaCurrent(null);
    redimensionarMapa();
}

function exibirAviso(msg) {
    const aviso = document.getElementById("aviso-sistema");
    if (!aviso) return;
    aviso.textContent = msg; aviso.classList.add("visivel");
    clearTimeout(exibirAviso._t);
    exibirAviso._t = setTimeout(() => aviso.classList.remove("visivel"), 3500);
}

function redimensionarMapa() {
    setTimeout(() => { if (mapa) mapa.invalidateSize({ pan: false }); }, 0);
    setTimeout(() => { if (mapa) mapa.invalidateSize({ pan: false }); }, 250);
}

function trapFocus(e) {
    if (!painelEl || !painelEl.classList.contains("aberto") || e.key !== "Tab") return;
    const focusable = painelEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* =====================================
   MAPA E ÔNIBUS
===================================== */
const CENTRO_MAPA = [-27.6356, -52.2744];
const ZOOM_INICIAL = 13.5;

function posicaoNaPolyline(coords, fraction) {
    if (!coords || coords.length === 0) return [0, 0];
    if (coords.length === 1) return coords[0];
    const n = coords.length - 1, f = Math.max(0, Math.min(1, fraction));
    const seg = Math.min(Math.floor(f * n), n - 1), t = f * n - seg;
    const a = coords[seg], b = coords[seg + 1];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function inicializarProgressoOnibus() {
    dadosOnibus.forEach(bus => {
        const rota = rotas[bus.linhaIdx];
        bus.tempoTotal = rota.tempoTotal;
        bus.progresso = Math.min(1, Math.max(0, (bus.tempoTotal - bus.minutos) / bus.tempoTotal));
        bus.horario = calcularHorarioChegada(bus.minutos);
    });
}

function iniciarMovimentoOnibus() {
    if (intervaloMovimento) return;
    intervaloMovimento = setInterval(() => {
        dadosOnibus.forEach(bus => {
            bus.minutos = Math.max(0.3, bus.minutos - PASSO_MINUTOS);
            if (bus.minutos <= 0.5) { bus.minutos = bus.tempoTotal; bus.progresso = 0; }
            else { bus.progresso = 1 - (bus.minutos / bus.tempoTotal); }
            bus.horario = calcularHorarioChegada(bus.minutos);

            const rota = rotas[bus.linhaIdx], marker = marcadoresOnibusNoMapa[bus.id];
            if (rota && marker) marker.setLatLng(posicaoNaPolyline(rota.coordenadasTrajeto, bus.progresso));
        });
        if (painelAtual === "Próximas Chegadas") atualizarContadoresChegadas();
        if (painelAtual === "Infraestrutura da Parada") atualizarDisplayIoT();
    }, TICK_MS);
}

function inicializarMapa() {
    const el = document.getElementById("mapa-erechim");
    if (!el || mapa) return;
    if (typeof L === "undefined") { exibirAviso("Mapa indisponível."); document.getElementById("mapa-carregando")?.classList.add("oculto"); return; }

    // Limites de Erechim
    const limites = L.latLngBounds(L.latLng(-27.700, -52.340), L.latLng(-27.580, -52.200));
    mapa = L.map("mapa-erechim", { zoomControl: false, minZoom: 12, maxZoom: 18, maxBounds: limites }).setView(CENTRO_MAPA, ZOOM_INICIAL);

    // Mapa em tons de cinza (CartoDB Positron)
    const tiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19, subdomains: "abcd", attribution: "&copy; OpenStreetMap &copy; CARTO"
    }).addTo(mapa);

    const timerOcultar = setTimeout(() => document.getElementById("mapa-carregando")?.classList.add("oculto"), 5000);
    tiles.once("load", () => { clearTimeout(timerOcultar); setTimeout(() => document.getElementById("mapa-carregando")?.classList.add("oculto"), 300); });

    L.control.zoom({ position: "bottomright" }).addTo(mapa);

    // Rotas
    rotas.forEach(r => {
        const poly = L.polyline(r.coordenadasTrajeto, { color: r.cor, weight: 4, opacity: 0.85 }).addTo(mapa);
        poly.bindTooltip(r.nome, { sticky: true });
        camadasRotas[r.id] = poly;
    });

    // Paradas
    paradasSistema.forEach(p => {
        const cor = p.principal ? "#111111" : "#777777";
        const icone = L.divIcon({
            html: `<div style="background:${cor};width:12px;height:12px;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
            className: "", iconSize: [12, 12], iconAnchor: [6, 6]
        });
        L.marker(p.coords, { icon: icone, title: p.nome }).addTo(mapa)
            .bindPopup(`<strong>${escapeHtml(p.nome)}</strong><br><small>${p.principal ? "Parada Principal" : "Ponto"}</small>`);
    });

    // Ônibus
    dadosOnibus.forEach(bus => {
        const rota = rotas[bus.linhaIdx]; if (!rota) return;
        const pos = posicaoNaPolyline(rota.coordenadasTrajeto, bus.progresso || 0);
        const iconeHtml = `<div style="background:${bus.cor};color:#fff;padding:2px 6px;font-size:10px;font-weight:800;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;">🚌 ${bus.linha.split("—")[0].trim()}</div>`;
        const icone = L.divIcon({ html: iconeHtml, className: "", iconSize: [70, 24], iconAnchor: [35, 12] });
        const marker = L.marker(pos, { icon: icone, riseOnHover: true }).addTo(mapa);
        marker.bindPopup(() =>
            `<strong>${escapeHtml(bus.linha)}</strong><br>
             Destino: ${escapeHtml(bus.destino)}<br>
             Chegada: <strong>${Math.round(bus.minutos)} min</strong> (${bus.horario})`
        );
        marcadoresOnibusNoMapa[bus.id] = marker;
    });

    construirFiltroLinhas(); construirLegenda(); iniciarMovimentoOnibus(); refinarRotasViaOSRM();
}

async function refinarRotasViaOSRM() {
    if (!navigator.onLine) return;
    try {
        for (const rota of rotas) {
            const pts = rota.coordenadasTrajeto, start = pts[0], end = pts[pts.length - 1];
            const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
            const r = await fetch(url); if (!r.ok) continue;
            const d = await r.json();
            if (d.routes?.[0]?.geometry) {
                const coords = d.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
                if (coords.length > 2) { rota.coordenadasTrajeto = coords; camadasRotas[rota.id]?.setLatLngs(coords); }
            }
        }
    } catch (e) { console.info("OSRM indisponível."); }
}

function centralizarMapa() { if (mapa) { mapa.setView(CENTRO_MAPA, ZOOM_INICIAL); exibirAviso("Mapa centralizado."); } }
function toggleFiltroLinhas() { const el = document.getElementById("filtro-linhas"); const btn = document.getElementById("btn-filtro-mapa"); if (el) { el.hidden = !el.hidden; btn?.setAttribute("aria-expanded", (!el.hidden).toString()); } }
function toggleLegenda() { const el = document.getElementById("legenda-mapa"); const btn = document.getElementById("btn-legenda-mapa"); if (el) { el.hidden = !el.hidden; btn?.setAttribute("aria-expanded", (!el.hidden).toString()); } }

function construirFiltroLinhas() {
    const c = document.getElementById("lista-filtro-linhas"); if (!c) return;
    c.innerHTML = rotas.map(r => `<label><input type="checkbox" ${linhasOcultas.has(r.id) ? "" : "checked"} onchange="toggleLinhaFiltro('${r.id}')"><span class="cor-mini" style="background:${r.cor}"></span><span>${escapeHtml(r.nome)}</span></label>`).join("");
}
function toggleLinhaFiltro(id) { if (linhasOcultas.has(id)) linhasOcultas.delete(id); else linhasOcultas.add(id); atualizarVisibilidadeLinhas(); }
function limparFiltroLinhas() { linhasOcultas.clear(); construirFiltroLinhas(); atualizarVisibilidadeLinhas(); exibirAviso("Linhas visíveis."); }

function atualizarVisibilidadeLinhas() {
    rotas.forEach(r => camadasRotas[r.id]?.setStyle({ opacity: !linhasOcultas.has(r.id) ? 0.85 : 0.1 }));
    dadosOnibus.forEach(bus => {
        const visivel = !linhasOcultas.has(rotas[bus.linhaIdx].id), marker = marcadoresOnibusNoMapa[bus.id];
        if (!marker || !mapa) return;
        if (visivel && !mapa.hasLayer(marker)) marker.addTo(mapa);
        if (!visivel && mapa.hasLayer(marker)) mapa.removeLayer(marker);
    });
}

function construirLegenda() {
    const c = document.getElementById("legenda-linhas"); if (!c) return;
    c.innerHTML = rotas.map(r => `<div class="item-legenda"><span class="cor-legenda" style="background:${r.cor}"></span><span>${escapeHtml(r.nome)}</span></div>`).join("");
}

/* =====================================
   CHEGADAS E LINHAS
===================================== */
function mostrarChegadas() {
    const ordenados = [...dadosOnibus].sort((a, b) => a.minutos - b.minutos).slice(0, 5);
    let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <p class="painel-subtitulo" style="margin:0;">PREVISÃO DE CHEGADA</p>
        <small style="font-size:10px;color:var(--texto-secundario);">Atualizado: <strong>${minutosAgoraStr()}</strong></small>
    </div>`;
    ordenados.forEach(bus => {
        html += `<div class="item-informacao" data-chegada-id="${bus.id}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <strong style="flex:1;">${escapeHtml(bus.linha)}</strong>
                <span class="destaque-horario" data-eta-id="${bus.id}">${Math.round(bus.minutos)} min</span>
            </div>
            <small>Destino: ${escapeHtml(bus.destino)}</small>
            <small>Horário previsto: <span data-horario-id="${bus.id}">${bus.horario}</span></small>
            <div style="display:flex;justify-content:space-between;margin-top:8px;">
                <span class="etiqueta ${bus.status === "Atrasado" ? "atrasado" : ""}">${escapeHtml(bus.status)}</span>
                <button class="btn-secundario" style="padding:4px 8px;font-size:10px;" onclick="focarOnibusNoMapa('${bus.id}')">Ver no mapa</button>
            </div>
        </div>`;
    });
    abrirPainel("Próximas Chegadas", html);
}

function atualizarContadoresChegadas() {
    document.querySelectorAll("[data-eta-id]").forEach(el => { const bus = dadosOnibus.find(b => b.id === el.getAttribute("data-eta-id")); if (bus) el.textContent = Math.round(bus.minutos) + " min"; });
    document.querySelectorAll("[data-horario-id]").forEach(el => { const bus = dadosOnibus.find(b => b.id === el.getAttribute("data-horario-id")); if (bus) el.textContent = bus.horario; });
}

function focarOnibusNoMapa(id) {
    const marker = marcadoresOnibusNoMapa[id]; if (!mapa || !marker) return;
    mapa.setView(marker.getLatLng(), 15); marker.openPopup(); exibirAviso("Veículo localizado.");
}

const salvarBuscaDebounced = debounce((termo) => {
    if (!termo || termo.trim().length < 2) return;
    historicoBuscas = [{ termo: termo.trim(), tipo: "linhas", data: Date.now() }, ...historicoBuscas.filter(h => h.termo.toLowerCase() !== termo.trim().toLowerCase())].slice(0, 10);
    try { localStorage.setItem("pi_historico_buscas", JSON.stringify(historicoBuscas)); } catch {}
}, 1500);

function mostrarRotas() {
    const conteudo = `<div id="buscas-recentes" class="buscas-recentes"></div>
        <div class="grupo-input"><label>Buscar linha ou destino</label><input type="text" id="busca-rotas" placeholder="Ex: URI, Centro..." oninput="onBuscarRotas(this.value)"></div>
        <div style="display:flex;justify-content:flex-end;margin-bottom:12px;"><button class="btn-secundario ${filtroFavoritas ? "ativo" : ""}" onclick="toggleFiltroFavoritas()">★ Apenas favoritas</button></div>
        <div id="container-lista-rotas"></div>`;
    abrirPainel("Linhas e Itinerários", conteudo); renderizarBuscasRecentes(); renderizarListaRotas();
}

function onBuscarRotas(termo) { renderizarListaRotas(); salvarBuscaDebounced(termo); }

function renderizarBuscasRecentes() {
    const c = document.getElementById("buscas-recentes"); if (!c) return;
    const recentes = historicoBuscas.filter(h => h.tipo === "linhas").slice(0, 6);
    c.innerHTML = recentes.length ? `<small>Buscas recentes</small>` + recentes.map(h => `<button class="horario-chip" style="cursor:pointer;" onclick="aplicarBuscaRecente('${escapeHtml(h.termo)}')">${escapeHtml(h.termo)}</button>`).join("") : "";
}
function aplicarBuscaRecente(termo) { const input = document.getElementById("busca-rotas"); if (input) { input.value = termo; renderizarListaRotas(); } }
function toggleFiltroFavoritas() { filtroFavoritas = !filtroFavoritas; mostrarRotas(); }

function renderizarListaRotas() {
    const container = document.getElementById("container-lista-rotas"); if (!container) return;
    const termo = (document.getElementById("busca-rotas")?.value || "").toLowerCase().trim();
    let filtradas = rotas.filter(r => !termo || r.nome.toLowerCase().includes(termo) || r.destino.toLowerCase().includes(termo));
    if (filtroFavoritas) filtradas = filtradas.filter(r => favoritos.includes(r.id));

    if (filtradas.length === 0) { container.innerHTML = `<p class="estado-vazio">Nenhuma linha encontrada.</p>`; return; }
    container.innerHTML = filtradas.map(r => `<div class="item-informacao">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div style="display:flex;gap:8px;align-items:center;">
                <div style="background:${r.cor};width:4px;height:32px;"></div>
                <div><strong>${escapeHtml(r.nome)}</strong><small>${escapeHtml(r.destino)}</small></div>
            </div>
            <button style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--texto-principal);" onclick="toggleFavorito('${r.id}')">${favoritos.includes(r.id) ? "★" : "☆"}</button>
        </div>
        <button class="btn-acao-primaria" style="margin-top:8px;" onclick="selecionarLinha('${r.id}')">Ver detalhes</button>
    </div>`).join("");
}

function toggleFavorito(id) {
    if (favoritos.includes(id)) favoritos = favoritos.filter(f => f !== id); else favoritos.push(id);
    try { localStorage.setItem("pi_favoritos", JSON.stringify(favoritos)); } catch {}
    renderizarListaRotas(); exibirAviso(favoritos.includes(id) ? "Adicionado aos favoritos." : "Removido dos favoritos.");
}

function selecionarLinha(id) {
    const rota = rotas.find(r => r.id === id); if (!rota || !mapa) return;
    Object.entries(camadasRotas).forEach(([idR, layer]) => layer.setStyle({ weight: idR === id ? 6 : 3, opacity: idR === id ? 1 : 0.4 }));
    mapa.fitBounds(L.latLngBounds(rota.coordenadasTrajeto), { padding: [50, 50] });
    const onibusDaLinha = dadosOnibus.filter(b => b.linhaIdx === rotas.indexOf(rota));
    
    abrirPainel(rota.nome, `
        <div class="item-informacao">
            <strong>Itinerário</strong>
            <ol style="margin-top:8px;padding-left:20px;font-size:12px;line-height:1.6;">${rota.paradas.map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ol>
        </div>
        <div class="item-informacao"><strong>Horário</strong><p>${escapeHtml(rota.horarioOperacao)}</p></div>
        <div class="item-informacao">
            <strong>Veículos ativos</strong>
            <p>${onibusDaLinha.map(b => `Carro: <strong>${Math.round(b.minutos)} min</strong>`).join(" • ")}</p>
        </div>
        <button class="btn-secundario" style="width:100%;" onclick="mostrarRotas()">← Voltar</button>
    `);
}

/* =====================================
   HORÁRIOS SIMPLIFICADOS
===================================== */
function mostrarHorarios() {
    const hhmm = new Date().getHours() * 60 + new Date().getMinutes();
    const linhasHtml = horariosOperacao.map(item => {
        const chips = item.partidas.map(p => {
            const [h, m] = p.split(":").map(Number);
            return `<span class="horario-chip ${h * 60 + m < hhmm ? "passado" : ""}">${p}</span>`;
        }).join("");
        return `<div class="linha-horario"><strong style="font-size:13px;">${escapeHtml(item.linha)}</strong><div class="horarios-grid">${chips}</div></div>`;
    }).join("");

    abrirPainel("Quadro de Horários", `
        <p class="painel-subtitulo">HORÁRIOS DE OPERAÇÃO (HOJE)</p>
        <div class="horarios-lista">${linhasHtml}</div>
        <button class="btn-acao-primaria" style="margin-top:16px;" onclick="window.print()">🖨 Imprimir / Gerar PDF</button>
    `);
}

/* =====================================
   PLANEJADOR
===================================== */
function mostrarPlanejador() {
    abrirPainel("Planejador de Viagens", `
        <p class="painel-subtitulo">PLANEJADOR DE ROTAS</p>
        <div class="grupo-input"><label>Origem</label><select id="origem-viagem">${paradasSistema.map(p => `<option value="${p.id}">${escapeHtml(p.nome)}</option>`).join("")}</select></div>
        <button class="btn-secundario" style="width:100%;margin-bottom:12px;" onclick="inverterOrigemDestino()">⇅ Inverter</button>
        <div class="grupo-input"><label>Destino</label><select id="destino-viagem">${paradasSistema.map((p, i) => `<option value="${p.id}" ${i === 1 ? "selected" : ""}>${escapeHtml(p.nome)}</option>`).join("")}</select></div>
        <button class="btn-acao-primaria" onclick="calcularRotaViagem()">Calcular trajeto</button>
        <div id="resultado-planejamento" style="margin-top:16px;"></div>
    `);
}

function inverterOrigemDestino() { const o = document.getElementById("origem-viagem"), d = document.getElementById("destino-viagem"); if (o && d) { const t = o.value; o.value = d.value; d.value = t; } }

function encontrarLinhaParaParada(parada) {
    return rotas.find(r => coordsIguais(r.coordenadasTrajeto[r.coordenadasTrajeto.length - 1], parada.coords));
}

function calcularRotaViagem() {
    const idO = document.getElementById("origem-viagem").value, idD = document.getElementById("destino-viagem").value;
    const container = document.getElementById("resultado-planejamento");
    if (idO === idD) { container.innerHTML = `<div class="item-informacao atrasado"><strong>Origem e destino iguais</strong></div>`; return; }
    
    const origem = paradasSistema.find(p => p.id === idO), destino = paradasSistema.find(p => p.id === idD);
    if (origem.principal) {
        const linha = encontrarLinhaParaParada(destino);
        if (linha) return renderizarResultado(container, linha, origem, destino, "ida");
    }
    if (destino.principal) {
        const linha = encontrarLinhaParaParada(origem);
        if (linha) return renderizarResultado(container, linha, origem, destino, "volta");
    }
    container.innerHTML = `<div class="item-informacao"><strong>Sem trajeto direto</strong><p>Não há linha conectando esses pontos na simulação.</p></div>`;
}

function renderizarResultado(container, linha, origem, destino, sentido) {
    const dist = calcularDistanciaKm(origem.coords, destino.coords);
    const tempo = Math.max(4, Math.round(dist * 4 + 3));
    const bus = dadosOnibus.find(b => b.linhaIdx === rotas.indexOf(linha));
    
    container.innerHTML = `<div class="item-informacao" style="border-left-color:var(--texto-principal);">
        <strong>Trajeto direto</strong>
        <p style="margin-top:8px;">
            🚌 <strong>Linha:</strong> ${escapeHtml(linha.nome)}<br>
            📍 <strong>Embarque:</strong> ${escapeHtml(sentido === "ida" ? origem.nome : destino.nome)}<br>
            🏁 <strong>Desembarque:</strong> ${escapeHtml(sentido === "ida" ? destino.nome : origem.nome)}<br>
            ⏱️ <strong>Duração:</strong> ~${tempo} min<br>
            📏 <strong>Distância:</strong> ~${dist.toFixed(1)} km
            ${bus ? `<br>🕒 <strong>Próximo veículo:</strong> ${Math.round(bus.minutos)} min` : ""}
        </p>
    </div>
    <button class="btn-secundario" style="width:100%;" onclick="destacarPercurso('${linha.id}')">Destacar no mapa</button>`;
    destacarPercurso(linha.id);
}

function calcularDistanciaKm(a, b) {
    const R = 6371, dLat = (b[0] - a[0]) * Math.PI / 180, dLon = (b[1] - a[1]) * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function destacarPercurso(id) {
    if (!mapa || !camadasRotas[id]) return;
    camadasRotas[id].setStyle({ weight: 6, opacity: 1 });
    mapa.fitBounds(L.latLngBounds(rotas.find(r => r.id === id).coordenadasTrajeto), { padding: [50, 50] });
    exibirAviso("Percurso destacado.");
}

/* =====================================
   ASSISTENTE COM IA EXTERNA
===================================== */
function mostrarIA() {
    abrirPainel("Assistente com IA", `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <div style="width:40px;height:40px;background:var(--texto-principal);color:var(--bg-principal);display:grid;place-items:center;font-weight:800;">IA</div>
            <div><span style="font-size:10px;font-weight:800;color:var(--texto-secundario);">ASSISTENTE VIRTUAL</span><p style="font-size:12px;">Consulte ônibus, rotas e infraestrutura.</p></div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
            <button class="horario-chip" style="cursor:pointer;" onclick="enviarSugestaoIA('Qual o próximo ônibus?')">⏱️ Próximo ônibus</button>
            <button class="horario-chip" style="cursor:pointer;" onclick="enviarSugestaoIA('Como chegar na URI?')">🎓 Como chegar na URI</button>
            <button class="horario-chip" style="cursor:pointer;" onclick="enviarSugestaoIA('Qual a temperatura?')">🌡️ Clima atual</button>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
            <button class="btn-secundario" style="padding:4px 8px;font-size:10px;" onclick="alternarVoz()">${vozAtiva ? "🔊 Voz on" : "🔇 Voz off"}</button>
            <button class="btn-secundario" style="padding:4px 8px;font-size:10px;" onclick="limparHistoricoChat()">🗑 Limpar</button>
        </div>
        <div id="historico-chat" class="historico-chat"></div>
        <form class="campo-chat" id="form-chat" onsubmit="processarConversaIA(event)">
            <input type="text" id="entrada-chat" placeholder="Pergunte algo..." required autocomplete="off">
            <button type="submit" class="botao-enviar">Enviar</button>
        </form>
        <div style="margin-top:12px;font-size:10px;color:var(--texto-secundario);text-align:center;">IA via Pollinations.ai (pode levar alguns segundos)</div>
    `);

    if (historicoConversaAssistente.length > 0) {
        historicoConversaAssistente.forEach(m => adicionarMensagemChat(m.texto, m.tipo, false));
    } else {
        adicionarMensagemChat("Olá! Sou o assistente. Posso consultar os dados em tempo real para você. O que deseja saber?", "ia", false);
    }
}

function enviarSugestaoIA(texto) { const input = document.getElementById("entrada-chat"); if (input) { input.value = texto; document.getElementById("form-chat").requestSubmit(); } }

function adicionarMensagemChat(texto, tipo, salvar = true) {
    const historico = document.getElementById("historico-chat"); if (!historico) return;
    const div = document.createElement("div");
    div.className = `mensagem-chat ${tipo === "usuario" ? "mensagem-usuario" : "mensagem-ia"}`;
    if (tipo === "usuario") div.textContent = texto; else div.innerHTML = texto;
    historico.appendChild(div); historico.scrollTop = historico.scrollHeight;
    if (salvar) {
        historicoConversaAssistente.push({ texto, tipo });
        if (historicoConversaAssistente.length > 60) historicoConversaAssistente.shift();
        try { localStorage.setItem("pi_historico_chat", JSON.stringify(historicoConversaAssistente)); } catch {}
    }
}

function limparHistoricoChat() {
    historicoConversaAssistente = [];
    try { localStorage.removeItem("pi_historico_chat"); } catch {}
    const h = document.getElementById("historico-chat"); if (h) h.innerHTML = "";
    adicionarMensagemChat("Histórico limpo.", "ia", false);
}

async function processarConversaIA(e) {
    e.preventDefault();
    const input = document.getElementById("entrada-chat"); if (!input) return;
    const pergunta = input.value.trim(); if (!pergunta) return;

    adicionarMensagemChat(pergunta, "usuario"); input.value = "";

    const indicador = document.createElement("div");
    indicador.className = "mensagem-chat mensagem-ia indicador-processamento";
    indicador.textContent = "consultando IA...";
    const hist = document.getElementById("historico-chat");
    if (hist) { hist.appendChild(indicador); hist.scrollTop = hist.scrollHeight; }

    // Tenta chamar IA Externa (Pollinations.ai) gratuita
    let resposta = "";
    try {
        const contexto = `Você é o assistente virtual da Parada Inteligente de Erechim. Responda de forma curta, direta e amigável.
        Dados atuais simulados:
        - Ônibus: ${dadosOnibus.map(b => `${b.linha} a ${Math.round(b.minutos)} min`).join(', ')}.
        - Infraestrutura: Bateria ${Math.round(configParadaHardware.bateria)}%, Wi-Fi ${configParadaHardware.sinalWiFi}%, temp ${configParadaHardware.temperaturaAmbiente.toFixed(1)}°C.
        Usuário pergunta: ${pergunta}`;
        
        const url = `https://text.pollinations.ai/${encodeURIComponent(contexto)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
            resposta = await response.text();
        } else {
            throw new Error("Falha na API");
        }
    } catch (err) {
        console.warn("IA externa falhou, usando fallback local.", err);
        resposta = gerarRespostaLocal(pergunta);
    }

    indicador.remove();
    adicionarMensagemChat(resposta, "ia");
    if (vozAtiva) falarTextoVoz(resposta.replace(/<[^>]*>/g, ""));
}

// Fallback local caso a internet falhe
function gerarRespostaLocal(pergunta) {
    const p = normalizar(pergunta);
    if (/proxim|chegand|quando|passa|vem/.test(p)) {
        const o = [...dadosOnibus].sort((a, b) => a.minutos - b.minutos)[0];
        return `O próximo ônibus é o da <strong>${escapeHtml(o.linha)}</strong>, previsto para <strong>${Math.round(o.minutos)} min</strong>.`;
    }
    if (/solar|energia|bateria|esp32|temperatura|wifi/.test(p)) {
        return `A parada opera com energia solar, bateria em ${Math.round(configParadaHardware.bateria)}% e temperatura de ${configParadaHardware.temperaturaAmbiente.toFixed(1)}°C.`;
    }
    if (/horario|que horas/.test(p)) {
        return "Você pode conferir todos os horários no botão <strong>Horários</strong> no menu lateral.";
    }
    return "Desculpe, estou sem conexão com a IA no momento e não entendi a pergunta. Tente perguntar sobre os próximos ônibus, horários ou clima.";
}

function falarTextoVoz(texto) {
    if (!vozAtiva || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(texto); ut.lang = "pt-BR";
    window.speechSynthesis.speak(ut);
}

function alternarVoz() {
    vozAtiva = !vozAtiva; try { localStorage.setItem("pi_voz_ativa", vozAtiva ? "true" : "false"); } catch {}
    exibirAviso(vozAtiva ? "Voz ativada." : "Voz desativada.");
    if (painelAtual === "Assistente com IA") mostrarIA();
    else if (painelAtual === "Acessibilidade") mostrarAcessibilidade();
}

/* =====================================
   ACESSIBILIDADE E IOT
===================================== */
function carregarPreferenciasAcessibilidade() {
    try {
        if (localStorage.getItem("pi_alto_contraste") === "true") document.body.classList.add("alto-contraste");
        aplicarEscalaFonte(parseFloat(localStorage.getItem("pi_tamanho_fonte") || "1"));
    } catch {}
}
function aplicarEscalaFonte(escala) {
    document.documentElement.classList.remove("fonte-ampliada", "fonte-grande");
    if (escala === 1.125) document.documentElement.classList.add("fonte-ampliada");
    else if (escala === 1.25) document.documentElement.classList.add("fonte-grande");
}
function mudarTamanhoFonte(escala) { aplicarEscalaFonte(escala); try { localStorage.setItem("pi_tamanho_fonte", escala.toString()); } catch {} mostrarAcessibilidade(); }
function alternarAltoContraste(ativar) { document.body.classList.toggle("alto-contraste", ativar); try { localStorage.setItem("pi_alto_contraste", ativar ? "true" : "false"); } catch {} mostrarAcessibilidade(); }

function mostrarAcessibilidade() {
    let escala = 1; try { escala = parseFloat(localStorage.getItem("pi_tamanho_fonte") || "1"); } catch {}
    const contraste = document.body.classList.contains("alto-contraste");
    abrirPainel("Acessibilidade", `
        <p class="painel-subtitulo">RECURSOS DE ACESSIBILIDADE</p>
        <div class="item-informacao">
            <strong>Tamanho do texto</strong>
            <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="${escala === 1 ? "btn-acao-primaria" : "btn-secundario"}" style="flex:1;" onclick="mudarTamanhoFonte(1)">Padrão</button>
                <button class="${escala === 1.125 ? "btn-acao-primaria" : "btn-secundario"}" style="flex:1;" onclick="mudarTamanhoFonte(1.125)">Ampliada</button>
                <button class="${escala === 1.25 ? "btn-acao-primaria" : "btn-secundario"}" style="flex:1;" onclick="mudarTamanhoFonte(1.25)">Grande</button>
            </div>
        </div>
        <div class="item-informacao">
            <strong>Contraste</strong>
            <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="${!contraste ? "btn-acao-primaria" : "btn-secundario"}" style="flex:1;" onclick="alternarAltoContraste(false)">Padrão</button>
                <button class="${contraste ? "btn-acao-primaria" : "btn-secundario"}" style="flex:1;" onclick="alternarAltoContraste(true)">Alto Contraste</button>
            </div>
        </div>
        <div class="item-informacao">
            <strong>Leitura por voz</strong>
            <p>Respostas do assistente são lidas em voz alta quando ativo.</p>
            <button class="${vozAtiva ? "btn-acao-primaria" : "btn-secundario"}" style="margin-top:8px;width:100%;" onclick="alternarVoz()">${vozAtiva ? "🔊 Voz ativada" : "🔇 Voz desativada"}</button>
        </div>
    `);
}

function iniciarSimulacaoIoT() {
    if (intervaloIoT) return;
    intervaloIoT = setInterval(() => {
        if (!configParadaHardware.carregando) { configParadaHardware.bateria -= 0.15; if (configParadaHardware.bateria < 30) configParadaHardware.carregando = true; }
        else { configParadaHardware.bateria += 0.25; if (configParadaHardware.bateria >= 95) configParadaHardware.carregando = false; }
        configParadaHardware.temperaturaAmbiente = 23 + Math.sin(Date.now() / 60000) * 2 + (Math.random() - 0.5);
        configParadaHardware.sinalWiFi = 90 + Math.round(Math.random() * 9);
        configParadaHardware.ultimaAtualizacao = new Date();
        if (painelAtual === "Infraestrutura da Parada") atualizarDisplayIoT();
    }, 5000);
}

function atualizarDisplayIoT() {
    const campos = {
        "iot-bateria": Math.round(configParadaHardware.bateria) + "%" + (configParadaHardware.carregando ? " ⚡" : ""),
        "iot-wifi": "Wi-Fi " + configParadaHardware.sinalWiFi + "%",
        "iot-temp": configParadaHardware.temperaturaAmbiente.toFixed(1) + "°C"
    };
    Object.entries(campos).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
}

function mostrarMonitoramento() {
    abrirPainel("Infraestrutura da Parada", `
        <p class="painel-subtitulo">MONITORAMENTO (ESP32)</p>
        <div class="item-informacao atrasado" style="margin-bottom:16px;"><strong>⚠ Dados simulados para demonstração</strong></div>
        <div class="grid-monitores">
            <div class="card-monitor"><span>Painel</span><strong>${escapeHtml(configParadaHardware.painelEletronico)}</strong></div>
            <div class="card-monitor"><span>Conexão</span><strong id="iot-wifi">${escapeHtml(configParadaHardware.conexaoInternet)}</strong></div>
            <div class="card-monitor"><span>Alimentação</span><strong>${escapeHtml(configParadaHardware.alimentacaoEletrica)}</strong></div>
            <div class="card-monitor"><span>Bateria</span><strong id="iot-bateria">${Math.round(configParadaHardware.bateria)}%</strong></div>
            <div class="card-monitor"><span>Temperatura</span><strong id="iot-temp">${configParadaHardware.temperaturaAmbiente.toFixed(1)}°C</strong></div>
            <div class="card-monitor"><span>ESP32</span><strong>${escapeHtml(configParadaHardware.estadoESP32)}</strong></div>
        </div>
    `);
    iniciarSimulacaoIoT();
}

/* =====================================
   AJUDA / SOS
===================================== */
function mostrarAjuda() {
    abrirPainel("Ajuda / SOS", `
        <div style="background:var(--texto-principal);color:var(--bg-principal);padding:12px;margin-bottom:16px;">
            <strong>⚠ MODO DEMONSTRAÇÃO</strong>
            <p style="font-size:12px;margin-top:4px;">Em celulares, os botões iniciam chamadas reais (com confirmação). Em desktops, apenas simulam.</p>
        </div>
        <div id="container-confirmacao-sos"></div>
        <p class="painel-subtitulo">SERVIÇOS DE EMERGÊNCIA</p>
        <div class="grade-emergencia-completa">
            <button class="card-emergencia-item" onclick="solicitarAtendimento('SAMU', '192')"><span class="num-emergencia">192</span><strong>SAMU</strong><span>Atendimento médico</span></button>
            <button class="card-emergencia-item" onclick="solicitarAtendimento('Polícia', '190')"><span class="num-emergencia">190</span><strong>Polícia Militar</strong><span>Segurança</span></button>
            <button class="card-emergencia-item" onclick="solicitarAtendimento('Bombeiros', '193')"><span class="num-emergencia">193</span><strong>Bombeiros</strong><span>Resgate</span></button>
            <button class="card-emergencia-item" onclick="solicitarAtendimento('Guarda', '153')"><span class="num-emergencia">153</span><strong>Guarda Municipal</strong><span>Apoio</span></button>
        </div>
        <div style="margin-top:24px;border-top:1px solid var(--borda);padding-top:16px;">
            <p class="painel-subtitulo">ENVIAR SUGESTÃO</p>
            <textarea id="texto-ideia-usuario" placeholder="Sua sugestão..." maxlength="500" style="width:100%;height:80px;padding:10px;border:1px solid var(--borda);margin-bottom:8px;font-family:var(--fonte);"></textarea>
            <button class="btn-acao-primaria" onclick="enviarIdeiaUsuario()">Enviar</button>
            <small style="display:block;margin-top:8px;font-size:10px;color:var(--texto-secundario);">Salvo apenas no seu navegador.</small>
        </div>
    `);
}

function isDispositivoMovel() { return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent); }

function solicitarAtendimento(servico, numero) {
    servicoEmergenciaSelecionado = { servico, numero };
    const container = document.getElementById("container-confirmacao-sos"); if (!container) return;
    const isMobile = isDispositivoMovel();
    
    container.innerHTML = `<div class="item-informacao" style="border-left-color:var(--borda-forte);">
        <strong>Ligar para ${escapeHtml(servico)} (${numero})?</strong>
        <p style="font-size:12px;margin-top:6px;">${isMobile ? "O dispositivo iniciará uma chamada real." : "Ambiente não suporta chamadas — ação simulada."}</p>
        <div style="display:flex;gap:8px;margin-top:12px;">
            ${isMobile ? `<a href="tel:${numero}" class="btn-acao-primaria" style="text-decoration:none;text-align:center;" onclick="cancelarChamadaSOS()">Ligar</a>` : `<button class="btn-acao-primaria" onclick="confirmarChamadaSOS()">Simular</button>`}
            <button class="btn-secundario" onclick="cancelarChamadaSOS()">Cancelar</button>
        </div>
    </div>`;
}

function confirmarChamadaSOS() { if (!servicoEmergenciaSelecionado) return; cancelarChamadaSOS(); exibirAviso("Simulação de chamada registrada."); }
function cancelarChamadaSOS() { servicoEmergenciaSelecionado = null; const c = document.getElementById("container-confirmacao-sos"); if (c) c.innerHTML = ""; }
function enviarIdeiaUsuario() {
    const input = document.getElementById("texto-ideia-usuario"); if (!input) return;
    const t = input.value.trim(); if (t.length < 3) return exibirAviso("Digite ao menos 3 caracteres.");
    try {
        const s = safeParse(localStorage.getItem("pi_sugestoes"), []); s.push({ texto: t, data: new Date().toISOString() });
        localStorage.setItem("pi_sugestoes", JSON.stringify(s.slice(-50))); input.value = ""; exibirAviso("Sugestão registrada localmente.");
    } catch { exibirAviso("Erro ao salvar."); }
}

/* =====================================
   RELÓGIO E CLIMA
===================================== */
function atualizarRelogio() {
    const agora = new Date();
    const dataStr = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "long" });
    const horaStr = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    const elData = document.getElementById("data-atual"), elHora = document.getElementById("hora-atual");
    if (elData) elData.textContent = dataStr;
    if (elHora) elHora.textContent = horaStr;
}

async function buscarClimaErechim() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=-27.6339&longitude=-52.2745&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo&forecast_days=1";
    try {
        const r = await fetch(url, { cache: "no-store" }); if (!r.ok) throw new Error();
        const d = await r.json();
        const temp = Math.round(d.current.temperature_2m), max = Math.round(d.daily.temperature_2m_max[0]), min = Math.round(d.daily.temperature_2m_min[0]), cod = d.current.weather_code;
        let icone = "☁️"; if (cod === 0) icone = "☀️"; else if ([1, 2].includes(cod)) icone = "⛅"; else if (cod >= 51) icone = "🌧️";
        
        document.getElementById("temperatura-atual").textContent = temp + "°C";
        document.getElementById("temperatura-maxima").textContent = max + "°C";
        document.getElementById("temperatura-minima").textContent = min + "°C";
        document.getElementById("icone-clima").textContent = icone;
    } catch { document.getElementById("temperatura-atual").textContent = "--°C"; document.getElementById("icone-clima").textContent = "⚠️"; }
}

/* =====================================
   INICIALIZAÇÃO
===================================== */
document.addEventListener("DOMContentLoaded", () => {
    carregarPreferenciasAcessibilidade();
    atualizarRelogio(); setInterval(atualizarRelogio, 1000);
    inicializarProgressoOnibus(); buscarClimaErechim(); setInterval(buscarClimaErechim, 10 * 60 * 1000);
    inicializarMapa(); iniciarSimulacaoIoT();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharPainel();
    trapFocus(e);
});
