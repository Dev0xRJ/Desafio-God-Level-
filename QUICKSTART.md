# ⚡ Quick Start

Guia rápido para começar em 5 minutos.

## 1. Banco de Dados

```bash
cd nola-god-level
docker-compose up -d postgres
sleep 10
docker-compose --profile tools up data-generator
cd ..
```

## 2. Instalar e Executar

```bash
npm run setup
cd backend && cp .env.example .env && cd ..
npm run dev
```

## 3. Acessar

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Pronto! 🎉

Agora você pode:
- Explorar o Dashboard
- Testar as análises avançadas
- Criar queries personalizadas

Para mais detalhes, veja [SETUP.md](./SETUP.md) ou [README.md](./README.md).

