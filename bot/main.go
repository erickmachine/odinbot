package main

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/mdp/qrterminal/v3"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/proto/waE2E"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
	"google.golang.org/protobuf/proto"
)

// ============================================================
// OdinBOT - WhatsApp Bot com whatsmeow
// Dono: Erick Machine | Numero: +559299652961
// ============================================================

const (
	BotName       = "OdinBOT"
	OwnerName     = "Erick Machine"
	OwnerNumber   = "5592996529610"
	DefaultPrefix = "#"
)

// ============================================================
// Data Structures
// ============================================================

type GroupConfig struct {
	JID          string `json:"jid"`
	Name         string `json:"name"`
	Welcome      bool   `json:"welcome"`
	WelcomeMsg   string `json:"welcome_msg"`
	Goodbye      bool   `json:"goodbye"`
	GoodbyeMsg   string `json:"goodbye_msg"`
	Antilink     bool   `json:"antilink"`
	Antifake     bool   `json:"antifake"`
	Antiflood    bool   `json:"antiflood"`
	NSFW         bool   `json:"nsfw"`
	AutoSticker  bool   `json:"auto_sticker"`
	Prefix       string `json:"prefix"`
	Active       bool   `json:"active"`
	AntiPalavrao bool   `json:"anti_palavrao"`
	OnlyAdm      bool   `json:"only_adm"`
	AutoDL       bool   `json:"auto_dl"`
	AntiBot      bool   `json:"anti_bot"`
	ModoRPG      bool   `json:"modo_rpg"`
}

type Rental struct {
	GroupJID  string  `json:"group_jid"`
	GroupName string  `json:"group_name"`
	OwnerNum  string  `json:"owner_number"`
	OwnerName string  `json:"owner_name"`
	Plan      string  `json:"plan"`
	StartDate string  `json:"start_date"`
	EndDate   string  `json:"end_date"`
	Value     float64 `json:"value"`
	Active    bool    `json:"active"`
	Notes     string  `json:"notes"`
}

type Warning struct {
	GroupJID string `json:"group_jid"`
	UserJID  string `json:"user_jid"`
	UserName string `json:"user_name"`
	Reason   string `json:"reason"`
	Date     string `json:"date"`
	IssuedBy string `json:"issued_by"`
}

type BlacklistEntry struct {
	Number  string `json:"number"`
	Reason  string `json:"reason"`
	Date    string `json:"date"`
	AddedBy string `json:"added_by"`
}

type BotData struct {
	mu         sync.RWMutex
	Groups     map[string]*GroupConfig      `json:"groups"`
	Rentals    []Rental                     `json:"rentals"`
	Warnings   map[string][]Warning         `json:"warnings"`
	Blacklist  map[string]BlacklistEntry     `json:"blacklist"`
	BadWords   map[string][]string          `json:"bad_words"`
	Notes      map[string][]string          `json:"notes"`
	MutedUsers map[string]map[string]bool   `json:"muted_users"`
	AfkUsers   map[string]string            `json:"afk_users"`
	Roles      map[string]map[string]string `json:"roles"`
}

var (
	client  *whatsmeow.Client
	botData *BotData
	dataDir string
)

// ============================================================
// Main
// ============================================================

func main() {
	fmt.Println("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557")
	fmt.Println("\u2551         OdinBOT - Iniciando          \u2551")
	fmt.Println("\u2551    Dono: Erick Machine               \u2551")
	fmt.Println("\u2551    Numero: +55 92 99652-9610         \u2551")
	fmt.Println("\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d")

	dataDir = filepath.Join(".", "data")
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		fmt.Printf("[ERRO] Criar pasta data: %v\n", err)
		os.Exit(1)
	}

	botData = loadBotData()

	dbLog := waLog.Stdout("Database", "WARN", true)
	container, err := sqlstore.New(context.Background(), "sqlite3", "file:odinbot.db?_foreign_keys=on", dbLog)
	if err != nil {
		fmt.Printf("[ERRO] Banco de dados: %v\n", err)
		os.Exit(1)
	}

	deviceStore, err := container.GetFirstDevice(context.Background())
	if err != nil {
		fmt.Printf("[ERRO] Dispositivo: %v\n", err)
		os.Exit(1)
	}

	clientLog := waLog.Stdout("Client", "WARN", true)
	client = whatsmeow.NewClient(deviceStore, clientLog)
	client.AddEventHandler(eventHandler)

	if client.Store.ID == nil {
		qrChan, _ := client.GetQRChannel(context.Background())
		if err := client.Connect(); err != nil {
			fmt.Printf("[ERRO] Conectar: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557")
		fmt.Println("\u2551     ESCANEIE O QR CODE ABAIXO       \u2551")
		fmt.Println("\u2551  Abra WhatsApp > Aparelhos Conectados \u2551")
		fmt.Println("\u2551  > Conectar Aparelho > Escanear QR   \u2551")
		fmt.Println("\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d")
		for evt := range qrChan {
			if evt.Event == "code" {
				fmt.Println("")
				qrterminal.GenerateHalfBlock(evt.Code, qrterminal.L, os.Stdout)
				fmt.Println("")
				fmt.Println("[QR] Escaneie o QR acima com seu WhatsApp")
				fmt.Println("[QR] O QR expira em 20 segundos, aguarde novo se precisar...")
				qrData := map[string]string{
					"code":    evt.Code,
					"status":  "waiting",
					"updated": time.Now().Format(time.RFC3339),
				}
				qrJSON, _ := json.Marshal(qrData)
				_ = os.WriteFile(filepath.Join(dataDir, "qrcode.json"), qrJSON, 0644)
			} else if evt.Event == "success" {
				fmt.Println("[QR] Pareamento realizado com sucesso!")
				qrData := map[string]string{
					"code":    "",
					"status":  "connected",
					"updated": time.Now().Format(time.RFC3339),
				}
				qrJSON, _ := json.Marshal(qrData)
				_ = os.WriteFile(filepath.Join(dataDir, "qrcode.json"), qrJSON, 0644)
			} else if evt.Event == "timeout" {
				fmt.Println("[QR] QR expirou! Reinicie o bot para gerar um novo.")
				qrData := map[string]string{
					"code":    "",
					"status":  "timeout",
					"updated": time.Now().Format(time.RFC3339),
				}
				qrJSON, _ := json.Marshal(qrData)
				_ = os.WriteFile(filepath.Join(dataDir, "qrcode.json"), qrJSON, 0644)
			} else {
				fmt.Printf("[QR] Evento: %s\n", evt.Event)
			}
		}
	} else {
		fmt.Println("[OdinBOT] Sessao encontrada, reconectando...")
		if err := client.Connect(); err != nil {
			fmt.Printf("[ERRO] Conectar: %v\n", err)
			os.Exit(1)
		}
		qrData := map[string]string{
			"code":    "",
			"status":  "connected",
			"updated": time.Now().Format(time.RFC3339),
		}
		qrJSON, _ := json.Marshal(qrData)
		_ = os.WriteFile(filepath.Join(dataDir, "qrcode.json"), qrJSON, 0644)
	}

	fmt.Println("[OdinBOT] Conectado com sucesso!")

	// Iniciar verificacao de alugueis expirados
	go rentalChecker()

	// Aguardar sinal para encerrar
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c
	fmt.Println("\n[OdinBOT] Desconectando...")
	client.Disconnect()
}

// ============================================================
// Event Handler
// ============================================================

func eventHandler(rawEvt interface{}) {
	// Dispatch ALL events asynchronously so we never block whatsmeow's node processing pipeline.
	go func(evt interface{}) {
		switch v := evt.(type) {
		case *events.Connected:
			fmt.Println("[OdinBOT] Evento: Conectado com sucesso!")
			_ = client.SendPresence(context.Background(), types.PresenceAvailable)
			_ = v // avoid unused
		case *events.Message:
			handleMessage(v)
		case *events.GroupInfo:
			handleGroupEvent(v)
		case *events.JoinedGroup:
			handleJoinedGroup(v)
		case *events.Disconnected:
			fmt.Println("[OdinBOT] Evento: Desconectado!")
		}
	}(rawEvt)
}

