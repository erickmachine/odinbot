"use client"

import { useEffect, useState } from "react"
import PanelLayout from "@/components/panel-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Save, RotateCcw } from "lucide-react"
import { getSettings, saveSettings, DEFAULT_SETTINGS, type BotSettings } from "@/lib/store"

export default function SettingsPage() {
  const [settings, setSettings] = useState<BotSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
    setMounted(true)
  }, [])

  function handleSave() {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
  }

  if (!mounted) {
    return (
      <PanelLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </PanelLayout>
    )
  }

  return (
    <PanelLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Configuracoes</h1>
        <p className="text-sm text-muted-foreground">Configuracoes gerais do OdinBOT</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bot Info */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5 text-primary" />
              Informacoes do Bot
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label className="text-foreground">Nome do Bot</Label>
              <Input className="mt-1 border-border bg-secondary text-foreground" value={settings.botName} onChange={(e) => setSettings({ ...settings, botName: e.target.value })} />
            </div>
            <div>
              <Label className="text-foreground">Nome do Dono</Label>
              <Input className="mt-1 border-border bg-secondary text-foreground" value={settings.ownerName} onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })} />
            </div>
            <div>
              <Label className="text-foreground">Numero do Dono</Label>
              <Input className="mt-1 border-border bg-secondary text-foreground" value={settings.ownerNumber} onChange={(e) => setSettings({ ...settings, ownerNumber: e.target.value })} />
            </div>
            <div>
              <Label className="text-foreground">Prefixo de Comandos</Label>
              <Input className="mt-1 border-border bg-secondary text-foreground" value={settings.prefix} onChange={(e) => setSettings({ ...settings, prefix: e.target.value })} />
            </div>
            <div>
              <Label className="text-foreground">Maximo de Advertencias (antes do ban)</Label>
              <Input className="mt-1 border-border bg-secondary text-foreground" type="number" value={settings.maxWarnings} onChange={(e) => setSettings({ ...settings, maxWarnings: Number(e.target.value) })} />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <span className="text-sm text-foreground">Auto-Read (ler mensagens)</span>
              <Switch checked={settings.autoRead} onCheckedChange={(v) => setSettings({ ...settings, autoRead: v })} />
            </div>
          </CardContent>
        </Card>

        {/* Default Messages */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Mensagens Padrao</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label className="text-foreground">Boas-vindas Padrao</Label>
              <Textarea className="mt-1 border-border bg-secondary text-foreground" value={settings.welcomeDefault} onChange={(e) => setSettings({ ...settings, welcomeDefault: e.target.value })} rows={4} />
              <p className="mt-1 text-xs text-muted-foreground">
                {'Use {name} para nome, {group} para o grupo, {number} para numero'}
              </p>
            </div>
            <div>
              <Label className="text-foreground">Despedida Padrao</Label>
              <Textarea className="mt-1 border-border bg-secondary text-foreground" value={settings.goodbyeDefault} onChange={(e) => setSettings({ ...settings, goodbyeDefault: e.target.value })} rows={4} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-4">
        <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" />
          {saved ? "Salvo!" : "Salvar Configuracoes"}
        </Button>
        <Button onClick={handleReset} variant="outline" className="border-border text-foreground hover:bg-secondary">
          <RotateCcw className="mr-2 h-4 w-4" />
          Resetar Padrao
        </Button>
      </div>
    </PanelLayout>
  )
}
