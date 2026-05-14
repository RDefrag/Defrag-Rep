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

// 2. REFERÊNCIA DE PILOTOS (Para nomes e cores)
// O número deve bater com o número oficial do piloto na F1
const DADOS_REFERENCIA = [
    { numero: 1, nome: "Max Verstappen", equipe: "Red Bull", cor: "3671C6" },
    { numero: 4, nome: "Lando Norris", equipe: "McLaren", cor: "ff8700" },
    { numero: 16, nome: "Charles Leclerc", equipe: "Ferrari", cor: "e10600" },
    { numero: 81, nome: "Oscar Piastri", equipe: "McLaren", cor: "ff8700" },
    { numero: 55, nome: "Carlos Sainz", equipe: "Ferrari", cor: "e10600" },
    { numero: 44, nome: "Lewis Hamilton", equipe: "Mercedes", cor: "27f4d2" },
    { numero: 63, nome: "George Russell", equipe: "Mercedes", cor: "27f4d2" },
    { numero: 11, nome: "Sergio Perez", equipe: "Red Bull", cor: "3671C6" },
    { numero: 14, nome: "Fernando Alonso", equipe: "Aston Martin", cor: "229971" }
];

// Variável global para guardar o mundial calculado e evitar múltiplas chamadas à API
let MUNDIAL_CALCULADO = [];

// 3. NAVEGAÇÃO
function mostrarSecao(id) {
    document.querySelectorAll('.secao-conteudo').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.btn-aba').forEach(b => b.classList.remove('active'));
    
    document.getElementById(id).style.display = 'block';
    const btn = document.getElementById(`btn-${id}`);
    if(btn) btn.classList.add('active');

    if (id === 'calendario') carregarCalendario();
    if (id === 'pilotos') exibirMundial('pilotos');
    if (id === 'equipes') exibirMundial('equipes');
}

// 4. CALCULAR MUNDIAL AUTOMATICAMENTE (A Lógica Principal)
async function calcularMundialAutomatico() {
    if (MUNDIAL_CALCULADO.length > 0) return MUNDIAL_CALCULADO;

    const PONTUACAO = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };
    const placar = {};

    try {
        // Pegamos as sessões de corrida de 2024 (onde há dados completos)
        const res = await fetch(`${API_BASE}/sessions?session_name=Race&year=2024`);
        const sessoes = await res.json();

        // Para não travar a API, pegamos apenas as últimas 5 corridas como teste
        const ultimasCorridas = sessoes.slice(-5); 

        for (const sessao of ultimasCorridas) {
            const resPos = await fetch(`${API_BASE}/position?session_key=${sessao.session_key}`);
            const positions = await resPos.json();

            if (positions.length > 0) {
                const resultadoFinal = [...new Map(positions.map(p => [p.driver_number, p])).values()];
                
                resultadoFinal.forEach(p => {
                    if (!placar[p.driver_number]) {
                        const ref = DADOS_REFERENCIA.find(d => d.numero === p.driver_number);
                        placar[p.driver_number] = {
                            nome: ref ? ref.nome : `Piloto ${p.driver_number}`,
                            equipe: ref ? ref.equipe : "F1 Team",
                            cor: ref ? ref.cor : "ffffff",
                            pontos: 0
                        };
                    }
                    placar[p.driver_number].pontos += (PONTUACAO[p.position] || 0);
                });
            }
        }
        MUNDIAL_CALCULADO = Object.values(placar).sort((a, b) => b.pontos - a.pontos);
        return MUNDIAL_CALCULADO;
    } catch (e) {
        console.error("Erro no cálculo:", e);
        return [];
    }
}

// 5. EXIBIR MUNDIAL (PILOTOS E EQUIPES)
async function exibirMundial(tipo) {
    const container = tipo === 'pilotos' ? document.getElementById('lista-pilotos') : document.getElementById('lista-equipes');
    container.innerHTML = "<p>Calculando pontuação em tempo real...</p>";
    
    const dados = await calcularMundialAutomatico();
    container.innerHTML = '';

    if (tipo === 'pilotos') {
        dados.forEach((p, i) => {
            container.innerHTML += `
                <div class="item-lista" style="border-left: 6px solid #${p.cor}">
                    <span class="pos">${i + 1}º</span>
                    <span class="nome">${p.nome}</span>
                    <span class="tempo" style="color:#e10600">${p.pontos} PTS</span>
                </div>`;
        });
    } else {
        const equipes = {};
        dados.forEach(p => {
            if (!equipes[p.equipe]) equipes[p.equipe] = { nome: p.equipe, pontos: 0, cor: p.cor };
            equipes[p.equipe].pontos += p.pontos;
        });
        Object.values(equipes).sort((a,b) => b.pontos - a.pontos).forEach((eq, i) => {
            container.innerHTML += `
                <div class="item-lista" style="border-left: 6px solid #${eq.cor}">
                    <span class="pos">${i + 1}º</span>
                    <span class="nome">${eq.nome}</span>
                    <span class="tempo" style="color:#e10600">${eq.pontos} PTS</span>
                </div>`;
        });
    }
}

// 6. CALENDÁRIO
async function carregarCalendario() {
    const container = document.getElementById('lista-corridas');
    container.innerHTML = "<p>Carregando...</p>";
    try {
        const res = await fetch(`${API_BASE}/meetings?year=2024`);
        const data = await res.json();
        const corridas = data.filter(m => m.meeting_name.includes('Grand Prix'));
        container.innerHTML = '';
        corridas.forEach(c => {
            const nome = traducoesCorridas[c.meeting_name] || c.meeting_name;
            container.innerHTML += `
                <div class="card" onclick="verResultado('${c.meeting_key}', '${nome}')">
                    <h3>${nome}</h3>
                    <p>📍 ${c.location}</p>
                    <button class="btn-resultado">Ver Detalhes</button>
                </div>`;
        });
    } catch (e) { container.innerHTML = "<p>Erro.</p>"; }
}

// 7. RESULTADO DA ETAPA
async function verResultado(meetingKey, meetingName) {
    mostrarSecao('resultado-detalhe');
    document.getElementById('nome-corrida-titulo').innerText = meetingName;
    const container
