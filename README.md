# Analytics Pro - Dashboard para Restaurantes 📊

Bom, depois de algumas semanas trabalhando nisso aqui, consegui montar uma plataforma de analytics que resolve aqueles problemas chatos que todo dono de restaurante tem. Sabe quando você quer saber "qual produto vende mais na quinta à noite no iFood?" e não tem como descobrir fácil? Então, é isso que esse sistema resolve.

## O que rola aqui

Basicamente, peguei o desafio de criar algo tipo Power BI mas específico pra restaurantes. A ideia veio depois de conversar com alguns donos de estabelecimento que sempre reclamavam da dificuldade de entender seus próprios dados.

### O que consegue fazer

- "Qual produto vende mais na quinta à noite no iFood?" ✓
- "Meu tempo de entrega tá uma bosta. Em quais regiões?" ✓ 
- "Quais clientes compraram várias vezes mas sumiram?" ✓
- Comparar como cada loja tá se saindo
- Ver padrões estranhos nos dados (tipo aquela queda de vendas inexplicável)

## Como tá estruturado

### Stack que usei

- **Backend**: Node.js com TypeScript (escolhi porque já manjava e é rápido pra fazer API)
- **Frontend**: React + TypeScript + Vite (Vite é muito mais rápido que o Create React App)
- **CSS**: Tailwind (não gosto muito de CSS então facilita)
- **Banco**: PostgreSQL (veio no desafio, mas é bom mesmo)
- **Gráficos**: Recharts (testei alguns, esse funcionou bem)
- **Cache**: Node-cache (simples mas funciona)

### Estrutura do Projeto

```
restaurant-analytics-platform/
├── backend/           # API REST em Node.js/TypeScript
│   ├── src/
│   │   ├── config/    # Configurações (DB, cache)
│   │   ├── services/  # Lógica de negócio
│   │   ├── routes/    # Endpoints da API
│   │   └── utils/     # Utilitários
│   └── package.json
├── frontend/          # Aplicação React
│   ├── src/
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── pages/      # Páginas da aplicação
│   │   └── services/   # Cliente API
│   └── package.json
├── nola-god-level/    # Repositório do desafio (schema, dados)
└── README.md
```

## Como rodar essa bagaça 🚀

### O que você precisa ter

- Node.js (testei no 18, mas deve funcionar em outras versões)
- Docker (pra não ter que instalar PostgreSQL)
- Paciência (principalmente na primeira vez)

### Jeito rápido (recomendado)

Se você tem Docker, é só rodar:

```bash
# Gera dados e sobe tudo
./deploy.ps1 -GenerateData

# Ou no Linux/Mac
./deploy.sh --generate-data
```

### Jeito manual (se quiser entender o que tá acontecendo)

1. Sobe o banco:
```bash
cd nola-god-level
docker-compose up -d postgres
```

2. Gera os dados (demora uns 10 minutos):
```bash
docker-compose --profile tools up data-generator
```

### Passo 2: Instalar Dependências

Na raiz do projeto:
```bash
npm run setup
```

Ou manualmente:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Passo 3: Configurar Variáveis de Ambiente

No diretório `backend/`, crie um arquivo `.env` baseado em `.env.example`:

```env
PORT=3001
DATABASE_URL=postgresql://challenge:challenge_2024@localhost:5432/challenge_db
NODE_ENV=development
CACHE_TTL=300
```

### Passo 4: Executar a Aplicação

**Opção 1: Executar tudo junto**
```bash
npm run dev
```

**Opção 2: Executar separadamente**

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

### Passo 5: Acessar

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📚 Documentação da API

### Endpoints Principais

#### Analytics

