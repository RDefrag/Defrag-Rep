async function buscarCalendario() {
    const container = document.getElementById('lista-corridas');
    const anoAtual = new Date().getFullYear(); 
    
    try {
        const response = await fetch(`https://api.openf1.org/v1/meetings?year=${anoAtual}`);
        if (!response.ok) throw new Error('Falha ao conectar com a API');

        const corridas = await response.json();
        container.innerHTML = ''; 

        corridas.forEach(corrida => {
            // Formatando a data e hora
            const dataInicio = new Date(corrida.date_start);
            const dataFormatada = dataInicio.toLocaleDateString('pt-BR');
            const horarioFormatado = dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            const card = document.createElement('div');
            card.className = 'corrida-card';
            card.innerHTML = `
                <h3>${corrida.meeting_name}</h3>
                <p>📍 ${corrida.location}</p>
                <p>📅 ${dataFormatada}</p>
                <p>⏰ Largada: ${horarioFormatado}</p>
            `;
            container.appendChild(card);
        });

    } catch (erro) {
        container.innerHTML = '<p>Erro ao carregar datas. Verifique o console.</p>';
        console.error(erro);
    }
}

buscarCalendario();
