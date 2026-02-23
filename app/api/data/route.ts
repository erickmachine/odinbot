import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// API for the Go bot to read/write data
// Data is stored in JSON files in the data/ directory

const DATA_DIR = path.join(process.cwd(), "data")

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {
    // already exists
  }
}

async function readJSON(filename: string) {
  await ensureDir()
  const filepath = path.join(DATA_DIR, filename)
  try {
    const data = await fs.readFile(filepath, "utf-8")
    return JSON.parse(data)
  } catch {
    return null
  }
}

async function writeJSON(filename: string, data: unknown) {
  await ensureDir()
  const filepath = path.join(DATA_DIR, filename)
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  if (!type) {
    return NextResponse.json({ error: "Missing type parameter" }, { status: 400 })
  }

  const validTypes = ["groups", "rentals", "warnings", "blacklist", "scheduled", "settings"]
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  }

  const data = await readJSON(`${type}.json`)
  return NextResponse.json(data || (type === "settings" ? {} : []))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || data === undefined) {
      return NextResponse.json({ error: "Missing type or data" }, { status: 400 })
    }

    const validTypes = ["groups", "rentals", "warnings", "blacklist", "scheduled", "settings"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    await writeJSON(`${type}.json`, data)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}
