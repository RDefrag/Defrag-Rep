// 1. DEFINIÇÃO DA PONTUAÇÃO OFICIAL DA F1
const PONTUACAO = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1
};

// 2. FUNÇÃO PARA CALCULAR O MUNDIAL AUTOMATICAMENTE
async function calcularMundialAutomatico() {
    console.log("Calculando classificação em tempo real...");
    
    try {
        // Busca todas as sessões do tipo 'Race' (Corrida) do ano de 2026
        const resSessoes = await fetch(`${API_BASE}/sessions?session_name=Race&year=2026`);
        const sessoes = await resSessoes.json();

        const placarPilotos = {};

        // Para cada corrida que já aconteceu...
        for (const sessao of sessoes) {
            const resPos = await fetch(`${API_BASE}/position?session_key=${sessao.session_key}`);
            const positions = await resPos.json();

            if (positions.length > 0) {
                // Pega o resultado final daquela corrida específica
                const resultadoFinal = [...new Map(positions.map(p => [p.driver_number, p])).values()];

                resultadoFinal.forEach(p => {
                    const pontosGanhos = PONTUACAO[p.position] || 0;
                    
                    if (!placarPilotos[p.driver_number]) {
                        placarPilotos[p.driver_number] = { 
                            nome: `Piloto ${p.driver_number}`, 
                            pontos: 0,
                            equipe: "Verificar", // A API precisaria de outro fetch para equipe
                            cor: "e10600"
                        };
                    }
                    placarPilotos[p.driver_number].pontos += pontosGanhos;
                });
            }
        }

        // Converte o objeto em array e ordena por pontos
        const rankingOrdenado = Object.values(placarPilotos).sort((a, b) => b.pontos - a.pontos);
        
        // Agora você usaria esse 'rankingOrdenado' para renderizar as abas
        return rankingOrdenado;

    } catch (e) {
        console.error("Erro ao calcular mundial automático:", e);
    }
}
