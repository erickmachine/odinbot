"use client"

import { useEffect, useState, useCallback } from "react"
import PanelLayout from "@/components/panel-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Clock, Plus, Trash2 } from "lucide-react"
import {
  getScheduledMessages,
  addScheduledMessage,
  deleteScheduledMessage,
  generateId,
  type ScheduledMessage,
} from "@/lib/store"

export default function ScheduledPage() {
  const [messages, setMessages] = useState<ScheduledMessage[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    groupJid: "",
    groupName: "",
    message: "",
    time: "08:00",
    frequency: "daily" as ScheduledMessage["frequency"],
    active: true,
  })
  const [mounted, setMounted] = useState(false)

  const reload = useCallback(() => setMessages(getScheduledMessages()), [])

  useEffect(() => {
    reload()
    setMounted(true)
  }, [reload])

  function handleSave() {
    if (!form.groupName || !form.message) return
    addScheduledMessage({
      id: generateId(),
      groupJid: form.groupJid,
      groupName: form.groupName,
      message: form.message,
      time: form.time,
      frequency: form.frequency,
      active: form.active,
    })
    setDialogOpen(false)
    setForm({ groupJid: "", groupName: "", message: "", time: "08:00", frequency: "daily", active: true })
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

  const freqLabel: Record<string, string> = { once: "Uma vez", daily: "Diario", weekly: "Semanal", monthly: "Mensal" }

  return (
    <PanelLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mensagens Agendadas</h1>
          <p className="text-sm text-muted-foreground">Programe envios automaticos para os grupos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div>
                <Label className="text-foreground">Nome do Grupo</Label>
                <Input className="mt-1 border-border bg-secondary text-foreground" value={form.groupName} onChange={(e) => setForm({ ...form, groupName: e.target.value })} placeholder="Grupo da Galera" />
              </div>
              <div>
                <Label className="text-foreground">JID do Grupo</Label>
                <Input className="mt-1 border-border bg-secondary text-foreground" value={form.groupJid} onChange={(e) => setForm({ ...form, groupJid: e.target.value })} placeholder="120363000@g.us" />
              </div>
              <div>
                <Label className="text-foreground">Mensagem</Label>
                <Textarea className="mt-1 border-border bg-secondary text-foreground" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Mensagem a ser enviada..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-foreground">Horario</Label>
                  <Input className="mt-1 border-border bg-secondary text-foreground" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
                <div>
                  <Label className="text-foreground">Frequencia</Label>
                  <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as ScheduledMessage["frequency"] })}>
                    <SelectTrigger className="mt-1 border-border bg-secondary text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card text-foreground">
                      <SelectItem value="once">Uma vez</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                <span className="text-sm text-foreground">Ativo</span>
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              </div>
              <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">Agendar Mensagem</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {messages.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">Nenhum agendamento</p>
            <p className="text-sm text-muted-foreground">Clique em &quot;Novo Agendamento&quot; para criar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <Card key={m.id} className="border-border bg-card">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                    <Clock className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.groupName}</p>
                    <p className="max-w-xs truncate text-xs text-muted-foreground">{m.message}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className={m.active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"}>
                        {m.active ? "Ativo" : "Pausado"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{m.time} - {freqLabel[m.frequency] || m.frequency}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { deleteScheduledMessage(m.id); reload() }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PanelLayout>
  )
}
