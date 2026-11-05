/* =====================================
   BASE DE DADOS DA PARADA INTELIGENTE
===================================== */

let historicoConversaAssistente = [];
let mapa = null;
let servicoEmergenciaSelecionado = null;

const dadosOnibus = [
    {
        linha: "Linha 01 — Centro",
        destino: "Terminal Central",
        horario: "15:35",
        minutos: 4,
        status: "No horário",
        cor: "#0284c7"
    },
    {
        linha: "Linha 02 — Atlântico",
        destino: "Bairro Atlântico",
        horario: "15:42",
        minutos: 11,
        status: "No horário",
        cor: "#16a34a"
    },
    {
        linha: "Linha 03 — Bela Vista",
        destino: "Bairro Bela Vista",
        horario: "15:50",
        minutos: 19,
        status: "Previsão",
        cor: "#d97706"
    },
    {
        linha: "Linha 04 — URI / Câmpus",
        destino: "Universidade URI Erechim",
        horario: "16:05",
        minutos: 34,
        status: "No horário",
        cor: "#8b5cf6"
    },
    {
        linha: "Linha 05 — Três Vendas",
        destino: "Bairro Três Vendas",
        horario: "16:20",
        minutos: 49,
        status: "No horário",
        cor: "#ec4899"
    }
];

// IMPORTANTE: a ordem de "horarios", "rotas" e "dadosOnibus" é a mesma (índice 0 = Linha 01, etc.)
const horarios = [
    {
        linha: "Centro (Linha 01)",
        partidas: ["06:30", "07:15", "08:00", "11:45", "12:15", "13:30", "15:35", "17:15", "18:20", "19:10"]
    },
    {
        linha: "Atlântico (Linha 02)",
        partidas: ["06:45", "07:30", "08:15", "11:50", "12:30", "13:45", "15:42", "17:30", "18:40", "19:25"]
    },
    {
        linha: "Bela Vista (Linha 03)",
        partidas: ["07:00", "07:45", "08:30", "12:00", "12:45", "14:00", "15:50", "17:45", "19:00", "20:00"]
    },
    {
        linha: "URI Câmpus (Linha 04)",
        partidas: ["07:10", "07:35", "11:30", "13:15", "16:05", "18:00", "19:00", "22:30"]
    },
    {
        linha: "Três Vendas (Linha 05)",
        partidas: ["06:40", "07:20", "12:10", "13:20", "16:20", "17:50", "18:30"]
    }
];

const rotas = [
    {
        nome: "Linha 01 — Centro",
        destino: "Terminal Central — Av. Maurício Cardoso",
        cor: "#0284c7"
    },
    {
        nome: "Linha 02 — Atlântico",
        destino: "Bairro Atlântico via Av. Sete de Setembro",
        cor: "#16a34a"
    },
    {
        nome: "Linha 03 — Bela Vista",
        destino: "Bairro Bela Vista via R. Itália",
        cor: "#d97706"
    },
    {
        nome: "Linha 04 — URI / Câmpus",
        destino: "Universidade URI Erechim",
        cor: "#8b5cf6"
    },
    {
        nome: "Linha 05 — Três Vendas",
        destino: "Bairro Três Vendas via Av. Caldas Júnior",
        cor: "#ec4899"
    }
];

/* =====================================
   CONFIGURAÇÕES EDITÁVEIS DA IA
   (ajuste aqui conforme o seu projeto real)
===================================== */

// Tarifa: preencha com os valores oficiais quando tiver. Se ficar null, a IA
// informa que o valor é definido pela concessionária.
const INFO_TARIFA = {
    inteira: null,      // ex.: "R$ 5,00"
    estudante: null,    // ex.: "R$ 2,50"
    observacao: ""      // ex.: "Idosos acima de 65 anos têm gratuidade."
};

// Pontos de referência -> linha (índice em dadosOnibus). DEMONSTRATIVO: ajuste ao itinerário real.
const PONTOS_REFERENCIA = [
    {
        nome: "URI Erechim",
        apelidos: ["uri", "universidade", "faculdade", "campus"],
        linha: 3,
        dica: "Ela leva direto ao câmpus da universidade."
    },
    {
        nome: "IFRS Câmpus Erechim",
        apelidos: ["ifrs", "instituto federal"],
        linha: 4,
        dica: "No protótipo, o acesso é pela linha dos bairros da região de Três Vendas."
    },
    {
        nome: "Hospitais e UPA",
        apelidos: ["hospital", "hospitais", "upa", "pronto socorro", "pronto atendimento", "caridade", "santa terezinha", "posto de saude", "ubs"],
        linha: 0,
        dica: "No protótipo, o acesso é pela linha do Centro. Em urgência, ligue 192 (SAMU)."
    },
    {
        nome: "Centro / Terminal Central",
        apelidos: ["centro", "terminal", "terminal central", "rodoviaria", "praca da bandeira", "calcadao", "catedral"],
        linha: 0,
        dica: "Ela passa pelo coração da cidade e termina no Terminal Central."
    },
    {
        nome: "Bairro Atlântico",
        apelidos: ["atlantico"],
        linha: 1,
        dica: "O trajeto segue pela Avenida Sete de Setembro."
    },
    {
        nome: "Bairro Bela Vista",
        apelidos: ["bela vista"],
        linha: 2,
        dica: "O trajeto passa pela Rua Itália."
    },
    {
        nome: "Bairro Três Vendas",
        apelidos: ["tres vendas"],
        linha: 4,
        dica: "O trajeto segue pela Avenida Caldas Júnior."
    }
];

// Bairros sem linha direta cadastrada no protótipo (a IA sugere conexão pelo Terminal Central)
const BAIRROS_SEM_LINHA = ["koller", "presidente vargas", "aeroporto", "industrial", "linho", "fatima"];

/* =====================================
   MAPA — ERECHIM COMPLETA
   (Esri World Street Map: gratuito, sem chave de API)
===================================== */

const CENTRO_MAPA = [-27.6356, -52.2744];
const ZOOM_INICIAL = 13.5;

function redimensionarMapa(atrasos = [0, 260]) {
    atrasos.forEach(tempo => {
        setTimeout(() => {
            if (mapa) mapa.invalidateSize({ pan: false });
        }, tempo);
    });
}

