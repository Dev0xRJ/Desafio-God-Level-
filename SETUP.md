# 🚀 Guia de Setup Rápido

Este guia te ajudará a configurar e executar a plataforma de analytics rapidamente.

## Pré-requisitos

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Docker Desktop** ([download](https://www.docker.com/products/docker-desktop/)) - Opcional, mas recomendado
- **Git** - Para clonar o repositório do desafio

## Opção 1: Setup com Docker (Recomendado)

### 1. Configurar o Banco de Dados

```bash
# Ir para o diretório do desafio
cd nola-god-level

# Iniciar PostgreSQL
docker-compose up -d postgres

# Aguardar alguns segundos para o banco inicializar
sleep 10

# Gerar os dados (500k vendas)
docker-compose --profile tools up data-generator
```

Ou se preferir gerar localmente com Python:

```bash
# Instalar dependências Python (se necessário)
pip install -r requirements.txt

# Gerar dados
python generate_data.py
```

### 2. Voltar para o Diretório Principal

```bash
cd ..
```

### 3. Instalar Dependências

```bash
npm run setup
```

### 4. Configurar Backend

```bash
cd backend
cp .env.example .env
# Edite o .env se necessário (geralmente não precisa)
cd ..
```

### 5. Criar Índices (Opcional mas Recomendado)

Para melhorar performance, execute o script de índices:

```bash
# Se usando Docker
docker exec -i restaurant-analytics-db psql -U challenge -d challenge_db < database-indexes.sql

# Ou se usando PostgreSQL local
psql -U challenge -d challenge_db -f database-indexes.sql
```

### 6. Executar a Aplicação

```bash
# Terminal único (recomendado)
npm run dev

# Ou em terminais separados:
# Terminal 1:
npm run dev:backend

# Terminal 2:
npm run dev:frontend
```

### 7. Acessar

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Opção 2: Setup Manual (Sem Docker)

### 1. Instalar PostgreSQL

Instale PostgreSQL 15+ localmente e crie o banco:

```sql
CREATE DATABASE challenge_db;
CREATE USER challenge WITH PASSWORD 'challenge_2024';
GRANT ALL PRIVILEGES ON DATABASE challenge_db TO challenge;
```

### 2. Configurar Schema e Dados

```bash
cd nola-god-level

# Executar schema
psql -U challenge -d challenge_db -f database-schema.sql

# Gerar dados
python generate_data.py --db-url postgresql://challenge:challenge_2024@localhost:5432/challenge_db
```

### 3. Resto do Setup

Siga os passos 2-7 da Opção 1.

## Verificação

Para verificar se tudo está funcionando:

1. Acesse http://localhost:3001/health - deve retornar `{"status":"ok"}`
2. Acesse http://localhost:3000 - deve mostrar o dashboard
3. No dashboard, selecione um período e verifique se os dados aparecem

## Troubleshooting

### Erro de Conexão com o Banco

- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env` do backend
- Teste a conexão: `psql -U challenge -d challenge_db -h localhost`

### Erro "Cannot find module"

```bash
# Reinstalar dependências
rm -rf node_modules backend/node_modules frontend/node_modules
npm run setup
```

### Porta já em uso

- Backend: Altere `PORT` no `.env` do backend
- Frontend: Altere `port` no `vite.config.ts`

### Dados não aparecem

- Verifique se os dados foram gerados: `SELECT COUNT(*) FROM sales;` no banco
- Verifique se o período selecionado tem dados
- Verifique os logs do backend no console

## Próximos Passos

1. Explore o Dashboard
2. Teste as análises avançadas
3. Experimente o Query Builder
4. Leia a [documentação de decisões arquiteturais](./DECISOES_ARQUITETURAIS.md)

---

**Precisa de ajuda?** Consulte o [README.md](./README.md) para mais detalhes.

