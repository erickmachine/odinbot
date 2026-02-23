"use client"

import { useEffect, useState, type ReactNode } from "react"
import PanelLayout from "@/components/panel-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  CreditCard,
  AlertTriangle,
  Ban,
  Clock,
  Shield,
  Activity,
  Zap,
  TrendingUp,
  Server,
} from "lucide-react"
import {
  getGroups,
  getRentals,
  getWarnings,
  getBlacklist,
  getScheduledMessages,
  getSettings,
  type GroupConfig,
  type Rental,
  type Warning,
  type BlacklistEntry,
  type ScheduledMessage,
  type BotSettings,
} from "@/lib/store"

export default function DashboardPage() {
  const [groups, setGroups] = useState<GroupConfig[]>([])
  const [rentals, setRentals] = useState<Rental[]>([])
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])
  const [scheduled, setScheduled] = useState<ScheduledMessage[]>([])
  const [settings, setSettings] = useState<BotSettings | null>(null)
  const [mounted, setMounted] = useState(false)
  const [uptime, setUptime] = useState(0)

  useEffect(() => {
    setGroups(getGroups())
    setRentals(getRentals())
    setWarnings(getWarnings())
    setBlacklist(getBlacklist())
    setScheduled(getScheduledMessages())
    setSettings(getSettings())
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setUptime((p) => p + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <PanelLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <Shield className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Carregando painel...</p>
          </div>
        </div>
      </PanelLayout>
    )
  }

  const activeRentals = rentals.filter((r) => r.active)
  const activeGroups = groups.filter((g) => g.active)
  const activeScheduled = scheduled.filter((s) => s.active)
  const totalRevenue = rentals.reduce((sum, r) => sum + r.value, 0)

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <PanelLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500" />
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {settings?.botName || "OdinBOT"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Painel de Controle &middot; {settings?.ownerName || "Erick Machine"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Badge className="gap-1.5 border-0 bg-green-500/10 px-3 py-1.5 text-green-500 hover:bg-green-500/20">
              <Activity className="h-3 w-3" />
              Online
            </Badge>
            <div className="hidden rounded-lg bg-card px-3 py-1.5 text-xs font-mono text-muted-foreground sm:block">
              <Server className="mr-1.5 inline h-3 w-3" />
              Uptime: {formatUptime(uptime)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Grupos Ativos"
          value={activeGroups.length}
          subtitle={`${groups.length} total`}
          icon={<Users className="h-5 w-5" />}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          label="Alugueis"
          value={activeRentals.length}
          subtitle={`${rentals.length} total`}
          icon={<CreditCard className="h-5 w-5" />}
          color="text-green-500"
          bg="bg-green-500/10"
        />
        <StatCard
          label="Advertencias"
          value={warnings.length}
          subtitle="registradas"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <StatCard
          label="Lista Negra"
          value={blacklist.length}
          subtitle="banidos"
          icon={<Ban className="h-5 w-5" />}
          color="text-red-500"
          bg="bg-red-500/10"
        />
        <StatCard
          label="Agendamentos"
          value={activeScheduled.length}
          subtitle={`${scheduled.length} total`}
          icon={<Clock className="h-5 w-5" />}
          color="text-cyan-400"
          bg="bg-cyan-400/10"
        />
        <StatCard
          label="Receita Total"
          value={`R$${totalRevenue.toFixed(0)}`}
          subtitle="alugueis"
          icon={<TrendingUp className="h-5 w-5" />}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Rentals */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <CreditCard className="h-4 w-4 text-primary" />
              Alugueis Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rentals.length === 0 ? (
              <EmptyState text="Nenhum aluguel cadastrado ainda." />
            ) : (
              <div className="flex flex-col gap-2">
                {rentals.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5 transition-colors hover:bg-secondary/80"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.groupName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.ownerName} &middot; {r.plan} &middot; R${r.value.toFixed(2)}
                      </p>
                    </div>
                    <Badge
                      className={
                        r.active
                          ? "border-0 bg-green-500/10 text-green-500"
                          : "border-0 bg-red-500/10 text-red-500"
                      }
                    >
                      {r.active ? "Ativo" : "Expirado"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bot Info */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Zap className="h-4 w-4 text-primary" />
              Informacoes do Bot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <InfoRow label="Nome" value={settings?.botName || "OdinBOT"} />
              <InfoRow label="Dono" value={settings?.ownerName || "Erick Machine"} />
              <InfoRow label="Numero" value={settings?.ownerNumber || "5592996529610"} />
              <InfoRow label="Prefixo" value={settings?.prefix || "#"} />
              <InfoRow label="Max Warns" value={String(settings?.maxWarnings || 3)} />
              <InfoRow label="Auto-Read" value={settings?.autoRead ? "Sim" : "Nao"} />
              <InfoRow label="Engine" value="Go + whatsmeow" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Warnings */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Advertencias Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {warnings.length === 0 ? (
              <EmptyState text="Nenhuma advertencia registrada." />
            ) : (
              <div className="flex flex-col gap-2">
                {warnings.slice(0, 5).map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{w.userName}</p>
                      <p className="text-xs text-muted-foreground">{w.reason}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(w.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Blacklist Preview */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Ban className="h-4 w-4 text-red-500" />
              Lista Negra
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blacklist.length === 0 ? (
              <EmptyState text="Lista negra vazia." />
            ) : (
              <div className="flex flex-col gap-2">
                {blacklist.slice(0, 5).map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium font-mono text-foreground">{b.number}</p>
                      <p className="text-xs text-muted-foreground">{b.reason}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(b.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  )
}

function StatCard({
  label,
  value,
  subtitle,
  icon,
  color,
  bg,
}: {
  label: string
  value: string | number
  subtitle: string
  icon: ReactNode
  color: string
  bg: string
}) {
  return (
    <Card className="border-border bg-card transition-all hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
            <span className={color}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="py-4 text-center text-sm text-muted-foreground">{text}</p>
  )
}
