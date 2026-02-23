# OdinBOT - Bot para WhatsApp

**Dono:** Erick Machine  
**Numero:** +55 92 99652-9610  
**Linguagem:** Go (whatsmeow) + Next.js (Painel Web)

---

## Estrutura do Projeto

```
OdinBOT/
├── bot/                    # Bot WhatsApp (Go)
│   ├── main.go             # Codigo principal do bot
│   ├── go.mod              # Dependencias Go
│   └── data/               # Dados persistidos (JSON)
├── app/                    # Painel Web (Next.js)
│   ├── page.tsx            # Dashboard
│   ├── groups/page.tsx     # Gerenciamento de grupos
│   ├── rentals/page.tsx    # Gerenciamento de alugueis
│   ├── warnings/page.tsx   # Advertencias
│   ├── blacklist/page.tsx  # Lista negra
│   ├── scheduled/page.tsx  # Mensagens agendadas
│   ├── settings/page.tsx   # Configuracoes
│   └── api/data/route.ts   # API para sync de dados
├── components/             # Componentes React
├── lib/                    # Utilitarios
├── install.sh              # Script de instalacao
├── start.sh                # Script para iniciar tudo
└── README.md               # Este arquivo
```

---

## Requisitos da VPS

- **Sistema:** Ubuntu 20.04+ / Debian 11+
- **RAM:** Minimo 1GB
- **Go:** 1.22+ (o install.sh instala automaticamente)
- **Node.js:** 18+ (o install.sh instala automaticamente)
- **pnpm:** 8+ (o install.sh instala automaticamente)

---

## Instalacao na VPS

### 1. Clonar o repositorio

```bash
git clone https://github.com/SEU_USUARIO/odinbot.git
cd odinbot
```

### 2. Executar o script de instalacao

```bash
chmod +x install.sh start.sh
./install.sh
```

O script instala Go 1.22.5, Node.js 20, pnpm, PM2, compila o bot e builda o painel. Tudo automatico.

### 3. Ou instalar manualmente

**Go (se nao tiver):**
```bash
# IMPORTANTE: remova qualquer Go antigo primeiro!
sudo rm -rf /usr/local/go
wget https://go.dev/dl/go1.22.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz
rm go1.22.5.linux-amd64.tar.gz
echo 'export PATH=/usr/local/go/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
go version  # deve mostrar go1.22.5
```

**Node.js (se nao tiver):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
```

**Dependencias do Bot:**
```bash
cd bot
go clean -cache -modcache  # limpa cache antigo
go mod tidy
CGO_ENABLED=1 go build -o odinbot main.go
cd ..
```

**Dependencias do Painel:**
```bash
pnpm install
```

---

## Como Iniciar

### Modo Rapido (bot + painel juntos)

```bash
chmod +x start.sh
./start.sh
```

### Modo Manual

**Terminal 1 - Bot:**
```bash
cd bot
go run main.go
```

Na primeira execucao, um QR Code aparecera no terminal.  
Abra o WhatsApp > Dispositivos Conectados > Conectar > Escanear QR Code.

**Terminal 2 - Painel Web:**
```bash
pnpm dev --port 3000
```

Acesse o painel em: `http://SEU_IP:3000`

---

## Rodar 24h com PM2

Instale o PM2 para manter tudo rodando:

```bash
npm install -g pm2
```

**Iniciar o Bot:**
```bash
cd bot
pm2 start "go run main.go" --name odinbot-go
```

**Iniciar o Painel:**
```bash
cd /caminho/para/odinbot
pm2 start "pnpm start" --name odinbot-panel
```

**Salvar para autostart:**
```bash
pm2 save
pm2 startup
```

**Ver logs:**
```bash
pm2 logs odinbot-go
pm2 logs odinbot-panel
```

**Reiniciar:**
```bash
pm2 restart all
```

---

## Rodar com systemd (alternativa)

Crie o arquivo `/etc/systemd/system/odinbot.service`:

```ini
[Unit]
Description=OdinBOT WhatsApp
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/caminho/para/odinbot/bot
ExecStart=/usr/local/go/bin/go run main.go
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable odinbot
sudo systemctl start odinbot
sudo systemctl status odinbot
```

---

## Comandos do Bot

### Prefixo: `#` (configuravel)

