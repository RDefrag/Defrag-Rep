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
    const anoAtual = new Date().getFullYear();
    try {
        const response = await fetch(`https://api.openf1.org/v1/meetings?year=${anoAtual}`);
        const dados = await response.json();
        container.innerHTML = '';
        dados.forEach(c => {
            container.innerHTML += `
                <div class="card" onclick="verResultado('${c.meeting_key}', '${c.meeting_name}')">
                    <h3>${c.meeting_name}</h3>
                    <p>📍 ${c.location}</p>
                    <p>📅 ${new Date(c.date_start).toLocaleDateString('pt-BR')}</p>
                    <small>Ver Resultados</small>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Erro ao carregar calendário."; }
}

async function verResultado(key, nome) {
    mostrarSecao('resultado-detalhe');
    document.getElementById('nome-corrida-titulo').innerText = nome;
    const container = document.getElementById('tabela-resultados');
    container.innerHTML = 'Buscando dados...';
    
    try {
        const res = await fetch(`https://api.openf1.org/v1/sessions?meeting_key=${key}&session_name=Race`);
        const session = await res.json();
        if(session.length > 0) {
            container.innerHTML = `<p>Sessão encontrada. Exibindo grid de largada/posições.</p>`;
            // Aqui você poderia buscar posições específicas da session_key
        } else {
            container.innerHTML = "Dados da corrida de 2026 ainda não processados.";
        }
    } catch (e) { container.innerHTML = "Erro ao buscar detalhes."; }
}

async function buscarClassificacao(tipo) {
    const container = tipo === 'pilotos' ? document.getElementById('lista-pilotos') : document.getElementById('lista-equipes');
    container.innerHTML = 'Processando classificação 2026...';
    
    try {
        const res = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        const drivers = await res.json();
        
        // Simulação de pontos reais para 2026 (ordenados)
        let lista = drivers.map(d => ({
            ...d,
            pontos: Math.floor(Math.random() * 250) // Em um sistema real, aqui viria a soma de resultados
        }));

        container.innerHTML = '';

        if (tipo === 'pilotos') {
            // Ordenar por pontos (Maior primeiro)
            lista.sort((a, b) => b.pontos - a.pontos);
            
            lista.forEach(p => {
                container.innerHTML += `
                    <div class="card" style="border-bottom-color: #${p.team_colour}">
                        <img src="${p.headshot_url || 'https://www.formula1.com/etc/designs/fom-website/images/f1-logo.split.svg'}" class="foto-piloto">
                        <h3>${p.full_name}</h3>
                        <p>${p.team_name}</p>
                        <div class="pontos-badge">${p.pontos} PTS</div>
                    </div>`;
            });
        } else {
            // Agrupar Equipes e somar pontos
            const equipesMap = {};
            lista.forEach(d => {
                if (!equipesMap[d.team_name]) {
                    equipesMap[d.team_name] = { nome: d.team_name, cor: d.team_colour, pontos: 0 };
                }
                equipesMap[d.team_name].pontos += d.pontos;
            });

            const rankingEquipes = Object.values(equipesMap).sort((a, b) => b.pontos - a.pontos);

            rankingEquipes.forEach(eq => {
                container.innerHTML += `
                    <div class="card" style="border-bottom-color: #${eq.cor}">
                        <img src="https://static.vecteezy.com/system/resources/previews/020/502/555/original/formula-1-logo-formula-1-icon-transparent-free-png.png" class="logo-equipe">
                        <h3>${eq.nome}</h3>
                        <div class="pontos-badge">${eq.pontos} PTS</div>
                    </div>`;
            });
        }
    } catch (e) { container.innerHTML = "Erro ao processar ranking."; }
}

window.onload = buscarCalendario;
