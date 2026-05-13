async function buscarCalendario() {
    const container = document.getElementById('lista-corridas');
    const anoAtual = new Date().getFullYear();
    
    try {
        // Agora a URL usa o ano dinâmico
        const response = await fetch(`https://api.openf1.org/v1/meetings?year=${anoAtual}`);
        
        if (!response.ok) throw new Error('Falha ao conectar com a API');

        const corridas = await response.json();
        
        container.innerHTML = ''; 

        corridas.forEach(corrida => {
            const card = document.createElement('div');
            card.className = 'corrida-card';
            card.innerHTML = `
                <h3>${corrida.meeting_name}</h3>
                <p>📍 ${corrida.location}</p>
                <p>📅 Temporada ${corrida.year}</p>
            `;
            container.appendChild(card);
        });

    } catch (erro) {
        container.innerHTML = '<p>Erro ao carregar dados de 2026. Verifique o console.</p>';
        console.error("Erro:", erro);
    }
}

buscarCalendario();
