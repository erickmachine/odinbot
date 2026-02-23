#!/bin/bash
# ============================================
# OdinBOT - Script de Instalacao
# Dono: Erick Machine
# ============================================

set -e

echo "╔══════════════════════════════════════╗"
echo "║   OdinBOT - Instalacao Automatica    ║"
echo "║   Dono: Erick Machine                ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Diretorio base
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[1/7] Atualizando sistema..."
apt-get update -y
apt-get install -y curl wget git build-essential gcc sqlite3

echo ""
echo "[2/7] Instalando Go 1.22.5 (limpo)..."
# SEMPRE remove instalacao antiga para evitar conflitos de runtime
echo "  -> Removendo Go antigo (se existir)..."
rm -rf /usr/local/go
rm -f /tmp/go1.22.5.linux-amd64.tar.gz

echo "  -> Baixando Go 1.22.5..."
wget -q --show-progress https://go.dev/dl/go1.22.5.linux-amd64.tar.gz -O /tmp/go1.22.5.linux-amd64.tar.gz

echo "  -> Extraindo..."
tar -C /usr/local -xzf /tmp/go1.22.5.linux-amd64.tar.gz
rm -f /tmp/go1.22.5.linux-amd64.tar.gz

# Garantir PATH
export PATH=/usr/local/go/bin:$PATH
export GOPATH=$HOME/go
export PATH=$GOPATH/bin:$PATH

# Adicionar ao bashrc se nao existir
if ! grep -q '/usr/local/go/bin' ~/.bashrc 2>/dev/null; then
    echo '' >> ~/.bashrc
    echo '# Go' >> ~/.bashrc
    echo 'export PATH=/usr/local/go/bin:$PATH' >> ~/.bashrc
    echo 'export GOPATH=$HOME/go' >> ~/.bashrc
    echo 'export PATH=$GOPATH/bin:$PATH' >> ~/.bashrc
fi

echo "  -> Go instalado: $(go version)"
echo ""

echo "[3/7] Verificando Node.js..."
if ! command -v node &> /dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
    echo "  -> Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "  -> Node.js: $(node -v)"
echo ""

echo "[4/7] Instalando pnpm e PM2..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "  -> pnpm: $(pnpm -v)"
echo "  -> PM2: $(pm2 -v)"
echo ""

echo "[5/7] Criando pasta de dados do bot..."
mkdir -p "$BASE_DIR/bot/data"
echo ""

echo "[6/7] Compilando bot Go..."
cd "$BASE_DIR/bot"

# Limpar cache do Go para evitar conflitos
echo "  -> Limpando cache Go..."
go clean -cache -modcache 2>/dev/null || true

echo "  -> Baixando dependencias..."
go mod tidy

echo "  -> Compilando binario..."
CGO_ENABLED=1 go build -o odinbot main.go

if [ -f "$BASE_DIR/bot/odinbot" ]; then
    echo "  -> Binario compilado com sucesso!"
    ls -lh "$BASE_DIR/bot/odinbot"
else
    echo "  -> [ERRO] Falha ao compilar binario!"
    exit 1
fi
echo ""

echo "[7/7] Instalando dependencias do painel..."
cd "$BASE_DIR"
pnpm install
pnpm build

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Instalacao concluida com sucesso!      ║"
echo "╠══════════════════════════════════════════╣"
echo "║                                          ║"
echo "║   Para iniciar bot + painel:             ║"
echo "║   ./start.sh                             ║"
echo "║                                          ║"
echo "║   Na primeira vez, veja o QR Code:       ║"
echo "║   pm2 logs odinbot-go                    ║"
echo "║                                          ║"
echo "║   Painel web: http://SEU_IP:3000         ║"
echo "║   Pagina QR:  http://SEU_IP:3000/connection ║"
echo "║                                          ║"
echo "╚══════════════════════════════════════════╝"
