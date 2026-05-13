async function buscarCalendario() {
    const container = document.getElementById('lista-corridas');
    
    try {
        // Usando a OpenF1, que é mais amigável para navegadores
        const response = await fetch('https://api.openf1.org/v1/meetings?year=2024');
        
        if (!response.ok) throw new Error('Falha ao conectar com a API');

        const corridas = await response.json();
        
        container.innerHTML = ''; 

        // A OpenF1 retorna um array direto de objetos
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
        container.innerHTML = '<p>Erro ao carregar dados da OpenF1. Verifique o console.</p>';
        console.error("Erro detectado:", erro);
    }
}

buscarCalendario();
