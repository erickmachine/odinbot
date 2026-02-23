"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Shield,
  AlertTriangle,
  Clock,
  Settings,
  Ban,
  Menu,
  X,
  ChevronRight,
  Wifi,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/connection", label: "Conexao", icon: Wifi },
  { href: "/groups", label: "Grupos", icon: Users },
  { href: "/rentals", label: "Alugueis", icon: CreditCard },
  { href: "/warnings", label: "Advertencias", icon: AlertTriangle },
  { href: "/blacklist", label: "Lista Negra", icon: Ban },
  { href: "/scheduled", label: "Agendamentos", icon: Clock },
  { href: "/settings", label: "Configuracoes", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-xl bg-card p-2.5 text-foreground shadow-lg ring-1 ring-border md:hidden"
        aria-label="Abrir menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">OdinBOT</h1>
            <p className="text-xs text-muted-foreground">Painel de Controle</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navegacao
          </p>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-primary")} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 text-primary/60" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-xs font-bold text-primary">EM</span>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Erick Machine</p>
              <p className="text-xs text-muted-foreground">+55 92 99652-961</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
