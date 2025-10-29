import { promises as fs } from "fs"
import path from "path"

import { GitHubLink } from "@/settings/navigation"
import { Settings } from "@/types/settings"
import { PageRoutes } from "@/hooks/pageroutes"

type TableOfContentsEntry = {
  level: number
  text: string
  href: string
}

type DocumentResult = {
  frontmatter: Record<string, unknown>
  content: string
  tocs: TableOfContentsEntry[]
  lastUpdated: string | null
}

const HEADINGS_REGEX = /^(#{2,4})\s(.+)$/gm

const buildLocalPath = (slug: string) =>
  path.join(process.cwd(), "contents", "docs", slug, "index.mdx")

async function loadDocumentSource(slug: string) {
  try {
    if (Settings.gitload && GitHubLink.href) {
      const response = await fetch(
        `${GitHubLink.href}/raw/main/contents/docs/${slug}/index.mdx`,
      )
      if (!response.ok) {
        return null
      }

      const rawMdx = await response.text()
      const lastUpdated = response.headers.get("Last-Modified")

      return {
        rawMdx,
        lastUpdated,
      }
    }

    const filePath = buildLocalPath(slug)
    const rawMdx = await fs.readFile(filePath, "utf-8")
    const stats = await fs.stat(filePath)

    return {
      rawMdx,
      lastUpdated: stats.mtime.toISOString(),
    }
  } catch {
    return null
  }
}

export async function getDocument(slug: string): Promise<DocumentResult | null> {
  const source = await loadDocumentSource(slug)

  if (!source) {
    return null
  }

  const tocs = extractHeadings(source.rawMdx)

  return {
    frontmatter: {},
    content: source.rawMdx,
    tocs,
    lastUpdated: source.lastUpdated ?? null,
  }
}

export async function getTable(slug: string): Promise<TableOfContentsEntry[]> {
  const source = await loadDocumentSource(slug)
  if (!source) {
    return []
  }

  return extractHeadings(source.rawMdx)
}

function extractHeadings(rawMdx: string): TableOfContentsEntry[] {
  const headings: TableOfContentsEntry[] = []
  let match: RegExpExecArray | null

  while ((match = HEADINGS_REGEX.exec(rawMdx)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const href = `#${slugify(text)}`

    headings.push({ level, text, href })
  }

  return headings
}

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_]/g, "")
}

const pathIndexMap = new Map(
  PageRoutes.map((route, index) => [route.href, index]),
)

export function getPreviousNext(pathname: string) {
  const index = pathIndexMap.get(`/${pathname}`)

  if (index === undefined || index === -1) {
    return { prev: null, next: null }
  }

  const prev = index > 0 ? PageRoutes[index - 1] : null
  const next = index < PageRoutes.length - 1 ? PageRoutes[index + 1] : null

  return { prev, next }
}
