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
        const response = await fetch('https://api.openf1.org/v1/meetings?year=2024');
        const dados = await response.json();
        container.innerHTML = '';
        dados.forEach(c => {
            container.innerHTML += `
                <div class="card" onclick="verResultado('${c.meeting_key}', '${c.meeting_name}')">
                    <h3>${c.meeting_name}</h3>
                    <p>📍 ${c.location}</p>
                    <p>📅 ${new Date(c.date_start).toLocaleDateString('pt-BR')}</p>
                    <small>Clique para ver resultados</small>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Erro ao carregar."; }
}

async function verResultado(key, nome) {
    mostrarSecao('resultado-detalhe');
    document.getElementById('nome-corrida-titulo').innerText = nome;
    const container = document.getElementById('tabela-resultados');
    container.innerHTML = '<p>Buscando posições finais...</p>';
    
    try {
        const res = await fetch(`https://api.openf1.org/v1/position?session_key=latest&meeting_key=${key}`);
        const posicoes = await res.json();
        // Pegar apenas a última posição registrada de cada piloto
        const final = [...new Map(posicoes.map(item => [item.driver_number, item])).values()]
                        .sort((a, b) => a.position - b.position);

        container.innerHTML = '';
        final.forEach(p => {
            container.innerHTML += `
                <div class="card" style="width: 150px">
                    <h4>${p.position}º Lugar</h4>
                    <p>Piloto nº ${p.driver_number}</p>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Resultados ainda não disponíveis."; }
}

async function buscarClassificacao(tipo) {
    const container = tipo === 'pilotos' ? document.getElementById('lista-pilotos') : document.getElementById('lista-equipes');
    container.innerHTML = '<p>Calculando pontos da temporada...</p>';
    
    try {
        const res = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        const drivers = await res.json();
        container.innerHTML = '';

        if (tipo === 'pilotos') {
            drivers.forEach(p => {
                // Simulação de pontos acumulados para o portfólio
                const pontosSimulados = Math.floor(Math.random() * 200); 
                container.innerHTML += `
                    <div class="card" style="border-bottom-color: #${p.team_colour}">
                        <img src="${p.headshot_url}" class="foto-piloto">
                        <h3>${p.full_name}</h3>
                        <p>${p.team_name}</p>
                        <div class="pontos-badge">${pontosSimulados} PTS</div>
                    </div>`;
            });
        } else {
            const equipes = [...new Set(drivers.map(d => d.team_name))];
            equipes.forEach(eq => {
                const info = drivers.find(d => d.team_name === eq);
                const pontosEquipe = Math.floor(Math.random() * 400);
                container.innerHTML += `
                    <div class="card" style="border-bottom-color: #${info.team_colour}">
                        <img src="https://logodownload.org/wp-content/uploads/2016/11/f1-logo-escuderia.png" class="logo-equipe" style="filter: grayscale(1) brightness(2);">
                        <h3>${eq}</h3>
                        <div class="pontos-badge">${pontosEquipe} PTS</div>
                    </div>`;
            });
        }
    } catch (e) { container.innerHTML = "Erro ao carregar pontos."; }
}

window.onload = buscarCalendario;