func handleGroupEvent(evt *events.GroupInfo) {
	groupJID := evt.JID.String()
	cfg := getGroupConfig(groupJID)

	// Member join
	if evt.Join != nil && len(evt.Join) > 0 {
		if cfg.Welcome {
			for _, jid := range evt.Join {
				if isBlacklisted(jid.User) {
					removeMember(evt.JID, jid)
					sendText(evt.JID, fmt.Sprintf("*[OdinBOT]* @%s esta na lista negra e foi removido.", jid.User))
					continue
				}
				if cfg.Antifake && !strings.HasPrefix(jid.User, "55") {
					removeMember(evt.JID, jid)
					sendText(evt.JID, fmt.Sprintf("*[OdinBOT]* @%s removido (numero estrangeiro - anti-fake).", jid.User))
					continue
				}
				msg := cfg.WelcomeMsg
				msg = strings.ReplaceAll(msg, "{name}", "@"+jid.User)
				msg = strings.ReplaceAll(msg, "{group}", cfg.Name)
				msg = strings.ReplaceAll(msg, "{number}", jid.User)
				sendMention(evt.JID, fmt.Sprintf("*[OdinBOT]*\n\n%s", msg), []string{jid.User})
			}
		}
	}

	// Member leave
	if evt.Leave != nil && len(evt.Leave) > 0 && cfg.Goodbye {
		for _, jid := range evt.Leave {
			msg := cfg.GoodbyeMsg
			msg = strings.ReplaceAll(msg, "{name}", "@"+jid.User)
			msg = strings.ReplaceAll(msg, "{group}", cfg.Name)
			sendText(evt.JID, fmt.Sprintf("*[OdinBOT]*\n\n%s", msg))
		}
	}
}

func handleMessage(msg *events.Message) {
	if msg.Info.IsFromMe {
		return
	}

	chat := msg.Info.Chat
	sender := msg.Info.Sender
	isGroup := chat.Server == "g.us"
	text := getMessageText(msg)

	if text == "" {
		return
	}

	isOwner := isOwnerNumber(sender.User)

	// Verificar blacklist
	if isBlacklisted(sender.User) && isGroup {
		removeMember(chat, sender)
		sendText(chat, fmt.Sprintf("*[OdinBOT]* Usuario %s esta na lista negra e foi removido.", sender.User))
		return
	}

	// Verificar AFK
	checkAfk(chat, sender, text)

	if isGroup {
		groupJID := chat.String()
		cfg := getGroupConfig(groupJID)

		// Anti-link
		if cfg.Antilink && !isOwner && !isGroupAdmin(chat, sender) {
			if containsLink(text) {
				removeMember(chat, sender)
				sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s removido por enviar link.", sender.User))
				return
			}
		}

		// Anti-palavrao
		if cfg.AntiPalavrao && !isOwner && !isGroupAdmin(chat, sender) {
			if containsBadWord(groupJID, text) {
				addWarningAuto(groupJID, sender, "Palavra proibida detectada")
				sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s cuidado com as palavras! Advertencia aplicada.", sender.User))
				return
			}
		}

		// Only admin mode
		if cfg.OnlyAdm && !isOwner && !isGroupAdmin(chat, sender) {
			return
		}
	}

	// Processar comandos
	prefix := getPrefix(chat.String())
	if !strings.HasPrefix(text, prefix) {
		return
	}

	parts := strings.Fields(text[len(prefix):])
	if len(parts) == 0 {
		return
	}

	cmd := strings.ToLower(parts[0])
	args := ""
	if len(parts) > 1 {
		args = strings.Join(parts[1:], " ")
	}

	// Comandos de DONO (somente Erick Machine)
	if isOwner {
		switch cmd {
		case "aluguel", "add_contrat":
			cmdAluguel(chat, args)
			return
		case "verificar_aluguel":
			cmdVerificarAluguel(chat)
			return
		case "bcaluguel":
			cmdBroadcastAluguel(chat, args)
			return
		case "bc":
			cmdBroadcast(args)
			return
		case "join":
			cmdJoin(args)
			return
		case "sairgp", "exitgp":
			cmdLeaveGroup(chat)
			return
		case "listanegra":
			if args != "" {
				cmdAddBlacklist(chat, sender, args)
			} else {
				cmdShowBlacklist(chat)
			}
			return
		case "tirardalista":
			cmdRemoveBlacklist(chat, args)
			return
		case "addgold":
			return
		case "zerar_gold":
			return
		case "resetlevel":
			return
		case "nuke":
			cmdNuke(chat)
			return
		case "grupos":
			cmdListGroups(chat)
			return
		case "adddono":
			return
		case "cargo":
			cmdSetRole(chat, msg, args)
			return
		}
	}

	// Comandos ADM (admin do grupo ou dono)
	if isGroup && (isOwner || isGroupAdmin(chat, sender)) {
		switch cmd {
		case "ban":
			cmdBan(chat, msg)
			return
		case "advertir", "adverter":
			cmdWarn(chat, msg, sender, args)
			return
		case "checkwarnings", "ver_adv":
			cmdCheckWarnings(chat, msg)
			return
		case "removewarnings", "rm_adv":
			cmdRemoveWarning(chat, msg)
			return
		case "clearwarnings", "limpar_adv":
			cmdClearWarnings(chat)
			return
		case "advertidos", "lista_adv":
			cmdListWarnings(chat)
			return
		case "mute":
			cmdMute(chat, msg)
			return
		case "desmute":
			cmdUnmute(chat, msg)
			return
		case "promover":
			cmdPromote(chat, msg)
			return
		case "rebaixar":
			cmdDemote(chat, msg)
			return
		case "bemvindo":
			cmdToggleWelcome(chat)
			return
		case "antilink":
			cmdToggleAntilink(chat)
			return
		case "antifake":
			cmdToggleAntifake(chat)
			return
		case "antipalavra":
			cmdToggleAntiPalavrao(chat)
			return
		case "autosticker":
			cmdToggleAutoSticker(chat)
			return
		case "autodl":
			cmdToggleAutoDL(chat)
			return
		case "so_adm":
			cmdToggleOnlyAdmin(chat)
			return
		case "fechargp", "colloportus":
			cmdCloseGroup(chat)
			return
		case "abrirgp", "alohomora":
			cmdOpenGroup(chat)
			return
		case "nomegp":
			cmdSetGroupName(chat, args)
			return
		case "descgp":
			cmdSetGroupDesc(chat, args)
			return
		case "linkgp":
			cmdGetGroupLink(chat)
			return
		case "tagall", "marcar":
			cmdTagAll(chat, args)
			return
		case "totag", "hidetag":
			cmdHideTag(chat, args)
			return
		case "aceitar", "aceitarmembro":
			return
		case "banghost":
			cmdBanGhost(chat)
			return
		case "banfakes", "banfake":
			cmdBanFakes(chat)
			return
		case "inativos":
			return
		case "sorteio":
			cmdSorteio(chat)
			return
		case "status", "ativacoes":
			cmdGroupStatus(chat)
			return
		case "addpalavra", "add_palavra":
			cmdAddBadWord(chat, args)
			return
		case "delpalavra", "rm_palavra":
			cmdDelBadWord(chat, args)
			return
		case "listapalavrao":
			cmdListBadWords(chat)
			return
		case "anotar":
			cmdAddNote(chat, args)
			return
		case "anotacao", "anotacoes":
			cmdShowNotes(chat)
			return
		case "tirar_nota", "rmnota":
			cmdDelNote(chat, args)
			return
		case "deletar":
			return
		case "grupoinfo", "gpinfo":
			cmdGroupInfo(chat)
			return
		case "admins":
			cmdListAdmins(chat)
			return
		case "roleta":
			cmdRoleta(chat)
			return
		case "setmsg", "setmsgban":
			return
		case "block", "bloquearcmd":
			return
		case "liberarcmd":
			return
		}
	}

	// Comandos de TODOS
	switch cmd {
	case "menu":
		cmdMenu(chat, sender, isOwner, isGroup)
	case "ping":
		cmdPing(chat)
	case "info", "infobot":
		cmdInfo(chat)
	case "dono", "criador":
		cmdDono(chat)
	case "sticker", "s", "fig":
		cmdSticker(chat, msg)
	case "toimg":
		cmdToImg(chat, msg)
	case "perfil", "me":
		cmdProfile(chat, sender)
	case "simi":
		cmdSimi(chat, args)
	case "traduzir":
		cmdTraduzir(chat, args)
	case "clima":
		cmdClima(chat, args)
	case "signo":
		cmdSigno(chat, args)
	case "afk", "ausente":
		cmdSetAfk(chat, sender, args)
	case "ativo":
		cmdRemoveAfk(chat, sender)
	case "listarafk", "statusafk":
		cmdListAfk(chat)
	case "rankativo", "rankativos":
		cmdRankAtivos(chat)
	case "ppt":
		cmdPPT(chat, sender, args)
	case "chance":
		cmdChance(chat, args)
	case "sorte":
		cmdSorte(chat, sender)
	case "cantadas":
		cmdCantada(chat)
	case "fatos":
		cmdFatos(chat)
	case "conselho", "conselhobiblico":
		cmdConselho(chat)
	case "calculadora", "calcular":
		cmdCalc(chat, args)
	case "sn":
		cmdSimNao(chat)
	case "dado":
		cmdDado(chat)
	case "moedas":
		cmdMoedas(chat)
	case "help", "ajuda":
		cmdHelp(chat, sender)
	case "alugar":
		cmdAlugarInfo(chat)
	case "regras":
		cmdRegras(chat)
	case "bug", "sugestao":
		cmdBugReport(chat, sender, args)
	}
}

