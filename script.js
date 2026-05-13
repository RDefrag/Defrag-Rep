async function buscarCalendario() {
    const container = document.getElementById('lista-corridas');
    
    try {
        const response = await fetch('https://ergast.com/api/f1/current.json');
        const dados = await response.json();
        const corridas = dados.MRData.RaceTable.Races;
        
        container.innerHTML = ''; // Limpa o "Carregando..."

        corridas.forEach(corrida => {
            const card = document.createElement('div');
            card.className = 'corrida-card';
            card.innerHTML = `
                <h3>${corrida.raceName}</h3>
                <p>📍 ${corrida.Circuit.Location.locality}, ${corrida.Circuit.Location.country}</p>
                <p>📅 ${new Date(corrida.date).toLocaleDateString('pt-BR')}</p>
            `;
            container.appendChild(card);
        });

    } catch (erro) {
        container.innerHTML = '<p>Erro ao carregar dados. Tente novamente mais tarde.</p>';
        console.error("Erro:", erro);
    }
}

buscarCalendario();
