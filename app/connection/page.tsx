"use client"

import { useState, useEffect, useCallback } from "react"
import PanelLayout from "@/components/panel-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, QrCode, RefreshCw, Clock, CheckCircle2, AlertTriangle, Smartphone } from "lucide-react"

interface QRStatus {
  code: string
  status: "waiting" | "connected" | "timeout" | "offline" | "error"
  updated: string
  message?: string
}

export default function ConnectionPage() {
  const [qrStatus, setQrStatus] = useState<QRStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/qrcode")
      if (res.ok) {
        const data = await res.json()
        setQrStatus(data)
      }
    } catch {
      setQrStatus({
        code: "",
        status: "offline",
        updated: new Date().toISOString(),
        message: "Nao foi possivel conectar ao painel.",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchStatus])

  const statusConfig = {
    waiting: {
      label: "Aguardando Escaneamento",
      color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      icon: QrCode,
      pulse: true,
    },
    connected: {
      label: "Conectado",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
      pulse: false,
    },
    timeout: {
      label: "QR Expirado",
      color: "bg-red-500/10 text-red-400 border-red-500/30",
      icon: AlertTriangle,
      pulse: false,
    },
    offline: {
      label: "Bot Offline",
      color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
      icon: WifiOff,
      pulse: false,
    },
    error: {
      label: "Erro",
      color: "bg-red-500/10 text-red-400 border-red-500/30",
      icon: AlertTriangle,
      pulse: false,
    },
  }

  const currentStatus = qrStatus ? statusConfig[qrStatus.status] : statusConfig.offline
  const StatusIcon = currentStatus.icon

  return (
    <PanelLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Conexao WhatsApp</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Escaneie o QR Code para conectar o OdinBOT ao WhatsApp
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "border-primary/50 text-primary" : ""}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchStatus}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${currentStatus.color}`}>
                <StatusIcon className="h-6 w-6" />
              </div>
              {currentStatus.pulse && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-500" />
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Status do Bot</h3>
                <Badge variant="outline" className={currentStatus.color}>
                  {currentStatus.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {qrStatus?.message || getStatusMessage(qrStatus?.status)}
              </p>
            </div>
            {qrStatus?.updated && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(qrStatus.updated).toLocaleTimeString("pt-BR")}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* QR Code Display */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                QR Code
              </CardTitle>
              <CardDescription>
                Abra o WhatsApp no celular e escaneie o codigo
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-8">
              {loading ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Carregando status...</p>
                </div>
              ) : qrStatus?.status === "connected" ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10">
                    <Wifi className="h-12 w-12 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-emerald-400">Bot Conectado!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      O OdinBOT esta online e funcionando
                    </p>
                  </div>
                </div>
              ) : qrStatus?.status === "waiting" && qrStatus.code ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-xl border border-border bg-white p-4">
                    <QRCodeSVG value={qrStatus.code} size={256} />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Escaneie com WhatsApp {'>'} Aparelhos conectados {'>'} Conectar aparelho
                  </p>
                  <div className="flex items-center gap-2 text-xs text-yellow-400">
                    <Clock className="h-3 w-3" />
                    QR atualiza automaticamente a cada 20s
                  </div>
                </div>
              ) : qrStatus?.status === "timeout" ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10">
                    <AlertTriangle className="h-12 w-12 text-red-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-red-400">QR Expirado</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reinicie o bot para gerar um novo QR Code
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-500/10">
                    <WifiOff className="h-12 w-12 text-zinc-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-zinc-400">Bot Offline</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Inicie o bot na VPS para gerar o QR Code
                    </p>
                    <code className="mt-3 block rounded-lg bg-secondary px-4 py-2 text-xs text-primary font-mono">
                      cd ~/odinbot && ./start.sh
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Como Conectar
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Step n={1} title="Inicie o bot na VPS">
                Acesse o terminal da VPS e execute:
                <code className="mt-2 block rounded-lg bg-secondary px-3 py-2 text-xs text-primary font-mono">
                  cd ~/odinbot && ./start.sh
                </code>
              </Step>
              <Step n={2} title="Aguarde o QR Code">
                O QR aparecera no terminal e tambem aqui nesta pagina automaticamente.
              </Step>
              <Step n={3} title="Abra o WhatsApp">
                No celular: <strong className="text-foreground">Configuracoes</strong> {'>'}{' '}
                <strong className="text-foreground">Aparelhos conectados</strong> {'>'}{' '}
                <strong className="text-foreground">Conectar aparelho</strong>
              </Step>
              <Step n={4} title="Escaneie o QR">
                Aponte a camera do WhatsApp para o QR Code. A conexao e feita em segundos.
              </Step>
              <Step n={5} title="Pronto!">
                O bot ficara online 24h. Se reconectar automaticamente apos reiniciar.
              </Step>

              <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs text-primary">
                  <strong>Dica:</strong> Apos o primeiro escaneamento, o bot salva a sessao.
                  Nas proximas vezes ele conecta automaticamente sem QR.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PanelLayout>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {n}
      </div>
      <div>
        <p className="font-medium text-foreground text-sm">{title}</p>
        <div className="text-sm text-muted-foreground mt-0.5">{children}</div>
      </div>
    </div>
  )
}

function getStatusMessage(status?: string) {
  switch (status) {
    case "waiting":
      return "QR Code gerado. Escaneie com seu WhatsApp."
    case "connected":
      return "Bot conectado e funcionando normalmente."
    case "timeout":
      return "O QR Code expirou. Reinicie o bot."
    case "offline":
      return "O bot nao esta rodando na VPS."
    default:
      return "Status desconhecido."
  }
}

function QRCodeSVG({ value, size }: { value: string; size: number }) {
  const [svgUrl, setSvgUrl] = useState("")

  useEffect(() => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000&format=svg`
    setSvgUrl(qrApiUrl)
  }, [value, size])

  if (!svgUrl) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={svgUrl}
      alt="QR Code para conectar OdinBOT"
      width={size}
      height={size}
      className="rounded"
    />
  )
}
