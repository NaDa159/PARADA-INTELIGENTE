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
   INICIALIZAÇÃO DO MAPA URBANO DE ERECHIM
   (SEM ERRO 403, FUNDO CLARO E BAIRROS VISÍVEIS)
===================================== */

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

    // Centro da área urbana de Erechim (Praça da Bandeira)
    const latErechim = -27.6345;
    const lngErechim = -52.2740;

    // Delimitação do perímetro urbano de Erechim
    const limitesErechim = L.latLngBounds(
        L.latLng(-27.6850, -52.3250), // Canto Sudoeste
        L.latLng(-27.5850, -52.2230)  // Canto Nordeste
    );

    mapa = L.map("mapa-erechim", {
        zoomControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        minZoom: 13,                   // Mantém o enquadramento na mancha urbana
        maxZoom: 18,
        maxBounds: limitesErechim,     // Limita a navegação para não sair da cidade
        maxBoundsViscosity: 0.4        // Movimentação suave nas bordas sem cortes secos
    }).setView([latErechim, lngErechim], 13.8);

    // Servidor OpenStreetMap França: não bloqueia arquivos locais (file://) e exibe os bairros em português
    const camadaUrbana = L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap France | Erechim Nav System'
    });

    // Alternativa automática Esri caso haja instabilidade de conexão
    camadaUrbana.on("tileerror", function () {
        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
            maxZoom: 18
        }).addTo(mapa);
    });

    camadaUrbana.addTo(mapa);

    L.control.zoom({ position: "bottomright" }).addTo(mapa);

    // Redimensionamento automático do container
    [100, 300, 600, 1000].forEach(tempo => {
        setTimeout(() => {
            if (mapa) mapa.invalidateSize();
        }, tempo);
    });
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
===================================== */

