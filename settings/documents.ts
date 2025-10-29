type DocumentRoute =
  | {
      title: string
      href: string
      noLink?: true
      heading?: string
      items?: DocumentRoute[]
    }
  | { spacer: true }

export const Documents: DocumentRoute[] = []