function inicializarMapa() {
    const elementoMapa = document.getElementById("mapa-erechim");
    if (!elementoMapa) return;

    if (mapa !== null) {
        mapa.invalidateSize();
        return;
    }

    if (typeof L === "undefined") {
        console.error("A biblioteca Leaflet não foi carregada.");
        return;
    }

    // Bounding box ampliado: área urbana + periurbana completa de Erechim
    const limitesErechim = L.latLngBounds(
        L.latLng(-27.700, -52.340), // Sudoeste
        L.latLng(-27.580, -52.200)  // Nordeste
    );

    mapa = L.map("mapa-erechim", {
        zoomControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        inertia: true,
        zoomSnap: 0.5,                 // permite o zoom 13.5
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 90,
        minZoom: 12,
        maxZoom: 18,
        maxBounds: limitesErechim,
        maxBoundsViscosity: 0.6        // borda suave, sem "parede" seca
    }).setView(CENTRO_MAPA, ZOOM_INICIAL);

    // Camada principal: Esri World Street Map (gratuita, sem chave de API)
    const camadaEsri = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 18,
        keepBuffer: 4,                 // mantém tiles extras em volta: arrastar sem "buracos"
        updateWhenIdle: false,
        updateWhenZooming: false,
        attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors"
    });

    // Reserva: OpenStreetMap França (também sem chave)
    let errosDeTile = 0;
    let usandoReserva = false;

    camadaEsri.on("tileerror", function () {
        errosDeTile++;
        if (errosDeTile >= 6 && !usandoReserva) {
            usandoReserva = true;
            mapa.removeLayer(camadaEsri);
            L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
                maxZoom: 18,
                keepBuffer: 4,
                updateWhenIdle: false,
                attribution: "&copy; OpenStreetMap France"
            }).addTo(mapa);
        }
    });

    camadaEsri.on("tileload", function () {
        errosDeTile = 0;
    });

    camadaEsri.addTo(mapa);

    L.control.zoom({ position: "bottomright" }).addTo(mapa);

    // Redimensionamento automático do contêiner enquanto o layout estabiliza
    redimensionarMapa([100, 300, 600, 1000]);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializarMapa);
} else {
    inicializarMapa();
}

window.addEventListener("load", () => {
    if (mapa) mapa.invalidateSize();
});

window.addEventListener("resize", () => {
    if (mapa) mapa.invalidateSize();
});

/* =====================================
   RELÓGIO & DATA EM TEMPO REAL
===================================== */

function atualizarRelogio() {
    const agora = new Date();

    const dataFormatada = agora.toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    const horaFormatada = agora.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    });

    const elData = document.getElementById("data-atual");
    const elHora = document.getElementById("hora-atual");

    if (elData) elData.textContent = dataFormatada;
    if (elHora) elHora.textContent = horaFormatada;
}

atualizarRelogio();
setInterval(atualizarRelogio, 1000);

/* =====================================
   CLIMA EM TEMPO REAL
   (também alimenta as respostas da IA)
===================================== */

let climaAtual = {
    disponivel: false,
    temp: 20,
    max: 21,
    min: 17,
    codigo: 3,
    chuvaProb: null
};

function descricaoClima(codigo) {
    if (codigo === 0) return "céu limpo";
    if (codigo === 1 || codigo === 2) return "parcialmente nublado";
    if (codigo === 3) return "nublado";
    if (codigo === 45 || codigo === 48) return "com neblina";
    if (codigo >= 51 && codigo <= 57) return "com garoa";
    if (codigo >= 61 && codigo <= 67) return "com chuva";
    if (codigo >= 80 && codigo <= 82) return "com pancadas de chuva";
    if (codigo >= 95) return "com tempestade";
    return "com tempo instável";
}

function estaChovendo(codigo) {
    return (codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82) || codigo >= 95;
}

async function buscarClimaErechim() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=-27.6339&longitude=-52.2745&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=1";

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error("Erro API clima");

        const dados = await resposta.json();
        const temperatura = Math.round(dados.current.temperature_2m);
        const tempMax = Math.round(dados.daily.temperature_2m_max[0]);
        const tempMin = Math.round(dados.daily.temperature_2m_min[0]);
        const codigo = dados.current.weather_code;
        const probChuva = dados.daily.precipitation_probability_max
            ? dados.daily.precipitation_probability_max[0]
            : null;

        let icone = "☁️";
        if (codigo === 0) icone = "☀️";
        else if ([1, 2].includes(codigo)) icone = "⛅";
        else if (codigo >= 51 && codigo <= 82) icone = "🌧️";
        else if (codigo >= 95) icone = "⛈️";

        document.getElementById("temperatura-atual").textContent = temperatura + "°C";
        document.getElementById("temperatura-maxima").textContent = tempMax + "°C";
        document.getElementById("temperatura-minima").textContent = tempMin + "°C";
        document.getElementById("icone-clima").textContent = icone;

        climaAtual = {
            disponivel: true,
            temp: temperatura,
            max: tempMax,
            min: tempMin,
            codigo: codigo,
            chuvaProb: probChuva
        };

    } catch (erro) {
        document.getElementById("temperatura-atual").textContent = "20°C";
        document.getElementById("temperatura-maxima").textContent = "21°C";
        document.getElementById("temperatura-minima").textContent = "17°C";
        climaAtual.disponivel = false;
    }
}

buscarClimaErechim();
setInterval(buscarClimaErechim, 600000);

/* =====================================
   PAINÉIS DE INTERAÇÃO
===================================== */

const painel = document.getElementById("painel-funcionalidade");
const painelTitulo = document.getElementById("painel-titulo");
const painelConteudo = document.getElementById("painel-conteudo");

function abrirPainel(titulo, conteudo) {
    painelTitulo.textContent = titulo;
    painelConteudo.innerHTML = conteudo;
    painel.classList.add("aberto");
    redimensionarMapa([0, 260]);
}

function fecharPainel() {
    painel.classList.remove("aberto");
    redimensionarMapa([0, 260]);
}

function exibirAviso(mensagem) {
    const aviso = document.getElementById("aviso-sistema");
    if (!aviso) return;
    aviso.textContent = mensagem;
    aviso.classList.add("visivel");
    setTimeout(() => {
        aviso.classList.remove("visivel");
    }, 3800);
}

