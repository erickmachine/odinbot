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
import { Ban, Plus, Trash2, Search } from "lucide-react"
import {
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  generateId,
  type BlacklistEntry,
} from "@/lib/store"

export default function BlacklistPage() {
  const [list, setList] = useState<BlacklistEntry[]>([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ number: "", reason: "" })
  const [mounted, setMounted] = useState(false)

  const reload = useCallback(() => setList(getBlacklist()), [])

  useEffect(() => {
    reload()
    setMounted(true)
  }, [reload])

  const filtered = list.filter(
    (b) => b.number.includes(search) || b.reason.toLowerCase().includes(search.toLowerCase())
  )

  function handleSave() {
    if (!form.number) return
    addToBlacklist({
      id: generateId(),
      number: form.number,
      reason: form.reason || "Sem motivo informado",
      date: new Date().toISOString(),
      addedBy: "Painel",
    })
    setDialogOpen(false)
    setForm({ number: "", reason: "" })
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
          <h1 className="text-2xl font-bold text-foreground">Lista Negra</h1>
          <p className="text-sm text-muted-foreground">Numeros banidos de todos os grupos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Numero
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Adicionar a Lista Negra</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <Label className="text-foreground">Numero</Label>
                <Input className="mt-1 border-border bg-secondary text-foreground" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="5592999999999" />
              </div>
              <div>
                <Label className="text-foreground">Motivo</Label>
                <Input className="mt-1 border-border bg-secondary text-foreground" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Motivo do ban" />
              </div>
              <Button onClick={handleSave} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Banir Numero</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="border-border bg-card pl-10 text-foreground" placeholder="Buscar numero ou motivo..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ban className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Lista negra vazia</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((b) => (
            <Card key={b.id} className="border-border bg-card">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <Ban className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium font-mono text-foreground">{b.number}</p>
                    <p className="text-xs text-muted-foreground">{b.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{new Date(b.date).toLocaleDateString("pt-BR")}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { removeFromBlacklist(b.id); reload() }}>
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