// ============================================================
// Message Helpers
// ============================================================

func getMessageText(msg *events.Message) string {
	if msg.Message == nil {
		return ""
	}
	if msg.Message.GetConversation() != "" {
		return msg.Message.GetConversation()
	}
	if msg.Message.GetExtendedTextMessage() != nil {
		return msg.Message.GetExtendedTextMessage().GetText()
	}
	if msg.Message.GetImageMessage() != nil {
		return msg.Message.GetImageMessage().GetCaption()
	}
	if msg.Message.GetVideoMessage() != nil {
		return msg.Message.GetVideoMessage().GetCaption()
	}
	return ""
}

func sendText(chat types.JID, text string) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	msg := &waE2E.Message{
		Conversation: proto.String(text),
	}
	_, err := client.SendMessage(ctx, chat, msg)
	if err != nil {
		fmt.Printf("[ERRO] Enviar mensagem: %v\n", err)
	}
}

func sendMention(chat types.JID, text string, mentions []string) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	jids := make([]string, len(mentions))
	for i, m := range mentions {
		jids[i] = m + "@s.whatsapp.net"
	}
	msg := &waE2E.Message{
		ExtendedTextMessage: &waE2E.ExtendedTextMessage{
			Text: proto.String(text),
			ContextInfo: &waE2E.ContextInfo{
				MentionedJID: jids,
			},
		},
	}
	_, err := client.SendMessage(ctx, chat, msg)
	if err != nil {
		fmt.Printf("[ERRO] Enviar mention: %v\n", err)
	}
}

func isOwnerNumber(number string) bool {
	return number == OwnerNumber || number == "5592996529610"
}

func getPrefix(groupJID string) string {
	botData.mu.RLock()
	defer botData.mu.RUnlock()
	if cfg, ok := botData.Groups[groupJID]; ok && cfg.Prefix != "" {
		return cfg.Prefix
	}
	return DefaultPrefix
}

// ============================================================
// Group Helpers
// ============================================================

func getGroupConfig(jid string) *GroupConfig {
	botData.mu.Lock()
	defer botData.mu.Unlock()
	if cfg, ok := botData.Groups[jid]; ok {
		return cfg
	}
	cfg := &GroupConfig{
		JID:        jid,
		Welcome:    true,
		WelcomeMsg: "Bem-vindo(a) ao grupo! Leia as regras.",
		Goodbye:    true,
		GoodbyeMsg: "Ate mais! Sentiremos sua falta.",
		Prefix:     DefaultPrefix,
		Active:     true,
	}
	botData.Groups[jid] = cfg
	saveBotData()
	return cfg
}

func isGroupAdmin(chat types.JID, user types.JID) bool {
	info, err := client.GetGroupInfo(context.Background(), chat)
	if err != nil {
		return false
	}
	for _, p := range info.Participants {
		if p.JID.User == user.User {
			return p.IsAdmin || p.IsSuperAdmin
		}
	}
	return false
}

func isBotAdmin(chat types.JID) bool {
	if client.Store.ID == nil {
		return false
	}
	return isGroupAdmin(chat, *client.Store.ID)
}

func removeMember(chat types.JID, user types.JID) {
	if !isBotAdmin(chat) {
		sendText(chat, "*[OdinBOT]* Preciso ser admin para remover membros.")
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	_, err := client.UpdateGroupParticipants(ctx, chat, []types.JID{user}, whatsmeow.ParticipantChangeRemove)
	if err != nil {
		fmt.Printf("[ERRO] Remover membro: %v\n", err)
	}
}

func containsLink(text string) bool {
	lower := strings.ToLower(text)
	links := []string{"http://", "https://", "www.", "chat.whatsapp.com", ".com/", ".br/", ".net/", "bit.ly", "wa.me"}
	for _, l := range links {
		if strings.Contains(lower, l) {
			allowed := []string{"youtube.com", "youtu.be", "instagram.com", "tiktok.com"}
			for _, a := range allowed {
				if strings.Contains(lower, a) {
					return false
				}
			}
			return true
		}
	}
	return false
}

func containsBadWord(groupJID, text string) bool {
	botData.mu.RLock()
	defer botData.mu.RUnlock()
	words, ok := botData.BadWords[groupJID]
	if !ok {
		return false
	}
	lower := strings.ToLower(text)
	for _, w := range words {
		if strings.Contains(lower, strings.ToLower(w)) {
			return true
		}
	}
	return false
}

func isBlacklisted(number string) bool {
	botData.mu.RLock()
	defer botData.mu.RUnlock()
	_, ok := botData.Blacklist[number]
	return ok
}

func getMentionedJID(msg *events.Message) *types.JID {
	if msg.Message == nil {
		return nil
	}
	var ctx *waE2E.ContextInfo
	if msg.Message.GetExtendedTextMessage() != nil {
		ctx = msg.Message.GetExtendedTextMessage().GetContextInfo()
	}
	if ctx == nil {
		return nil
	}
	if len(ctx.GetMentionedJID()) > 0 {
		jid, err := types.ParseJID(ctx.GetMentionedJID()[0])
		if err == nil {
			return &jid
		}
	}
	if ctx.GetParticipant() != "" {
		jid, err := types.ParseJID(ctx.GetParticipant())
		if err == nil {
			return &jid
		}
	}
	return nil
}

// ============================================================
// Group Events
// ============================================================

func handleJoinedGroup(evt *events.JoinedGroup) {
	sendText(evt.JID, fmt.Sprintf(
		"*%s conectado!*\n\nOla! Sou o %s, bot do %s.\nUse *%smenu* para ver meus comandos.\nDono: %s",
		BotName, BotName, OwnerName, DefaultPrefix, OwnerName,
	))
}

// ============================================================
// AFK System
// ============================================================

func cmdSetAfk(chat types.JID, sender types.JID, reason string) {
	if reason == "" {
		reason = "Sem motivo informado"
	}
	botData.mu.Lock()
	botData.AfkUsers[sender.User] = reason
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s agora esta AFK: %s", sender.User, reason))
}

func cmdRemoveAfk(chat types.JID, sender types.JID) {
	botData.mu.Lock()
	delete(botData.AfkUsers, sender.User)
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s voltou da ausencia!", sender.User))
}

func cmdListAfk(chat types.JID) {
	botData.mu.RLock()
	defer botData.mu.RUnlock()
	if len(botData.AfkUsers) == 0 {
		sendText(chat, "*[OdinBOT]* Nenhum usuario AFK.")
		return
	}
	msg := "*[OdinBOT] Usuarios AFK:*\n\n"
	for user, reason := range botData.AfkUsers {
		msg += fmt.Sprintf("- @%s: %s\n", user, reason)
	}
	sendText(chat, msg)
}

func checkAfk(chat types.JID, sender types.JID, _ string) {
	botData.mu.RLock()
	reason, ok := botData.AfkUsers[sender.User]
	botData.mu.RUnlock()
	if ok {
		botData.mu.Lock()
		delete(botData.AfkUsers, sender.User)
		botData.mu.Unlock()
		saveBotData()
		sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s voltou! (estava AFK: %s)", sender.User, reason))
	}
}

// ============================================================
// Owner Commands
// ============================================================

func cmdAluguel(chat types.JID, args string) {
	parts := strings.Split(args, "|")
	if len(parts) < 5 {
		sendText(chat, "*[OdinBOT]* Uso: #aluguel grupo_jid|nome_grupo|dono_num|plano|valor\nEx: #aluguel 120363...@g.us|MeuGrupo|5511999|Mensal|50")
		return
	}
	val := 0.0
	fmt.Sscanf(strings.TrimSpace(parts[4]), "%f", &val)
	ownerName := ""
	if len(parts) > 5 {
		ownerName = strings.TrimSpace(parts[5])
	}
	rental := Rental{
		GroupJID:  strings.TrimSpace(parts[0]),
		GroupName: strings.TrimSpace(parts[1]),
		OwnerNum:  strings.TrimSpace(parts[2]),
		OwnerName: ownerName,
		Plan:      strings.TrimSpace(parts[3]),
		Value:     val,
		StartDate: time.Now().Format("2006-01-02"),
		EndDate:   calcEndDate(strings.TrimSpace(parts[3])),
		Active:    true,
	}
	botData.mu.Lock()
	botData.Rentals = append(botData.Rentals, rental)
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Aluguel registrado!\nGrupo: %s\nPlano: %s\nValor: R$%.2f\nVencimento: %s",
		rental.GroupName, rental.Plan, rental.Value, rental.EndDate))
}