function mostrarChegadas() {
    let conteudo = `<p class="painel-subtitulo">PREVISÃO EM TEMPO REAL NA PARADA</p>`;
    dadosOnibus.forEach(onibus => {
        conteudo += `
            <div class="item-informacao">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${onibus.linha}</strong>
                    <span class="destaque-horario">${onibus.minutos} min</span>
                </div>
                <small>Destino: ${onibus.destino}</small>
                <small>Horário previsto: ${onibus.horario}</small>
                <span class="etiqueta">${onibus.status}</span>
            </div>
        `;
    });
    abrirPainel("Próximas Chegadas", conteudo);
}

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
            <p>Confirmação de simulação de chamada para o serviço de emergência.</p>
            <div class="botoes-confirmacao-emergencia">
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
   IA INFORMATIVA DA PARADA — INTERFACE
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
        // false = só redesenha, sem duplicar no histórico
        historicoConversaAssistente.forEach(msg => adicionarMensagemChat(msg.texto, msg.tipo, false));
    } else {
        adicionarMensagemChat(`${saudacaoDoDia()}! Sou a assistente da parada. Posso informar o próximo ônibus, montar a rota até o seu destino, falar do clima e explicar como a parada funciona. O que você precisa?`, "ia");
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

    // Texto digitado pelo usuário nunca vira HTML (evita injeção de código)
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
        let resposta;
        try {
            resposta = gerarRespostaInteligenteIA(pergunta);
        } catch (erro) {
            console.error(erro);
            resposta = "Tive um probleminha para entender isso. Pode perguntar de outro jeito?";
        }
        adicionarMensagemChat(resposta, "ia");
        falarTexto(resposta);
    }, 250);
}

/* =====================================
   MOTOR DE LINGUAGEM NATURAL (NLP)
===================================== */

const contextoIA = { linha: null, local: null, intencao: null };

function normalizar(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/*
  tem(p, termo): verifica se o termo aparece no texto normalizado.
  - termos curtos (até 4 letras) ou terminados em "!" exigem a palavra inteira
  - os demais funcionam como radical (ex.: "chuv" pega "chuva", "chuvoso")
*/
const cacheRegexIA = {};
function tem(p, termo) {
    let re = cacheRegexIA[termo];
    if (!re) {
        const exato = termo.endsWith("!");
        const t = normalizar(termo.replace("!", ""));
        const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const fim = (exato || t.length <= 4) ? "(?=\\s|$)" : "";
        re = new RegExp("(^|\\s)" + esc + fim);
        cacheRegexIA[termo] = re;
    }
    return re.test(p);
}

const TERMOS_EMERGENCIA = [
    "socorro", "samu", "ambulancia", "bombeiro", "assalto", "roubo", "roubaram", "incendio",
    "acidente", "infarto", "desmaiou", "passando mal", "mal subito", "violencia", "perigo",
    "emergencia", "policia", "sos", "192", "190", "193", "153", "guarda municipal"
];

const INTENCOES = [
    {
        id: "saudacao",
        termos: ["oi", "ola", "eae", "e ai", "opa", "salve", "fala", "bom dia", "boa tarde", "boa noite", "tudo bem", "tudo bom", "beleza", "hey", "hello"]
    },
    {
        id: "agradecimento",
        termos: ["obrigad", "brigad", "valeu", "vlw", "tmj", "agradeco", "show de bola", "perfeito", "otimo", "top demais"]
    },
    {
        id: "despedida",
        termos: ["tchau", "ate mais", "ate logo", "flw", "falou", "xau", "ate breve"]
    },
    {
        id: "identidade",
        termos: ["quem e voce", "quem e vc", "seu nome", "como voce se chama", "o que voce faz", "o que voce sabe", "o que voce pode", "voce e um robo", "voce e uma ia", "como voce funciona"]
    },
    {
        id: "perdi",
        termos: ["perdi", "perdeu", "acabei de perder", "passou direto", "nao parou", "nao passou", "ja passou", "fugiu"]
    },
    {
        id: "chegada",
        termos: ["proximo", "proxima", "chegada", "chegando", "chega", "demora", "demorando", "demorou", "atrasad", "passa", "passando", "cade", "onibus", "busao", "buzao", "coletivo", "circular", "quanto falta", "quando", "previsao", "esperando", "espera", "tempo real", "bus"]
    },
    {
        id: "linhas",
        termos: ["linha", "linhas", "itinerario", "trajeto", "percurso", "passa por", "paradas da linha", "quais rotas", "rotas"]
    },
    {
        id: "rota",
        termos: ["como chego", "como chegar", "como ir", "como vou", "quero ir", "preciso ir", "vou pra", "vou para", "ir para", "ir pra", "ir ate", "chegar em", "chegar na", "chegar no", "qual pega", "qual onibus pega", "que onibus pego", "que onibus pegar", "qual pegar", "caminho", "destino", "onde fica", "me leva", "leva ate", "leva pra", "levar"]
    },
    {
        id: "horarios",
        termos: ["horario", "horarios", "partida", "partidas", "quadro", "tabela", "ultimo", "ultima", "primeiro", "primeira", "madrugada", "de manha", "a noite", "cedo", "tarde da noite", "que horas"]
    },
    {
        id: "clima",
        termos: ["clima", "chuva", "chover", "chove", "chovendo", "temperatura", "frio", "frio demais", "calor", "guarda chuva", "sol", "garoa", "previsao do tempo", "como esta o tempo", "como ta o tempo", "tempo hoje", "tempo la fora", "graus", "tempestade", "molhar"]
    },
    {
        id: "tarifa",
        termos: ["tarifa", "passagem", "preco", "valor", "quanto custa", "custa", "quanto e", "quanto paga", "pagar", "pagamento", "pix", "cartao", "dinheiro", "troco", "bilhete", "estudante", "gratuidade", "idoso", "desconto", "integracao", "qr code", "aproximacao", "carteirinha"]
    },
    {
        id: "tecnico",
        termos: ["solar", "energia", "microrrede", "micro rede", "fotovoltaic", "bateria", "baterias", "litio", "sensor", "sensores", "iot", "internet das coisas", "esp32", "esp 32", "arduino", "microcontrolador", "wifi", "wi fi", "mqtt", "tecnologia", "eletrica", "sustentavel", "sustentabilidade", "autonomia", "controlador de carga", "inversor", "placa solar", "painel solar", "funciona sem luz", "falta de luz"]
    },
    {
        id: "projeto",
        termos: ["projeto", "integrador", "engenharia", "semestre", "prototipo", "quem fez", "quem criou", "quem desenvolveu", "equipe", "desenvolvedor", "faculdade do projeto", "trabalho academico"]
    },
    {
        id: "alertas",
        termos: ["alerta", "alertas", "aviso", "avisos", "transito", "congestionamento", "engarrafamento", "problema", "funcionando", "sistema online", "status do sistema", "interdicao", "obra"]
    },
    {
        id: "acessibilidade",
        termos: ["cadeirante", "cadeira de rodas", "acessivel", "acessibilidade", "deficiente", "deficiencia", "rampa", "elevador", "braille", "libras", "cego", "surdo", "mobilidade reduzida", "idosos"]
    },
    {
        id: "sugestao",
        termos: ["sugestao", "sugerir", "reclamacao", "reclamar", "elogio", "feedback", "opiniao", "ideia", "melhoria"]
    },
    {
        id: "painel",
        termos: ["como usar", "como uso", "como funciona o painel", "botao", "botoes", "tela", "menu", "como mexer", "como navegar"]
    },
    {
        id: "mapa",
        termos: ["mapa", "onde estou", "onde fica a parada", "localizacao", "gps", "zoom"]
    },
    {
        id: "ajuda",
        termos: ["ajuda!", "ajudar", "preciso de ajuda", "pode me ajudar", "duvida", "nao entendi", "nao sei"]
    }
];

function pontuarIntencoes(p) {
    const resultado = [];
    INTENCOES.forEach(intencao => {
        let score = 0;
        intencao.termos.forEach(termo => {
            if (tem(p, termo)) {
                const palavras = termo.replace("!", "").trim().split(" ").length;
                score += palavras; // frases específicas pesam mais que palavras soltas
            }
        });
        if (score > 0) resultado.push({ id: intencao.id, score });
    });
    resultado.sort((a, b) => b.score - a.score);
    return resultado;
}

function detectarLinha(p) {
    let m = p.match(/\blinha\s*(?:numero\s*|n\s*)?0?([1-5])\b/);
    if (m) return Number(m[1]) - 1;

    m = p.match(/^(?:e\s+)?(?:a\s+|o\s+)?0?([1-5])$/);
    if (m) return Number(m[1]) - 1;

    m = p.match(/\b(?:onibus|busao|buzao)\s+(?:numero\s*|n\s*)?0?([1-5])\b/);
    if (m) return Number(m[1]) - 1;

    return null;
}

function detectarLocal(p) {
    let melhor = null;
    let tamanho = 0;

    PONTOS_REFERENCIA.forEach(ponto => {
        ponto.apelidos.forEach(apelido => {
            if (tem(p, apelido) && apelido.length > tamanho) {
                melhor = ponto;
                tamanho = apelido.length;
            }
        });
    });

    if (!melhor) {
        const semLinha = BAIRROS_SEM_LINHA.find(b => tem(p, b));
        if (semLinha) {
            const nomeBonito = semLinha.replace(/\b\w/g, c => c.toUpperCase());
            return { nome: nomeBonito, linha: null, dica: "" };
        }
    }

    return melhor;
}

/* ---------- Utilidades de tempo e horários ---------- */

function minutosAgora() {
    const partes = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date());

    const h = Number(partes.find(x => x.type === "hour").value);
    const m = Number(partes.find(x => x.type === "minute").value);
    return h * 60 + m;
}

