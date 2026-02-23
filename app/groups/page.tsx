"use client"

import { useEffect, useState, useCallback } from "react"
import PanelLayout from "@/components/panel-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Plus, Pencil, Trash2, Search } from "lucide-react"
import {
  getGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  generateId,
  type GroupConfig,
} from "@/lib/store"

const emptyGroup: Omit<GroupConfig, "id"> = {
  name: "",
  jid: "",
  welcome: true,
  welcomeMsg: "Bem-vindo(a) ao grupo! Leia as regras.",
  goodbye: true,
  goodbyeMsg: "Ate mais! Sentiremos sua falta.",
  antilink: false,
  antifake: false,
  antiflood: false,
  nsfw: false,
  autoSticker: false,
  prefix: "#",
  mutedUsers: [],
  active: true,
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupConfig[]>([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<GroupConfig | null>(null)
  const [form, setForm] = useState<Omit<GroupConfig, "id">>(emptyGroup)
  const [mounted, setMounted] = useState(false)

  const reload = useCallback(() => {
    setGroups(getGroups())
  }, [])

  useEffect(() => {
    reload()
    setMounted(true)
  }, [reload])

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.jid.toLowerCase().includes(search.toLowerCase())
  )

  function openNew() {
    setEditing(null)
    setForm(emptyGroup)
    setDialogOpen(true)
  }

  function openEdit(g: GroupConfig) {
    setEditing(g)
    setForm({
      name: g.name,
      jid: g.jid,
      welcome: g.welcome,
      welcomeMsg: g.welcomeMsg,
      goodbye: g.goodbye,
      goodbyeMsg: g.goodbyeMsg,
      antilink: g.antilink,
      antifake: g.antifake,
      antiflood: g.antiflood,
      nsfw: g.nsfw,
      autoSticker: g.autoSticker,
      prefix: g.prefix,
      mutedUsers: g.mutedUsers,
      active: g.active,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.name || !form.jid) return
    if (editing) {
      updateGroup(editing.id, form)
    } else {
      addGroup({ ...form, id: generateId() })
    }
    setDialogOpen(false)
    reload()
  }

  function handleDelete(id: string) {
    deleteGroup(id)
    reload()
  }

  function toggleField(field: keyof GroupConfig, id: string, current: boolean) {
    updateGroup(id, { [field]: !current })
    reload()
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
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gerenciar Grupos
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure os grupos onde o OdinBOT esta ativo
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openNew}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editing ? "Editar Grupo" : "Adicionar Grupo"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <Label className="text-foreground">Nome do Grupo</Label>
                <Input
                  className="mt-1 border-border bg-secondary text-foreground"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Grupo da Galera"
                />
              </div>
              <div>
                <Label className="text-foreground">JID do Grupo</Label>
                <Input
                  className="mt-1 border-border bg-secondary text-foreground"
                  value={form.jid}
                  onChange={(e) => setForm({ ...form, jid: e.target.value })}
                  placeholder="Ex: 120363000000@g.us"
                />
              </div>
              <div>
                <Label className="text-foreground">Prefixo</Label>
                <Input
                  className="mt-1 border-border bg-secondary text-foreground"
                  value={form.prefix}
                  onChange={(e) => setForm({ ...form, prefix: e.target.value })}
                  placeholder="#"
                />
              </div>

              {/* Toggles */}
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleItem
                  label="Ativo"
                  checked={form.active}
                  onChange={(v) => setForm({ ...form, active: v })}
                />
                <ToggleItem
                  label="Boas-vindas"
                  checked={form.welcome}
                  onChange={(v) => setForm({ ...form, welcome: v })}
                />
                <ToggleItem
                  label="Despedida"
                  checked={form.goodbye}
                  onChange={(v) => setForm({ ...form, goodbye: v })}
                />
                <ToggleItem
                  label="Anti-Link"
                  checked={form.antilink}
                  onChange={(v) => setForm({ ...form, antilink: v })}
                />
                <ToggleItem
                  label="Anti-Fake"
                  checked={form.antifake}
                  onChange={(v) => setForm({ ...form, antifake: v })}
                />
                <ToggleItem
                  label="Anti-Flood"
                  checked={form.antiflood}
                  onChange={(v) => setForm({ ...form, antiflood: v })}
                />
                <ToggleItem
                  label="Auto Sticker"
                  checked={form.autoSticker}
                  onChange={(v) => setForm({ ...form, autoSticker: v })}
                />
                <ToggleItem
                  label="NSFW (+18)"
                  checked={form.nsfw}
                  onChange={(v) => setForm({ ...form, nsfw: v })}
                />
              </div>

              {form.welcome && (
                <div>
                  <Label className="text-foreground">Mensagem de Boas-vindas</Label>
                  <Textarea
                    className="mt-1 border-border bg-secondary text-foreground"
                    value={form.welcomeMsg}
                    onChange={(e) =>
                      setForm({ ...form, welcomeMsg: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              )}
              {form.goodbye && (
                <div>
                  <Label className="text-foreground">Mensagem de Despedida</Label>
                  <Textarea
                    className="mt-1 border-border bg-secondary text-foreground"
                    value={form.goodbyeMsg}
                    onChange={(e) =>
                      setForm({ ...form, goodbyeMsg: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              )}

              <Button
                onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {editing ? "Salvar Alteracoes" : "Adicionar Grupo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="border-border bg-card pl-10 text-foreground"
          placeholder="Buscar grupo por nome ou JID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Groups List */}
      {filtered.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">
              Nenhum grupo encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Clique em &quot;Novo Grupo&quot; para adicionar um grupo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((g) => (
            <Card key={g.id} className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-foreground">
                    {g.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        g.active
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }
                    >
                      {g.active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(g)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(g.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{g.jid}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <FeatureBadge
                    label="Welcome"
                    active={g.welcome}
                    onClick={() => toggleField("welcome", g.id, g.welcome)}
                  />
                  <FeatureBadge
                    label="Goodbye"
                    active={g.goodbye}
                    onClick={() => toggleField("goodbye", g.id, g.goodbye)}
                  />
                  <FeatureBadge
                    label="Anti-Link"
                    active={g.antilink}
                    onClick={() => toggleField("antilink", g.id, g.antilink)}
                  />
                  <FeatureBadge
                    label="Anti-Fake"
                    active={g.antifake}
                    onClick={() => toggleField("antifake", g.id, g.antifake)}
                  />
                  <FeatureBadge
                    label="Anti-Flood"
                    active={g.antiflood}
                    onClick={() => toggleField("antiflood", g.id, g.antiflood)}
                  />
                  <FeatureBadge
                    label="Auto-Sticker"
                    active={g.autoSticker}
                    onClick={() =>
                      toggleField("autoSticker", g.id, g.autoSticker)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PanelLayout>
  )
}

function ToggleItem({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function FeatureBadge({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-secondary text-muted-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  )
}
