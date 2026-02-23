"use client"

import { useEffect, useState, useCallback } from "react"
import PanelLayout from "@/components/panel-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreditCard, Plus, Pencil, Trash2, Search, Calendar } from "lucide-react"
import {
  getRentals,
  addRental,
  updateRental,
  deleteRental,
  generateId,
  type Rental,
} from "@/lib/store"

const emptyRental: Omit<Rental, "id"> = {
  groupJid: "",
  groupName: "",
  ownerNumber: "",
  ownerName: "",
  plan: "mensal",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  value: 0,
  active: true,
  notes: "",
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Rental | null>(null)
  const [form, setForm] = useState<Omit<Rental, "id">>(emptyRental)
  const [mounted, setMounted] = useState(false)

  const reload = useCallback(() => {
    setRentals(getRentals())
  }, [])

  useEffect(() => {
    reload()
    setMounted(true)
  }, [reload])

  const filtered = rentals.filter(
    (r) =>
      r.groupName.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerNumber.includes(search)
  )

  function openNew() {
    setEditing(null)
    setForm(emptyRental)
    setDialogOpen(true)
  }

  function openEdit(r: Rental) {
    setEditing(r)
    setForm({
      groupJid: r.groupJid,
      groupName: r.groupName,
      ownerNumber: r.ownerNumber,
      ownerName: r.ownerName,
      plan: r.plan,
      startDate: r.startDate,
      endDate: r.endDate,
      value: r.value,
      active: r.active,
      notes: r.notes,
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.groupName || !form.ownerNumber) return
    if (editing) {
      updateRental(editing.id, form)
    } else {
      addRental({ ...form, id: generateId() })
    }
    setDialogOpen(false)
    reload()
  }

  function handleDelete(id: string) {
    deleteRental(id)
    reload()
  }

  function isExpired(endDate: string): boolean {
    if (!endDate) return false
    return new Date(endDate) < new Date()
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
            Gerenciar Alugueis
          </h1>
          <p className="text-sm text-muted-foreground">
            Somente o dono (Erick Machine) pode configurar alugueis
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openNew}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Aluguel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editing ? "Editar Aluguel" : "Novo Aluguel"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <Label className="text-foreground">Nome do Grupo</Label>
                <Input
                  className="mt-1 border-border bg-secondary text-foreground"
                  value={form.groupName}
                  onChange={(e) =>
                    setForm({ ...form, groupName: e.target.value })
                  }
                  placeholder="Ex: Grupo da Galera"
                />
              </div>
              <div>
                <Label className="text-foreground">JID do Grupo</Label>
                <Input
                  className="mt-1 border-border bg-secondary text-foreground"
                  value={form.groupJid}
                  onChange={(e) =>
                    setForm({ ...form, groupJid: e.target.value })
                  }
                  placeholder="Ex: 120363000000@g.us"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-foreground">Nome do Responsavel</Label>
                  <Input
                    className="mt-1 border-border bg-secondary text-foreground"
                    value={form.ownerName}
                    onChange={(e) =>
                      setForm({ ...form, ownerName: e.target.value })
                    }
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Numero</Label>
                  <Input
                    className="mt-1 border-border bg-secondary text-foreground"
                    value={form.ownerNumber}
                    onChange={(e) =>
                      setForm({ ...form, ownerNumber: e.target.value })
                    }
                    placeholder="5592999999999"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-foreground">Plano</Label>
                  <Select
                    value={form.plan}
                    onValueChange={(v) => setForm({ ...form, plan: v })}
                  >
                    <SelectTrigger className="mt-1 border-border bg-secondary text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card text-foreground">
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                      <SelectItem value="vitalicio">Vitalicio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-foreground">Valor (R$)</Label>
                  <Input
                    className="mt-1 border-border bg-secondary text-foreground"
                    type="number"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: Number(e.target.value) })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-foreground">Data Inicio</Label>
                  <Input
                    className="mt-1 border-border bg-secondary text-foreground"
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label className="text-foreground">Data Fim</Label>
                  <Input
                    className="mt-1 border-border bg-secondary text-foreground"
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label className="text-foreground">Observacoes</Label>
                <Textarea
                  className="mt-1 border-border bg-secondary text-foreground"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Anotacoes sobre o aluguel..."
                />
              </div>
              <Button
                onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {editing ? "Salvar Alteracoes" : "Criar Aluguel"}
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
          placeholder="Buscar aluguel por grupo, dono ou numero..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Rentals List */}
      {filtered.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">
              Nenhum aluguel encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Clique em &quot;Novo Aluguel&quot; para adicionar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((r) => {
            const expired = isExpired(r.endDate)
            return (
              <Card key={r.id} className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-foreground">
                      {r.groupName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          expired
                            ? "bg-destructive/10 text-destructive"
                            : r.active
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }
                      >
                        {expired ? "Expirado" : r.active ? "Ativo" : "Pausado"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Responsavel</span>
                      <span className="text-foreground">{r.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Numero</span>
                      <span className="font-mono text-foreground">
                        {r.ownerNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Plano</span>
                      <span className="capitalize text-foreground">{r.plan}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valor</span>
                      <span className="font-medium text-success">
                        R$ {r.value.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Periodo
                      </span>
                      <span className="text-foreground">
                        {r.startDate
                          ? new Date(r.startDate + "T12:00:00").toLocaleDateString("pt-BR")
                          : "N/A"}{" "}
                        -{" "}
                        {r.endDate
                          ? new Date(r.endDate + "T12:00:00").toLocaleDateString("pt-BR")
                          : "Indefinido"}
                      </span>
                    </div>
                    {r.notes && (
                      <p className="mt-1 rounded bg-secondary/50 px-2 py-1 text-xs text-muted-foreground">
                        {r.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </PanelLayout>
  )
}