function paraMinutos(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

function saudacaoDoDia() {
    const h = Math.floor(minutosAgora() / 60);
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
}

function formatarDuracao(min) {
    if (min < 1) return "agora mesmo";
    if (min < 60) return `${min} ${min === 1 ? "minuto" : "minutos"}`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h} ${h === 1 ? "hora" : "horas"}${m ? ` e ${m} minutos` : ""}`;
}

function proximaPartida(idx) {
    const agora = minutosAgora();
    const lista = horarios[idx].partidas;
    const achada = lista.find(h => paraMinutos(h) >= agora);

    if (achada) {
        return { horario: achada, em: paraMinutos(achada) - agora, amanha: false };
    }
    const primeira = lista[0];
    return { horario: primeira, em: 1440 - agora + paraMinutos(primeira), amanha: true };
}

function partidasRestantes(idx, limite = 4) {
    const agora = minutosAgora();
    return horarios[idx].partidas
        .filter(h => paraMinutos(h) >= agora)
        .slice(0, limite);
}

/* ---------- Clima combinado com ônibus ---------- */

function dicaClima() {
    if (!climaAtual.disponivel) return "";

    const chovendo = estaChovendo(climaAtual.codigo);
    const prob = climaAtual.chuvaProb;

    if (chovendo) {
        return `Está chovendo em Erechim agora, então leve guarda-chuva.`;
    }
    if (prob !== null && prob >= 60) {
        return `Há ${prob}% de chance de chuva hoje, vale levar guarda-chuva.`;
    }
    if (climaAtual.temp <= 12) {
        return `Está frio, ${climaAtual.temp}°C, agasalhe-se enquanto espera.`;
    }
    if (climaAtual.temp >= 30) {
        return `Está quente, ${climaAtual.temp}°C, procure a sombra e se hidrate.`;
    }
    return "";
}

function sufixoClima() {
    const d = dicaClima();
    return d ? `<br>${d}` : "";
}

function resumoClima() {
    if (!climaAtual.disponivel) {
        return "Não consegui atualizar o clima agora, mas você pode ver a temperatura no topo da tela.";
    }
    const prob = climaAtual.chuvaProb !== null ? ` A chance de chuva hoje é de ${climaAtual.chuvaProb}%.` : "";
    return `Agora em Erechim faz <strong>${climaAtual.temp}°C</strong>, ${descricaoClima(climaAtual.codigo)}. Hoje a máxima é de ${climaAtual.max}°C e a mínima de ${climaAtual.min}°C.${prob}`;
}

/* ---------- Respostas por intenção ---------- */

function respostaChegada(idx) {
    if (idx !== null) {
        const o = dadosOnibus[idx];
        const situacao = o.status === "No horário" ? "Está no horário." : "É uma previsão, pode variar um pouco.";
        return `A <strong>${o.linha}</strong>, sentido ${o.destino}, chega em cerca de <strong>${o.minutos} minutos</strong>, previsão para as ${o.horario}. ${situacao}${sufixoClima()}`;
    }

    const ordenados = [...dadosOnibus].sort((a, b) => a.minutos - b.minutos);
    const [a, b, c] = ordenados;
    return `O próximo ônibus é a <strong>${a.linha}</strong>, sentido ${a.destino}, chegando em <strong>${a.minutos} minutos</strong> (${a.horario}).<br>Em seguida vêm a ${b.linha}, em ${b.minutos} minutos, e a ${c.linha}, em ${c.minutos} minutos.${sufixoClima()}`;
}

function respostaPerdi(idx) {
    if (idx !== null) {
        const prox = proximaPartida(idx);
        const quando = prox.amanha ? `amanhã às ${prox.horario}` : `às ${prox.horario}, daqui a ${formatarDuracao(prox.em)}`;
        return `Sem problema! A próxima partida da <strong>${horarios[idx].linha}</strong> é ${quando}.${sufixoClima()}`;
    }

    const lista = horarios
        .map((h, i) => ({ nome: dadosOnibus[i].linha, ...proximaPartida(i) }))
        .sort((x, y) => x.em - y.em)
        .slice(0, 2);

    return `Sem problema! Os próximos são: <strong>${lista[0].nome}</strong> às ${lista[0].horario} (em ${formatarDuracao(lista[0].em)}) e <strong>${lista[1].nome}</strong> às ${lista[1].horario} (em ${formatarDuracao(lista[1].em)}).${sufixoClima()}`;
}

function respostaLinha(idx) {
    const r = rotas[idx];
    const o = dadosOnibus[idx];
    const prox = proximaPartida(idx);
    const quando = prox.amanha ? `amanhã às ${prox.horario}` : `às ${prox.horario} (em ${formatarDuracao(prox.em)})`;
    return `<strong>${r.nome}</strong>: ${r.destino}.<br>O próximo ônibus chega em ${o.minutos} minutos nesta parada e a próxima partida do quadro é ${quando}.${sufixoClima()}`;
}

function respostaLinhasGeral() {
    return `As linhas desta parada são: <strong>Linha 01</strong> (Centro), <strong>Linha 02</strong> (Atlântico), <strong>Linha 03</strong> (Bela Vista), <strong>Linha 04</strong> (URI / Câmpus) e <strong>Linha 05</strong> (Três Vendas).<br>Diga a linha ou o destino que eu explico o trajeto, ou abra 'Rotas e Itinerários'.`;
}

function respostaLocal(local) {
    if (local.linha === null) {
        return `Para <strong>${local.nome}</strong> ainda não há linha direta cadastrada no protótipo. A opção mais prática é pegar a <strong>${dadosOnibus[0].linha}</strong> até o Terminal Central e fazer a conexão por lá.${sufixoClima()}`;
    }

    const linha = dadosOnibus[local.linha];
    const prox = proximaPartida(local.linha);
    const quando = prox.amanha
        ? `a próxima partida é amanhã às ${prox.horario}`
        : `a próxima partida é às ${prox.horario}, daqui a ${formatarDuracao(prox.em)}`;

    return `Para <strong>${local.nome}</strong>, pegue a <strong>${linha.linha}</strong>. ${local.dica}<br>Nesta parada ela chega em ${linha.minutos} minutos, e ${quando}.${sufixoClima()}`;
}

function respostaRotaSemDestino() {
    return `Me diga para onde você quer ir! Eu conheço o caminho para a <strong>URI</strong>, o <strong>IFRS</strong>, <strong>hospitais</strong>, o <strong>Centro</strong> e os bairros <strong>Atlântico</strong>, <strong>Bela Vista</strong> e <strong>Três Vendas</strong>.`;
}

function respostaHorarios(idx, p) {
    if (idx !== null) {
        const h = horarios[idx];
        const lista = h.partidas;

        if (tem(p, "ultimo") || tem(p, "ultima")) {
            return `A última partida da <strong>${h.linha}</strong> hoje é às <strong>${lista[lista.length - 1]}</strong>.`;
        }
        if (tem(p, "primeiro") || tem(p, "primeira") || tem(p, "cedo") || tem(p, "madrugada")) {
            return `A primeira partida da <strong>${h.linha}</strong> é às <strong>${lista[0]}</strong>.`;
        }

        const restantes = partidasRestantes(idx, 4);
        if (restantes.length === 0) {
            return `A <strong>${h.linha}</strong> já encerrou as partidas de hoje. A primeira de amanhã é às <strong>${lista[0]}</strong>.`;
        }
        const prox = proximaPartida(idx);
        return `Próximas partidas da <strong>${h.linha}</strong>: ${restantes.join(", ")}.<br>A próxima sai em ${formatarDuracao(prox.em)}. Para ver o dia completo, abra o 'Quadro de Horários'.${sufixoClima()}`;
    }

    if (tem(p, "ultimo") || tem(p, "ultima")) {
        const ultimas = horarios.map(h => `${h.linha}: ${h.partidas[h.partidas.length - 1]}`).join("<br>");
        return `Últimas partidas de hoje:<br>${ultimas}`;
    }

    const resumo = horarios
        .map((h, i) => {
            const prox = proximaPartida(i);
            return `${h.linha}: ${prox.horario}${prox.amanha ? " (amanhã)" : ""}`;
        })
        .join("<br>");

    return `Próxima partida de cada linha:<br>${resumo}<br>Veja a tabela completa no botão 'Quadro de Horários'.${sufixoClima()}`;
}

function respostaClima() {
    const prox = [...dadosOnibus].sort((a, b) => a.minutos - b.minutos)[0];
    const dica = dicaClima();
    return `${resumoClima()}<br>Seu próximo ônibus é a ${prox.linha}, em ${prox.minutos} minutos.${dica ? "<br>" + dica : ""}`;
}

function respostaTarifa(p) {
    const pagamento = `A proposta do protótipo é integrar o pagamento na própria parada (cartão de transporte, aproximação ou QR Code), mas isso ainda está em fase de projeto. Por enquanto, o pagamento é feito no embarque, conforme as regras da concessionária.`;

    if (tem(p, "pagar") || tem(p, "pagamento") || tem(p, "pix") || tem(p, "cartao") || tem(p, "dinheiro") || tem(p, "troco") || tem(p, "qr code") || tem(p, "aproximacao")) {
        return pagamento;
    }

    let valores = "";
    if (INFO_TARIFA.inteira) {
        valores = `A tarifa inteira é de <strong>${INFO_TARIFA.inteira}</strong>.`;
        if (INFO_TARIFA.estudante) valores += ` Estudantes pagam <strong>${INFO_TARIFA.estudante}</strong>.`;
        if (INFO_TARIFA.observacao) valores += ` ${INFO_TARIFA.observacao}`;
    } else {
        valores = `O valor da passagem, os descontos de estudante e as gratuidades são definidos pela concessionária e pela prefeitura, então vale confirmar nos canais oficiais do transporte coletivo.`;
    }
    return `${valores}<br>${pagamento}`;
}

function respostaTecnica(p) {
    if (tem(p, "esp32") || tem(p, "esp 32") || tem(p, "microcontrolador") || tem(p, "arduino")) {
        return `O cérebro da parada é um <strong>ESP32</strong>: um microcontrolador com Wi-Fi e Bluetooth integrados. Ele lê os sensores, controla as cargas (painel, iluminação) e envia os dados para o sistema, tudo com baixo consumo de energia.`;
    }
    if (tem(p, "bateria") || tem(p, "baterias") || tem(p, "litio") || tem(p, "autonomia") || tem(p, "falta de luz") || tem(p, "funciona sem luz")) {
        return `As <strong>baterias de lítio</strong> guardam a energia gerada durante o dia para manter a parada funcionando à noite e em dias nublados. Um sistema de gerenciamento protege contra sobrecarga, descarga excessiva e superaquecimento, e isso dá autonomia mesmo sem a rede elétrica.`;
    }
    if (tem(p, "sensor") || tem(p, "sensores") || tem(p, "iot") || tem(p, "internet das coisas") || tem(p, "mqtt") || tem(p, "wifi") || tem(p, "wi fi")) {
        return `A parada usa conceitos de <strong>IoT</strong>: sensores monitoram a microrrede, como tensão, corrente e temperatura, e o ESP32 envia esses dados por Wi-Fi. Assim o sistema acompanha o funcionamento em tempo real e pode gerar alertas.`;
    }
    if (tem(p, "solar") || tem(p, "fotovoltaic") || tem(p, "placa solar") || tem(p, "painel solar")) {
        return `O <strong>painel solar</strong> no teto transforma luz em energia elétrica. Um controlador de carga regula a tensão e distribui a energia para as baterias e para o painel de informações. É uma microrrede pequena, limpa e independente.`;
    }
    return `A parada é uma <strong>microrrede solar</strong>: o painel fotovoltaico gera energia, um controlador de carga a regula, as <strong>baterias de lítio</strong> armazenam, e um <strong>ESP32</strong> com <strong>sensores IoT</strong> monitora tudo e atualiza as informações da tela. Quer detalhes sobre solar, baterias ou sensores?`;
}

function respostaProjeto() {
    return `Este é um <strong>Projeto Integrador do 4.º semestre de Engenharia Elétrica</strong>: um protótipo de parada de ônibus inteligente que une energia solar, sensores IoT, informações de ônibus em tempo real, clima e um assistente de voz.`;
}

function respostaAlertas() {
    return `No momento o trânsito flui normalmente no centro de Erechim e os sistemas da parada estão online. Para ver os avisos completos, abra 'Alertas do Sistema'.${sufixoClima()}`;
}

function respostaAcessibilidade() {
    return `Esta parada tem um assistente de voz, que ajuda quem tem dificuldade de leitura. Sobre rampas, elevadores e acessibilidade dos veículos, as informações devem ser confirmadas com a concessionária do transporte coletivo.`;
}

function respostaSOS(urgente) {
    const numeros = `SAMU <strong>192</strong>, Polícia Militar <strong>190</strong>, Bombeiros <strong>193</strong> e Guarda Municipal <strong>153</strong>`;
    if (urgente) {
        return `Se alguém está em perigo, ligue agora: ${numeros}. Mantenha a calma e informe o endereço ou um ponto de referência. O botão 'Ajuda / SOS' da tela faz apenas uma chamada simulada, então em emergência real use o telefone.`;
    }
    return `Os contatos de emergência estão no botão 'Ajuda / SOS': ${numeros}. A tela simula a chamada; em emergência real, ligue direto.`;
}

function respostaSugestao() {
    return `Adoramos ouvir ideias! Abra 'Ajuda / SOS' e use o campo 'Enviar Sugestão' para deixar seu comentário.`;
}

function respostaPainel() {
    return `É simples: <strong>Falar com IA</strong> é aqui comigo, <strong>Próximas Chegadas</strong> mostra os ônibus em tempo real, <strong>Rotas e Itinerários</strong> traz os trajetos, <strong>Quadro de Horários</strong> a tabela completa, <strong>Alertas</strong> os avisos do sistema e <strong>Ajuda / SOS</strong> os contatos de emergência.`;
}

function respostaMapa() {
    return `O mapa mostra toda a área urbana de Erechim. Arraste para se mover e use o zoom para ver ruas e bairros em detalhe.`;
}

function respostaIdentidade() {
    return `Sou a assistente virtual da Parada Inteligente de Erechim. Informo o próximo ônibus, ensino o caminho até URI, IFRS, hospitais, Centro e bairros, falo do clima, de tarifa e explico a tecnologia da parada, como a microrrede solar e o ESP32.`;
}

function respostaFallback() {
    return `Não tenho certeza se entendi. Posso ajudar com o <strong>próximo ônibus</strong>, <strong>como chegar</strong> a um destino, <strong>horários</strong>, <strong>clima</strong>, <strong>tarifa</strong> e a <strong>tecnologia da parada</strong>. Tente, por exemplo: "como chego na URI?" ou "vai chover hoje?".`;
}

/* ---------- Orquestrador principal ---------- */

function gerarRespostaInteligenteIA(pergunta) {
    const p = normalizar(pergunta)
        .replace(/\bquanto tempo\b/g, "quanto falta")
        .replace(/\btempo de espera\b/g, "quanto falta");

    if (!p) return respostaFallback();

    // Emergência sempre tem prioridade
    if (TERMOS_EMERGENCIA.some(t => tem(p, t))) return respostaSOS(true);

    const intencoes = pontuarIntencoes(p);
    const ids = intencoes.map(i => i.id);
    const topo = intencoes.length ? intencoes[0].id : null;

    const linhaExplicita = detectarLinha(p);
    const local = detectarLocal(p);

    let idxLinha = linhaExplicita !== null
        ? linhaExplicita
        : (local && local.linha !== null ? local.linha : null);

    // Perguntas de seguimento: "e o horário dela?", "e a próxima?"
    const seguimento = /\b(dele|dela|desse|dessa|essa|esse|mesma|mesmo)\b/.test(p) || p.split(" ").length <= 3;
    if (idxLinha === null && seguimento && contextoIA.linha !== null && ["chegada", "horarios", "perdi"].includes(topo)) {
        idxLinha = contextoIA.linha;
    }

    // Sem intenção clara, mas citou linha ou lugar
    let intencao = topo;
    if (!intencao) {
        if (local) intencao = "rota";
        else if (linhaExplicita !== null) {
            intencao = ["chegada", "horarios"].includes(contextoIA.intencao) ? contextoIA.intencao : "linhas";
        }
    }

    let resposta;

    if (local && ["rota", "chegada", "linhas", null].includes(topo)) {
        resposta = respostaLocal(local);
    } else {
        switch (intencao) {
            case "saudacao":
                resposta = `${saudacaoDoDia()}! Posso ajudar com ônibus, rotas, horários, clima ou com a tecnologia da parada. O que você precisa?`;
                break;
            case "agradecimento":
                resposta = "Por nada! Se precisar de mais alguma coisa, é só chamar. Boa viagem!";
                break;
            case "despedida":
                resposta = "Até mais! Tenha uma ótima viagem.";
                break;
            case "identidade":
                resposta = respostaIdentidade();
                break;
            case "perdi":
                resposta = respostaPerdi(idxLinha);
                break;
            case "chegada":
                resposta = respostaChegada(idxLinha);
                break;
            case "linhas":
                resposta = idxLinha !== null ? respostaLinha(idxLinha) : respostaLinhasGeral();
                break;
            case "rota":
                resposta = respostaRotaSemDestino();
                break;
            case "horarios":
                resposta = respostaHorarios(idxLinha, p);
                break;
            case "clima":
                resposta = respostaClima();
                break;
            case "tarifa":
                resposta = respostaTarifa(p);
                break;
            case "tecnico":
                resposta = respostaTecnica(p);
                break;
            case "projeto":
                resposta = respostaProjeto();
                break;
            case "alertas":
                resposta = respostaAlertas();
                break;
            case "acessibilidade":
                resposta = respostaAcessibilidade();
                break;
            case "sugestao":
                resposta = respostaSugestao();
                break;
            case "painel":
                resposta = respostaPainel();
                break;
            case "mapa":
                resposta = respostaMapa();
                break;
            case "ajuda":
                resposta = `Claro, estou aqui! Posso informar o próximo ônibus, montar a rota até o seu destino, passar horários, clima e tarifa. Se for emergência, ligue 192, 190 ou 193.`;
                break;
            default:
                resposta = respostaFallback();
        }
    }

    // Pergunta mista (ex.: "vai chover e quando passa o ônibus?"): acrescenta o clima
    if (ids.includes("clima") && !["clima", "saudacao", "agradecimento", "despedida"].includes(intencao)
        && !resposta.includes("guarda-chuva")) {
        resposta += `<br>${resumoClima()}`;
    }

    if (idxLinha !== null) contextoIA.linha = idxLinha;
    if (topo) contextoIA.intencao = topo;
    if (local) contextoIA.local = local;

    return resposta;
}

/* =====================================
   VOZ NATURAL E HUMANA
   (Web Speech API — gratuita)
===================================== */

function iniciarVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Seu navegador não possui suporte para reconhecimento de voz.");
        return;
    }

    // Para a fala da IA para ela não "se ouvir"
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const rec = new SpeechRecognition();
    rec.lang = "pt-BR";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
        const texto = e.results[0][0].transcript;
        const input = document.getElementById("entrada-chat");
        if (input) {
            input.value = texto;
            document.getElementById("form-chat").requestSubmit();
        }
    };

    rec.onerror = () => {
        exibirAviso("Não consegui ouvir. Tente falar de novo.");
    };

    rec.start();
}

// Ordem de preferência: vozes neurais/naturais brasileiras primeiro
const PREFERENCIA_VOZES = [
    "francisca online",
    "antonio online",
    "thalita",
    "google português do brasil",
    "google portugues do brasil",
    "francisca",
    "antonio",
    "helena",
    "luciana",
    "felipe",
    "maria"
];

let vozEscolhida = null;

function pontuarVoz(v) {
    const lang = (v.lang || "").replace("_", "-").toLowerCase();
    const nome = (v.name || "").toLowerCase();
    let score = 0;

    if (lang === "pt-br") score += 100;
    else if (lang.startsWith("pt")) score += 20;   // pt-PT fica bem abaixo
    else return -1;

    if (nome.includes("natural")) score += 80;
    if (nome.includes("online")) score += 50;

    const idx = PREFERENCIA_VOZES.findIndex(n => nome.includes(n));
    if (idx >= 0) score += (PREFERENCIA_VOZES.length - idx) * 3;

    // Penaliza vozes antigas e robóticas do Windows
    if (nome.includes("desktop")) score -= 60;
    if (nome.includes("maria") && !nome.includes("online") && !nome.includes("natural")) score -= 40;

    return score;
}

function obterVozHumana() {
    if (!("speechSynthesis" in window)) return null;
    if (vozEscolhida) return vozEscolhida;

    const vozes = window.speechSynthesis.getVoices();
    if (!vozes || vozes.length === 0) return null;

    let melhor = null;
    let melhorScore = -1;
    vozes.forEach(v => {
        const s = pontuarVoz(v);
        if (s > melhorScore) {
            melhorScore = s;
            melhor = v;
        }
    });

    vozEscolhida = melhor;
    return vozEscolhida;
}

/*
  Prepara o texto para soar natural: remove HTML e emojis, lê horários e números
  do jeito que as pessoas falam, soletra siglas e ajusta pontuação para pausas orgânicas.
*/
function prepararTextoParaFala(texto) {
    let t = String(texto)
        .replace(/<br\s*\/?>/gi, ". ")
        .replace(/<\/(p|div|li)>/gi, ". ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, " e ")
        .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, " ");

    // Horários: 15:35 -> "15 horas e 35 minutos" | 16:00 -> "16 horas"
    t = t.replace(/\b(\d{1,2}):(\d{2})\b/g, (_, h, m) => {
        const hh = Number(h);
        const mm = Number(m);
        const horas = `${hh} ${hh === 1 ? "hora" : "horas"}`;
        return mm === 0 ? horas : `${horas} e ${mm} ${mm === 1 ? "minuto" : "minutos"}`;
    });

    // Unidades, porcentagem e moeda
    t = t
        .replace(/\b(\d+)\s*min\b/gi, (_, n) => `${n} ${Number(n) === 1 ? "minuto" : "minutos"}`)
        .replace(/(\d+)\s*°\s*C\b/g, "$1 graus")
        .replace(/(\d+)\s*%/g, "$1 por cento")
        .replace(/R\$\s*(\d+)[,.](\d{2})/g, "$1 reais e $2 centavos")
        .replace(/R\$\s*(\d+)/g, "$1 reais");

    // Números de emergência dígito a dígito
    t = t.replace(/\b(192|190|193|153)\b/g, (n) => n.split("").join(" "));

    // Abreviações e siglas
    t = t
        .replace(/\bAv\.\s?/g, "Avenida ")
        .replace(/\bR\.\s/g, "Rua ")
        .replace(/\bMáx\./g, "máxima")
        .replace(/\bMín\./g, "mínima")
        .replace(/\bESP32\b/g, "E S P trinta e dois")
        .replace(/\bIoT\b/g, "I o T")
        .replace(/\bIFRS\b/g, "I F R S")
        .replace(/\bURI\b/g, "U R I")
        .replace(/\bSOS\b/g, "S O S")
        .replace(/\bUPA\b/g, "U P A")
        .replace(/\bQR\b/g, "Q R")
        .replace(/\bPM\b/g, "P M")
        .replace(/Wi-?Fi/gi, "uai-fai");

    // Pontuação: converte símbolos em pausas naturais
    t = t
        .replace(/[—–]/g, ", ")
        .replace(/[•·]/g, ", ")
        .replace(/[\/()\[\]]/g, ", ")
        .replace(/[*_#~`"“”']/g, "")
        .replace(/:/g, ", ")
        .replace(/;/g, ",")
        .replace(/\.{2,}|…/g, ".")
        .replace(/\s*,(\s*,)+/g, ",")
        .replace(/,\s*\./g, ".")
        .replace(/\.\s*\./g, ".")
        .replace(/\s+([,.!?])/g, "$1")
        .replace(/\s{2,}/g, " ")
        .trim();

    if (t && !/[.!?]$/.test(t)) t += ".";
    return t;
}