async function buscarClimaErechim() {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=-27.6339&longitude=-52.2745&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo&forecast_days=1";

    try {
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error("Erro API clima");

        const dados = await resposta.json();
        const temperatura = Math.round(dados.current.temperature_2m);
        const tempMax = Math.round(dados.daily.temperature_2m_max[0]);
        const tempMin = Math.round(dados.daily.temperature_2m_min[0]);
        const codigo = dados.current.weather_code;

        let icone = "☁️";
        if (codigo === 0) icone = "☀️";
        else if ([1, 2].includes(codigo)) icone = "⛅";
        else if (codigo >= 51 && codigo <= 82) icone = "🌧️";
        else if (codigo >= 95) icone = "⛈️";

        document.getElementById("temperatura-atual").textContent = temperatura + "°C";
        document.getElementById("temperatura-maxima").textContent = tempMax + "°C";
        document.getElementById("temperatura-minima").textContent = tempMin + "°C";
        document.getElementById("icone-clima").textContent = icone;

    } catch (erro) {
        document.getElementById("temperatura-atual").textContent = "20°C";
        document.getElementById("temperatura-maxima").textContent = "21°C";
        document.getElementById("temperatura-minima").textContent = "17°C";
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

    if (mapa) {
        setTimeout(() => { mapa.invalidateSize(); }, 250);
    }
}

function fecharPainel() {
    painel.classList.remove("aberto");
    if (mapa) {
        setTimeout(() => { mapa.invalidateSize(); }, 250);
    }
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
   IA INFORMATIVA DA PARADA
===================================== */

function mostrarIA() {
    const conteudo = `
        <div class="assistente-apresentacao">
            <div class="assistente-avatar">IA</div>
            <div>
                <span class="assistente-etiqueta">ASSISTENTE VIRTUAL DA PARADA</span>
                <p style="font-size:0.76rem; color:#64748b;">Informações sobre ônibus, linhas, horários e uso do painel.</p>
            </div>
        </div>

        <div class="sugestoes-assistente">
            <button onclick="enviarSugestao('Qual o próximo ônibus?')">⏱️ Próximo Ônibus</button>
            <button onclick="enviarSugestao('Quais são as linhas?')">🚌 Linhas Disponíveis</button>
            <button onclick="enviarSugestao('Como ver os horários?')">📅 Quadro de Horários</button>
            <button onclick="enviarSugestao('Como pedir ajuda?')">🆘 Ajuda de Emergência</button>
        </div>

        <div id="historico-chat" class="historico-chat"></div>

        <form class="campo-chat" id="form-chat">
            <input type="text" id="entrada-chat" placeholder="Digite sua pergunta sobre os ônibus ou linhas..." required autocomplete="off">
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
        historicoConversaAssistente.forEach(msg => adicionarMensagemChat(msg.texto, msg.tipo));
    } else {
        adicionarMensagemChat("Olá! Como posso ajudar com as informações dos ônibus e horários hoje?", "ia");
    }
}

function enviarSugestao(texto) {
    const input = document.getElementById("entrada-chat");
    if (input) {
        input.value = texto;
        document.getElementById("form-chat").requestSubmit();
    }
}

function adicionarMensagemChat(texto, tipo) {
    const historico = document.getElementById("historico-chat");
    if (!historico) return;

    const divMsg = document.createElement("div");
    divMsg.className = `mensagem-chat ${tipo === "usuario" ? "mensagem-usuario" : "mensagem-ia"}`;
    divMsg.innerHTML = texto;

    historico.appendChild(divMsg);
    historico.scrollTop = historico.scrollHeight;

    historicoConversaAssistente.push({ texto, tipo });
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
    return texto.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function gerarRespostaInteligenteIA(pergunta) {
    const p = normalizar(pergunta);

    if (p.includes("proximo") || p.includes("onibus") || p.includes("chegada") || p.includes("demora")) {
        const proximo = dadosOnibus[0];
        return `O próximo ônibus previsto nesta parada é a ${proximo.linha} em direção ao ${proximo.destino}, com previsão em ${proximo.minutos} minutos (${proximo.horario}).`;
    }

    if (p.includes("linha") || p.includes("rota") || p.includes("itinerario")) {
        return "As linhas disponíveis nesta parada são: Linha 01 (Centro), Linha 02 (Atlântico), Linha 03 (Bela Vista), Linha 04 (URI / Câmpus) e Linha 05 (Três Vendas). Você pode ver detalhes clicando no botão 'Rotas e Itinerários'.";
    }

    if (p.includes("horario") || p.includes("partida") || p.includes("quadro") || p.includes("tabela")) {
        return "Você pode consultar a tabela de partidas completas de cada linha clicando no botão 'Quadro de Horários' no menu à direita.";
    }

    if (p.includes("ajuda") || p.includes("sos") || p.includes("emergencia") || p.includes("policia") || p.includes("samu")) {
        return "Para acionar contatos de emergência ou enviar uma sugestão, acesse o botão 'Ajuda / SOS' no menu à direita.";
    }

    if (p.includes("tarifa") || p.includes("passagem") || p.includes("preco") || p.includes("valor") || p.includes("pagamento") || p.includes("pagar")) {
        return "Informações sobre valores de passagens e formas de pagamento devem ser consultadas diretamente com os canais oficiais da concessionária do transporte coletivo urbano.";
    }

    if (p.includes("solar") || p.includes("energia") || p.includes("microrrede") || p.includes("projeto") || p.includes("engenharia")) {
        return "Este protótipo de Parada Inteligente foi desenvolvido como um Projeto Integrador de Engenharia Elétrica. Para detalhes técnicos específicos, consulte a documentação acadêmica do projeto.";
    }

    if (p.includes("ola") || p.includes("oi") || p.includes("bom dia") || p.includes("boa tarde") || p.includes("boa noite")) {
        return "Olá! Como posso ajudar com as informações de ônibus e horários da parada?";
    }

    return "Posso ajudar com informações sobre previsão de chegada, linhas disponíveis, horários de ônibus e atalhos dos botões do painel. Como posso ajudar?";
}

/* =====================================
   SINTETIZADOR DE VOZ NATURAL E HUMANA
   (LIVRE E GRATUITO VIA WEB SPEECH API)
===================================== */

function iniciarVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Seu navegador não possui suporte para reconhecimento de voz.");
        return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "pt-BR";
    rec.start();

    rec.onresult = (e) => {
        const texto = e.results[0][0].transcript;
        const input = document.getElementById("entrada-chat");
        if (input) {
            input.value = texto;
            document.getElementById("form-chat").requestSubmit();
        }
    };
}

// Filtra e prioriza vozes neurais/naturais em português do Brasil
function obterVozHumana() {
    if (!("speechSynthesis" in window)) return null;
    const voces = window.speechSynthesis.getVoices();
    if (!voces || voces.length === 0) return null;

    // Prioridade total para vozes neurais e naturais em pt-BR
    const vozNeuralBR = voces.find(v => v.lang.startsWith("pt") && (
        v.name.includes("Natural") || 
        v.name.includes("Online") ||
        v.name.includes("Google") || 
        v.name.includes("Francisca") || 
        v.name.includes("Antonio") ||
        v.name.includes("Helena") || 
        v.name.includes("Luciana")
    ));

    if (vozNeuralBR) return vozNeuralBR;

    // Fallback para qualquer voz em pt-BR
    const vozPtBR = voces.find(v => v.lang === "pt-BR" || v.lang === "pt_BR");
    if (vozPtBR) return vozPtBR;

    // Fallback para qualquer voz em português
    return voces.find(v => v.lang.startsWith("pt")) || null;
}

function falarTexto(texto) {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    // Formatação de pontuação e números para cadência humana natural
    let textoLimpo = texto
        .replace(/<[^>]*>?/gm, '')
        .replace(/[*_#•]/g, '')
        .replace(/\b(\d{1,2}):(\d{2})\b/g, '$1 horas e $2 minutos')
        .trim();

    if (!textoLimpo) return;

    const ut = new SpeechSynthesisUtterance(textoLimpo);
    ut.lang = "pt-BR";
    
    // Parâmetros de prosódia humana: velocidade cadenciada e tom natural
    ut.rate = 0.95;
    ut.pitch = 1.02;

    const voz = obterVozHumana();
    if (voz) ut.voice = voz;

    window.speechSynthesis.speak(ut);
}

// Garante o carregamento assíncrono das vozes disponibilizadas pelo SO/navegador
if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        obterVozHumana();
    };
}

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