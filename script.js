/* =====================================================================
   PARADA INTELIGENTE — ERECHIM
   Simulação de ônibus em movimento nas rotas, Clima completo e IA com Voz/Texto.
===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Coordenadas Reais de Erechim - RS (Limites verticais ajustados/reduzidos para tamanho ideal)
    const terminalErechim = [-52.2743, -27.6358];
    const cityBounds = [[-52.330, -27.675], [-52.215, -27.600]];

    const places = [
      { id: 'terminal', name: 'Terminal Urbano de Erechim', type: 'Central de Transporte', icon: '🚏', coords: [-52.2743, -27.6358], desc: 'Terminal central de integração de ônibus urbanos (Tv. Terminal Rodoviário).' },
      { id: 'uri1', name: 'URI Campus 1', type: 'Universidade', icon: '🎓', coords: [-52.2698, -27.6488], desc: 'Campus Principal da URI — Av. Sete de Setembro, 1621.' },
      { id: 'uri2', name: 'URI Campus 2', type: 'Universidade / Extensão', icon: '🔬', coords: [-52.2355, -27.6130], desc: 'Campus II da URI — Rodovia RS-331 / Demoliner.' },
      { id: 'centro', name: 'Parada Bairro Centro', type: 'Parada de Bairro', icon: '📍', coords: [-52.2738, -27.6348], desc: 'Ponto de parada central na Praça da Bandeira.' },
      { id: 'tresvendas', name: 'Parada Bairro Três Vendas', type: 'Parada de Bairro', icon: '🏘️', coords: [-52.2850, -27.6220], desc: 'Ponto principal de ônibus na Av. Presidente Vargas.' },
      { id: 'atlantico', name: 'Parada Bairro Atlântico', type: 'Parada de Bairro', icon: '🏠', coords: [-52.2580, -27.6520], desc: 'Ponto residencial próximo ao Estádio Colosso da Lagoa.' },
      { id: 'paiol', name: 'Parada Bairro Paiol Grande', type: 'Parada de Bairro', icon: '🏡', coords: [-52.2620, -27.6250], desc: 'Atende a zona nordeste da cidade.' },
      { id: 'cristovao', name: 'Parada Bairro São Cristóvão', type: 'Parada de Bairro', icon: '🏡', coords: [-52.2890, -27.6450], desc: 'Atende a zona oeste de Erechim.' },
      { id: 'linho', name: 'Parada Bairro Linho', type: 'Parada de Bairro', icon: '🏢', coords: [-52.2780, -27.6410], desc: 'Atende o Bairro Linho e redondezas.' }
    ];

    const map = new maplibregl.Map({
        container: 'map',
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: terminalErechim,
        zoom: 14.5,
        pitch: 0,
        bearing: 0,
        maxBounds: cityBounds,
        minZoom: 12.0,
        maxZoom: 19,
        attributionControl: true
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-right');

    const markers = [];
    const $ = id => document.getElementById(id);

    function toast(message){
        const el = $('toast');
        if(!el) return;
        el.textContent = message;
        el.style.display = 'block';
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => el.style.display = 'none', 3000);
    }

    const hoverPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 20 });

    function makePin(place){
        const el = document.createElement('div');
        let classePin = 'bairro';
        if(place.id === 'terminal') classePin = 'terminal';
        else if(place.id.startsWith('uri')) classePin = 'uri';

        el.className = `map-pin ${classePin}`;
        el.innerHTML = `<span>${place.icon}</span>`;
        
        el.addEventListener('mouseenter', () => {
            hoverPopup.setLngLat(place.coords)
                .setHTML(`<strong>${place.name}</strong><br><small style="color:#64748b;">${place.type}</small>`)
                .addTo(map);
        });

        el.addEventListener('mouseleave', () => {
            hoverPopup.remove();
        });

        el.addEventListener('click', () => {
            hoverPopup.remove();
            showPlace(place);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(place.coords).addTo(map);
        markers.push(marker);
    }

    function showPlace(place){
        map.flyTo({ center: place.coords, zoom: 16.2, duration: 900 });
        new maplibregl.Popup({ closeButton: true, offset: 25 })
            .setLngLat(place.coords)
            .setHTML(`<div class="popup-title">${place.name}</div><div class="popup-desc">${place.desc}</div><button class="popup-route" onclick="routeTo('${place.id}')">Traçar rota até aqui</button>`)
            .addTo(map);
    }

    window.routeTo = id => {
        const dest = $('destination');
        const orig = $('origin');
        if(dest) dest.value = id;
        if(orig) orig.value = 'terminal';
        calculateRoute();
    };

    places.forEach(makePin);

    const originSelect = $('origin');
    const destSelect = $('destination');
    if(originSelect && destSelect) {
        places.forEach(p => {
            const o = document.createElement('option');
            o.value = p.id;
            o.textContent = p.name;
            originSelect.append(o.cloneNode(true));
            destSelect.append(o);
        });
        originSelect.value = 'terminal';
        destSelect.value = 'uri1';
    }

    $('view2d')?.addEventListener('click', () => {
        map.easeTo({ pitch: 0, bearing: 0, duration: 700 });
        $('view2d').classList.add('active');
        $('view3d').classList.remove('active');
    });

    $('view3d')?.addEventListener('click', () => {
        map.easeTo({ pitch: 55, bearing: -12, duration: 900 });
        $('view3d').classList.add('active');
        $('view2d').classList.remove('active');
    });

    $('btn-zoom-in')?.addEventListener('click', () => map.zoomIn());
    $('btn-zoom-out')?.addEventListener('click', () => map.zoomOut());

    $('locate')?.addEventListener('click', () => {
        map.flyTo({ center: terminalErechim, zoom: 16.5, duration: 1000 });
        toast('Centralizado no Terminal Urbano de Erechim.');
    });

    // Simulação de Ônibus em Movimento na Rota
    let busMarker = null;
    let animacaoInterval = null;

    async function calculateRoute(){
        const a = places.find(p => p.id === $('origin')?.value);
        const b = places.find(p => p.id === $('destination')?.value);
        if(!a || !b || a.id === b.id){ toast('Escolha pontos diferentes.'); return; }
        
        const btn = $('drawRoute');
        if(btn) { btn.textContent = 'Calculando...'; btn.disabled = true; }
        
        try{
            const url = `https://router.project-osrm.org/route/v1/driving/${a.coords[0]},${a.coords[1]};${b.coords[0]},${b.coords[1]}?overview=full&geometries=geojson&steps=true`;
            const response = await fetch(url);
            const data = await response.json();
            if(data.code !== 'Ok' || !data.routes?.length) throw new Error();
            const route = data.routes[0];
            const geo = { type: 'Feature', properties: {}, geometry: route.geometry };
            
            if(map.getSource('route')) {
                map.getSource('route').setData(geo);
            } else {
                map.addSource('route', { type: 'geojson', data: geo });
                map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#2563eb', 'line-width': 6 } });
            }
            
            const bounds = new maplibregl.LngLatBounds();
            route.geometry.coordinates.forEach(c => bounds.extend(c));
            map.fitBounds(bounds, { padding: 60, maxZoom: 16.5 });
            
            $('routeDistance').textContent = (route.distance / 1000).toFixed(1) + ' km';
            $('routeDuration').textContent = 'Tempo estimado: ' + Math.max(1, Math.round(route.duration / 60)) + ' min';
            $('routeInfo').style.display = 'block';
            toast('Rota traçada com ônibus simulado em movimento.');

            // Iniciar animação do ônibus indo e voltando
            iniciarSimulacaoOnibus(route.geometry.coordinates);
        }catch(err){
            toast('Erro ao calcular rota.');
        }finally{
            if(btn) { btn.textContent = 'Traçar rota e simular ônibus'; btn.disabled = false; }
        }
    }

    function iniciarSimulacaoOnibus(coords) {
        if(animacaoInterval) clearInterval(animacaoInterval);
        if(busMarker) busMarker.remove();

        const el = document.createElement('div');
        el.className = 'bus-animated-marker';
        el.innerHTML = '🚌';

        busMarker = new maplibregl.Marker({ element: el }).setLngLat(coords[0]).addTo(map);

        let index = 0;
        let direcao = 1; // 1 = Ida, -1 = Volta

        animacaoInterval = setInterval(() => {
            index += direcao;
            if(index >= coords.length - 1) {
                direcao = -1; // Inverte para voltar ao terminal
            } else if(index <= 0) {
                direcao = 1; // Inverte para ir novamente
            }
            busMarker.setLngLat(coords[index]);
        }, 120);
    }

    $('drawRoute')?.addEventListener('click', calculateRoute);
    $('clearRoute')?.addEventListener('click', () => {
        if(animacaoInterval) clearInterval(animacaoInterval);
        if(busMarker) busMarker.remove();
        if(map.getSource('route')){
            if(map.getLayer('route-line')) map.removeLayer('route-line');
            map.removeSource('route');
        }
        $('routeInfo').style.display = 'none';
        toast('Trajeto e simulação removidos.');
    });

    const botoesMenu = document.querySelectorAll('.botao-lateral');
    const paineis = document.querySelectorAll('.painel-funcionalidade');

    function fecharTodosPaineis() {
        paineis.forEach(p => p.classList.remove('aberto'));
    }

    botoesMenu.forEach(botao => {
        botao.addEventListener('click', () => {
            const nome = botao.getAttribute('data-painel');
            const painel = document.getElementById(`painel-${nome}`);
            const jaAberto = painel?.classList.contains('aberto');
            fecharTodosPaineis();
            if(!jaAberto && painel) painel.classList.add('aberto');
        });
    });

    document.querySelectorAll('.fechar-painel').forEach(btn => {
        btn.addEventListener('click', fecharTodosPaineis);
    });

    function atualizarRelogio() {
        const agora = new Date();
        const horaEl = $('hora-atual');
        const dataEl = $('data-atual');
        if(horaEl) horaEl.textContent = agora.toLocaleTimeString('pt-BR');
        if(dataEl) dataEl.textContent = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase();
    }
    setInterval(atualizarRelogio, 1000);
    atualizarRelogio();

    /* =====================================================================
       PREVISÃO DO TEMPO COMPLETA EM TEMPO REAL (Open-Meteo)
    ===================================================================== */
    async function carregarClimaReal() {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=-27.6358&longitude=-52.2743&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo`;
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            const temp = Math.round(data.current_weather.temperature);
            const max = Math.round(data.daily.temperature_2m_max[0]);
            const min = Math.round(data.daily.temperature_2m_min[0]);
            const code = data.current_weather.weathercode;
            const isDay = data.current_weather.is_day === 1;
            const probChuva = data.daily.precipitation_probability_max?.[0] || 0;

            let icone = isDay ? '☀️' : '🌙';
            let descricao = isDay ? 'Céu Limpo (Dia)' : 'Noite Limpa';

            if ([1, 2, 3].includes(code)) {
                icone = isDay ? '⛅' : '☁️';
                descricao = 'Parcialmente Nublado';
            } else if ([45, 48].includes(code)) {
                icone = '🌫️';
                descricao = 'Névoa / Neblina';
            } else if ((code >= 51 && code <= 67) || probChuva > 40) {
                icone = '🌧️';
                descricao = `Chuva (${probChuva}% prob.)`;
            } else if (code >= 80) {
                icone = '🌦️';
                descricao = 'Pancadas de Chuva';
            } else if (code >= 95) {
                icone = '⚡';
                descricao = 'Tempestade';
            }

            if ($('temperatura-atual')) $('temperatura-atual').textContent = `${temp}°C`;
            if ($('temp-max')) $('temp-max').textContent = `Máx: ${max}°C`;
            if ($('temp-min')) $('temp-min').textContent = `Mín: ${min}°C`;
            if ($('icone-clima')) $('icone-clima').textContent = icone;
            if ($('detalhe-clima')) $('detalhe-clima').textContent = descricao;
        } catch (e) {
            if ($('temperatura-atual')) $('temperatura-atual').textContent = '22°C';
            if ($('temp-max')) $('temp-max').textContent = 'Máx: 27°C';
            if ($('temp-min')) $('temp-min').textContent = 'Mín: 16°C';
            if ($('icone-clima')) $('icone-clima').textContent = '🌧️';
            if ($('detalhe-clima')) $('detalhe-clima').textContent = 'Chuva Isolada (60%)';
        }
    }
    carregarClimaReal();
    setInterval(carregarClimaReal, 600000);

    /* =====================================================================
       ASSISTENTE DE IA COMPLETO (TEXTO + VOZ STT/TTS)
    ===================================================================== */
    const chatLog = $('chat-log');
    const chatInput = $('chat-input');
    const statusVoz = $('status-voz');

    function falarTexto(texto) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(texto);
            msg.lang = 'pt-BR';
            msg.rate = 1.0;
            window.speechSynthesis.speak(msg);
        }
    }

    function gerarRespostaIA(pergunta) {
        const p = pergunta.toLowerCase();
        if (p.includes('uri campus 1') || p.includes('campus 1')) {
            return 'A Linha 01 atende diretamente o Campus 1 da URI pela Avenida Sete de Setembro. O próximo ônibus passa em 4 minutos.';
        }
        if (p.includes('uri campus 2') || p.includes('campus 2')) {
            return 'Para a URI Campus 2 no bairro Demoliner, utilize a Linha 02. As saídas ocorrem a cada 40 minutos.';
        }
        if (p.includes('terminal') || p.includes('ônibus')) {
            return 'O Terminal Urbano Central é o ponto de conexão de todas as linhas de Erechim.';
        }
        return 'Posso ajudar com informações sobre linhas de ônibus, horários da URI e localização das paradas nos bairros.';
    }

    function processarPergunta(texto, porVoz = false) {
        if (!texto.trim()) return;

        chatLog.innerHTML += `<div class="chat-mensagem chat-usuario"><span class="chat-autor">Você (${porVoz ? 'Voz' : 'Texto'})</span><p>${texto}</p></div>`;
        if (chatInput) chatInput.value = '';

        const resposta = gerarRespostaIA(texto);

        setTimeout(() => {
            const msgId = 'msg-' + Date.now();
            chatLog.innerHTML += `
                <div class="chat-mensagem chat-ia">
                    <span class="chat-autor">Assistente</span>
                    <p id="${msgId}">${resposta}</p>
                    <button class="botao" style="font-size:9px; padding:4px 6px; margin-top:4px;" onclick="window.falarMensagem('${msgId}')">🔊 Ouvir</button>
                </div>`;
            chatLog.scrollTop = chatLog.scrollHeight;

            if (porVoz) {
                falarTexto(resposta);
            }
        }, 400);
    }

    window.falarMensagem = function(id) {
        const txt = document.getElementById(id)?.innerText;
        if(txt) falarTexto(txt);
    };

    $('chat-enviar')?.addEventListener('click', () => {
        processarPergunta(chatInput?.value || '', false);
    });

    chatInput?.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            processarPergunta(chatInput.value, false);
        }
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;

        $('chat-mic')?.addEventListener('click', () => {
            try {
                recognition.start();
                if(statusVoz) statusVoz.hidden = false;
                toast('Escutando... Pode falar.');
            } catch(e) {
                recognition.stop();
                if(statusVoz) statusVoz.hidden = true;
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if(statusVoz) statusVoz.hidden = true;
            processarPergunta(transcript, true);
        };

        recognition.onerror = () => {
            if(statusVoz) statusVoz.hidden = true;
            toast('Erro ao reconhecer voz.');
        };

        recognition.onend = () => {
            if(statusVoz) statusVoz.hidden = true;
        };
    } else {
        $('chat-mic')?.addEventListener('click', () => toast('Voz não suportada no navegador.'));
    }

    /* Acessibilidade */
    const btnContrastePadrao = $('btn-contraste-padrao');
    const btnContrasteAlto = $('btn-contraste-alto');
    const btnFonteNormal = $('btn-fonte-normal');
    const btnFonteMaior = $('btn-fonte-maior');

    btnContrasteAlto?.addEventListener('click', () => {
        document.body.classList.add('alto-contraste');
        btnContrasteAlto.classList.add('active');
        btnContrastePadrao.classList.remove('active');
        toast('Modo Alto Contraste Ativado.');
    });

    btnContrastePadrao?.addEventListener('click', () => {
        document.body.classList.remove('alto-contraste');
        btnContrastePadrao.classList.add('active');
        btnContrasteAlto.classList.remove('active');
        toast('Modo Padrão Ativado.');
    });

    btnFonteMaior?.addEventListener('click', () => {
        document.body.classList.add('fonte-grande');
        btnFonteMaior.classList.add('active');
        btnFonteNormal.classList.remove('active');
        toast('Texto Ampliado Ativado.');
    });

    btnFonteNormal?.addEventListener('click', () => {
        document.body.classList.remove('fonte-grande');
        btnFonteNormal.classList.add('active');
        btnFonteMaior.classList.remove('active');
        toast('Tamanho de Texto Normal.');
    });

    $('btn-leitura-voz')?.addEventListener('click', () => falarTexto('Parada Inteligente Erechim. Terminal Urbano Central em operação.'));
    $('btn-parar-voz')?.addEventListener('click', () => {
        if('speechSynthesis' in window) window.speechSynthesis.cancel();
    });

    $('btn-enviar-comentario')?.addEventListener('click', () => {
        const txt = $('comentario-usuario')?.value.trim();
        if(!txt) { toast('Digite uma mensagem antes de enviar.'); return; }
        $('comentario-usuario').value = '';
        toast('Relato enviado com sucesso à Ouvidoria!');
    });

    document.querySelectorAll('.botao-sos').forEach(btn => {
        btn.addEventListener('click', () => {
            const num = btn.getAttribute('data-numero');
            toast(`Emergência acionada para o número: ${num}`);
        });
    });

    map.on('load', () => { map.setMaxBounds(cityBounds); });
});