#!/bin/bash

# Deploy script para Restaurant Analytics Platform
# Este script automatiza o processo de build e deploy da aplicação

set -e

echo "🚀 Iniciando deploy do Restaurant Analytics Platform..."

# Função para logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    log "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Fazer backup do banco de dados se existir
if docker ps | grep -q restaurant_analytics_db; then
    log "📦 Fazendo backup do banco de dados..."
    docker exec restaurant_analytics_db pg_dump -U challenge challenge_db > backup_$(date +%Y%m%d_%H%M%S).sql || true
fi

# Parar containers existentes
log "🔄 Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down || true

# Fazer rebuild das imagens
log "🏗️ Building containers..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Subir o banco de dados primeiro
log "🗄️ Iniciando banco de dados..."
docker-compose -f docker-compose.prod.yml up -d postgres

# Aguardar o banco estar pronto
log "⏳ Aguardando banco de dados estar pronto..."
timeout=60
counter=0
while ! docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U challenge -d challenge_db; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        log "❌ Timeout aguardando banco de dados"
        exit 1
    fi
done

# Gerar dados se necessário
if [ "$1" = "--generate-data" ]; then
    log "📊 Gerando dados de exemplo..."
    docker-compose -f docker-compose.prod.yml --profile tools up data-generator
fi

# Subir todos os serviços
log "🚀 Iniciando todos os serviços..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar serviços estarem prontos
log "⏳ Aguardando serviços estarem prontos..."
sleep 30

# Verificar health dos serviços
log "🔍 Verificando status dos serviços..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "✅ Backend está funcionando"
else
    log "❌ Backend não está respondendo"
fi

if curl -f http://localhost/ > /dev/null 2>&1; then
    log "✅ Frontend está funcionando"
else
    log "❌ Frontend não está respondendo"
fi

# Mostrar status dos containers
log "📋 Status dos containers:"
docker-compose -f docker-compose.prod.yml ps

log "🎉 Deploy concluído!"
log "📱 Frontend: http://localhost"
log "🔧 Backend API: http://localhost:3001"
log "🗄️ PostgreSQL: localhost:5432"

echo ""
echo "Para parar os serviços: docker-compose -f docker-compose.prod.yml down"
echo "Para ver logs: docker-compose -f docker-compose.prod.yml logs -f"