- `GET /api/analytics/metrics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
  - Retorna métricas gerais (faturamento, ticket médio, total de vendas)

- `GET /api/analytics/sales-by-period?startDate=...&endDate=...&period=day|week|month`
  - Vendas agrupadas por período

- `GET /api/analytics/top-products?startDate=...&endDate=...&limit=10`
  - Top produtos mais vendidos

- `GET /api/analytics/products-by-channel-time?channelId=...&dayOfWeek=...&startHour=...&endHour=...`
  - Produtos mais vendidos em canal/horário específico

- `GET /api/analytics/delivery-performance?startDate=...&endDate=...`
  - Performance de entrega por região

- `GET /api/analytics/inactive-customers?daysInactive=30&minPurchases=3`
  - Clientes recorrentes inativos

- `GET /api/analytics/sales-by-channel?startDate=...&endDate=...`
  - Vendas agrupadas por canal

- `GET /api/analytics/sales-by-store?startDate=...&endDate=...`
  - Vendas agrupadas por loja

- `POST /api/analytics/custom-query`
  - Executa query customizada (veja Query Builder)

#### Metadata

- `GET /api/metadata/stores` - Lista de lojas
- `GET /api/metadata/channels` - Lista de canais
- `GET /api/metadata/products?limit=100&search=...` - Lista de produtos
- `GET /api/metadata/categories` - Lista de categorias
- `GET /api/metadata/date-range` - Período de dados disponíveis

## 🎨 Funcionalidades

### Dashboard Principal
- Métricas gerais (faturamento, ticket médio, total de vendas)
- Gráfico de vendas ao longo do tempo
- Comparação de vendas por canal
- Top 10 produtos mais vendidos
- Filtros de período (últimos 7, 30, 90 dias ou customizado)

### Analytics Avançados
- **Produtos por Canal e Horário**: Responder "Qual produto vende mais na quinta à noite no iFood?"
- **Performance de Entrega**: Identificar regiões com pior tempo de entrega
- **Clientes Inativos**: Encontrar clientes recorrentes que não voltam há X dias

### Query Builder
- Interface para criar queries personalizadas via JSON
- Suporta filtros, agregações, agrupamentos
- Visualização tabular dos resultados

## 🎯 Decisões Arquiteturais

Veja o arquivo [DECISOES_ARQUITETURAIS.md](./DECISOES_ARQUITETURAIS.md) para detalhes completos.

### Principais Decisões

1. **Backend em Node.js/TypeScript**: Performance e ecossistema rico
2. **Query Builder Customizado**: Permite flexibilidade sem SQL direto
3. **Cache em Memória**: Reduz carga no banco para queries frequentes
4. **Frontend React Moderno**: UX responsiva e interativa
5. **Separação de Responsabilidades**: Services, Routes, Components bem separados

## ⚡ Performance

- Cache implementado (TTL configurável, default 5 minutos)
- Queries otimizadas com índices sugeridos
- Lazy loading de componentes
- Paginação implícita (limites em queries)

## 🧪 Próximos Passos (Melhorias Futuras)

- [ ] Testes automatizados (Jest, React Testing Library)
- [ ] Índices no banco de dados otimizados
- [ ] Sistema de autenticação completo
- [ ] Dashboards salvos e compartilháveis
- [ ] Exportação para PDF/Excel
- [ ] Alertas automáticos (anomalias, KPIs)
- [ ] IA para insights automáticos
- [ ] Deploy em cloud (AWS, Vercel, Railway)

## 📝 Licença

MIT

## 👤 Autor

Desenvolvido para o desafio God Level Coder Challenge - Nola

## Considerações finais

Foi um projeto legal de fazer. Aprendi bastante sobre analytics e dados de restaurante. Tem algumas coisas que eu faria diferente se fosse recomeçar (principalmente na parte de cache e otimização de queries), mas no geral ficou funcional.

Se você encontrar bugs ou tiver sugestões, fique à vontade pra abrir uma issue.

**Obs**: Este projeto foi feito como resposta ao desafio God Level da Nola. Tentei focar em resolver problemas reais que donos de restaurante enfrentam no dia a dia.

