// Exemplo para buscar o calendário da temporada atual
async function buscarCalendario() {
    try {
        const response = await fetch('https://ergast.com/api/f1/current.json');
        const dados = await response.json();
        const corridas = dados.MRData.RaceTable.Races;
        
        console.log(corridas); // Isso mostrará as datas e locais no console do navegador
    } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
    }
}

buscarCalendario();
