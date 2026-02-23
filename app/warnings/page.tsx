"use client"

import { useEffect, useState, useCallback } from "react"
import PanelLayout from "@/components/panel-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Plus, Trash2, Search } from "lucide-react"
import {
  getWarnings,
  addWarning,
  deleteWarning,
  generateId,
  type Warning,
} from "@/lib/store"

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ groupJid: "", userJid: "", userName: "", reason: "", issuedBy: "Painel" })
  const [mounted, setMounted] = useState(false)

  const reload = useCallback(() => setWarnings(getWarnings()), [])

  useEffect(() => {
    reload()
    setMounted(true)
  }, [reload])

  const filtered = warnings.filter(
    (w) =>
      w.userName.toLowerCase().includes(search.toLowerCase()) ||
      w.userJid.includes(search) ||
      w.reason.toLowerCase().includes(search.toLowerCase())
  )

  function handleSave() {
    if (!form.userName || !form.reason) return
    addWarning({
      id: generateId(),
      groupJid: form.groupJid,
      userJid: form.userJid,
      userName: form.userName,
      reason: form.reason,
      date: new Date().toISOString(),
      issuedBy: form.issuedBy || "Painel",
    })
    setDialogOpen(false)
    setForm({ groupJid: "", userJid: "", userName: "", reason: "", issuedBy: "Painel" })
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Advertencias</h1>
          <p className="text-sm text-muted-foreground">Gerencie advertencias dos membros</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Advertencia
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova Advertencia</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <Label className="text-foreground">Nome do Usuario</Label>
                <Input className="mt-1 border-border bg-secondary text-foreground" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} placeholder="Nome" />
              </div>
              <div>
                <Label className="text-foreground">Numero (JID)</Label>
                <Input className="mt-1 border-border bg-secondary text-foreground" value={form.userJid} onChange={(e) => setForm({ ...form, userJid: e.target.value })} placeholder="5592999999999@s.whatsapp.net" />
              </div>
              <div>
                <Label className="text-foreground">Grupo JID</Label>
                <Input className="mt-1 border-border bg-secondary text-foreground" value={form.groupJid} onChange={(e) => setForm({ ...form, groupJid: e.target.value })} placeholder="120363000@g.us" />
              </div>
              <div>
                <Label className="text-foreground">Motivo</Label>
                <Input className="mt-1 border-border bg-secondary text-foreground" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Motivo da advertencia" />
              </div>
              <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">Adicionar Advertencia</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="border-border bg-card pl-10 text-foreground" placeholder="Buscar advertencia..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Nenhuma advertencia</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((w) => (
            <Card key={w.id} className="border-border bg-card">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.userName}</p>
                    <p className="text-xs text-muted-foreground">{w.reason}</p>
                    <p className="text-xs text-muted-foreground font-mono">{w.userJid}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{new Date(w.date).toLocaleDateString("pt-BR")}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { deleteWarning(w.id); reload() }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PanelLayout>
  )
}
