"use client"

import Sidebar from "@/components/sidebar"

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="p-4 pt-16 md:p-8 md:pt-8">{children}</div>
      </main>
    </div>
  )
}
