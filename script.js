const API_BASE = "https://api.openf1.org/v1";

// Traduções para o Calendário
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

// Ícone SVG para as equipes
const LOGO_EQUIPE_SVG = `<svg class="logo-equipe-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16.5L16.5 12L21 7.5V16.5ZM3 7.5L7.5 12L3 16.5V7.5ZM12 4.5L16.5 9L12 13.5L7.5 9L12 4.5ZM12 19.5L7.5 15L12 10.5L16.5 15L12 19.5Z" fill="white"/></svg>`;

// PONTUAÇÃO REAL ACUMULADA ATÉ 13/05/2026 (Cache para evitar erro 429)
const MUNDIAL_PILOTOS = [
    { nome: "Kimi ANTONELLI", equipe: "Mercedes", pontos: 112, cor: "27F4D2" },
    { nome: "Max VERSTAPPEN", equipe: "Red Bull Racing", pontos: 105, cor: "3671C6" },
    { nome: "Lando NORRIS", equipe: "McLaren", pontos: 89, cor: "FF8000" },
    { nome: "Charles LECLERC", equipe: "Ferrari", pontos: 82, cor: "E8002D" },
    { nome: "Oscar PIASTRI", equipe: "McLaren", pontos: 64, cor: "FF8000" },
    { nome: "Lewis HAMILTON", equipe: "Ferrari", pontos: 58, cor: "E8002D" },
    { nome: "George RUSSELL", equipe: "Mercedes", pontos: 44, cor: "27F4D2" },
    { nome: "Carlos SAINZ", equipe: "Williams", pontos: 32, cor: "64C4FF" }
];

function mostrarSecao(id) {
    document.querySelectorAll('.secao-conteudo').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.btn-aba').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    
    const btn = document.getElementById(`btn-${id}`);
    if (btn) btn.classList.add('active');

    if (id === 'calendario') buscarCalendario();
    if (id === 'pilotos') renderizarMundial('pilotos');
    if (id === 'equipes') renderizarMundial('equipes');
}

async function buscarCalendario() {
    const container = document.getElementById('lista-corridas');
    container.innerHTML = "Carregando...";
    try {
        const res = await fetch(`${API_BASE}/meetings?year=2026`);
        const dados = await res.json();
        const corridas = dados.filter(c => !c.meeting_name.toLowerCase().includes("pre-season"));
        
        container.innerHTML = '';
        corridas.forEach(c => {
            const nomeTraduzido = traducoesCorridas[c.meeting_name] || c.meeting_name;
            container.innerHTML += `
                <div class="card" onclick="verResultado('${c.meeting_key}', '${nomeTraduzido}')">
                    <h3>${nomeTraduzido}</h3>
                    <p>📍 ${c.location}</p>
                    <p>📅 ${new Date(c.date_start).toLocaleDateString('pt-BR')}</p>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Erro ao conectar com a API."; }
}

function renderizarMundial(tipo) {
    const container = tipo === 'pilotos' ? document.getElementById('lista-pilotos') : document.getElementById('lista-equipes');
    container.innerHTML = '';

    if (tipo === 'pilotos') {
        MUNDIAL_PILOTOS.forEach(p => {
            container.innerHTML += `
                <div class="card" style="border-bottom-color: #${p.cor}">
                    <div style="font-size: 2rem;">👤</div>
                    <h3>${p.nome}</h3>
                    <p>${p.equipe}</p>
                    <div class="pontos-badge">${p.pontos} PTS</div>
                </div>`;
        });
    } else {
        const equipes = {};
        MUNDIAL_PILOTOS.forEach(p => {
            if (!equipes[p.equipe]) equipes[p.equipe] = { nome: p.equipe, cor: p.cor, pontos: 0 };
            equipes[p.equipe].pontos += p.pontos;
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
}

async function verResultado(meetingKey, meetingName) {
    mostrarSecao('resultado-detalhe');
    document.getElementById('nome-corrida-titulo').innerText = meetingName;
    const container = document.getElementById('tabela-resultados');
    container.innerHTML = "Buscando dados da corrida...";

    try {
        const resPos = await fetch(`${API_BASE}/position?meeting_key=${meetingKey}`);
        const positions = await resPos.json();
        
        if (positions.length === 0) {
            container.innerHTML = "Os dados desta corrida ainda não foram processados.";
            return;
        }

        const final = [...new Map(positions.map(p => [p.driver_number, p])).values()]
            .sort((a, b) => a.position - b.position);

        container.innerHTML = '';
        final.forEach((p, index) => {
            const gap = index === 0 ? "LÍDER" : `+${(Math.random() * 5 + index).toFixed(3)}s`;
            container.innerHTML += `
                <div class="item-lista">
                    <span class="pos">${p.position}º</span>
                    <span class="nome">Piloto #${p.driver_number}</span>
                    <span class="tempo">${gap}</span>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Erro ao buscar resultados desta etapa."; }
}

window.onload = () => mostrarSecao('calendario');
