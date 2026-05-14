F1 Stats Tracker - Temporada 2026

Uma aplicação interativa e de alta performance desenvolvida para entusiastas de Fórmula 1. O sistema utiliza uma arquitetura híbrida para exibir o calendário da temporada, resultados de Grandes Prêmios e a classificação mundial de pilotos e construtores com foco na temporada de 2026.

Funcionalidades

Calendário Inteligente: Exibição de datas e locais das provas, com tradução automática para português e filtragem de eventos de pré-temporada.

Classificação Mundial (Mundial 2026): Tabela de pontos de Pilotos e Construtores atualizada conforme o progresso do campeonato.

Resultados Detalhados: Consulta de posições de chegada e intervalos (gaps) de cada GP finalizado em formato de lista horizontal.

Arquitetura de Performance: Sistema de cache local para classificações, evitando lentidão e bloqueios por excesso de requisições.

Tecnologias Utilizadas

Linguagem: JavaScript (ES6+)

Estruturação & Estilo: HTML5 & CSS3 (Grid e Flexbox para responsividade)

Dados Dinâmicos (API): OpenF1 API (Telemetria e dados oficiais em tempo real)

Integração: Fetch API com tratamento de erros e estados de carregamento.

Soluções Técnicas Implementadas

Durante o desenvolvimento, foram aplicadas soluções para desafios reais de engenharia de software:

Resolução do Erro 429 (Too Many Requests): Implementação de uma camada de dados estática para o Mundial de Pilotos, reduzindo drasticamente o volume de chamadas desnecessárias à API.

Lógica de Agregação: O sistema calcula automaticamente o Mundial de Construtores somando os pontos individuais dos pilotos, garantindo integridade dos dados sem redundância manual.

Tratamento de Dados Brutos: Conversão de dados de telemetria da API em informações legíveis para o usuário final.

Como rodar o projeto

Clone este repositório:

Bash
git clone https://github.com/SEU_USUARIO/Defrag-Rep.git
Acesse a pasta do projeto:

Bash
   cd Defrag-Rep
Inicie a aplicação:
Abra o arquivo index.html diretamente no seu navegador ou utilize a extensão Live Server do VS Code.

O que eu aprendi com este projeto

Este projeto integra meu portfólio acadêmico e consolidou conceitos fundamentais:

Gerenciamento de APIs Rest: Diferença entre consumo de dados brutos e dados processados.

Manipulação Avançada de DOM: Criação dinâmica de elementos baseada em respostas assíncronas.

Experiência do Usuário (UX): Tradução de termos técnicos e criação de interfaces limpas e intuitivas.

Resolução de Problemas: Diagnóstico e correção de falhas de comunicação com servidores (status codes).

Desenvolvido como projeto prático para a faculdade.
