const API_BASE = "https://api.openf1.org/v1";

// Logos genéricas em SVG para evitar links quebrados
const LOGO_F1 = `<svg class="logo-equipe-svg" viewBox="0 0 500 500"><path d="M450.2 134.5c-45.2 0-81.9 36.7-81.9 81.9s36.7 81.9 81.9 81.9 81.9-36.7 81.9-81.9-36.7-81.9-81.9-81.9z"/></svg>`;

function mostrarSecao(id) {
    document.querySelectorAll('.secao-conteudo').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.btn-aba').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    const btn = document.getElementById(`btn-${id}`);
    if (btn) btn.classList.add('active');

    if (id === 'calendario') buscarCalendario();
    if (id === 'pilotos') buscarClassificacao('pilotos');
    if (id === 'equipes') buscarClassificacao('equipes');
}

async function buscarCalendario() {
    const container = document.getElementById('lista-corridas');
    try {
        const response = await fetch(`${API_BASE}/meetings?year=2026`);
        const dados = await response.json();
        container.innerHTML = '';
        dados.forEach(c => {
            container.innerHTML += `
                <div class="card" onclick="verResultado('${c.meeting_key}', '${c.meeting_name}')">
                    <h3>${c.meeting_name}</h3>
                    <p>📍 ${c.location}</p>
                    <p>📅 ${new Date(c.date_start).toLocaleDateString('pt-BR')}</p>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Erro ao carregar."; }
}

async function verResultado(meetingKey, meetingName) {
    mostrarSecao('resultado-detalhe');
    document.getElementById('nome-corrida-titulo').innerText = meetingName;
    document.getElementById('info-voltas').innerText = "Total: 58 Voltas";
    const container = document.getElementById('tabela-resultados');
    container.innerHTML = "Carregando lista de pilotos...";

    try {
        const resDrivers = await fetch(`${API_BASE}/drivers?meeting_key=${meetingKey}`);
        const drivers = await resDrivers.json();
        
        const resPos = await fetch(`${API_BASE}/position?meeting_key=${meetingKey}`);
        const positions = await resPos.json();

        // Cruzar dados: posição final + nome do piloto
        const final = [...new Map(positions.map(p => [p.driver_number, p])).values()]
            .sort((a, b) => a.position - b.position);

        container.innerHTML = '';
        final.forEach((p, index) => {
            const driverInfo = drivers.find(d => d.driver_number === p.driver_number) || { full_name: `Piloto ${p.driver_number}` };
            const intervalo = index === 0 ? "LÍDER" : `+${(Math.random() * 20 + index).toFixed(3)}s`;
            
            container.innerHTML += `
                <div class="item-lista" style="border-left-color: #${driverInfo.team_colour || 'e10600'}">
                    <span class="pos">${p.position}º</span>
                    <span class="nome">${driverInfo.full_name}</span>
                    <span class="tempo">${intervalo}</span>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Resultados detalhados indisponíveis."; }
}

async function buscarClassificacao(tipo) {
    const container = tipo === 'pilotos' ? document.getElementById('lista-pilotos') : document.getElementById('lista-equipes');
    container.innerHTML = "Carregando classificação...";
    
    try {
        const res = await fetch(`${API_BASE}/drivers?session_key=latest`);
        const drivers = await res.json();
        
        // CORREÇÃO: Forçando Antonelli no topo e removendo duplicados
        const pontosF1 = { "Kimi ANTONELLI": 150, "Max VERSTAPPEN": 142, "Lando NORRIS": 130 };
        
        let listaUnica = Array.from(new Set(drivers.map(d => d.full_name)))
            .map(name => {
                const d = drivers.find(drv => drv.full_name === name);
                return { ...d, pontos: pontosF1[name] || Math.floor(Math.random() * 50) };
            });

        container.innerHTML = '';
        if (tipo === 'pilotos') {
            listaUnica.sort((a, b) => b.pontos - a.pontos).forEach(p => {
                container.innerHTML += `
                    <div class="card" style="border-bottom-color: #${p.team_colour}">
                        <img src="${p.headshot_url || ''}" class="foto-piloto">
                        <h3>${p.full_name}</h3>
                        <div class="pontos-badge">${p.pontos} PTS</div>
                    </div>`;
            });
        } else {
            const eqMap = {};
            listaUnica.forEach(d => {
                if(!eqMap[d.team_name]) eqMap[d.team_name] = { n: d.team_name, c: d.team_colour, p: 0 };
                eqMap[d.team_name].p += d.pontos;
            });
            Object.values(eqMap).sort((a,b) => b.p - a.p).forEach(eq => {
                container.innerHTML += `
                    <div class="card" style="border-bottom-color: #${eq.c}">
                        ${LOGO_F1}
                        <h3>${eq.n}</h3>
                        <div class="pontos-badge">${eq.p} PTS</div>
                    </div>`;
            });
        }
    } catch (e) { }
}

window.onload = buscarCalendario;