**Comandos Gerais:**
| Comando | Descricao |
|---------|-----------|
| #menu | Menu completo |
| #ping | Testar latencia |
| #info | Info do bot |
| #dono | Info do dono |
| #ajuda | Como usar |
| #alugar | Info de aluguel |
| #s / #fig | Criar figurinha |
| #toimg | Figurinha para imagem |
| #traduzir | Traduzir texto |
| #clima | Previsao do tempo |
| #signo | Horoscopo |
| #calcular | Calculadora |
| #sn | Sim ou Nao |
| #ppt | Pedra Papel Tesoura |
| #sorte | Sorte do dia |
| #cantadas | Cantada aleatoria |
| #fatos | Fato curioso |
| #conselho | Conselho aleatorio |
| #moedas | Cara ou Coroa |
| #afk | Ficar ausente |
| #ativo | Voltar da ausencia |
| #rankativos | Rank de ativos |

**Comandos de Admin:**
| Comando | Descricao |
|---------|-----------|
| #ban @user | Banir membro |
| #advertir @user motivo | Advertir membro |
| #checkwarnings @user | Ver advertencias |
| #removewarnings @user | Remover advertencia |
| #clearwarnings | Limpar advertencias |
| #mute / #desmute @user | Mutar/desmutar |
| #promover / #rebaixar @user | Promover/rebaixar |
| #bemvindo | Ativar/desativar boas vindas |
| #antilink | Ativar/desativar anti-link |
| #antifake | Ativar/desativar anti-fake |
| #antipalavra | Ativar/desativar anti-palavrao |
| #autosticker | Ativar/desativar auto-sticker |
| #so_adm | Modo so admin |
| #fechargp / #abrirgp | Fechar/abrir grupo |
| #nomegp nome | Alterar nome |
| #descgp desc | Alterar descricao |
| #linkgp | Obter link |
| #tagall / #totag | Marcar todos |
| #sorteio | Sortear membro |
| #roleta | Roleta russa |
| #status | Status do grupo |
| #admins | Listar admins |
| #grupoinfo | Info do grupo |
| #addpalavra / #delpalavra | Gerenciar palavras proibidas |
| #anotar / #anotacao | Anotacoes |
| #banghost | Banir ghosts |
| #banfakes | Banir numeros estrangeiros |

**Comandos de Dono (somente Erick Machine):**
| Comando | Descricao |
|---------|-----------|
| #aluguel jid\|nome\|num\|plano\|valor | Registrar aluguel |
| #verificar_aluguel | Ver todos os alugueis |
| #bcaluguel msg | Broadcast para grupos alugados |
| #bc msg | Broadcast geral |
| #join link | Entrar em grupo |
| #sairgp | Sair do grupo |
| #nuke | Remover todos os membros |
| #grupos | Listar todos os grupos |
| #cargo @user cargo | Definir cargo |
| #listanegra numero | Adicionar a lista negra |
| #tirardalista numero | Remover da lista negra |

---

## Painel Web

O painel web permite configurar o bot sem precisar de login:

- **Dashboard:** Visao geral de tudo
- **Grupos:** Configurar grupos (welcome, anti-link, etc)
- **Alugueis:** Gerenciar alugueis de grupos
- **Advertencias:** Ver/remover advertencias
- **Lista Negra:** Gerenciar banidos
- **Agendamentos:** Mensagens agendadas
- **Configuracoes:** Configuracoes gerais do bot

---

## Seguranca

- Somente o numero +559299652961 (Erick Machine) pode configurar alugueis
- O painel web nao requer login (para uso interno na VPS)
- Recomendado: configure um firewall para limitar acesso ao painel

```bash
sudo ufw allow 22
sudo ufw allow 3000
sudo ufw enable
```

---

## Solucao de Problemas

**Erro `roundupsize redeclared` ou erros de runtime Go:**
- Sua versao do Go esta corrompida ou e antiga demais
- Solucao: reinstale o Go limpo:
```bash
sudo rm -rf /usr/local/go
wget https://go.dev/dl/go1.22.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz
rm go1.22.5.linux-amd64.tar.gz
export PATH=/usr/local/go/bin:$PATH
go version
# Depois recompile:
cd bot
go clean -cache
go mod tidy
CGO_ENABLED=1 go build -o odinbot main.go
```

**Bot nao conecta:**
- Delete o arquivo `odinbot.db` e reconecte escaneando o QR Code

**Erro de permissao:**
- Use `sudo` ou ajuste as permissoes dos arquivos

**Painel nao abre:**
- Verifique se a porta 3000 esta liberada no firewall
- Verifique se o Node.js esta instalado

**Bot cai depois de um tempo:**
- Use PM2 ou systemd para manter rodando
- Verifique os logs: `pm2 logs odinbot-go`

---

## Licenca

Projeto privado de Erick Machine. Todos os direitos reservados.