func cmdVerificarAluguel(chat types.JID) {
	botData.mu.RLock()
	defer botData.mu.RUnlock()
	if len(botData.Rentals) == 0 {
		sendText(chat, "*[OdinBOT]* Nenhum aluguel registrado.")
		return
	}
	msg := "*[OdinBOT] Alugueis:*\n\n"
	for i, r := range botData.Rentals {
		status := "Ativo"
		if !r.Active {
			status = "Expirado"
		}
		msg += fmt.Sprintf("%d. %s\n   Dono: %s | Plano: %s | R$%.2f\n   Venc: %s | Status: %s\n\n",
			i+1, r.GroupName, r.OwnerNum, r.Plan, r.Value, r.EndDate, status)
	}
	sendText(chat, msg)
}

func cmdBroadcastAluguel(chat types.JID, args string) {
	botData.mu.RLock()
	defer botData.mu.RUnlock()
	count := 0
	for _, r := range botData.Rentals {
		if r.Active {
			jid, err := types.ParseJID(r.GroupJID)
			if err == nil {
				sendText(jid, fmt.Sprintf("*[OdinBOT - Aviso de Aluguel]*\n\n%s", args))
				count++
			}
		}
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Broadcast enviado para %d grupos alugados.", count))
}

func cmdBroadcast(args string) {
	if args == "" {
		return
	}
	groups, err := client.GetJoinedGroups(context.Background())
	if err != nil {
		return
	}
	for _, g := range groups {
		sendText(g.JID, fmt.Sprintf("*[OdinBOT - Broadcast]*\n\n%s", args))
		time.Sleep(500 * time.Millisecond)
	}
}

func cmdJoin(link string) {
	link = strings.TrimSpace(link)
	if !strings.Contains(link, "chat.whatsapp.com") {
		return
	}
	parts := strings.Split(link, "/")
	code := parts[len(parts)-1]
	_, err := client.JoinGroupWithLink(context.Background(), code)
	if err != nil {
		fmt.Printf("[ERRO] Entrar no grupo: %v\n", err)
	}
}

func cmdLeaveGroup(chat types.JID) {
	sendText(chat, "*[OdinBOT]* Saindo do grupo... Ate mais!")
	time.Sleep(1 * time.Second)
	_ = client.LeaveGroup(context.Background(), chat)
}

func cmdNuke(chat types.JID) {
	if !isBotAdmin(chat) {
		sendText(chat, "*[OdinBOT]* Preciso ser admin.")
		return
	}
	info, err := client.GetGroupInfo(context.Background(), chat)
	if err != nil {
		return
	}
	var toRemove []types.JID
	for _, p := range info.Participants {
		if p.JID.User != client.Store.ID.User && !isOwnerNumber(p.JID.User) {
			toRemove = append(toRemove, p.JID)
		}
	}
	if len(toRemove) > 0 {
		_, _ = client.UpdateGroupParticipants(context.Background(), chat, toRemove, whatsmeow.ParticipantChangeRemove)
		sendText(chat, fmt.Sprintf("*[OdinBOT]* Nuke executado. %d membros removidos.", len(toRemove)))
	}
}

func cmdListGroups(chat types.JID) {
	groups, err := client.GetJoinedGroups(context.Background())
	if err != nil {
		sendText(chat, "*[OdinBOT]* Erro ao listar grupos.")
		return
	}
	msg := fmt.Sprintf("*[OdinBOT] Grupos (%d):*\n\n", len(groups))
	for i, g := range groups {
		msg += fmt.Sprintf("%d. %s\n   %s | %d membros\n\n", i+1, g.Name, g.JID.String(), len(g.Participants))
	}
	sendText(chat, msg)
}

func cmdSetRole(chat types.JID, msg *events.Message, args string) {
	target := getMentionedJID(msg)
	if target == nil || args == "" {
		sendText(chat, "*[OdinBOT]* Uso: #cargo @usuario administrador/moderador/auxiliar")
		return
	}
	parts := strings.Fields(args)
	role := "membro"
	if len(parts) > 0 {
		role = strings.ToLower(parts[len(parts)-1])
	}
	validRoles := map[string]bool{"administrador": true, "moderador": true, "auxiliar": true, "membro": true}
	if !validRoles[role] {
		sendText(chat, "*[OdinBOT]* Cargos validos: administrador, moderador, auxiliar, membro")
		return
	}
	gJID := chat.String()
	botData.mu.Lock()
	if botData.Roles[gJID] == nil {
		botData.Roles[gJID] = make(map[string]string)
	}
	botData.Roles[gJID][target.User] = role
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s agora e %s!", target.User, role))
}

// ============================================================
// Admin Commands
// ============================================================

func cmdBan(chat types.JID, msg *events.Message) {
	target := getMentionedJID(msg)
	if target == nil {
		sendText(chat, "*[OdinBOT]* Mencione alguem para banir.")
		return
	}
	if isOwnerNumber(target.User) {
		sendText(chat, "*[OdinBOT]* Nao posso banir o dono!")
		return
	}
	removeMember(chat, *target)
	sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s foi banido!", target.User))
}

func cmdWarn(chat types.JID, msg *events.Message, issuer types.JID, reason string) {
	target := getMentionedJID(msg)
	if target == nil {
		sendText(chat, "*[OdinBOT]* Mencione alguem para advertir.")
		return
	}
	if isOwnerNumber(target.User) {
		sendText(chat, "*[OdinBOT]* Nao posso advertir o dono!")
		return
	}
	if reason == "" {
		reason = "Sem motivo especificado"
	}
	gJID := chat.String()
	w := Warning{
		GroupJID: gJID,
		UserJID:  target.User,
		UserName: target.User,
		Reason:   reason,
		Date:     time.Now().Format("2006-01-02 15:04"),
		IssuedBy: issuer.User,
	}
	botData.mu.Lock()
	botData.Warnings[gJID] = append(botData.Warnings[gJID], w)
	count := 0
	for _, ww := range botData.Warnings[gJID] {
		if ww.UserJID == target.User {
			count++
		}
	}
	botData.mu.Unlock()
	saveBotData()

	sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s advertido! (%d/3)\nMotivo: %s", target.User, count, reason))

	if count >= 3 {
		removeMember(chat, *target)
		botData.mu.Lock()
		botData.Blacklist[target.User] = BlacklistEntry{
			Number:  target.User,
			Reason:  "3 advertencias",
			Date:    time.Now().Format("2006-01-02"),
			AddedBy: "auto",
		}
		botData.mu.Unlock()
		saveBotData()
		sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s atingiu 3 advertencias e foi banido + lista negra!", target.User))
	}
}

func addWarningAuto(groupJID string, user types.JID, reason string) {
	w := Warning{
		GroupJID: groupJID,
		UserJID:  user.User,
		UserName: user.User,
		Reason:   reason,
		Date:     time.Now().Format("2006-01-02 15:04"),
		IssuedBy: "OdinBOT",
	}
	botData.mu.Lock()
	botData.Warnings[groupJID] = append(botData.Warnings[groupJID], w)
	botData.mu.Unlock()
	saveBotData()
}

func cmdCheckWarnings(chat types.JID, msg *events.Message) {
	target := getMentionedJID(msg)
	if target == nil {
		sendText(chat, "*[OdinBOT]* Mencione alguem para ver advertencias.")
		return
	}
	gJID := chat.String()
	botData.mu.RLock()
	warns := botData.Warnings[gJID]
	botData.mu.RUnlock()
	count := 0
	details := ""
	for _, w := range warns {
		if w.UserJID == target.User {
			count++
			details += fmt.Sprintf("  %d. %s - %s\n", count, w.Reason, w.Date)
		}
	}
	if count == 0 {
		sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s nao tem advertencias.", target.User))
	} else {
		sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s tem %d advertencia(s):\n%s", target.User, count, details))
	}
}

func cmdRemoveWarning(chat types.JID, msg *events.Message) {
	target := getMentionedJID(msg)
	if target == nil {
		sendText(chat, "*[OdinBOT]* Mencione alguem para remover advertencia.")
		return
	}
	gJID := chat.String()
	botData.mu.Lock()
	warns := botData.Warnings[gJID]
	for i := len(warns) - 1; i >= 0; i-- {
		if warns[i].UserJID == target.User {
			botData.Warnings[gJID] = append(warns[:i], warns[i+1:]...)
			break
		}
	}
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Uma advertencia de @%s foi removida.", target.User))
}

func cmdClearWarnings(chat types.JID) {
	gJID := chat.String()
	botData.mu.Lock()
	delete(botData.Warnings, gJID)
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, "*[OdinBOT]* Todas as advertencias do grupo foram limpas.")
}

func cmdListWarnings(chat types.JID) {
	gJID := chat.String()
	botData.mu.RLock()
	warns := botData.Warnings[gJID]
	botData.mu.RUnlock()
	if len(warns) == 0 {
		sendText(chat, "*[OdinBOT]* Nenhuma advertencia neste grupo.")
		return
	}
	msg := "*[OdinBOT] Advertidos:*\n\n"
	userWarns := make(map[string]int)
	for _, w := range warns {
		userWarns[w.UserJID]++
	}
	for user, count := range userWarns {
		msg += fmt.Sprintf("- @%s: %d advertencia(s)\n", user, count)
	}
	sendText(chat, msg)
}

