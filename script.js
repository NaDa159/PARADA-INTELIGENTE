"use strict";

document.addEventListener("DOMContentLoaded", iniciarAplicacao);

function iniciarAplicacao() {

    const CFG = {
        centro: [-52.2754, -27.6296],
        estilo: "https://tiles.openfreemap.org/styles/positron",
        osrm: "https://router.project-osrm.org/route/v1/driving/",
        clima: "https://api.open-meteo.com/v1/forecast"
    };

    const terminal = {
        nome: "Terminal Urbano Central",
        c: [-52.27541, -27.62955]
    };

    const campi = [
        {
            nome: "URI — Câmpus I",
            c: [-52.26986, -27.64886],
            id: "uri1"
        },
        {
            nome: "URI — Câmpus II",
            c: [-52.23225, -27.61247],
            id: "uri2"
        }
    ];

    /*
       Coordenadas de referência dos bairros.
       São aproximações para visualização cartográfica,
       não coordenadas oficiais de pontos de ônibus.
    */

    const bairros = [
        ["Centro", -52.2757, -27.6320],
        ["Fátima", -52.2705, -27.6470],
        ["Bela Vista", -52.2840, -27.6200],
        ["Linho", -52.2870, -27.6370],
        ["José Bonifácio", -52.2660, -27.6350],
        ["Esperança", -52.2920, -27.6420],
        ["Morro da Cegonha", -52.2920, -27.6250],
        ["São Caetano", -52.3030, -27.6370],
        ["Ipiranga", -52.2920, -27.6500],
        ["Dal Molin", -52.2860, -27.6550],
        ["Triângulo", -52.2990, -27.6540],
        ["Santa Catarina", -52.3070, -27.6500],
        ["Espírito Santo", -52.3120, -27.6420],
        ["Parque dos Imigrantes", -52.3030, -27.6210],
        ["São Cristóvão", -52.2930, -27.6100],
        ["Cerâmica", -52.2820, -27.6120],
        ["Vitória I", -52.2720, -27.6110],
        ["São José", -52.2620, -27.6190],
        ["Presidente Castelo Branco", -52.2570, -27.6290],
        ["Estevam Carraro", -52.2510, -27.6400],
        ["Industrial", -52.2430, -27.6350],
        ["Atlântico", -52.2550, -27.6150],
        ["Morada do Sol", -52.2460, -27.6250],
        ["Parque Lívia", -52.2350, -27.6310],
        ["São Vicente de Paulo", -52.2640, -27.6560],
        ["Zimmer", -52.2850, -27.6000],
        ["Cristal", -52.2710, -27.6010],
        ["Vale Dourado", -52.2580, -27.6000],
        ["Jabuticabal", -52.2460, -27.6040],
        ["Três Vendas", -52.2910, -27.6030],
        ["Koller", -52.3050, -27.6080]
    ].map(([nome, lon, lat]) => ({
        nome,
        c: [lon, lat]
    }));

    // SETE ITINERÁRIOS DEMONSTRATIVOS

    const grupos = [
        {
            n: "01",
            nome: "URI Câmpus I",
            desc: "Terminal → URI Câmpus I → Terminal",
            cor: "#7c3aed",
            paradas: ["uri1"],
            min: 22
        },
        {
            n: "02",
            nome: "URI Câmpus II",
            desc: "Terminal → URI Câmpus II → Terminal",
            cor: "#9333ea",
            paradas: ["uri2"],
            min: 28
        },
        {
            n: "03",
            nome: "Centro e bairros próximos",
            desc: "Centro, Fátima, Bela Vista, Linho, José Bonifácio, Esperança e Morro da Cegonha",
            cor: "#2563eb",
            paradas: [
                "Centro", "Fátima", "Bela Vista", "Linho",
                "José Bonifácio", "Esperança", "Morro da Cegonha"
            ],
            min: 32
        },
        {
            n: "04",
            nome: "Setor Sul",
            desc: "São Caetano, Ipiranga, Dal Molin, Triângulo, Santa Catarina e Espírito Santo",
            cor: "#dc2626",
            paradas: [
                "São Caetano", "Ipiranga", "Dal Molin",
                "Triângulo", "Santa Catarina", "Espírito Santo"
            ],
            min: 35
        },
        {
            n: "05",
            nome: "Setor Norte",
            desc: "Parque dos Imigrantes, São Cristóvão, Cerâmica, Vitória I, São José e Presidente Castelo Branco",
            cor: "#059669",
            paradas: [
                "Parque dos Imigrantes", "São Cristóvão", "Cerâmica",
                "Vitória I", "São José", "Presidente Castelo Branco"
            ],
            min: 34
        },
        {
            n: "06",
            nome: "Setor Leste",
            desc: "Estevam Carraro, Industrial, Atlântico, Morada do Sol, Parque Lívia e São Vicente de Paulo",
            cor: "#d97706",
            paradas: [
                "Estevam Carraro", "Industrial", "Atlântico",
                "Morada do Sol", "Parque Lívia", "São Vicente de Paulo"
            ],
            min: 38
        },
        {
            n: "07",
            nome: "Setor Oeste",
            desc: "Zimmer, Cristal, Vale Dourado, Jabuticabal, Três Vendas e Koller",
            cor: "#0891b2",
            paradas: [
                "Zimmer", "Cristal", "Vale Dourado",
                "Jabuticabal", "Três Vendas", "Koller"
            ],
            min: 37
        }
    ].map(r => ({
        ...r,
        id: "linha-" + r.n,
        coords: [],
        progress: 0,
        marker: null,
        el: null,
        cumulative: [],
        total: 1,
        km: 0
    }));

    const locais = [
        { nome: terminal.nome, c: terminal.c },
        ...campi.map(p => ({ nome: p.nome, c: p.c })),
        ...bairros
    ];

    let map = null;
    let mapaPronto = false;
    let selected = grupos[0].id;
    let running = true;
    let last = performance.now();
    let toastTimer = null;
    let reconhecimento = null;
    let vozRespostaAtiva = true;
    let climaAtual = null;

    const $ = id => document.getElementById(id);

    // --------------------------------------------------
    // INICIALIZAÇÃO DO MAPA
    // --------------------------------------------------

    if (!window.maplibregl) {
        toast("A biblioteca do mapa não carregou. Verifique sua conexão.");
        atualizarStatus("status-mapa", "Indisponível", "status-alerta");
        return;
    }

    map = new maplibregl.Map({
        container: "map",
        style: CFG.estilo,
        center: CFG.centro,
        zoom: 13,
        attributionControl: true
    });

    map.addControl(
        new maplibregl.NavigationControl(),
        "bottom-right"
    );

    map.addControl(
        new maplibregl.ScaleControl(),
        "bottom-left"
    );

    map.on("load", async () => {
        mapaPronto = true;

        addFixedMarkers();
        addNeighborhoodMarkers();
        setupRouteLayers();
        addBusMarkers();

        renderRoutes();
        fillPlanner();
        renderArrivals();
        renderUffsSchedule();

        atualizarStatus("status-mapa", "Ativo", "status-ok");

        await loadRoadRoutes();

        highlightRoute();

        requestAnimationFrame(animate);

        toast("Mapa carregado.");
    });

    map.on("error", e => {
        console.warn("Erro MapLibre:", e.error || e);
    });

    // --------------------------------------------------
    // MARCADORES
    // --------------------------------------------------

    function pin(cls, label) {
        const el = document.createElement("div");
        el.className = "map-pin " + cls;
        el.textContent = label;
        return el;
    }

    function popup(marker, title, desc) {
        marker.setPopup(
            new maplibregl.Popup({ offset: 16 })
                .setHTML(
                    `<strong>${safe(title)}</strong>
                     <p>${safe(desc)}</p>`
                )
        );
    }

    function addFixedMarkers() {
        const m = new maplibregl.Marker({
            element: pin("terminal", "T"),
            anchor: "center"
        })
            .setLngLat(terminal.c)
            .addTo(map);

        popup(m, terminal.nome, "Ponto de referência do projeto.");

        campi.forEach((p, i) => {
            const marker = new maplibregl.Marker({
                element: pin("universidade", i === 0 ? "I" : "II"),
                anchor: "center"
            })
                .setLngLat(p.c)
                .addTo(map);

            popup(marker, p.nome, "Localização de referência do câmpus.");
        });

        [
            ["Praça da Bandeira", [-52.2738, -27.6330]],
            ["Catedral São José", [-52.2730, -27.6318]],
            ["Parque Longines Malinowski", [-52.2780, -27.6250]]
        ].forEach(([nome, coord]) => {
            const marker = new maplibregl.Marker({
                element: pin("referencia", "•"),
                anchor: "center"
            })
                .setLngLat(coord)
                .addTo(map);

            popup(marker, nome, "Ponto de referência aproximado.");
        });
    }

    function addNeighborhoodMarkers() {
        bairros.forEach((b, i) => {
            const marker = new maplibregl.Marker({
                element: pin("parada-bairro", ""),
                anchor: "center"
            })
                .setLngLat(b.c)
                .addTo(map);

            popup(
                marker,
                b.nome,
                `Referência aproximada do bairro (${i + 1}/31). Não representa uma parada oficial de ônibus.`
            );
        });
    }

    // --------------------------------------------------
    // CAMADAS DE ROTAS
    // --------------------------------------------------

    function setupRouteLayers() {
        grupos.forEach(r => {
            map.addSource(r.id + "-src", {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [terminal.c, terminal.c]
                    }
                }
            });

            map.addLayer({
                id: r.id + "-line",
                type: "line",
                source: r.id + "-src",
                layout: {
                    "line-join": "round",
                    "line-cap": "round"
                },
                paint: {
                    "line-color": r.cor,
                    "line-width": 3,
                    "line-opacity": 0.25
                }
            });
        });

        map.addSource("planner-src", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: []
            }
        });

        map.addLayer({
            id: "planner-line",
            type: "line",
            source: "planner-src",
            paint: {
                "line-color": "#f59e0b",
                "line-width": 6,
                "line-dasharray": [2, 1]
            }
        });
    }

    // --------------------------------------------------
    // MARCADORES DOS ÔNIBUS
    // --------------------------------------------------

    function addBusMarkers() {
        grupos.forEach(r => {
            const el = document.createElement("div");
            el.className = "bus-animated-marker";
            el.textContent = "🚌";
            el.title = "Ônibus demonstrativo da linha " + r.n;

            r.el = el;

            r.marker = new maplibregl.Marker({
                element: el,
                anchor: "center"
            })
                .setLngLat(terminal.c)
                .addTo(map);

            el.addEventListener("click", () => selectRoute(r.id));
        });
    }

    // --------------------------------------------------
    // CARREGAMENTO DE ROTAS
    // --------------------------------------------------

    async function loadRoadRoutes() {
        await Promise.all(
            grupos.map(async r => {
                const stops = [
                    terminal.c,
                    ...r.paradas
                        .map(id => {
                            if (id === "uri1") return campi[0].c;
                            if (id === "uri2") return campi[1].c;
                            return bairros.find(b => b.nome === id)?.c;
                        })
                        .filter(Boolean),
                    terminal.c
                ];

                r.coords = stops;

                try {
                    const path = stops.map(c => c.join(",")).join(";");

                    const response = await fetch(
                        `${CFG.osrm}${path}?overview=full&geometries=geojson&steps=false`,
                        { signal: AbortSignal.timeout(15000) }
                    );

                    if (!response.ok) throw new Error("OSRM " + response.status);

                    const data = await response.json();

                    if (data.code !== "Ok" || !data.routes?.length) {
                        throw new Error("Rota indisponível");
                    }

                    r.coords = data.routes[0].geometry.coordinates;
                    r.km = data.routes[0].distance / 1000;

                } catch (err) {
                    console.warn(`Linha ${r.n}: usando segmentos aproximados.`, err);
                    r.km = distancePath(stops) / 1000;
                }

                buildCumulative(r);

                map.getSource(r.id + "-src").setData({
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: r.coords
                    }
                });

                r.marker.setLngLat(r.coords[0]);
            })
        );
    }

    function buildCumulative(r) {
        r.cumulative = [0];
        let sum = 0;

        for (let i = 1; i < r.coords.length; i++) {
            sum += distance(r.coords[i - 1], r.coords[i]);
            r.cumulative.push(sum);
        }

        r.total = sum || 1;
    }

    function distance(a, b) {
        const rad = x => x * Math.PI / 180;
        const R = 6371000;

        const dlat = rad(b[1] - a[1]);
        const dlon = rad(b[0] - a[0]);

        const x =
            Math.sin(dlat / 2) ** 2 +
            Math.cos(rad(a[1])) *
            Math.cos(rad(b[1])) *
            Math.sin(dlon / 2) ** 2;

        return 2 * R * Math.asin(Math.sqrt(x));
    }

    function distancePath(points) {
        let total = 0;

        for (let i = 1; i < points.length; i++) {
            total += distance(points[i - 1], points[i]);
        }

        return total;
    }

    function pointAt(r, fraction) {
        const target = fraction * r.total;
        let i = 1;

        while (
            i < r.cumulative.length &&
            r.cumulative[i] < target
        ) {
            i++;
        }

        if (i >= r.coords.length) {
            return r.coords[r.coords.length - 1];
        }

        const a = r.cumulative[i - 1];
        const b = r.cumulative[i];
        const t = (target - a) / (b - a || 1);

        const p = r.coords[i - 1];
        const q = r.coords[i];

        return [
            p[0] + (q[0] - p[0]) * t,
            p[1] + (q[1] - p[1]) * t
        ];
    }

    // --------------------------------------------------
    // ANIMAÇÃO
    // --------------------------------------------------

    function animate(now) {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;

        if (running) {
            grupos.forEach(r => {
                if (r.coords.length > 1) {
                    r.progress =
                        (r.progress + dt / (r.min * 60)) % 1;

                    r.marker.setLngLat(pointAt(r, r.progress));
                }
            });
        }

        requestAnimationFrame(animate);
    }

    // --------------------------------------------------
    // LISTA DE LINHAS
    // --------------------------------------------------

    function renderRoutes(filter = "") {
        const root = $("rotas-lista");
        if (!root) return;

        root.innerHTML = "";

        const q = filter.toLocaleLowerCase("pt-BR");

        const rows = grupos.filter(r =>
            (r.n + " " + r.nome + " " + r.desc)
                .toLocaleLowerCase("pt-BR")
                .includes(q)
        );

        rows.forEach(r => {
            const button = document.createElement("button");

            button.className =
                "rota-item" +
                (r.id === selected ? " selecionada" : "");

            button.innerHTML = `
                <span class="rota-cor" style="background:${r.cor}"></span>
                <span class="rota-informacao">
                    <strong>Linha ${r.n} — ${safe(r.nome)}</strong>
                    <span>${safe(r.desc)}</span>
                </span>
                <span class="rota-etiqueta">Simulação</span>
            `;

            button.onclick = () => selectRoute(r.id);
            root.appendChild(button);
        });

        if (!rows.length) {
            root.textContent = "Nenhuma linha encontrada.";
        }
    }

    function selectRoute(id) {
        selected = id;

        const route = grupos.find(r => r.id === id);
        if (!route) return;

        renderRoutes($("busca-linha").value);
        highlightRoute();

        if (route.coords.length && mapaPronto) {
            const bounds = new maplibregl.LngLatBounds();

            route.coords.forEach(c => bounds.extend(c));

            map.fitBounds(bounds, {
                padding: {
                    top: 70,
                    bottom: 70,
                    left: 150,
                    right: 150
                },
                maxZoom: 14,
                duration: 700
            });
        }

        $("status-rota").textContent =
            `Linha ${route.n}: ${route.nome}. Percurso demonstrativo com retorno ao terminal.`;
    }

    function highlightRoute() {
        grupos.forEach(r => {
            const active = r.id === selected;

            if (map.getLayer(r.id + "-line")) {
                map.setPaintProperty(
                    r.id + "-line",
                    "line-width",
                    active ? 7 : 3
                );

                map.setPaintProperty(
                    r.id + "-line",
                    "line-opacity",
                    active ? 1 : 0.25
                );
            }

            r.el?.classList.toggle("bus-selecionado", active);
        });
    }

    // --------------------------------------------------
    // PLANEJADOR
    // --------------------------------------------------

    function fillPlanner() {
        const origin = $("origin");
        const destination = $("destination");

        locais.forEach((p, i) => {
            origin.add(new Option(p.nome, i));
            destination.add(new Option(p.nome, i));
        });

        destination.selectedIndex = 1;
    }

    async function drawPlanner() {
        const originIndex = Number($("origin").value);
        const destinationIndex = Number($("destination").value);

        if (originIndex === destinationIndex) {
            return toast("Escolha dois locais diferentes.");
        }

        const a = locais[originIndex];
        const b = locais[destinationIndex];

        if (!a || !b) return toast("Selecione origem e destino.");

        const button = $("drawRoute");
        button.disabled = true;
        button.textContent = "Calculando...";

        try {
            const path = [a.c, b.c]
                .map(c => c.join(","))
                .join(";");

            const response = await fetch(
                `${CFG.osrm}${path}?overview=full&geometries=geojson`,
                { signal: AbortSignal.timeout(15000) }
            );

            if (!response.ok) throw new Error("Falha no serviço de rotas.");

            const data = await response.json();

            if (data.code !== "Ok" || !data.routes?.length) {
                throw new Error("Rota não encontrada.");
            }

            const route = data.routes[0];

            map.getSource("planner-src").setData({
                type: "Feature",
                properties: {},
                geometry: route.geometry
            });

            $("routeInfo").hidden = false;

            $("routeDistance").textContent =
                `${(route.distance / 1000).toFixed(1)} km`;

            $("routeDuration").textContent =
                `Tempo estimado de carro: ${Math.max(1, Math.round(route.duration / 60))} min`;

            const bounds = new maplibregl.LngLatBounds();

            route.geometry.coordinates.forEach(c => bounds.extend(c));

            map.fitBounds(bounds, {
                padding: 90,
                duration: 700
            });

            toast("Rota calculada.");

        } catch (error) {
            console.warn(error);
            toast("Não foi possível calcular a rota. Tente novamente.");
        } finally {
            button.disabled = false;
            button.textContent = "Traçar rota";
        }
    }

    function clearPlanner() {
        map.getSource("planner-src")?.setData({
            type: "FeatureCollection",
            features: []
        });

        $("routeInfo").hidden = true;
        toast("Trajeto removido.");
    }

    function swapPlanner() {
        const a = $("origin");
        const b = $("destination");
        const old = a.value;

        a.value = b.value;
        b.value = old;
    }

    // --------------------------------------------------
    // HORÁRIOS UFFS
    // --------------------------------------------------

    function renderUffsSchedule() {
        const root = $("horarios-uffs");
        if (!root) return;

        const schedule = [
            ["06:50", "07:15", "Av. 7 de Setembro"],
            ["07:30", "08:00", "Av. 7 de Setembro"],
            ["07:30", "08:00", "Av. 7 de Setembro"],
            ["07:30", "08:00", "Av. Pedro Pinto de Souza"],
            ["08:30", "09:00", "Av. 7 de Setembro"],
            ["09:30", "10:00", "Av. 7 de Setembro"],
            ["10:30", "11:00", "Av. 7 de Setembro"],
            ["11:30", "12:00", "Av. 7 de Setembro"],
            ["11:50", "12:20", "Av. 7 de Setembro"],
            ["12:50", "13:30", "Av. 7 de Setembro"],
            ["14:45", "15:15", "Av. 7 de Setembro"],
            ["15:30", "16:05", "Av. 7 de Setembro"],
            ["15:45", "16:15", "Av. 7 de Setembro"],
            ["16:45", "17:15", "Av. 7 de Setembro"],
            ["16:45", "17:15", "Av. Pedro Pinto de Souza"],
            ["17:25", "18:00", "Av. 7 de Setembro"],
            ["18:00", "18:30", "Av. 7 de Setembro"],
            ["18:30", "19:00", "Av. 7 de Setembro"],
            ["18:30", "19:00", "Av. Pedro Pinto de Souza"],
            ["19:00", "19:30", "Av. 7 de Setembro"],
            ["21:00", "21:30", "Av. 7 de Setembro"],
            ["22:00", "22:35", "Av. 7 de Setembro"],
            ["22:00", "22:35", "Av. Pedro Pinto de Souza"]
        ];

        root.innerHTML = schedule.map(item => `
            <tr>
                <td>${item[0]}</td>
                <td>${item[1]}</td>
                <td>Terminal → ${safe(item[2])} → BR-153 → ERS-135 → UFFS</td>
            </tr>
        `).join("");
    }

    // --------------------------------------------------
    // CHEGADAS DEMONSTRATIVAS
    // --------------------------------------------------

    function renderArrivals() {
        $("chegadas-simuladas").innerHTML =
            grupos.map((r, i) => `
                <div class="cartao-chegada-completo">
                    <div class="cartao-chegada-topo">
                        <b>Linha ${r.n} — ${safe(r.nome)}</b>
                        <span class="status-badge">Simulação</span>
                    </div>
                    <div class="cartao-chegada-detalhes">
                        <span>Terminal Urbano</span>
                        <strong class="tempo-destaque">${3 + (i * 7 + 4) % 16} min</strong>
                    </div>
                </div>
            `).join("");
    }

    // --------------------------------------------------
    // PAINÉIS
    // --------------------------------------------------

    function openPanel(name) {
        closePanels();

        $("painel-" + name)?.classList.add("aberto");

        document
            .querySelector(`[data-painel="${name}"]`)
            ?.classList.add("selecionado");

        if (name === "planejador" && mapaPronto) {
            setTimeout(() => map.resize(), 250);
        }
    }

    function closePanels() {
        document.querySelectorAll(".painel-funcionalidade")
            .forEach(p => p.classList.remove("aberto"));

        document.querySelectorAll("[data-painel]")
            .forEach(b => b.classList.remove("selecionado"));
    }

    // --------------------------------------------------
    // ACESSIBILIDADE
    // --------------------------------------------------

    function toggleGroup(ids, active) {
        ids.forEach(id => {
            $(id).classList.toggle("active", id === active);
        });
    }

    function setContrast(high) {
        document.body.classList.toggle("alto-contraste", high);

        toggleGroup(
            ["btn-contraste-padrao", "btn-contraste-alto"],
            high ? "btn-contraste-alto" : "btn-contraste-padrao"
        );
    }

    function setFontSize(large) {
        document.body.classList.toggle("fonte-grande", large);

        toggleGroup(
            ["btn-fonte-normal", "btn-fonte-maior"],
            large ? "btn-fonte-maior" : "btn-fonte-normal"
        );
    }

    // --------------------------------------------------
    // ASSISTENTE DE TEXTO
    // --------------------------------------------------

    function sendChat() {
        const input = $("chat-input");
        const question = input.value.trim();

        if (!question) return;

        addChat("Você", question, "mensagem-usuario");
        input.value = "";

        const answer = getAnswer(question);

        setTimeout(() => {
            addChat("Assistente", answer, "mensagem-assistente");

            if (vozRespostaAtiva) {
                speak(answer);
            }
        }, 250);
    }

    function getAnswer(question) {
        const q = normalize(question);

        if (
            q.includes("oi") ||
            q.includes("ola") ||
            q.includes("bom dia") ||
            q.includes("boa tarde") ||
            q.includes("boa noite")
        ) {
            return "Olá! Sou o assistente da Parada Inteligente de Erechim. Posso ajudar com linhas, horários, URI, terminal, clima e acessibilidade.";
        }

        if (
            q.includes("campus 1") ||
            q.includes("campus i") ||
            q.includes("uri 1") ||
            q.includes("uri i")
        ) {
            return "A Linha demonstrativa 01 liga o Terminal Urbano ao URI Câmpus I e retorna ao terminal. A localização está indicada em roxo no mapa.";
        }

        if (
            q.includes("campus 2") ||
            q.includes("campus ii") ||
            q.includes("uri 2") ||
            q.includes("uri ii")
        ) {
            return "A Linha demonstrativa 02 liga o Terminal Urbano ao URI Câmpus II e retorna ao terminal. A localização está indicada em roxo no mapa.";
        }

        if (q.includes("uffs")) {
            return "O quadro de horários para a UFFS está disponível no painel Horários. Ele apresenta a programação divulgada pela universidade a partir de 2 de março de 2026.";
        }

        if (q.includes("terminal")) {
            return "O Terminal Urbano Central está marcado em laranja no mapa. Ele é utilizado como referência para os itinerários demonstrativos do projeto.";
        }

        if (
            q.includes("horario") ||
            q.includes("horarios") ||
            q.includes("que horas")
        ) {
            return "Abra o painel Horários para consultar o quadro divulgado pela UFFS. Para as demais linhas urbanas, utilize a consulta oficial da Empresa Gaurama.";
        }

        if (
            q.includes("linha") ||
            q.includes("linhas") ||
            q.includes("rota") ||
            q.includes("itinerario")
        ) {
            return "O mapa possui sete itinerários demonstrativos. As linhas 01 e 02 representam ligações com os câmpus da URI, enquanto as linhas 03 a 07 agrupam bairros por região. Elas não são a numeração oficial da empresa.";
        }

        if (
            q.includes("clima") ||
            q.includes("temperatura") ||
            q.includes("tempo agora")
        ) {
            if (climaAtual) {
                return `Agora em Erechim: ${climaAtual.temperatura} graus Celsius, ${climaAtual.descricao}. Sensação térmica de ${climaAtual.sensacao} graus. Umidade relativa de ${climaAtual.umidade} por cento.`;
            }

            return "Ainda estou carregando os dados meteorológicos atuais de Erechim. Consulte o quadro do clima no cabeçalho.";
        }

        if (
            q.includes("acessibilidade") ||
            q.includes("contraste") ||
            q.includes("fonte") ||
            q.includes("leitura")
        ) {
            return "No painel Acessibilidade você pode ativar alto contraste, ampliar o texto, ouvir um resumo da parada ou interromper a leitura por voz.";
        }

        if (
            q.includes("contato") ||
            q.includes("telefone") ||
            q.includes("gaurama")
        ) {
            return "A Empresa Gaurama atende pelos telefones (54) 3321-3637 e (54) 3522-6106. O WhatsApp informado pela empresa é (54) 99144-7046. A AGER pode ser contatada pelos números (54) 3321-6501 e (54) 3321-6491.";
        }

        if (
            q.includes("samu") ||
            q.includes("emergencia") ||
            q.includes("socorro")
        ) {
            return "O painel Ajuda / SOS apresenta os contatos de emergência e os canais de transporte. Em uma emergência real, procure diretamente o serviço oficial adequado.";
        }

        if (q.includes("mapa")) {
            return "Você pode ampliar e reduzir o mapa, alternar entre 2D e 3D, selecionar uma linha e visualizar seus percursos demonstrativos.";
        }

        if (
            q.includes("bom") ||
            q.includes("obrigado") ||
            q.includes("obrigada")
        ) {
            return "Por nada! Estou disponível para ajudar com as informações da Parada Inteligente.";
        }

        const bairro = bairros.find(b =>
            q.includes(normalize(b.nome))
        );

        if (bairro) {
            const route = grupos.find(r =>
                r.paradas.includes(bairro.nome)
            );

            if (route) {
                return `${bairro.nome} aparece como referência no itinerário demonstrativo da Linha ${route.n} — ${route.nome}. A posição no mapa é aproximada e não indica uma parada oficial.`;
            }

            return `${bairro.nome} está marcado no mapa como referência aproximada de bairro.`;
        }

        return "Não encontrei essa informação na base local. Posso ajudar com linhas demonstrativas, URI, UFFS, terminal, bairros, horários, clima e contatos.";
    }

    function normalize(text) {
        return text
            .toLocaleLowerCase("pt-BR")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function addChat(author, text, cls) {
        const div = document.createElement("div");

        div.className = "chat-mensagem " + cls;
        div.textContent = author + ": " + text;

        $("chat-log").appendChild(div);
        $("chat-log").scrollTop = $("chat-log").scrollHeight;
    }

    function clearChat() {
        $("chat-log").innerHTML = "";

        addChat(
            "Assistente",
            "Conversa reiniciada. Como posso ajudar?",
            "mensagem-assistente"
        );

        speechSynthesis?.cancel();
    }

    // --------------------------------------------------
    // VOZ: RECONHECIMENTO E RESPOSTA FALADA
    // --------------------------------------------------

    function voiceInput() {
        const API =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!API) {
            return toast("Reconhecimento de voz indisponível neste navegador.");
        }

        if (reconhecimento) {
            reconhecimento.stop();
            reconhecimento = null;
            return;
        }

        reconhecimento = new API();
        reconhecimento.lang = "pt-BR";
        reconhecimento.continuous = false;
        reconhecimento.interimResults = false;
        reconhecimento.maxAlternatives = 1;

        reconhecimento.onstart = () => {
            $("status-voz").hidden = false;
            $("chat-mic").textContent = "⏹";
        };

        reconhecimento.onresult = event => {
            const transcript = event.results[0][0].transcript;
            $("chat-input").value = transcript;
            sendChat();
        };

        reconhecimento.onerror = event => {
            console.warn("Reconhecimento de voz:", event.error);
            toast("Não foi possível reconhecer a fala.");
        };

        reconhecimento.onend = () => {
            $("status-voz").hidden = true;
            $("chat-mic").textContent = "🎙️";
            reconhecimento = null;
        };

        try {
            reconhecimento.start();
        } catch (error) {
            console.warn(error);
            toast("Não foi possível iniciar o microfone.");
            reconhecimento = null;
        }
    }

    function speak(text) {
        if (!("speechSynthesis" in window)) {
            return toast("Leitura de voz indisponível.");
        }

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "pt-BR";
        utterance.rate = 1;
        utterance.pitch = 1;

        const voices = speechSynthesis.getVoices();
        const ptVoice = voices.find(v =>
            v.lang.toLowerCase().startsWith("pt")
        );

        if (ptVoice) utterance.voice = ptVoice;

        speechSynthesis.speak(utterance);
    }

    function toggleVoiceAnswer() {
        vozRespostaAtiva = !vozRespostaAtiva;

        $("chat-voz-resposta").textContent =
            vozRespostaAtiva ? "🔊 Voz ativada" : "🔇 Voz desativada";

        $("chat-voz-resposta").setAttribute(
            "aria-pressed",
            String(vozRespostaAtiva)
        );

        if (!vozRespostaAtiva && "speechSynthesis" in window) {
            speechSynthesis.cancel();
        }

        toast(
            vozRespostaAtiva
                ? "Respostas por voz ativadas."
                : "Respostas por voz desativadas."
        );
    }

    // --------------------------------------------------
    // ACESSIBILIDADE POR VOZ
    // --------------------------------------------------

    function readSummary() {
        speak(
            "Parada Inteligente de Erechim. O mapa apresenta o Terminal Urbano, os câmpus da URI e referências de bairros. O painel Linhas mostra sete itinerários demonstrativos. O painel Horários apresenta a programação divulgada pela UFFS. O painel Acessibilidade permite ampliar o texto e ativar alto contraste."
        );
    }

    function stopSpeech() {
        if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
        }

        if (reconhecimento) {
            reconhecimento.stop();
        }

        toast("Áudio interrompido.");
    }

    // --------------------------------------------------
    // RELÓGIO
    // --------------------------------------------------

    function updateClock() {
        const now = new Date();

        $("data-atual").textContent =
            now.toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

        $("hora-atual").textContent =
            now.toLocaleTimeString("pt-BR");
    }

    // --------------------------------------------------
    // CLIMA ATUAL E PREVISÃO
    // --------------------------------------------------

    function weatherDescription(code) {
        const map = {
            0: ["Céu limpo", "☀️"],
            1: ["Predominantemente limpo", "🌤️"],
            2: ["Parcialmente nublado", "⛅"],
            3: ["Nublado", "☁️"],
            45: ["Neblina", "🌫️"],
            48: ["Neblina com geada", "🌫️"],
            51: ["Garoa fraca", "🌦️"],
            53: ["Garoa moderada", "🌦️"],
            55: ["Garoa intensa", "🌧️"],
            61: ["Chuva fraca", "🌧️"],
            63: ["Chuva moderada", "🌧️"],
            65: ["Chuva intensa", "🌧️"],
            71: ["Neve fraca", "🌨️"],
            73: ["Neve moderada", "🌨️"],
            75: ["Neve intensa", "❄️"],
            80: ["Pancadas fracas", "🌦️"],
            81: ["Pancadas moderadas", "🌧️"],
            82: ["Pancadas fortes", "⛈️"],
            95: ["Trovoadas", "⛈️"],
            96: ["Trovoadas com granizo", "⛈️"],
            99: ["Trovoadas fortes", "⛈️"]
        };

        return map[code] || ["Condição variável", "🌡️"];
    }

    async function weather() {
        const url =
            `${CFG.clima}?latitude=-27.6296&longitude=-52.2754` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,wind_speed_10m,wind_direction_10m` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset` +
            `&timezone=America%2FSao_Paulo&forecast_days=7`;

        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) throw new Error("Falha na consulta meteorológica.");

            const data = await response.json();
            const current = data.current;
            const daily = data.daily;

            if (!current || !daily) throw new Error("Dados incompletos.");

            const description = weatherDescription(current.weather_code);

            $("temperatura-atual").textContent =
                `${Math.round(current.temperature_2m)}°C`;

            $("temp-max").textContent =
                `Máx: ${Math.round(daily.temperature_2m_max[0])}°C`;

            $("temp-min").textContent =
                `Mín: ${Math.round(daily.temperature_2m_min[0])}°C`;

            $("icone-clima").textContent = description[1];
            $("detalhe-clima").textContent = description[0];

            climaAtual = {
                temperatura: Math.round(current.temperature_2m),
                sensacao: Math.round(current.apparent_temperature),
                umidade: Math.round(current.relative_humidity_2m),
                descricao: description[0]
            };

            renderWeatherDetails(current, daily);
            atualizarStatus("status-clima", "Atualizado", "status-ok");

        } catch (error) {
            console.warn("Clima:", error);

            $("detalhe-clima").textContent = "Clima indisponível";
            atualizarStatus("status-clima", "Indisponível", "status-alerta");
        }
    }

    function renderWeatherDetails(current, daily) {
    const infoClima = document.querySelector(".informacao-clima");
    if (!infoClima) return;

    // Remove elementos antigos gerados dinamicamente para evitar poluição visual
    document.getElementById("weather-details")?.remove();
    document.getElementById("weather-forecast")?.remove();

    const panel = document.createElement("div");
    panel.id = "weather-details";
    panel.className = "painel-clima-detalhes";
    panel.innerHTML = `
        <div class="clima-extra"><span>Sensação:</span> <strong>${Math.round(current.apparent_temperature)}°C</strong></div>
        <div class="clima-extra"><span>Umidade:</span> <strong>${Math.round(current.relative_humidity_2m)}%</strong></div>
        <div class="clima-extra"><span>Vento:</span> <strong>${Math.round(current.wind_speed_10m)} km/h</strong></div>
        <div class="clima-extra"><span>Chuva:</span> <strong>${Number(current.precipitation).toFixed(1)} mm</strong></div>
    `;
    infoClima.appendChild(panel);
}

    function renderForecast(daily) {
        let forecast = $("weather-forecast");

        if (!forecast) {
            forecast = document.createElement("div");
            forecast.id = "weather-forecast";
            forecast.className = "previsao-clima";

            const info = document.querySelector(".informacao-clima");

            if (info) info.appendChild(forecast);
        }

        forecast.innerHTML = `
            <strong>Próximos dias</strong>
            <div class="previsao-lista">
                ${daily.time.map((day, i) => {
                    const condition = weatherDescription(daily.weather_code[i]);
                    const date = new Date(day + "T12:00:00");

                    return `
                        <div class="previsao-dia">
                            <b>${i === 0 ? "Hoje" : date.toLocaleDateString("pt-BR", { weekday: "short" })}</b>
                            <span>${condition[1]}</span>
                            <small>${Math.round(daily.temperature_2m_min[i])}° / ${Math.round(daily.temperature_2m_max[i])}°</small>
                            <small>Chuva: ${daily.precipitation_probability_max[i] ?? 0}%</small>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function formatTime(value) {
        if (!value) return "--:--";
        return value.slice(11, 16);
    }

    function showWeatherModal() {
        toast("A previsão completa está disponível no cabeçalho e nos dados meteorológicos.");
    }

    // --------------------------------------------------
    // STATUS DO TOTEM
    // --------------------------------------------------

    function atualizarStatus(id, texto, classe) {
        const el = $(id);
        if (!el) return;

        el.textContent = texto;
        el.className = "status-tag " + (classe || "");
    }

    function updateSystemInfo() {
        $("ultima-atualizacao").textContent =
            new Date().toLocaleString("pt-BR");

        $("status-internet").textContent =
            navigator.onLine ? "Conectado" : "Sem conexão";

        const voiceAvailable =
            !!(window.SpeechRecognition || window.webkitSpeechRecognition);

        atualizarStatus(
            "status-voz-totem",
            voiceAvailable ? "Disponível" : "Não disponível",
            voiceAvailable ? "status-ok" : "status-alerta"
        );
    }

    window.addEventListener("online", updateSystemInfo);
    window.addEventListener("offline", updateSystemInfo);

    // --------------------------------------------------
    // EVENTOS DA INTERFACE
    // --------------------------------------------------

    function configureUI() {
        document.querySelectorAll("[data-painel]").forEach(button => {
            button.onclick = () => openPanel(button.dataset.painel);
        });

        document.querySelectorAll(".fechar-painel").forEach(button => {
            button.onclick = closePanels;
        });

        $("btn-zoom-in").onclick = () => map.zoomIn();
        $("btn-zoom-out").onclick = () => map.zoomOut();

        $("locate").onclick = () => {
            map.flyTo({
                center: terminal.c,
                zoom: 15,
                duration: 800
            });
        };

        $("view2d").onclick = () => {
            map.easeTo({ pitch: 0, bearing: 0 });
            viewButton("view2d");
        };

        $("view3d").onclick = () => {
            map.easeTo({ pitch: 50, bearing: -15 });
            viewButton("view3d");
        };

        $("busca-linha").oninput = event => {
            renderRoutes(event.target.value);
        };

        $("btn-iniciar-onibus").onclick = () => {
            running = true;
            toast("Animação iniciada.");
        };

        $("btn-pausar-onibus").onclick = () => {
            running = false;
            toast("Animação pausada.");
        };

        $("btn-reiniciar-onibus").onclick = () => {
            grupos.forEach(r => {
                r.progress = 0;
                r.marker?.setLngLat(r.coords[0] || terminal.c);
            });

            running = true;
            toast("Animações reiniciadas.");
        };

        $("drawRoute").onclick = drawPlanner;
        $("clearRoute").onclick = clearPlanner;
        $("swapRoute").onclick = swapPlanner;

        $("btn-contraste-padrao").onclick = () => setContrast(false);
        $("btn-contraste-alto").onclick = () => setContrast(true);
        $("btn-fonte-normal").onclick = () => setFontSize(false);
        $("btn-fonte-maior").onclick = () => setFontSize(true);

        $("btn-leitura-voz").onclick = readSummary;
        $("btn-parar-voz").onclick = stopSpeech;

        $("chat-enviar").onclick = sendChat;

        $("chat-input").onkeydown = event => {
            if (event.key === "Enter") sendChat();
        };

        $("chat-mic").onclick = voiceInput;
        $("chat-limpar").onclick = clearChat;
        $("chat-voz-resposta").onclick = toggleVoiceAnswer;

        document.querySelectorAll("[data-sugestao]").forEach(button => {
            button.onclick = () => {
                $("chat-input").value = button.dataset.sugestao;
                sendChat();
            };
        });

        $("btn-enviar-comentario").onclick = () => {
            const value = $("comentario-usuario").value.trim();

            if (!value) {
                return toast("Digite sua sugestão ou relato.");
            }

            $("comentario-usuario").value = "";
            toast("Demonstração: relato não enviado a um servidor.");
        };

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closePanels();
        });
    }

    function viewButton(id) {
        ["view2d", "view3d"].forEach(buttonId => {
            $(buttonId).classList.toggle("active", buttonId === id);
        });
    }

    // --------------------------------------------------
    // TOAST E SEGURANÇA
    // --------------------------------------------------

    function toast(message) {
        const el = $("toast");
        if (!el) return;

        el.textContent = message;
        el.classList.add("visivel");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            el.classList.remove("visivel");
        }, 3200);
    }

    function safe(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char]));
    }

    // --------------------------------------------------
    // INICIALIZAÇÃO GERAL
    // --------------------------------------------------

    configureUI();

    updateClock();
    setInterval(updateClock, 1000);

    updateSystemInfo();

    weather();
    setInterval(weather, 15 * 60 * 1000);

    // Recalcula o tamanho do mapa após alterações de tela.
    window.addEventListener("resize", () => {
        if (mapaPronto) map.resize();
    });
}