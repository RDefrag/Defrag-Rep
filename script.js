// Função para controlar a navegação entre as abas
function mostrarSecao(id) {
    // Esconde todas as seções
    document.querySelectorAll('.secao-conteudo').forEach(s => s.style.display = 'none');
    
    // Remove a classe 'active' de todos os botões
    document.querySelectorAll('.btn-aba').forEach(b => b.classList.remove('active'));
    
    // Mostra a seção desejada
    document.getElementById(id).style.display = 'block';
    
    // Adiciona classe ativa no botão clicado
    const btnAtivo = document.getElementById(`btn-${id}`);
    if (btnAtivo) btnAtivo.classList.add('active');

    // Carrega os dados dependendo da aba
    if (id === 'calendario') buscarCalendario();
    if (id === 'pilotos') buscarPilotos();
    if (id === 'equipes') buscarEquipes();
}

// Busca Calendário de Corridas
async function buscarCalendario() {
    const container = document.getElementById('lista-corridas');
    const ano = new Date().getFullYear();
    try {
        const response = await fetch(`https://api.openf1.org/v1/meetings?year=${ano}`);
        const dados = await response.json();
        container.innerHTML = '';
        dados.forEach(c => {
            const data = new Date(c.date_start).toLocaleDateString('pt-BR');
            container.innerHTML += `
                <div class="card">
                    <h3>${c.meeting_name}</h3>
                    <p>📍 ${c.location}</p>
                    <p>📅 ${data}</p>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Erro ao carregar dados."; }
}

// Busca Pilotos
async function buscarPilotos() {
    const container = document.getElementById('lista-pilotos');
    container.innerHTML = '<p>Carregando pilotos...</p>';
    try {
        const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        const dados = await response.json();
        container.innerHTML = '';
        // Filtrar duplicados por nome (a API pode retornar vários registros por piloto)
        const pilotosUnicos = Array.from(new Set(dados.map(p => p.full_name)))
            .map(name => dados.find(p => p.full_name === name));

        pilotosUnicos.forEach(p => {
            container.innerHTML += `
                <div class="card" style="border-bottom-color: #${p.team_colour}">
                    <img src="${p.headshot_url || 'https://www.formula1.com/etc/designs/fom-website/images/f1-logo.split.svg'}" alt="${p.full_name}">
                    <h3>${p.full_name}</h3>
                    <p>🏎️ ${p.team_name}</p>
                    <p>🔢 Número: ${p.driver_number}</p>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Erro ao carregar pilotos."; }
}

// Busca Equipes
async function buscarEquipes() {
    const container = document.getElementById('lista-equipes');
    container.innerHTML = '<p>Carregando equipes...</p>';
    try {
        const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        const dados = await response.json();
        container.innerHTML = '';
        
        // Agrupar por equipe
        const equipes = [...new Set(dados.map(d => d.team_name))];
        equipes.forEach(nome => {
            const info = dados.find(d => d.team_name === nome);
            container.innerHTML += `
                <div class="card" style="border-bottom-color: #${info.team_colour}">
                    <h3>${nome}</h3>
                    <p>Cor oficial: #${info.team_colour}</p>
                </div>`;
        });
    } catch (e) { container.innerHTML = "Erro ao carregar equipes."; }
}

// Inicializa a página no calendário
window.onload = buscarCalendario;