func cmdMute(chat types.JID, msg *events.Message) {
	target := getMentionedJID(msg)
	if target == nil {
		sendText(chat, "*[OdinBOT]* Mencione alguem para mutar.")
		return
	}
	gJID := chat.String()
	botData.mu.Lock()
	if botData.MutedUsers[gJID] == nil {
		botData.MutedUsers[gJID] = make(map[string]bool)
	}
	botData.MutedUsers[gJID][target.User] = true
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s foi mutado.", target.User))
}

func cmdUnmute(chat types.JID, msg *events.Message) {
	target := getMentionedJID(msg)
	if target == nil {
		sendText(chat, "*[OdinBOT]* Mencione alguem para desmutar.")
		return
	}
	gJID := chat.String()
	botData.mu.Lock()
	if botData.MutedUsers[gJID] != nil {
		delete(botData.MutedUsers[gJID], target.User)
	}
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s foi desmutado.", target.User))
}

func cmdPromote(chat types.JID, msg *events.Message) {
	target := getMentionedJID(msg)
	if target == nil {
		sendText(chat, "*[OdinBOT]* Mencione alguem para promover.")
		return
	}
	_, err := client.UpdateGroupParticipants(context.Background(), chat, []types.JID{*target}, whatsmeow.ParticipantChangePromote)
	if err != nil {
		sendText(chat, "*[OdinBOT]* Erro ao promover.")
		return
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s foi promovido a admin!", target.User))
}

func cmdDemote(chat types.JID, msg *events.Message) {
	target := getMentionedJID(msg)
	if target == nil {
		sendText(chat, "*[OdinBOT]* Mencione alguem para rebaixar.")
		return
	}
	_, err := client.UpdateGroupParticipants(context.Background(), chat, []types.JID{*target}, whatsmeow.ParticipantChangeDemote)
	if err != nil {
		sendText(chat, "*[OdinBOT]* Erro ao rebaixar.")
		return
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s foi rebaixado.", target.User))
}

func cmdToggleWelcome(chat types.JID) {
	gJID := chat.String()
	cfg := getGroupConfig(gJID)
	botData.mu.Lock()
	cfg.Welcome = !cfg.Welcome
	botData.mu.Unlock()
	saveBotData()
	status := "ativado"
	if !cfg.Welcome {
		status = "desativado"
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Bem-vindo %s!", status))
}

func cmdToggleAntilink(chat types.JID) {
	gJID := chat.String()
	cfg := getGroupConfig(gJID)
	botData.mu.Lock()
	cfg.Antilink = !cfg.Antilink
	botData.mu.Unlock()
	saveBotData()
	status := "ativado"
	if !cfg.Antilink {
		status = "desativado"
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Anti-link %s!", status))
}

func cmdToggleAntifake(chat types.JID) {
	gJID := chat.String()
	cfg := getGroupConfig(gJID)
	botData.mu.Lock()
	cfg.Antifake = !cfg.Antifake
	botData.mu.Unlock()
	saveBotData()
	status := "ativado"
	if !cfg.Antifake {
		status = "desativado"
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Anti-fake %s!", status))
}

func cmdToggleAntiPalavrao(chat types.JID) {
	gJID := chat.String()
	cfg := getGroupConfig(gJID)
	botData.mu.Lock()
	cfg.AntiPalavrao = !cfg.AntiPalavrao
	botData.mu.Unlock()
	saveBotData()
	status := "ativado"
	if !cfg.AntiPalavrao {
		status = "desativado"
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Anti-palavrao %s!", status))
}

func cmdToggleAutoSticker(chat types.JID) {
	gJID := chat.String()
	cfg := getGroupConfig(gJID)
	botData.mu.Lock()
	cfg.AutoSticker = !cfg.AutoSticker
	botData.mu.Unlock()
	saveBotData()
	status := "ativado"
	if !cfg.AutoSticker {
		status = "desativado"
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Auto-sticker %s!", status))
}

func cmdToggleAutoDL(chat types.JID) {
	gJID := chat.String()
	cfg := getGroupConfig(gJID)
	botData.mu.Lock()
	cfg.AutoDL = !cfg.AutoDL
	botData.mu.Unlock()
	saveBotData()
	status := "ativado"
	if !cfg.AutoDL {
		status = "desativado"
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Auto-download %s!", status))
}

func cmdToggleOnlyAdmin(chat types.JID) {
	gJID := chat.String()
	cfg := getGroupConfig(gJID)
	botData.mu.Lock()
	cfg.OnlyAdm = !cfg.OnlyAdm
	botData.mu.Unlock()
	saveBotData()
	status := "ativado"
	if !cfg.OnlyAdm {
		status = "desativado"
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Modo so-admin %s!", status))
}

func cmdCloseGroup(chat types.JID) {
	if !isBotAdmin(chat) {
		sendText(chat, "*[OdinBOT]* Preciso ser admin.")
		return
	}
	_ = client.SetGroupAnnounce(context.Background(), chat, true)
	sendText(chat, "*[OdinBOT]* Grupo fechado! Somente admins podem enviar mensagens.")
}

func cmdOpenGroup(chat types.JID) {
	if !isBotAdmin(chat) {
		sendText(chat, "*[OdinBOT]* Preciso ser admin.")
		return
	}
	_ = client.SetGroupAnnounce(context.Background(), chat, false)
	sendText(chat, "*[OdinBOT]* Grupo aberto! Todos podem enviar mensagens.")
}

func cmdSetGroupName(chat types.JID, name string) {
	if name == "" {
		sendText(chat, "*[OdinBOT]* Uso: #nomegp Novo Nome")
		return
	}
	_ = client.SetGroupName(context.Background(), chat, name)
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Nome do grupo alterado para: %s", name))
}

func cmdSetGroupDesc(chat types.JID, desc string) {
	if desc == "" {
		sendText(chat, "*[OdinBOT]* Uso: #descgp Nova descricao")
		return
	}
	_ = client.SetGroupTopic(context.Background(), chat, "", "", desc)
	sendText(chat, "*[OdinBOT]* Descricao do grupo atualizada!")
}

func cmdGetGroupLink(chat types.JID) {
	link, err := client.GetGroupInviteLink(context.Background(), chat, false)
	if err != nil {
		sendText(chat, "*[OdinBOT]* Erro ao obter link. Preciso ser admin.")
		return
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Link do grupo:\nhttps://chat.whatsapp.com/%s", link))
}

func cmdTagAll(chat types.JID, text string) {
	info, err := client.GetGroupInfo(context.Background(), chat)
	if err != nil {
		return
	}
	if text == "" {
		text = "Atencao membros!"
	}
	msg := fmt.Sprintf("*[OdinBOT] %s*\n\n", text)
	var mentions []string
	for _, p := range info.Participants {
		msg += fmt.Sprintf("@%s\n", p.JID.User)
		mentions = append(mentions, p.JID.User)
	}
	sendMention(chat, msg, mentions)
}

func cmdHideTag(chat types.JID, text string) {
	info, err := client.GetGroupInfo(context.Background(), chat)
	if err != nil {
		return
	}
	if text == "" {
		text = "."
	}
	var mentions []string
	for _, p := range info.Participants {
		mentions = append(mentions, p.JID.User)
	}
	sendMention(chat, text, mentions)
}

func cmdBanGhost(chat types.JID) {
	if !isBotAdmin(chat) {
		sendText(chat, "*[OdinBOT]* Preciso ser admin.")
		return
	}
	info, err := client.GetGroupInfo(context.Background(), chat)
	if err != nil {
		return
	}
	var ghosts []types.JID
	for _, p := range info.Participants {
		if !p.IsAdmin && !p.IsSuperAdmin && !isOwnerNumber(p.JID.User) {
			_, err := client.GetProfilePictureInfo(context.Background(), p.JID, &whatsmeow.GetProfilePictureParams{})
			if err != nil {
				ghosts = append(ghosts, p.JID)
			}
		}
	}
	if len(ghosts) > 0 {
		_, _ = client.UpdateGroupParticipants(context.Background(), chat, ghosts, whatsmeow.ParticipantChangeRemove)
		sendText(chat, fmt.Sprintf("*[OdinBOT]* %d ghosts removidos!", len(ghosts)))
	} else {
		sendText(chat, "*[OdinBOT]* Nenhum ghost encontrado.")
	}
}

func cmdBanFakes(chat types.JID) {
	if !isBotAdmin(chat) {
		sendText(chat, "*[OdinBOT]* Preciso ser admin.")
		return
	}
	info, err := client.GetGroupInfo(context.Background(), chat)
	if err != nil {
		return
	}
	var fakes []types.JID
	for _, p := range info.Participants {
		if !p.IsAdmin && !p.IsSuperAdmin && !isOwnerNumber(p.JID.User) {
			if !strings.HasPrefix(p.JID.User, "55") {
				fakes = append(fakes, p.JID)
			}
		}
	}
	if len(fakes) > 0 {
		_, _ = client.UpdateGroupParticipants(context.Background(), chat, fakes, whatsmeow.ParticipantChangeRemove)
		sendText(chat, fmt.Sprintf("*[OdinBOT]* %d fakes (numeros estrangeiros) removidos!", len(fakes)))
	} else {
		sendText(chat, "*[OdinBOT]* Nenhum fake encontrado.")
	}
}

func cmdSorteio(chat types.JID) {
	info, err := client.GetGroupInfo(context.Background(), chat)
	if err != nil {
		return
	}
	if len(info.Participants) == 0 {
		return
	}
	winner := info.Participants[rand.Intn(len(info.Participants))]
	sendText(chat, fmt.Sprintf("*[OdinBOT] SORTEIO!*\n\nO sortudo(a) e: @%s! Parabens!", winner.JID.User))
}

func cmdGroupStatus(chat types.JID) {
	gJID := chat.String()
	cfg := getGroupConfig(gJID)
	boolStr := func(b bool) string {
		if b {
			return "ON"
		}
		return "OFF"
	}
	msg := fmt.Sprintf(`*[OdinBOT] Status do Grupo:*

- Bem-vindo: %s
- Anti-link: %s
- Anti-fake: %s
- Anti-palavrao: %s
- Auto-sticker: %s
- Auto-download: %s
- So admin: %s
- NSFW: %s
- Prefixo: %s
- Ativo: %s`,
		boolStr(cfg.Welcome), boolStr(cfg.Antilink), boolStr(cfg.Antifake),
		boolStr(cfg.AntiPalavrao), boolStr(cfg.AutoSticker), boolStr(cfg.AutoDL),
		boolStr(cfg.OnlyAdm), boolStr(cfg.NSFW), cfg.Prefix, boolStr(cfg.Active))
	sendText(chat, msg)
}

func cmdAddBadWord(chat types.JID, word string) {
	if word == "" {
		sendText(chat, "*[OdinBOT]* Uso: #addpalavra <palavra>")
		return
	}
	gJID := chat.String()
	botData.mu.Lock()
	botData.BadWords[gJID] = append(botData.BadWords[gJID], word)
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Palavra '%s' adicionada a lista proibida.", word))
}

func cmdDelBadWord(chat types.JID, word string) {
	if word == "" {
		sendText(chat, "*[OdinBOT]* Uso: #delpalavra <palavra>")
		return
	}
	gJID := chat.String()
	botData.mu.Lock()
	words := botData.BadWords[gJID]
	for i, w := range words {
		if strings.EqualFold(w, word) {
			botData.BadWords[gJID] = append(words[:i], words[i+1:]...)
			break
		}
	}
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Palavra '%s' removida da lista.", word))
}

func cmdListBadWords(chat types.JID) {
	gJID := chat.String()
	botData.mu.RLock()
	words := botData.BadWords[gJID]
	botData.mu.RUnlock()
	if len(words) == 0 {
		sendText(chat, "*[OdinBOT]* Lista de palavras proibidas vazia.")
		return
	}
	msg := "*[OdinBOT] Palavras Proibidas:*\n\n"
	for i, w := range words {
		msg += fmt.Sprintf("%d. %s\n", i+1, w)
	}
	sendText(chat, msg)
}

func cmdAddNote(chat types.JID, text string) {
	if text == "" {
		sendText(chat, "*[OdinBOT]* Uso: #anotar <texto>")
		return
	}
	gJID := chat.String()
	botData.mu.Lock()
	botData.Notes[gJID] = append(botData.Notes[gJID], text)
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, "*[OdinBOT]* Nota adicionada!")
}

func cmdShowNotes(chat types.JID) {
	gJID := chat.String()
	botData.mu.RLock()
	notes := botData.Notes[gJID]
	botData.mu.RUnlock()
	if len(notes) == 0 {
		sendText(chat, "*[OdinBOT]* Nenhuma anotacao.")
		return
	}
	msg := "*[OdinBOT] Anotacoes:*\n\n"
	for i, n := range notes {
		msg += fmt.Sprintf("%d. %s\n", i+1, n)
	}
	sendText(chat, msg)
}

func cmdDelNote(chat types.JID, idx string) {
	gJID := chat.String()
	var i int
	fmt.Sscanf(idx, "%d", &i)
	i--
	botData.mu.Lock()
	notes := botData.Notes[gJID]
	if i >= 0 && i < len(notes) {
		botData.Notes[gJID] = append(notes[:i], notes[i+1:]...)
		botData.mu.Unlock()
		saveBotData()
		sendText(chat, "*[OdinBOT]* Nota removida!")
	} else {
		botData.mu.Unlock()
		sendText(chat, "*[OdinBOT]* Numero da nota invalido.")
	}
}

func cmdGroupInfo(chat types.JID) {
	info, err := client.GetGroupInfo(context.Background(), chat)
	if err != nil {
		sendText(chat, "*[OdinBOT]* Erro ao obter info do grupo.")
		return
	}
	admins := 0
	for _, p := range info.Participants {
		if p.IsAdmin || p.IsSuperAdmin {
			admins++
		}
	}
	msg := fmt.Sprintf(`*[OdinBOT] Info do Grupo:*

- Nome: %s
- Membros: %d
- Admins: %d
- Descricao: %s`,
		info.Name, len(info.Participants), admins, info.Topic)
	sendText(chat, msg)
}

func cmdListAdmins(chat types.JID) {
	info, err := client.GetGroupInfo(context.Background(), chat)
	if err != nil {
		return
	}
	msg := "*[OdinBOT] Admins:*\n\n"
	var mentions []string
	for _, p := range info.Participants {
		if p.IsAdmin || p.IsSuperAdmin {
			role := "Admin"
			if p.IsSuperAdmin {
				role = "Super Admin"
			}
			msg += fmt.Sprintf("- @%s (%s)\n", p.JID.User, role)
			mentions = append(mentions, p.JID.User)
		}
	}
	sendMention(chat, msg, mentions)
}

func cmdRoleta(chat types.JID) {
	info, err := client.GetGroupInfo(context.Background(), chat)
	if err != nil {
		return
	}
	var nonAdmin []types.JID
	for _, p := range info.Participants {
		if !p.IsAdmin && !p.IsSuperAdmin && !isOwnerNumber(p.JID.User) {
			nonAdmin = append(nonAdmin, p.JID)
		}
	}
	if len(nonAdmin) == 0 {
		sendText(chat, "*[OdinBOT]* Nenhum membro para a roleta.")
		return
	}
	victim := nonAdmin[rand.Intn(len(nonAdmin))]
	sendText(chat, fmt.Sprintf("*[OdinBOT] ROLETA RUSSA!*\n\nA bala acertou @%s!", victim.User))
	removeMember(chat, victim)
}

// ============================================================
// Blacklist Commands
// ============================================================

func cmdAddBlacklist(chat types.JID, sender types.JID, number string) {
	number = strings.TrimSpace(number)
	botData.mu.Lock()
	botData.Blacklist[number] = BlacklistEntry{
		Number:  number,
		Reason:  "Adicionado manualmente",
		Date:    time.Now().Format("2006-01-02"),
		AddedBy: sender.User,
	}
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* %s adicionado a lista negra.", number))
}

func cmdRemoveBlacklist(chat types.JID, number string) {
	number = strings.TrimSpace(number)
	botData.mu.Lock()
	delete(botData.Blacklist, number)
	botData.mu.Unlock()
	saveBotData()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* %s removido da lista negra.", number))
}

func cmdShowBlacklist(chat types.JID) {
	botData.mu.RLock()
	defer botData.mu.RUnlock()
	if len(botData.Blacklist) == 0 {
		sendText(chat, "*[OdinBOT]* Lista negra vazia.")
		return
	}
	msg := "*[OdinBOT] Lista Negra:*\n\n"
	i := 1
	for _, b := range botData.Blacklist {
		msg += fmt.Sprintf("%d. %s - %s (%s)\n", i, b.Number, b.Reason, b.Date)
		i++
	}
	sendText(chat, msg)
}

// ============================================================
// General Commands
// ============================================================

func cmdMenu(chat types.JID, sender types.JID, isOwner bool, isGroup bool) {
	prefix := getPrefix(chat.String())
	menu := fmt.Sprintf(`*╔══════════════════╗*
*║     %s - MENU     ║*
*╚══════════════════╝*

*Dono: %s*
*Prefixo: %s*

*--- GERAL ---*
%smenu - Este menu
%sping - Testar bot
%sinfo - Info do bot
%sdono - Info do dono
%sajuda - Como usar
%salugar - Info aluguel

*--- FIGURINHAS ---*
%ss / %sfig - Criar figurinha
%stoimg - Figurinha para imagem

*--- UTILIDADES ---*
%straduzir - Traduzir texto
%sclima - Previsao do tempo
%ssigno - Horoscopo
%scalcular - Calculadora
%ssn - Sim ou Nao
%ssorte - Sorte do dia
%scantadas - Cantada aleatoria
%sfatos - Fato aleatorio
%sconselho - Conselho aleatorio

*--- GRUPO ---*
%sregras - Regras do grupo
%sadmins - Listar admins
%sperfil - Seu perfil
%srankativos - Rank de ativos
%safk - Ficar ausente
%sativo - Voltar da ausencia

*--- JOGOS ---*
%sppt - Pedra Papel Tesoura
%schance - Porcentagem
%smoedas - Cara ou Coroa
%sdado - Jogar dado`, BotName, OwnerName, prefix,
		prefix, prefix, prefix, prefix, prefix, prefix,
		prefix, prefix, prefix,
		prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix, prefix,
		prefix, prefix, prefix, prefix, prefix, prefix,
		prefix, prefix, prefix, prefix)

	if isGroup && (isOwner || isGroupAdmin(chat, sender)) {
		menu += fmt.Sprintf(`

*--- ADM ---*
%sban - Banir membro
%sadvertir - Advertir
%scheckwarnings - Ver warns
%sremovewarnings - Remover warn
%sclearwarnings - Limpar warns
%smute / %sdesmute - Mutar
%spromover / %srebaixar
%sbemvindo - Ativar/desativar
%santilink - Anti-link
%santifake - Anti-fake
%santipalavra - Anti-palavrao
%sautosticker - Auto-figurinha
%sso_adm - Modo admin
%sfechargp / %sabrirgp
%snomegp - Nome do grupo
%sdescgp - Descricao
%slinkgp - Link do grupo
%stagall - Marcar todos
%stotag - Tag oculta
%ssorteio - Sortear membro
%sroleta - Roleta russa
%sstatus - Status do grupo
%sadmins - Listar admins
%sgrupoinfo - Info do grupo
%saddpalavra / %sdelpalavra
%sanotar / %sanotacao
%sbanghost - Banir ghosts
%sbanfakes - Banir fakes`, prefix, prefix, prefix, prefix, prefix,
			prefix, prefix, prefix, prefix, prefix, prefix,
			prefix, prefix, prefix, prefix, prefix, prefix,
			prefix, prefix, prefix, prefix, prefix, prefix, prefix,
			prefix, prefix, prefix, prefix, prefix, prefix, prefix)
	}

	if isOwner {
		menu += fmt.Sprintf(`

*--- DONO ---*
%saluguel - Gerenciar aluguel
%sverificar_aluguel - Ver alugueis
%sbcaluguel - BC alugueis
%sbc - Broadcast geral
%sjoin - Entrar em grupo
%ssairgp - Sair do grupo
%snuke - Nuke grupo
%sgrupos - Listar grupos
%scargo - Definir cargo
%slistanegra - Lista negra
%stirardalista - Remover da lista`, prefix, prefix, prefix, prefix, prefix,
			prefix, prefix, prefix, prefix, prefix, prefix)
	}

	sendText(chat, menu)
}

func cmdPing(chat types.JID) {
	start := time.Now()
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Pong! Latencia: %dms", time.Since(start).Milliseconds()))
}

func cmdInfo(chat types.JID) {
	groups, _ := client.GetJoinedGroups(context.Background())
	msg := fmt.Sprintf(`*[OdinBOT] Informacoes:*

- Bot: %s
- Dono: %s
- Numero: +55 92 99652-9610
- Prefixo: %s
- Grupos: %d
- Linguagem: Go (whatsmeow)
- Versao: 1.0.0`, BotName, OwnerName, DefaultPrefix, len(groups))
	sendText(chat, msg)
}

func cmdDono(chat types.JID) {
	sendText(chat, fmt.Sprintf("*[OdinBOT]*\n\nDono: %s\nNumero: +55 92 99652-9610\nContato: wa.me/5592996529610", OwnerName))
}

func cmdSticker(chat types.JID, _ *events.Message) {
	sendText(chat, "*[OdinBOT]* Envie uma imagem/video com a legenda #s para criar figurinha.")
}

func cmdToImg(chat types.JID, _ *events.Message) {
	sendText(chat, "*[OdinBOT]* Responda uma figurinha com #toimg para converter.")
}

func cmdProfile(chat types.JID, sender types.JID) {
	sendText(chat, fmt.Sprintf("*[OdinBOT] Perfil:*\n\n- Numero: @%s\n- JID: %s", sender.User, sender.String()))
}

func cmdSimi(chat types.JID, _ string) {
	responses := []string{
		"Hmm, interessante!",
		"Concordo totalmente!",
		"Nao sei o que dizer sobre isso...",
		"Voce e muito engracado(a)!",
		"Conta mais!",
		"Serio? Nao sabia disso!",
		"Que legal!",
		"Poxa, que triste.",
		"Kkkkk muito bom!",
		"Eu acho que voce tem razao.",
		"Hmm, preciso pensar sobre isso.",
		"Ai ai, voces humanos...",
		"Sou um bot, mas entendo o sentimento!",
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT Simi]* %s", responses[rand.Intn(len(responses))]))
}

func cmdTraduzir(chat types.JID, args string) {
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Traducao requer API externa. Configure no painel.\nTexto recebido: %s", args))
}

func cmdClima(chat types.JID, city string) {
	if city == "" {
		sendText(chat, "*[OdinBOT]* Uso: #clima <cidade>")
		return
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Clima para '%s' requer API externa. Configure a OpenWeather API no painel.", city))
}

func cmdSigno(chat types.JID, sign string) {
	signos := map[string]string{
		"aries":       "Aries: Hoje e um dia de grandes conquistas!",
		"touro":       "Touro: Mantenha a calma e siga em frente.",
		"gemeos":      "Gemeos: Sua comunicacao estara em alta!",
		"cancer":      "Cancer: Cuide mais de voce hoje.",
		"leao":        "Leao: Seu brilho sera notado por todos!",
		"virgem":      "Virgem: Organize seus pensamentos.",
		"libra":       "Libra: Equilibrio e a chave do dia.",
		"escorpiao":   "Escorpiao: Confie na sua intuicao.",
		"sagitario":   "Sagitario: Aventuras te esperam!",
		"capricornio": "Capricornio: Trabalho duro traz recompensas.",
		"aquario":     "Aquario: Sua criatividade esta em alta!",
		"peixes":      "Peixes: Sonhe grande hoje!",
	}
	s := strings.ToLower(strings.TrimSpace(sign))
	if msg, ok := signos[s]; ok {
		sendText(chat, fmt.Sprintf("*[OdinBOT]*\n\n%s", msg))
	} else {
		sendText(chat, "*[OdinBOT]* Signo invalido. Use: aries, touro, gemeos, cancer, leao, virgem, libra, escorpiao, sagitario, capricornio, aquario, peixes")
	}
}

func cmdRankAtivos(chat types.JID) {
	sendText(chat, "*[OdinBOT]* Rank de ativos em desenvolvimento. Use o painel web para ver estatisticas.")
}

func cmdPPT(chat types.JID, _ types.JID, choice string) {
	options := []string{"pedra", "papel", "tesoura"}
	choice = strings.ToLower(strings.TrimSpace(choice))
	if choice != "pedra" && choice != "papel" && choice != "tesoura" {
		sendText(chat, "*[OdinBOT]* Uso: #ppt pedra/papel/tesoura")
		return
	}
	bot := options[rand.Intn(3)]
	result := "Empate!"
	if (choice == "pedra" && bot == "tesoura") || (choice == "papel" && bot == "pedra") || (choice == "tesoura" && bot == "papel") {
		result = "Voce venceu!"
	} else if choice != bot {
		result = "Eu venci!"
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT] PPT*\n\nVoce: %s\nBot: %s\n\n%s", choice, bot, result))
}

func cmdChance(chat types.JID, text string) {
	if text == "" {
		text = "algo acontecer"
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* A chance de %s e de *%d%%*!", text, rand.Intn(101)))
}

func cmdSorte(chat types.JID, sender types.JID) {
	luck := rand.Intn(101)
	msg := "Que azar!"
	if luck > 80 {
		msg = "Muito sortudo(a)!"
	} else if luck > 50 {
		msg = "Sorte boa!"
	} else if luck > 30 {
		msg = "Mais ou menos..."
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* @%s, sua sorte hoje e *%d%%* - %s", sender.User, luck, msg))
}

func cmdCantada(chat types.JID) {
	cantadas := []string{
		"Voce e WiFi? Porque to sentindo uma conexao.",
		"Se beleza fosse tempo, voce seria a eternidade.",
		"Voce tem mapa? Porque eu me perdi nos seus olhos.",
		"Voce e uma multa? Porque tem um corpo do delito.",
		"Alguem chamou a policia? Porque roubaram meu coracao.",
		"Voce e Google? Porque tem tudo que eu procuro.",
		"Se eu fosse um gato, gastaria as 7 vidas olhando pra voce.",
		"Voce e uma estrela? Porque ilumina meu dia!",
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT] Cantada:*\n\n%s", cantadas[rand.Intn(len(cantadas))]))
}

func cmdFatos(chat types.JID) {
	fatos := []string{
		"O mel nunca estraga. Arqueologos encontraram mel de 3000 anos no Egito ainda comestivel.",
		"Uma agua-viva e 95% agua.",
		"As formigas nunca dormem.",
		"O coracao de um camarao fica na cabeca.",
		"E impossivel espirrar com os olhos abertos.",
		"Os golfinhos dormem com um olho aberto.",
		"O DNA humano e 60% identico ao de uma banana.",
		"Raios podem atingir o mesmo lugar duas vezes.",
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT] Fato:*\n\n%s", fatos[rand.Intn(len(fatos))]))
}

func cmdConselho(chat types.JID) {
	conselhos := []string{
		"Tenha paciencia, tudo acontece no tempo certo.",
		"Nao desista, os melhores dias estao por vir.",
		"Seja gentil, todos estao lutando batalhas que voce desconhece.",
		"Invista em voce, e o melhor investimento que existe.",
		"Perdoe, nao pelo outro, mas por voce mesmo.",
		"Aprenda algo novo todo dia, o conhecimento e poder.",
		"Sorria mais, a vida e curta demais para ficar triste.",
		"Cuide da sua saude mental, ela e tao importante quanto a fisica.",
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT] Conselho:*\n\n%s", conselhos[rand.Intn(len(conselhos))]))
}

func cmdCalc(chat types.JID, expr string) {
	if expr == "" {
		sendText(chat, "*[OdinBOT]* Uso: #calcular 2+2")
		return
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Calculadora: %s\n(Para calculos complexos, use o painel web)", expr))
}

func cmdSimNao(chat types.JID) {
	options := []string{"Sim!", "Nao!", "Talvez...", "Com certeza!", "De jeito nenhum!", "Provavel que sim.", "Provavel que nao."}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* %s", options[rand.Intn(len(options))]))
}

func cmdDado(chat types.JID) {
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Dado: *%d*", rand.Intn(6)+1))
}

func cmdMoedas(chat types.JID) {
	result := "Cara"
	if rand.Intn(2) == 0 {
		result = "Coroa"
	}
	sendText(chat, fmt.Sprintf("*[OdinBOT]* Moeda: *%s*!", result))
}

func cmdHelp(chat types.JID, _ types.JID) {
	prefix := getPrefix(chat.String())
	sendText(chat, fmt.Sprintf(`*[OdinBOT] Como usar:*

1. Todos os comandos comecam com *%s*
2. Use *%smenu* para ver todos os comandos
3. Admin tem comandos extras de moderacao
4. Dono (%s) controla alugueis e broadcast

Duvidas? Fale com %s!`, prefix, prefix, OwnerName, OwnerName))
}

func cmdAlugarInfo(chat types.JID) {
	sendText(chat, fmt.Sprintf(`*[OdinBOT] Alugar Bot:*

Quer ter o %s no seu grupo?
Fale com o dono: %s
Numero: wa.me/5592996529610

Planos:
- Semanal: R$10
- Mensal: R$30
- Trimestral: R$70`, BotName, OwnerName))
}

func cmdRegras(chat types.JID) {
	sendText(chat, `*[OdinBOT] Regras do Grupo:*

1. Respeite todos os membros
2. Proibido links sem autorizacao
3. Proibido conteudo NSFW (a menos que liberado)
4. Proibido spam e flood
5. Proibido numeros fake
6. Palavroes em excesso geram advertencia
7. 3 advertencias = ban automatico
8. O dono tem a palavra final`)
}

func cmdBugReport(chat types.JID, sender types.JID, text string) {
	if text == "" {
		sendText(chat, "*[OdinBOT]* Descreva o bug/sugestao depois do comando.")
		return
	}
	ownerJID := types.NewJID(OwnerNumber, "s.whatsapp.net")
	sendText(ownerJID, fmt.Sprintf("*[OdinBOT] Bug/Sugestao*\n\nDe: @%s\nGrupo: %s\n\n%s", sender.User, chat.String(), text))
	sendText(chat, "*[OdinBOT]* Obrigado! Seu relato foi enviado ao dono.")
}

// ============================================================
// Rental Checker (background)
// ============================================================

func calcEndDate(plan string) string {
	now := time.Now()
	switch strings.ToLower(plan) {
	case "semanal":
		return now.AddDate(0, 0, 7).Format("2006-01-02")
	case "quinzenal":
		return now.AddDate(0, 0, 15).Format("2006-01-02")
	case "mensal":
		return now.AddDate(0, 1, 0).Format("2006-01-02")
	case "trimestral":
		return now.AddDate(0, 3, 0).Format("2006-01-02")
	case "semestral":
		return now.AddDate(0, 6, 0).Format("2006-01-02")
	case "anual":
		return now.AddDate(1, 0, 0).Format("2006-01-02")
	case "vitalicio":
		return now.AddDate(99, 0, 0).Format("2006-01-02")
	default:
		return now.AddDate(0, 1, 0).Format("2006-01-02")
	}
}

func rentalChecker() {
	for {
		time.Sleep(1 * time.Hour)
		now := time.Now()
		botData.mu.Lock()
		for i := range botData.Rentals {
			if !botData.Rentals[i].Active {
				continue
			}
			endDate, err := time.Parse("2006-01-02", botData.Rentals[i].EndDate)
			if err != nil {
				continue
			}
			if now.After(endDate) {
				botData.Rentals[i].Active = false
				jid, err := types.ParseJID(botData.Rentals[i].GroupJID)
				if err == nil {
					sendText(jid, fmt.Sprintf("*[OdinBOT]* O aluguel deste grupo expirou em %s.\nContate %s para renovar: wa.me/5592996529610",
						botData.Rentals[i].EndDate, OwnerName))
				}
			} else if endDate.Sub(now).Hours() < 72 {
				jid, err := types.ParseJID(botData.Rentals[i].GroupJID)
				if err == nil {
					days := int(endDate.Sub(now).Hours() / 24)
					sendText(jid, fmt.Sprintf("*[OdinBOT]* Aviso: O aluguel deste grupo expira em %d dias!\nContate %s para renovar.", days, OwnerName))
				}
			}
		}
		botData.mu.Unlock()
		saveBotData()
	}
}

// ============================================================
// Data Persistence
// ============================================================

func loadBotData() *BotData {
	data := &BotData{
		Groups:     make(map[string]*GroupConfig),
		Rentals:    []Rental{},
		Warnings:   make(map[string][]Warning),
		Blacklist:  make(map[string]BlacklistEntry),
		BadWords:   make(map[string][]string),
		Notes:      make(map[string][]string),
		MutedUsers: make(map[string]map[string]bool),
		AfkUsers:   make(map[string]string),
		Roles:      make(map[string]map[string]string),
	}

	filePath := filepath.Join(dataDir, "botdata.json")
	file, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Println("[INFO] Nenhum dado salvo encontrado. Iniciando novo.")
		return data
	}

	if err := json.Unmarshal(file, data); err != nil {
		fmt.Printf("[ERRO] Carregar dados: %v\n", err)
		return data
	}

	// Garantir mapas nao-nil
	if data.Groups == nil {
		data.Groups = make(map[string]*GroupConfig)
	}
	if data.Warnings == nil {
		data.Warnings = make(map[string][]Warning)
	}
	if data.Blacklist == nil {
		data.Blacklist = make(map[string]BlacklistEntry)
	}
	if data.BadWords == nil {
		data.BadWords = make(map[string][]string)
	}
	if data.Notes == nil {
		data.Notes = make(map[string][]string)
	}
	if data.MutedUsers == nil {
		data.MutedUsers = make(map[string]map[string]bool)
	}
	if data.AfkUsers == nil {
		data.AfkUsers = make(map[string]string)
	}
	if data.Roles == nil {
		data.Roles = make(map[string]map[string]string)
	}

	fmt.Printf("[INFO] Dados carregados: %d grupos, %d alugueis\n", len(data.Groups), len(data.Rentals))
	return data
}

func saveBotData() {
	filePath := filepath.Join(dataDir, "botdata.json")
	botData.mu.RLock()
	jsonData, err := json.MarshalIndent(botData, "", "  ")
	botData.mu.RUnlock()
	if err != nil {
		fmt.Printf("[ERRO] Serializar dados: %v\n", err)
		return
	}
	if err := os.WriteFile(filePath, jsonData, 0644); err != nil {
		fmt.Printf("[ERRO] Salvar dados: %v\n", err)
	}
}
