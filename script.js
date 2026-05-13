const API_BASE = "https://api.openf1.org/v1";
const DATA_HOJE = new Date("2026-05-13"); // Data atual solicitada

const LOGO_EQUIPE_SVG = `<svg class="logo-equipe-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16.5L16.5 12L21 7.5V16.5ZM3 7.5L7.5 12L3 16.5V7.5ZM12 4.5L16.5 9L12 13.5L7.5 9L12 4.5ZM12 19.5L7.5 15L12 10.5L16.5 15L12 19.5Z" fill="white"/></svg>`;

// Sistema oficial de pontuação F1
const pontuacaoF1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

function mostrarSecao(id) {
    document.querySelectorAll('.secao-conteudo').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.btn-aba').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    const btn = document.getElementById(`btn-${id}`);
    if (btn) btn.classList.add('active');

    if (id === 'calendario') buscarCalendario();
    if (id === 'pilotos') calcularMundial('pilotos');
    if (id === 'equipes') calcularMundial('equipes');
}

async function calcularMundial(tipo) {
    const container = tipo === 'pilotos' ? document.getElementById('lista-pilotos') : document.getElementById('lista-equipes');
    container.innerHTML = `Processando pontos até ${DATA_HOJE.toLocaleDateString('pt-BR')}...`;

    try {
        // 1. Pegar todas as reuniões (GPs) de 2026
        const resMeetings = await fetch(`${API_BASE}/meetings?year=2026`);
        const meetings = await resMeetings.json();

        // 2. Filtrar apenas GPs que já aconteceram até hoje
        const gpsPassados = meetings.filter(m => new Date(m.date_start) < DATA_HOJE && !m.meeting_name.includes("Pre-Season"));

        // 3. Pegar lista de pilotos
        const resDrivers = await fetch(`${API_BASE}/drivers?session_key=latest`);
        const driversData = await resDrivers.json();

        // Objeto para acumular pontos
        let mapaPontos = {};
        driversData.forEach(d => {
            mapaPontos[d.driver_number] = { 
                nome: d.full_name, 
                equipe: d.team_name, 
                cor: d.team_colour, 
                foto: d.headshot_url,
                pontos: 0 
            };
        });

        // 4. Buscar resultados de cada GP e somar pontos
        for (const gp of gpsPassados) {
            const resSessions = await fetch(`${API_BASE}/sessions?meeting_key=${gp.meeting_key}&session_name=Race`);
            const sessions = await resSessions.json();

            if (sessions.length > 0) {
                const resPos = await fetch(`${API_BASE}/position?session_key=${sessions[0].session_key}`);
                const positions = await resPos.json();

                // Pegar posição final de cada piloto nesta corrida
                const finalGP = [...new Map(positions.map(p => [p.driver_number, p])).values()]
                    .sort((a, b) => a.position - b.position);

                finalGP.forEach((p, idx) => {
                    if (idx < 10 && mapaPontos[p.driver_number]) {
                        mapaPontos[p.driver_number].pontos += pontuacaoF1[idx];
                    }
                });
            }
        }

        // 5. Renderizar
        container.innerHTML = '';
        if (tipo === 'pilotos') {
            const ranking = Object.values(mapaPontos).sort((a, b) => b.pontos - a.pontos);
            ranking.forEach(p => {
                if (p.pontos > 0 || p.nome === "Kimi ANTONELLI") { // Garante exibição dos ativos
                    container.innerHTML += `
                        <div class="card" style="border-bottom-color: #${p.cor}">
                            <img src="${p.foto || ''}" class="foto-piloto">
                            <h3>${p.nome}</h3>
                            <p>${p.equipe}</p>
                            <div class="pontos-badge">${p.pontos} PTS</div>
                        </div>`;
                }
            });
        } else {
            const equipes = {};
            Object.values(mapaPontos).forEach(p => {
                if (!equipes[p.equipe]) equipes[p.equipe] = { nome: p.equipe, cor: p.cor, pontos: 0 };
                equipes[p.equipe].pontos += p.pontos;
            });

            Object.values(equipes).sort((a, b) => b.pontos - a.pontos).forEach(eq => {
                container.innerHTML += `
                    <div class="card" style="border-bottom-color: #${eq.cor}">
                        ${LOGO_EQUIPE_SVG}
                        <h3>${eq.nome}</h3>
                        <div class="pontos-badge">${eq.pontos} PTS</div>
                    </div>`;
            });
        }
    } catch (e) { container.innerHTML = "Erro ao calcular classificação em tempo real."; }
}

// ... (Mantenha as funções buscarCalendario e verResultado do código anterior)
