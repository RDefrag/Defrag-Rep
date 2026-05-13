async function buscarCalendario() {
    const container = document.getElementById('lista-corridas');
    
    try {
        // Mudamos para a versão .json explicitamente e garantimos o HTTPS
        const response = await fetch('https://ergast.com/api/f1/2024.json', {
            mode: 'cors'
        });
        
        if (!response.ok) throw new Error('Falha na requisição');

        const dados = await response.json();
        const corridas = dados.MRData.RaceTable.Races;
        
        container.innerHTML = ''; 

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
        // Se o erro de CORS persistir, usaremos um proxy temporário para o seu trabalho de faculdade
        container.innerHTML = '<p>Erro de conexão. Tentando contornar bloqueio...</p>';
        console.error("Erro original:", erro);
        tentarComProxy();
    }
}

// Função reserva caso a API Ergast continue bloqueando o GitHub
async function tentarComProxy() {
    const container = document.getElementById('lista-corridas');
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const targetUrl = encodeURIComponent('https://ergast.com/api/f1/2024.json');

    try {
        const response = await fetch(`${proxyUrl}${targetUrl}`);
        const data = await response.json();
        const dadosVerdadeiros = JSON.parse(data.contents);
        const corridas = dadosVerdadeiros.MRData.RaceTable.Races;

        container.innerHTML = '';
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
    } catch (e) {
        container.innerHTML = '<p>Ocorreu um erro persistente. Verifique o console.</p>';
    }
}

buscarCalendario();
