/* PARADA INTELIGENTE — ERECHIM | 31 pontos aproximados, 7 linhas circulares */
"use strict";

document.addEventListener("DOMContentLoaded", iniciarAplicacao);

function iniciarAplicacao() {

    const CFG = {
        centro: [-52.2754, -27.6296],
        estilo: "https://tiles.openfreemap.org/styles/positron",
        osrm: "https://router.project-osrm.org/route/v1/driving/"
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

    // Coordenadas aproximadas para visualização.
    // Não representam pontos oficiais de parada.

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

    // SETE LINHAS

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
                "Centro",
                "Fátima",
                "Bela Vista",
                "Linho",
                "José Bonifácio",
                "Esperança",
                "Morro da Cegonha"
            ],
            min: 32
        },

        {
            n: "04",
            nome: "Setor Sul",
            desc: "São Caetano, Ipiranga, Dal Molin, Triângulo, Santa Catarina e Espírito Santo",
            cor: "#dc2626",
            paradas: [
                "São Caetano",
                "Ipiranga",
                "Dal Molin",
                "Triângulo",
                "Santa Catarina",
                "Espírito Santo"
            ],
            min: 35
        },

        {
            n: "05",
            nome: "Setor Norte",
            desc: "Parque dos Imigrantes, São Cristóvão, Cerâmica, Vitória I, São José e Presidente Castelo Branco",
            cor: "#059669",
            paradas: [
                "Parque dos Imigrantes",
                "São Cristóvão",
                "Cerâmica",
                "Vitória I",
                "São José",
                "Presidente Castelo Branco"
            ],
            min: 34
        },

        {
            n: "06",
            nome: "Setor Leste",
            desc: "Estevam Carraro, Industrial, Atlântico, Morada do Sol, Parque Lívia e São Vicente de Paulo",
            cor: "#d97706",
            paradas: [
                "Estevam Carraro",
                "Industrial",
                "Atlântico",
                "Morada do Sol",
                "Parque Lívia",
                "São Vicente de Paulo"
            ],
            min: 38
        },

        {
            n: "07",
            nome: "Setor Oeste",
            desc: "Zimmer, Cristal, Vale Dourado, Jabuticabal, Três Vendas e Koller",
            cor: "#0891b2",
            paradas: [
                "Zimmer",
                "Cristal",
                "Vale Dourado",
                "Jabuticabal",
                "Três Vendas",
                "Koller"
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
        ...campi.map(p => ({
            nome: p.nome,
            c: p.c
        })),
        ...bairros
    ];

    let map;
    let selected = grupos[0].id;
    let running = true;
    let last = performance.now();
    let toastTimer;

    if (!window.maplibregl) {
        toast("Biblioteca do mapa não carregou.");
        return;
    }

    map = new maplibregl.Map({
        container: "map",
        style: CFG.estilo,
        center: CFG.centro,
        zoom: 13
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

        addFixedMarkers();
        addNeighborhoodMarkers();
        setupRouteLayers();
        addBusMarkers();

        renderRoutes();
        fillPlanner();
        renderArrivals();

        await loadRoadRoutes();

        highlightRoute();

        requestAnimationFrame(animate);

        toast("Mapa carregado.");
    });

    map.on("error", e => {
        console.warn("MapLibre:", e.error || e);
    });

    // CRIAÇÃO DOS MARCADORES

    function pin(cls, label) {
        const e = document.createElement("div");

        e.className = "map-pin " + cls;
        e.textContent = label;

        return e;
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

    // TERMINAL, URI E PONTOS DE REFERÊNCIA

    function addFixedMarkers() {

        let m = new maplibregl.Marker({
            element: pin("terminal", "T")
        })
            .setLngLat(terminal.c)
            .addTo(map);

        popup(
            m,
            terminal.nome,
            "Início e fim das sete linhas."
        );

        campi.forEach((p, i) => {

            let x = new maplibregl.Marker({
                element: pin("universidade", i ? "II" : "I")
            })
                .setLngLat(p.c)
                .addTo(map);

            popup(
                x,
                p.nome,
                "Destino da linha " + (i + 1) + "."
            );
        });

        [
            ["Praça da Bandeira", [-52.2738, -27.6330]],
            ["Catedral São José", [-52.2730, -27.6318]],
            ["Parque Longines Malinowski", [-52.2780, -27.6250]]
        ].forEach(([n, c]) => {

            let x = new maplibregl.Marker({
                element: pin("referencia", "•")
            })
                .setLngLat(c)
                .addTo(map);

            popup(x, n, "Ponto de referência.");
        });
    }

    // MARCADORES DOS 31 BAIRROS

    function addNeighborhoodMarkers() {

        bairros.forEach((b, i) => {

            let e = pin("parada-bairro", "");

            let m = new maplibregl.Marker({
                element: e
            })
                .setLngLat(b.c)
                .addTo(map);

            popup(
                m,
                b.nome,
                `Ponto aproximado de referência do bairro (${i + 1}/31). Não é uma parada oficial.`
            );
        });
    }

    // CAMADAS DAS ROTAS

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
                    "line-width": 4,
                    "line-opacity": 0.35
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

    // MARCADORES DOS ÔNIBUS

    function addBusMarkers() {

        grupos.forEach(r => {

            let e = document.createElement("div");

            e.className = "bus-animated-marker";
            e.textContent = "🚌";
            e.title = "Ônibus da linha " + r.n;

            r.el = e;

            r.marker = new maplibregl.Marker({
                element: e
            })
                .setLngLat(terminal.c)
                .addTo(map);

            e.addEventListener("click", () => {
                selectRoute(r.id);
            });
        });
    }

    // CARREGAMENTO DAS ROTAS PELO OSRM

    async function loadRoadRoutes() {

        await Promise.all(
            grupos.map(async r => {

                let stops = [
                    terminal.c,

                    ...r.paradas
                        .map(id =>
                            id === "uri1"
                                ? campi[0].c
                                : id === "uri2"
                                    ? campi[1].c
                                    : bairros.find(b => b.nome === id)?.c
                        )
                        .filter(Boolean),

                    terminal.c
                ];

                r.coords = stops;

                try {

                    let path = stops
                        .map(c => c.join(","))
                        .join(";");

                    let res = await fetch(
                        `${CFG.osrm}${path}?overview=full&geometries=geojson&steps=false`
                    );

                    if (!res.ok) {
                        throw Error("OSRM " + res.status);
                    }

                    let data = await res.json();

                    if (data.code !== "Ok") {
                        throw Error("Rota indisponível");
                    }

                    r.coords = data.routes[0].geometry.coordinates;
                    r.km = data.routes[0].distance / 1000;

                } catch (err) {

                    console.warn(
                        "Linha " + r.n + ": usando segmentos aproximados.",
                        err
                    );

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

    // CÁLCULO DA DISTÂNCIA ACUMULADA

    function buildCumulative(r) {

        r.cumulative = [0];

        let sum = 0;

        for (let i = 1; i < r.coords.length; i++) {

            sum += distance(
                r.coords[i - 1],
                r.coords[i]
            );

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

    function distancePath(p) {

        let d = 0;

        for (let i = 1; i < p.length; i++) {
            d += distance(p[i - 1], p[i]);
        }

        return d;
    }

    // POSIÇÃO DO ÔNIBUS NA ROTA

    function pointAt(r, f) {

        let target = f * r.total;
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

        let a = r.cumulative[i - 1];
        let b = r.cumulative[i];

        let t = (target - a) / (b - a || 1);

        let p = r.coords[i - 1];
        let q = r.coords[i];

        return [
            p[0] + (q[0] - p[0]) * t,
            p[1] + (q[1] - p[1]) * t
        ];
    }

    // ANIMAÇÃO CIRCULAR DOS ÔNIBUS

    function animate(now) {

        let dt = Math.min((now - last) / 1000, 0.1);

        last = now;

        if (running) {

            grupos.forEach(r => {

                if (r.coords.length > 1) {

                    r.progress =
                        (r.progress + dt / (r.min * 60)) % 1;

                    r.marker.setLngLat(
                        pointAt(r, r.progress)
                    );
                }
            });
        }

        requestAnimationFrame(animate);
    }

    // LISTA DE LINHAS

    function renderRoutes(filter = "") {

        let root = $("rotas-lista");

        if (!root) return;

        root.innerHTML = "";

        let q = filter.toLocaleLowerCase("pt-BR");

        let rows = grupos.filter(r =>
            (r.n + " " + r.nome + " " + r.desc)
                .toLocaleLowerCase("pt-BR")
                .includes(q)
        );

        rows.forEach(r => {

            let b = document.createElement("button");

            b.className =
                "rota-item" +
                (r.id === selected ? " selecionada" : "");

            b.innerHTML = `
                <span class="rota-cor" style="background:${r.cor}"></span>

                <span class="rota-informacao">
                    <strong>Linha ${r.n} — ${safe(r.nome)}</strong>
                    <span>${safe(r.desc)}</span>
                </span>

                <span class="rota-etiqueta">${r.min} min*</span>
            `;

            b.onclick = () => selectRoute(r.id);

            root.appendChild(b);
        });

        if (!rows.length) {
            root.textContent = "Nenhuma linha encontrada.";
        }
    }

    // SELEÇÃO DE LINHA

    function selectRoute(id) {

        selected = id;

        let r = grupos.find(x => x.id === id);

        renderRoutes(
            $("busca-linha")?.value || ""
        );

        highlightRoute();

        if (r.coords.length) {

            let bounds = new maplibregl.LngLatBounds();

            r.coords.forEach(c => bounds.extend(c));

            map.fitBounds(bounds, {
                padding: {
                    top: 70,
                    bottom: 70,
                    left: 140,
                    right: 140
                },
                maxZoom: 14,
                duration: 700
            });
        }

        $("status-rota").textContent =
            `Linha ${r.n}: ${r.nome}. O percurso retorna ao Terminal Urbano.`;
    }

    function highlightRoute() {

        grupos.forEach(r => {

            let on = r.id === selected;

            if (map.getLayer(r.id + "-line")) {

                map.setPaintProperty(
                    r.id + "-line",
                    "line-width",
                    on ? 7 : 3
                );

                map.setPaintProperty(
                    r.id + "-line",
                    "line-opacity",
                    on ? 1 : 0.25
                );
            }

            r.el?.classList.toggle(
                "bus-selecionado",
                on
            );
        });
    }

    // PLANEJADOR DE VIAGENS

    function fillPlanner() {

        let a = $("origin");
        let b = $("destination");

        locais.forEach((p, i) => {

            a.add(new Option(p.nome, i));
            b.add(new Option(p.nome, i));
        });

        b.selectedIndex = 1;
    }

    async function drawPlanner() {

        let a = locais[Number($("origin").value)];
        let b = locais[Number($("destination").value)];

        if (!a || !b || a === b) {
            return toast("Escolha dois pontos diferentes.");
        }

        try {

            let path = [a.c, b.c]
                .map(c => c.join(","))
                .join(";");

            let res = await fetch(
                `${CFG.osrm}${path}?overview=full&geometries=geojson`
            );

            let d = await res.json();

            if (d.code !== "Ok") {
                throw Error();
            }

            let r = d.routes[0];

            map.getSource("planner-src").setData({
                type: "Feature",
                properties: {},
                geometry: r.geometry
            });

            $("routeInfo").hidden = false;

            $("routeDistance").textContent =
                `Distância: ${(r.distance / 1000).toFixed(1)} km`;

            $("routeDuration").textContent =
                `Tempo estimado de carro: ${Math.round(r.duration / 60)} min`;

            let bounds = new maplibregl.LngLatBounds();

            r.geometry.coordinates.forEach(c => bounds.extend(c));

            map.fitBounds(bounds, {
                padding: 90
            });

        } catch (e) {

            toast("Não foi possível calcular o trajeto agora.");
        }
    }

    // PREVISÃO DE CHEGADAS

    function renderArrivals() {

        $("chegadas-simuladas").innerHTML =
            grupos.map((r, i) => `

                <div class="cartao-chegada-completo">

                    <div class="cartao-chegada-topo">
                        <b>Linha ${r.n} — ${safe(r.nome)}</b>
                        <span class="status-badge">Estimativa</span>
                    </div>

                    <div class="cartao-chegada-detalhes">
                        <span>Terminal Urbano</span>
                        <strong class="tempo-destaque">
                            ${3 + (i * 7 + 4) % 16} min
                        </strong>
                    </div>

                </div>

            `).join("");
    }

    // CONFIGURAÇÃO DOS BOTÕES

    function configureUI() {

        document.querySelectorAll("[data-painel]")
            .forEach(b => {
                b.onclick = () => openPanel(b.dataset.painel);
            });

        document.querySelectorAll(".fechar-painel")
            .forEach(b => {
                b.onclick = closePanels;
            });

        $("btn-zoom-in").onclick = () => map.zoomIn();

        $("btn-zoom-out").onclick = () => map.zoomOut();

        $("locate").onclick = () => {
            map.flyTo({
                center: terminal.c,
                zoom: 15
            });
        };

        $("view2d").onclick = () => {
            map.easeTo({
                pitch: 0,
                bearing: 0
            });

            viewButton("view2d");
        };

        $("view3d").onclick = () => {
            map.easeTo({
                pitch: 50,
                bearing: -15
            });

            viewButton("view3d");
        };

        $("busca-linha").oninput = e => {
            renderRoutes(e.target.value);
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
                r.marker.setLngLat(terminal.c);
            });

            running = true;

            toast("Ônibus retornaram ao terminal.");
        };

        $("drawRoute").onclick = drawPlanner;

        $("clearRoute").onclick = () => {

            map.getSource("planner-src")?.setData({
                type: "FeatureCollection",
                features: []
            });

            $("routeInfo").hidden = true;
        };

        $("btn-contraste-padrao").onclick = () => {

            document.body.classList.remove("alto-contraste");

            toggleGroup(
                ["btn-contraste-padrao", "btn-contraste-alto"],
                "btn-contraste-padrao"
            );
        };

        $("btn-contraste-alto").onclick = () => {

            document.body.classList.add("alto-contraste");

            toggleGroup(
                ["btn-contraste-padrao", "btn-contraste-alto"],
                "btn-contraste-alto"
            );
        };

        $("btn-fonte-normal").onclick = () => {

            document.body.classList.remove("fonte-grande");

            toggleGroup(
                ["btn-fonte-normal", "btn-fonte-maior"],
                "btn-fonte-normal"
            );
        };

        $("btn-fonte-maior").onclick = () => {

            document.body.classList.add("fonte-grande");

            toggleGroup(
                ["btn-fonte-normal", "btn-fonte-maior"],
                "btn-fonte-maior"
            );
        };

        $("btn-leitura-voz").onclick = () => {

            speak(
                "Parada Inteligente de Erechim. São sete linhas demonstrativas, duas para os câmpus da URI e cinco para grupos de bairros."
            );
        };

        $("btn-parar-voz").onclick = () => speechSynthesis.cancel();

        $("chat-enviar").onclick = sendChat;

        $("chat-input").onkeydown = e => {
            if (e.key === "Enter") sendChat();
        };

        $("chat-mic").onclick = voiceInput;

        document.querySelectorAll("[data-sugestao]")
            .forEach(b => {

                b.onclick = () => {
                    $("chat-input").value = b.dataset.sugestao;
                    sendChat();
                };
            });

        document.querySelectorAll("[data-numero]")
            .forEach(b => {

                b.onclick = () => {
                    location.href = "tel:" + b.dataset.numero;
                };
            });

        $("btn-enviar-comentario").onclick = () => {

            if (!$("comentario-usuario").value.trim()) {
                return toast("Digite seu relato.");
            }

            $("comentario-usuario").value = "";

            toast("Relato registrado nesta demonstração.");
        };
    }

    // PAINÉIS

    function openPanel(name) {

        closePanels();

        $("painel-" + name)?.classList.add("aberto");

        document
            .querySelector(`[data-painel="${name}"]`)
            ?.classList.add("selecionado");
    }

    function closePanels() {

        document
            .querySelectorAll(".painel-funcionalidade")
            .forEach(p => p.classList.remove("aberto"));

        document
            .querySelectorAll("[data-painel]")
            .forEach(b => b.classList.remove("selecionado"));
    }

    function viewButton(id) {

        ["view2d", "view3d"].forEach(x => {
            $(x).classList.toggle("active", x === id);
        });
    }

    function toggleGroup(ids, active) {

        ids.forEach(id => {
            $(id).classList.toggle("active", id === active);
        });
    }

    // ASSISTENTE

    function sendChat() {

        let input = $("chat-input");
        let q = input.value.trim();

        if (!q) return;

        addChat("Você", q, "mensagem-usuario");

        input.value = "";

        let low = q.toLocaleLowerCase("pt-BR");

        let answer =
            "Posso informar sobre as sete linhas, os bairros, os câmpus da URI e o Terminal Urbano.";

        if (
            low.includes("campus 1") ||
            low.includes("câmpus i") ||
            low.includes("campus i")
        ) {

            answer =
                "A Linha 01 liga o Terminal Urbano ao URI Câmpus I e retorna ao terminal.";

        } else if (
            low.includes("campus 2") ||
            low.includes("câmpus ii") ||
            low.includes("campus ii")
        ) {

            answer =
                "A Linha 02 liga o Terminal Urbano ao URI Câmpus II e retorna ao terminal.";

        } else if (low.includes("terminal")) {

            answer =
                "O Terminal Urbano Central está marcado em laranja e é o início e fim das sete linhas.";

        } else if (
            low.includes("linha") ||
            low.includes("rota")
        ) {

            answer =
                "Linhas 01 e 02 atendem separadamente os câmpus I e II da URI. Linhas 03 a 07 percorrem grupos de bairros.";

        } else {

            let b = bairros.find(x =>
                low.includes(x.nome.toLocaleLowerCase("pt-BR"))
            );

            if (b) {

                let r = grupos.find(x =>
                    x.paradas.includes(b.nome)
                );

                answer = r
                    ? `${b.nome} está no itinerário demonstrativo da Linha ${r.n}.`
                    : b.nome + " está marcado como referência no mapa.";
            }
        }

        setTimeout(() => {
            addChat(
                "Assistente",
                answer,
                "mensagem-assistente"
            );
        }, 180);
    }

    function addChat(author, text, cls) {

        let d = document.createElement("div");

        d.className = "chat-mensagem " + cls;
        d.textContent = author + ": " + text;

        $("chat-log").appendChild(d);

        $("chat-log").scrollTop =
            $("chat-log").scrollHeight;
    }

    // RECONHECIMENTO DE VOZ

    function voiceInput() {

        let API =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!API) {
            return toast("Reconhecimento de voz indisponível neste navegador.");
        }

        let rec = new API();

        rec.lang = "pt-BR";

        rec.onstart = () => {
            $("status-voz").hidden = false;
        };

        rec.onend = () => {
            $("status-voz").hidden = true;
        };

        rec.onresult = e => {

            $("chat-input").value =
                e.results[0][0].transcript;

            sendChat();
        };

        rec.onerror = () => {
            toast("Não foi possível reconhecer a voz.");
        };

        rec.start();
    }

    function speak(text) {

        if (!window.speechSynthesis) {
            return toast("Leitura de voz indisponível.");
        }

        speechSynthesis.cancel();

        let u = new SpeechSynthesisUtterance(text);

        u.lang = "pt-BR";

        speechSynthesis.speak(u);
    }

    // RELÓGIO

    function updateClock() {

        let d = new Date();

        $("data-atual").textContent =
            d.toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
            });

        $("hora-atual").textContent =
            d.toLocaleTimeString("pt-BR");
    }

    // CLIMA

    async function weather() {

        try {

            let u =
                "https://api.open-meteo.com/v1/forecast?latitude=-27.6296&longitude=-52.2754&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo&forecast_days=1";

            let d = await (await fetch(u)).json();

            $("temperatura-atual").textContent =
                Math.round(d.current.temperature_2m) + "°C";

            $("temp-max").textContent =
                "Máx: " +
                Math.round(d.daily.temperature_2m_max[0]) +
                "°C";

            $("temp-min").textContent =
                "Mín: " +
                Math.round(d.daily.temperature_2m_min[0]) +
                "°C";

            let c = d.current.weather_code;

            $("icone-clima").textContent =
                c === 0
                    ? "☀️"
                    : c >= 51
                        ? "🌧️"
                        : c >= 45
                            ? "🌫️"
                            : "⛅";

            $("detalhe-clima").textContent =
                c === 0
                    ? "Céu limpo"
                    : c >= 51
                        ? "Chuva"
                        : c >= 45
                            ? "Neblina"
                            : "Parcialmente nublado";

        } catch (e) {

            $("detalhe-clima").textContent =
                "Clima indisponível";
        }
    }

    // AVISOS NA TELA

    function toast(t) {

        let el = $("toast");

        if (!el) return;

        el.textContent = t;

        el.classList.add("visivel");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            el.classList.remove("visivel");
        }, 3000);
    }

    // PROTEÇÃO DE TEXTO INSERIDO NO HTML

    function safe(s) {

        return String(s).replace(/[&<>"']/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c]));
    }

    function $(id) {
        return document.getElementById(id);
    }

    // INICIALIZAÇÃO

    configureUI();

    updateClock();

    setInterval(updateClock, 1000);

    weather();

    setInterval(weather, 900000);
}