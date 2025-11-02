# Deploy script para Restaurant Analytics Platform (Windows)
# Este script automatiza o processo de build e deploy da aplicação

param(
    [switch]$GenerateData
)

function Write-Log {
    param($Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - $Message"
}

Write-Host "🚀 Iniciando deploy do Restaurant Analytics Platform..." -ForegroundColor Green

# Verificar se Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Log "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
}

# Fazer backup do banco de dados se existir
$containers = docker ps --filter "name=restaurant_analytics_db" --quiet
if ($containers) {
    Write-Log "📦 Fazendo backup do banco de dados..."
    $backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    docker exec restaurant_analytics_db pg_dump -U challenge challenge_db | Out-File $backupFile -Encoding UTF8
}

# Parar containers existentes
Write-Log "🔄 Parando containers existentes..."
docker-compose -f docker-compose.prod.yml down

# Fazer rebuild das imagens
Write-Log "🏗️ Building containers..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Subir o banco de dados primeiro
Write-Log "🗄️ Iniciando banco de dados..."
docker-compose -f docker-compose.prod.yml up -d postgres

# Aguardar o banco estar pronto
Write-Log "⏳ Aguardando banco de dados estar pronto..."
$timeout = 60
$counter = 0
do {
    Start-Sleep 2
    $counter += 2
    $ready = docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U challenge -d challenge_db 2>&1
    if ($counter -ge $timeout) {
        Write-Log "❌ Timeout aguardando banco de dados"
        exit 1
    }
} while ($ready -notmatch "accepting connections")

# Gerar dados se necessário
if ($GenerateData) {
    Write-Log "📊 Gerando dados de exemplo..."
    docker-compose -f docker-compose.prod.yml --profile tools up data-generator
}

# Subir todos os serviços
Write-Log "🚀 Iniciando todos os serviços..."
docker-compose -f docker-compose.prod.yml up -d

# Aguardar serviços estarem prontos
Write-Log "⏳ Aguardando serviços estarem prontos..."
Start-Sleep 30

# Verificar health dos serviços
Write-Log "🔍 Verificando status dos serviços..."
try {
    Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing | Out-Null
    Write-Log "✅ Backend está funcionando"
} catch {
    Write-Log "❌ Backend não está respondendo"
}

try {
    Invoke-WebRequest -Uri "http://localhost/" -UseBasicParsing | Out-Null
    Write-Log "✅ Frontend está funcionando"
} catch {
    Write-Log "❌ Frontend não está respondendo"
}

# Mostrar status dos containers
Write-Log "📋 Status dos containers:"
docker-compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "🎉 Deploy concluído!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🗄️ PostgreSQL: localhost:5432" -ForegroundColor Cyan

Write-Host ""
Write-Host "Para parar os serviços: docker-compose -f docker-compose.prod.yml down"
Write-Host "Para ver logs: docker-compose -f docker-compose.prod.yml logs -f"