import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const botDataDir = join(process.cwd(), "..", "bot", "data")
    const altDir = join(process.cwd(), "bot", "data")

    let qrData = null

    for (const dir of [botDataDir, altDir]) {
      try {
        const raw = await readFile(join(dir, "qrcode.json"), "utf-8")
        qrData = JSON.parse(raw)
        break
      } catch {
        continue
      }
    }

    if (!qrData) {
      return NextResponse.json({
        code: "",
        status: "offline",
        updated: new Date().toISOString(),
        message: "Bot nao esta rodando ou QR ainda nao foi gerado.",
      })
    }

    return NextResponse.json(qrData)
  } catch {
    return NextResponse.json({
      code: "",
      status: "error",
      updated: new Date().toISOString(),
      message: "Erro ao ler status do QR code.",
    })
  }
}
