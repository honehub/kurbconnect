import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import { getGuidelines } from './supabase'
import { S, C, catColor } from './styles'
import ServiceIcon from './ServiceIcon'
import { useLang, CATEGORY_LABELS } from './i18n'

const ORDER = { trash: 0, recycling: 1, bulk: 2, yard_waste: 3 }

// Guidance grouped by the service it belongs to, one accordion section each.
// `openCategory` is the service the resident tapped to get here, so that
// section starts open and they land on the answer rather than a list.
export default function GuidelinesView({ org, openCategory }) {
  const { t, lang } = useLang()
  const labels = CATEGORY_LABELS[lang]
  const [items, setItems] = useState(null)
  const [open, setOpen] = useState(openCategory || null)

  useEffect(() => { setOpen(openCategory || null) }, [openCategory])

  useEffect(() => {
    if (!org?.organization_id) return
    let live = true
    getGuidelines(org.organization_id, lang)
      .then((rows) => { if (live) setItems(rows) })
      .catch(() => { if (live) setItems([]) })
    return () => { live = false }
  }, [org?.organization_id, lang])

  // The RPC may not expose a category yet, so fall back to the service name.
  const groups = useMemo(() => {
    if (!items) return []
    const by = new Map()
    for (const g of items) {
      const key = g.service_category || g.service_type_name || 'general'
      if (!by.has(key)) {
        by.set(key, {
          key,
          category: g.service_category || null,
          label: labels[g.service_category] || g.service_type_name || t.guidelinesTitle,
          rows: [],
        })
      }
      by.get(key).rows.push(g)
    }
    return [...by.values()].sort(
      (a, b) => (ORDER[a.category] ?? 9) - (ORDER[b.category] ?? 9),
    )
  }, [items, labels, t.guidelinesTitle])

  if (items === null) return <div style={S.empty}>{t.loading}</div>
  if (items.length === 0) return <div style={S.empty}>{t.noGuidelines}</div>

  // Only one section can be open: these are reference answers, not a document
  // to read end to end, and a single open panel keeps the list scannable.
  const only = groups.length === 1

  return (
    <div style={{ padding: '4px 0 16px' }}>
      <div style={S.infoCard}>
        <span style={S.infoIcon}>
          <Info size={20} color={C.brand} strokeWidth={2} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ ...S.infoBody, display: 'block', marginTop: 0 }}>
            {t.guidelinesSample}
          </span>
        </span>
      </div>

      {groups.map((grp) => {
        const cc = catColor(grp.category)
        const isOpen = only || open === grp.key
        return (
          <div key={grp.key} style={{ ...S.card, marginTop: 12 }}>
            <button
              onClick={() => setOpen(isOpen && !only ? null : grp.key)}
              aria-expanded={isOpen}
              style={S.accHead}
            >
              <span style={{ ...S.iconTile, background: cc.tint, width: 34, height: 34 }}>
                <ServiceIcon category={grp.category} size={19} color={cc.solid} />
              </span>
              <span style={{ ...S.accTitle, flex: 1 }}>{grp.label}</span>
              {!only && (
                <ChevronDown
                  size={19}
                  color={C.muted}
                  style={{
                    flexShrink: 0,
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.18s',
                  }}
                />
              )}
            </button>

            {isOpen && (
              <div style={S.accBody}>
                {grp.rows.map((g) => (
                  <div key={g.id} style={S.accSection}>
                    <div style={S.accSectionTitle}>{g.title}</div>
                    <div style={S.accSectionBody}>{g.body}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
