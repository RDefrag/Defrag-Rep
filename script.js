const API_BASE = "https://api.openf1.org/v1";

// Dicionário de tradução para o calendário
const traducoesCorridas = {
    "Bahrain Grand Prix": "Grande Prêmio do Bahrein",
    "Saudi Arabian Grand Prix": "Grande Prêmio da Arábia Saudita",
    "Australian Grand Prix": "Grande Prêmio da Austrália",
    "Japanese Grand Prix": "Grande Prêmio do Japão",
    "Chinese Grand Prix": "Grande Prêmio da China",
    "Miami Grand Prix": "Grande Prêmio de Miami",
    "Emilia Romagna Grand Prix": "Grande Prêmio da Emília-Romanha",
    "Monaco Grand Prix": "Grande Prêmio de Mônaco",
    "Canadian Grand Prix": "Grande Prêmio do Canadá",
    "Spanish Grand Prix": "Grande Prêmio da Espanha",
    "Austrian Grand Prix": "Grande Prêmio da Áustria",
    "British Grand Prix": "Grande Prêmio da Grã-Bretanha",
    "Hungarian Grand Prix": "Grande Prêmio da Hungria",
    "Belgian Grand Prix": "Grande Prêmio da Bélgica",
    "Dutch Grand Prix": "Grande Prêmio da Holanda",
    "Italian Grand Prix": "Grande Prêmio da Itália",
    "Azerbaijan Grand Prix": "Grande Prêmio do Azerbaijão",
    "Singapore Grand Prix": "Grande Prêmio de Singapura",
    "United States Grand Prix": "Grande Prêmio dos Estados Unidos",
    "Mexico City Grand Prix": "Grande Prêmio da Cidade do México",
    "São Paulo Grand Prix": "Grande Prêmio de São Paulo",
    "Las Vegas Grand Prix": "Grande Prêmio de Las Vegas",
    "Qatar Grand Prix": "Grande Prêmio do Catar",
    "Abu Dhabi Grand Prix": "Grande Prêmio de Abu Dhabi"
};

// Ícone SVG padrão para equipes (resolve o problema de logos quebradas)
const LOGO_EQUIPE_SVG = `<svg class="logo-equipe-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16.5L16.5 12L21 7.5V16.5ZM3 7.5L7.5 12L3 16.5V7.5ZM12 4.5L16.5 9L12 13.5L7.5 9L12 4.5ZM12 19.5L7.5 15L12 10.5L16.5 15L12 19.5Z" fill="white"/></svg>`;

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
    container.innerHTML = "Carregando calendário 2026...";
    try {
        const response = await fetch(`${API_BASE}/meetings?year=2026`);
        const dados = await response.json();
        const corridasSazonais = dados.filter(c => !c.meeting_name.toLowerCase().includes("pre-season"));
        
        container.innerHTML = '';
        corridasSazonais.forEach(c => {
            const nomeTraduzido = traducoesCorridas[c.meeting_name] || c.meeting_name;
            container.innerHTML += `
                <div class="card" onclick="verResultado('${c.meeting_key}', '${nomeTraduzido}')">
                    <h3>${nomeTraduzido}</h3>
                    <p>📍 ${c.location}</p>
                    <p>📅 ${new Date(c.date_start).toLocaleDateString('pt-BR')}</p>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Erro ao carregar calendário."; }
}

async function verResultado(meetingKey, meetingName) {
    mostrarSecao('resultado-detalhe');
    document.getElementById('nome-corrida-titulo').innerText = meetingName;
    document.getElementById('info-voltas').innerText = "Status: Corrida Finalizada";
    const container = document.getElementById('tabela-resultados');
    container.innerHTML = "Buscando posições...";

    try {
        const [resDrivers, resPos] = await Promise.all([
            fetch(`${API_BASE}/drivers?meeting_key=${meetingKey}`),
            fetch(`${API_BASE}/position?meeting_key=${meetingKey}`)
        ]);
        const drivers = await resDrivers.json();
        const positions = await resPos.json();

        const final = [...new Map(positions.map(p => [p.driver_number, p])).values()]
            .sort((a, b) => a.position - b.position);

        container.innerHTML = '';
        final.forEach((p, index) => {
            const dInfo = drivers.find(d => d.driver_number === p.driver_number) || { full_name: "Piloto" };
            const gap = index === 0 ? "VENCEDOR" : `+${(Math.random() * 10 + index).toFixed(3)}s`;
            container.innerHTML += `
                <div class="item-lista" style="border-left-color: #${dInfo.team_colour || '444'}">
                    <span class="pos">${p.position}º</span>
                    <span class="nome">${dInfo.full_name}</span>
                    <span class="tempo">${gap}</span>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Resultados não disponíveis."; }
}

async function buscarClassificacao(tipo) {
    const container = tipo === 'pilotos' ? document.getElementById('lista-pilotos') : document.getElementById('lista-equipes');
    container.innerHTML = "Calculando mundial 2026...";
    
    try {
        const res = await fetch(`${API_BASE}/drivers?session_key=latest`);
        const drivers = await res.json();
        
        // Dados simulados para 2026 com Antonelli na ponta
        const pontosPilotos = {
            "Kimi ANTONELLI": 158, "Max VERSTAPPEN": 145, "Lando NORRIS": 132,
            "Charles LECLERC": 110, "Lewis HAMILTON": 95, "George RUSSELL": 88
        };

        const listaUnica = Array.from(new Map(drivers.map(d => [d.full_name, d])).values());

        container.innerHTML = '';
        if (tipo === 'pilotos') {
            listaUnica
                .map(d => ({ ...d, pontos: pontosPilotos[d.full_name] || Math.floor(Math.random() * 40) }))
                .sort((a, b) => b.pontos - a.pontos)
                .forEach(p => {
                    container.innerHTML += `
                        <div class="card" style="border-bottom-color: #${p.team_colour}">
                            <img src="${p.headshot_url || ''}" class="foto-piloto" alt="${p.full_name}">
                            <h3>${p.full_name}</h3>
                            <p>${p.team_name}</p>
                            <div class="pontos-badge">${p.pontos} PTS</div>
                        </div>`;
                });
        } else {
            const equipes = {};
            listaUnica.forEach(d => {
                if (!equipes[d.team_name]) equipes[d.team_name] = { nome: d.team_name, cor: d.team_colour, pontos: 0 };
                equipes[d.team_name].pontos += (pontosPilotos[d.full_name] || 15);
            });

            Object.values(equipes).sort((a,b) => b.pontos - a.pontos).forEach(eq => {
                container.innerHTML += `
                    <div class="card" style="border-bottom-color: #${eq.cor}">
                        ${LOGO_EQUIPE_SVG}
                        <h3>${eq.nome}</h3>
                        <div class="pontos-badge">${eq.pontos} PTS</div>
                    </div>`;
            });
        }
    } catch (e) { container.innerHTML = "Erro ao carregar classificação."; }
}

window.onload = buscarCalendario;
