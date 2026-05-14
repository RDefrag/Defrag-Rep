const API_BASE = "https://api.openf1.org/v1";

// 1. TRADUÇÃO DO CALENDÁRIO
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

// 2. DADOS OFICIAIS (Baseados em image_1c495f.png e image_1c4921.png)
const MUNDIAL_PILOTOS = [
    { nome: "A. Antonelli", equipe: "Mercedes", pontos: 100, cor: "27F4D2" },
    { nome: "G. Russell", equipe: "Mercedes", pontos: 80, cor: "27F4D2" },
    { nome: "C. Leclerc", equipe: "Ferrari", pontos: 59, cor: "E10600" },
    { nome: "L. Norris", equipe: "McLaren", pontos: 51, cor: "FF8000" },
    { nome: "L. Hamilton", equipe: "Ferrari", pontos: 51, cor: "E10600" },
    { nome: "O. Piastri", equipe: "McLaren", pontos: 43, cor: "FF8000" },
    { nome: "M. Verstappen", equipe: "Red Bull", pontos: 26, cor: "3671C6" },
    { nome: "O. Bearman", equipe: "Haas", pontos: 17, cor: "B6BABD" },
    { nome: "P. Gasly", equipe: "Alpine", pontos: 16, cor: "0093CC" },
    { nome: "L. Lawson", equipe: "Racing Bulls", pontos: 10, cor: "6692FF" },
    { nome: "F. Colapinto", equipe: "Alpine", pontos: 7, cor: "0093CC" },
    { nome: "A. Lindblad", equipe: "Racing Bulls", pontos: 4, cor: "6692FF" },
    { nome: "I. Hadjar", equipe: "Red Bull", pontos: 4, cor: "3671C6" },
    { nome: "C. Sainz Jr.", equipe: "Williams", pontos: 4, cor: "64C4FF" },
    { nome: "G. Bortoleto", equipe: "Audi F1 Team", pontos: 2, cor: "000000" },
    { nome: "E. Ocon", equipe: "Haas", pontos: 1, cor: "B6BABD" },
    { nome: "A. Albon", equipe: "Williams", pontos: 1, cor: "64C4FF" },
    { nome: "N. Hulkenberg", equipe: "Audi F1 Team", pontos: 0, cor: "000000" },
    { nome: "V. Bottas", equipe: "Cadillac", pontos: 0, cor: "FBBD08" },
    { nome: "S. Perez", equipe: "Cadillac", pontos: 0, cor: "FBBD08" },
    { nome: "F. Alonso", equipe: "Aston Martin", pontos: 0, cor: "229971" },
    { nome: "L. Stroll", equipe: "Aston Martin", pontos: 0, cor: "229971" }
];

// 3. LOGO SVG GENÉRICO PARA EQUIPES
const LOGO_EQUIPE_SVG = `<svg class="logo-equipe-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16.5L16.5 12L21 7.5V16.5ZM3 7.5L7.5 12L3 16.5V7.5ZM12 4.5L16.5 9L12 13.5L7.5 9L12 4.5ZM12 19.5L7.5 15L12 10.5L16.5 15L12 19.5Z" fill="white"/></svg>`;

// 4. CONTROLE DE NAVEGAÇÃO
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

// 5. BUSCAR CALENDÁRIO (API)
async function buscarCalendario() {
    const container = document.getElementById('lista-corridas');
    container.innerHTML = "<p>Carregando corridas...</p>";
    try {
        const res = await fetch(`${API_BASE}/meetings?year=2026`);
        const dados = await res.json();
        
        // Remove testes de pré-temporada
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
    } catch (e) {
        container.innerHTML = "<p>Erro ao carregar calendário.</p>";
    }
}

// 6. RENDERIZAR CLASSIFICAÇÕES (ESTÁTICO PARA PRECISÃO)
function renderizarMundial(tipo) {
    const container = tipo === 'pilotos' ? document.getElementById('lista-pilotos') : document.getElementById('lista-equipes');
    container.innerHTML = '';

    if (tipo === 'pilotos') {
        MUNDIAL_PILOTOS.forEach(p => {
            container.innerHTML += `
                <div class="card" style="border-bottom: 4px solid #${p.cor}">
                    <div style="font-size: 2rem; margin-bottom: 10px;">👤</div>
                    <h3>${p.nome}</h3>
                    <p>${p.equipe}</p>
                    <div class="pontos-badge">${p.pontos} PTS</div>
                </div>`;
        });
    } else {
        // Agrupa pontos por equipe automaticamente
        const equipesMap = {};
        MUNDIAL_PILOTOS.forEach(p => {
            if (!equipesMap[p.equipe]) {
                equipesMap[p.equipe] = { nome: p.equipe, pontos: 0, cor: p.cor };
            }
            equipesMap[p.equipe].pontos += p.pontos;
        });

        // Converte para array e ordena
        const rankingEquipes = Object.values(equipesMap).sort((a, b) => b.pontos - a.pontos);

        rankingEquipes.forEach(eq => {
            container.innerHTML += `
                <div class="card" style="border-bottom: 4px solid #${eq.cor}">
                    ${LOGO_EQUIPE_SVG}
                    <h3>${eq.nome}</h3>
                    <div class="pontos-badge">${eq.pontos} PTS</div>
                </div>`;
        });
    }
}

// 7. VER DETALHES DA ETAPA (API) - VERSÃO SIMPLIFICADA
async function verResultado(meetingKey, meetingName) {
    mostrarSecao('resultado-detalhe');
    document.getElementById('nome-corrida-titulo').innerText = meetingName;
    const container = document.getElementById('tabela-resultados');
    const infoVoltas = document.getElementById('info-voltas');
    
    container.innerHTML = "<p>Carregando classificação...</p>";
    infoVoltas.innerText = ""; // Removemos o texto de total de voltas para limpar o visual

    try {
        const resPos = await fetch(`${API_BASE}/position?meeting_key=${meetingKey}`);
        const positions = await resPos.json();
        
        if (positions.length === 0) {
            container.innerHTML = "<p>Dados não disponíveis para esta etapa.</p>";
            return;
        }

        // 1. Pegar a última posição registrada de cada carro
        const ultimoEstado = [...new Map(positions.map(p => [p.driver_number, p])).values()]
            .sort((a, b) => a.position - b.position);

        container.innerHTML = '';
        
        ultimoEstado.forEach((p) => {
            // Busca os dados do piloto (Nome e Equipe) no MUNDIAL_PILOTOS baseado na posição
            const pilotoInfo = MUNDIAL_PILOTOS[p.position - 1] || { 
                nome: `Carro #${p.driver_number}`, 
                equipe: "Equipe não identificada", 
                cor: "e10600" 
            };

            container.innerHTML += `
                <div class="item-lista" style="border-left: 6px solid #${pilotoInfo.cor}">
                    <span class="pos">${p.position}º</span>
                    <span class="nome">${pilotoInfo.nome}</span>
                    <span class="tempo" style="color: #aaa; font-family: 'Segoe UI', sans-serif;">${pilotoInfo.equipe}</span>
                </div>`;
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = "<p>Erro ao buscar classificação.</p>";
    }
}
// Inicialização
window.onload = () => mostrarSecao('calendario');
