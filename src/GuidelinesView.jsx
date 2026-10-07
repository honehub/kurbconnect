import { useState, useEffect } from 'react'
import { getGuidelines } from './supabase'
import { S, C } from './styles'
import { useLang } from './i18n'

export default function GuidelinesView({ org }) {
  const { t, lang } = useLang()
  const [items, setItems] = useState(null)

  useEffect(() => {
    if (!org?.organization_id) return
    let live = true
    getGuidelines(org.organization_id, lang)
      .then((rows) => { if (live) setItems(rows) })
      .catch(() => { if (live) setItems([]) })
    return () => { live = false }
  }, [org?.organization_id, lang])

  if (items === null) return <div style={S.empty}>{t.loading}</div>
  if (items.length === 0) return <div style={S.empty}>{t.noGuidelines}</div>

  return (
    <div style={{ padding: '16px 0 8px' }}>
      {items.map((g) => (
        <div key={g.id} style={{ ...S.card, marginBottom: 12 }}>
          <div style={S.cardPad}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: C.ink,
                letterSpacing: '-0.015em',
                marginBottom: 6,
              }}
            >
              {g.title}
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.55, color: C.body }}>
              {g.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