// Divide em trechos maiores: menos cortes = entonação mais contínua
function dividirEmTrechos(texto) {
    if (!texto) return [];

    const frases = (texto.match(/[^.!?]+[.!?]*/g) || [])
        .map(f => f.trim())
        .filter(Boolean);

    const trechos = [];
    let buffer = "";

    frases.forEach(frase => {
        buffer = buffer ? `${buffer} ${frase}` : frase;
        if (buffer.length >= 90) {
            trechos.push(buffer);
            buffer = "";
        }
    });
    if (buffer) trechos.push(buffer);

    // Trechos muito longos são quebrados nas vírgulas
    const final = [];
    trechos.forEach(trecho => {
        if (trecho.length <= 200) {
            final.push(trecho);
            return;
        }
        let parte = "";
        trecho.split(", ").forEach(pedaco => {
            if ((parte + pedaco).length > 180 && parte) {
                final.push(parte.trim() + ",");
                parte = "";
            }
            parte += pedaco + ", ";
        });
        if (parte.trim()) final.push(parte.trim().replace(/,\s*$/, "."));
    });

    return final;
}

function falarTexto(texto) {
    if (!("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const limpo = prepararTextoParaFala(texto);
    if (!limpo) return;

    // Texto curto = um único trecho (entonação contínua e mais natural)
    const trechos = limpo.length <= 220 ? [limpo] : dividirEmTrechos(limpo);
    const voz = obterVozHumana();

    // Diagnóstico: mostra uma vez qual voz está sendo usada (pode apagar depois)
    if (!window._vozAvisada) {
        window._vozAvisada = true;
        exibirAviso(voz ? `Voz em uso: ${voz.name}` : "Nenhuma voz em português encontrada neste navegador.");
        console.log("Voz escolhida:", voz ? voz.name : null);
        console.table(synth.getVoices().map(v => ({ nome: v.name, idioma: v.lang })));
    }

    // Pequeno atraso após cancel() evita que o navegador "engula" o início da fala
    setTimeout(() => {
        trechos.forEach(trecho => {
            const ut = new SpeechSynthesisUtterance(trecho);
            ut.lang = "pt-BR";
            ut.rate = 0.95;                              // cadência levemente calma
            ut.pitch = /\?$/.test(trecho) ? 1.08 : 1.04; // tom acolhedor; sobe um pouco nas perguntas
            ut.volume = 1;
            if (voz) ut.voice = voz;
            synth.speak(ut);
        });
    }, 60);
}

// Vozes carregam de forma assíncrona em muitos navegadores
if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        vozEscolhida = null;
        obterVozHumana();
    };
}

/* =====================================
   AÇÕES DOS BOTÕES
===================================== */

function acaoBotao(nome) {
    switch (nome) {
        case "PRÓXIMAS CHEGADAS": mostrarChegadas(); break;
        case "ROTAS E ITINERÁRIOS": mostrarRotas(); break;
        case "QUADRO DE HORÁRIOS": mostrarHorarios(); break;
        case "ALERTAS DO SISTEMA": mostrarAlertas(); break;
        case "AJUDA / SOS": mostrarAjuda(); break;
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharPainel();
});