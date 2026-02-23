#!/bin/bash
# ============================================
# OdinBOT - Script de Inicio
# Dono: Erick Machine
# ============================================

# Garantir PATH do Go
export PATH=/usr/local/go/bin:$HOME/go/bin:$PATH

echo "╔══════════════════════════════════════╗"
echo "║     OdinBOT - Iniciando Servicos     ║"
echo "║     Dono: Erick Machine              ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Diretorio base
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

# Verificar Go
if ! command -v go &> /dev/null; then
    echo "[ERRO] Go nao encontrado! Execute ./install.sh primeiro."
    exit 1
fi
echo "[OK] Go: $(go version)"

# Verificar PM2
if ! command -v pm2 &> /dev/null; then
    echo "[AVISO] PM2 nao encontrado. Instalando..."
    npm install -g pm2
fi

# Parar processos anteriores
pm2 delete odinbot-go 2>/dev/null || true
pm2 delete odinbot-panel 2>/dev/null || true

echo ""

# ===== BOT GO =====
echo "[1/2] Iniciando Bot WhatsApp..."
cd "$BASE_DIR/bot"

# Verificar se binario existe e recompilar se necessario
if [ ! -f "$BASE_DIR/bot/odinbot" ]; then
    echo "  -> Binario nao encontrado, compilando..."
    export PATH=/usr/local/go/bin:$PATH
    CGO_ENABLED=1 go build -o odinbot main.go
    if [ $? -ne 0 ]; then
        echo "  -> [ERRO] Falha ao compilar! Verifique os erros acima."
        exit 1
    fi
    echo "  -> Compilado com sucesso!"
fi

# Criar diretorio de dados
mkdir -p "$BASE_DIR/bot/data"

# Iniciar com PM2
pm2 start "$BASE_DIR/bot/odinbot" --name odinbot-go --cwd "$BASE_DIR/bot"
echo "  -> Bot iniciado!"

echo ""

# ===== PAINEL WEB =====
echo "[2/2] Iniciando Painel Web..."
cd "$BASE_DIR"

# Buildar se necessario
if [ ! -d "$BASE_DIR/.next" ]; then
    echo "  -> Build nao encontrado, buildando..."
    pnpm build
fi

pm2 start "pnpm start --port 3000" --name odinbot-panel --cwd "$BASE_DIR"
echo "  -> Painel iniciado!"

echo ""

# Salvar configuracao PM2 para autostart
pm2 save

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Servicos iniciados com sucesso!    ║"
echo "╠══════════════════════════════════════╣"
echo "║                                      ║"
echo "║   Bot:    pm2 logs odinbot-go        ║"
echo "║   Painel: http://SEU_IP:3000         ║"
echo "║   Status: pm2 status                 ║"
echo "║                                      ║"
echo "║   PRIMEIRA VEZ? Escaneie o QR Code:  ║"
echo "║   pm2 logs odinbot-go               ║"
echo "║                                      ║"
echo "╚══════════════════════════════════════╝"
echo ""

pm2 status
