import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock, X, AlertTriangle } from 'lucide-react'
import { S, C, catColor, parseDate, formatDate } from './styles'
import { useLang, CATEGORY_LABELS } from './i18n'
import { getCollectionsInRange, getHolidays } from './supabase'
import ServiceIcon from './ServiceIcon'

const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`

const ORDER = { trash: 0, recycling: 1, bulk: 2, yard_waste: 3 }

// A month as a 7-column grid, aligned to Sunday and padded only as far as the
// week containing the last day. A fixed 42 cells would leave a blank row below
// most months.
function monthCells(year, month) {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(1 - first.getDay())

  const last = new Date(year, month + 1, 0)
  const end = new Date(last)
  end.setDate(last.getDate() + (6 - last.getDay()))

  const cells = []
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = new Date(d)
    cells.push({ d: day, key: iso(day), inMonth: day.getMonth() === month })
  }
  return cells
}

export default function CalendarView({ org, coords, setoutTime, onGuidelines }) {
  const { t, lang, locale } = useLang()
  const labels = CATEGORY_LABELS[lang]

  const today = new Date()
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [collections, setCollections] = useState([])
  const [holidays, setHolidays] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const cells = useMemo(() => monthCells(year, month), [year, month])
  const from = cells[0].key
  const to = cells[cells.length - 1].key

  useEffect(() => {
    if (!org?.organization_id || !coords) return
    let live = true
    setLoading(true)
    Promise.all([
      getCollectionsInRange(org.organization_id, coords.lat, coords.lng, from, to),
      getHolidays(org.organization_id, from, to),
    ])
      .then(([c, h]) => {
        if (!live) return
        setCollections(c)
        setHolidays(h)
      })
      .finally(() => live && setLoading(false))
    return () => { live = false }
  }, [org?.organization_id, coords?.lat, coords?.lng, from, to])

  // date -> services collected that day
  const byDate = useMemo(() => {
    const m = new Map()
    for (const c of collections) {
      if (!m.has(c.pickup_date)) m.set(c.pickup_date, [])
      m.get(c.pickup_date).push(c)
    }
    for (const list of m.values()) {
      list.sort((a, b) => (ORDER[a.service_category] ?? 9) - (ORDER[b.service_category] ?? 9))
    }
    return m
  }, [collections])

  // Holidays are highlighted on the day they are observed, which is the day
  // crews would otherwise have worked.
  const holidayOn = useMemo(() => {
    const m = new Map()
    for (const h of holidays) m.set(h.observed_date, h)
    return m
  }, [holidays])

  const monthLabel = cursor.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const dowLabels = useMemo(() => {
    const base = new Date(2026, 10, 1) // a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      return d.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()
    })
  }, [locale])

  function step(n) {
    setSelected(null)
    setCursor(new Date(year, month + n, 1))
  }

  const observanceText = {
    normal: t.obsNormal,
    shift_day: t.obsShiftDay,
    shift_week: t.obsShiftWeek,
    skip: t.obsSkip,
  }
  const observanceColor = (o) => (o === 'normal' ? C.brand : C.holidayInk)

  const sel = selected ? byDate.get(selected) : null
  const selExc = sel?.find((c) => c.is_schedule_exception)

  return (
    <div>
      <div style={S.calCard}>
        <div style={S.monthRow}>
          <button onClick={() => step(-1)} aria-label={t.previous} style={S.monthBtn}>
            <ChevronLeft size={19} color={C.brand} strokeWidth={2.3} />
          </button>
          <span style={S.monthLabel}>{monthLabel}</span>
          <button onClick={() => step(1)} aria-label={t.next} style={S.monthBtn}>
            <ChevronRight size={19} color={C.brand} strokeWidth={2.3} />
          </button>
        </div>

        <div style={S.monthGrid}>
          {dowLabels.map((d, i) => (
            <div key={i} style={S.dowCell}>{d}</div>
          ))}

          {cells.map(({ d, key, inMonth }) => {
            const items = byDate.get(key)
            const hol = holidayOn.get(key)
            const isSel = selected === key
            if (!inMonth) return <div key={key} style={{ ...S.dayCell, background: 'transparent' }} />
            return (
              <button
                key={key}
                onClick={items ? () => setSelected(key) : undefined}
                aria-label={`${d.getDate()}${items ? ', ' + t.collections(items.length) : ''}`}
                style={{
                  ...S.dayCell,
                  background: hol ? C.holiday : C.cell,
                  borderColor: isSel ? C.brand : 'transparent',
                  cursor: items ? 'pointer' : 'default',
                }}
              >
                <span style={S.dayNum}>{d.getDate()}</span>
                <span style={items ? S.dayDot : S.dayDotSpacer} />
              </button>
            )
          })}
        </div>

        <div style={S.legendRow}>
          <span style={{ ...S.legendSwatch, background: C.brand }} />
          {t.legendCollection}
          <span style={{ ...S.legendSwatch, background: C.holiday, borderRadius: 3, marginLeft: 8 }} />
          {t.legendHoliday}
          <span style={{ marginLeft: 'auto', color: C.faint }}>{t.tapForDetails}</span>
        </div>
      </div>

      <div style={S.agendaHead}>{t.holidaysThisMonth}</div>
      {holidays.length === 0 ? (
        <div style={{ ...S.empty, paddingTop: 0 }}>{t.noHolidays}</div>
      ) : (
        holidays.map((h) => {
          const d = parseDate(h.observed_date)
          return (
            <button
              key={h.holiday_id}
              onClick={onGuidelines}
              style={{
                display: 'flex', alignItems: 'stretch', gap: 12,
                width: 'calc(100% - 28px)', margin: '0 14px 8px', padding: 10,
                background: C.paper, border: `1px solid ${C.rule}`, borderRadius: 16,
                font: 'inherit', textAlign: 'left', cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <span style={S.holidayBlock}>
                <span style={S.holidayMon}>
                  {d.toLocaleDateString(locale, { month: 'short' }).toUpperCase()}
                </span>
                <span style={S.holidayNum}>{d.getDate()}</span>
              </span>
              <span style={{ flex: 1, minWidth: 0, alignSelf: 'center' }}>
                <span style={{ ...S.holidayName, display: 'block' }}>{h.name}</span>
                <span
                  style={{
                    ...S.holidayWhat, display: 'block',
                    color: observanceColor(h.observance),
                  }}
                >
                  {observanceText[h.observance] || h.observance}
                </span>
                {h.moved_to && (
                  <span style={{ ...S.holidayWhen, display: 'block' }}>
                    {t.movedFromTo(
                      parseDate(h.observed_date).toLocaleDateString(locale, {
                        weekday: 'short', month: 'short', day: 'numeric',
                      }),
                      parseDate(h.moved_to).toLocaleDateString(locale, {
                        weekday: 'short', month: 'short', day: 'numeric',
                      }),
                    )}
                  </span>
                )}
              </span>
              <ChevronRight size={18} color={C.faint} style={{ alignSelf: 'center' }} />
            </button>
          )
        })
      )}

      {!loading && collections.length === 0 && (
        <div style={S.empty}>{t.noPickupsThisMonth}</div>
      )}

      {sel && (
        <div
          style={S.scrim}
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div style={S.sheet} onClick={(e) => e.stopPropagation()}>
            <div style={S.sheetGrip} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.sheetTitle}>{formatDate(selected, locale)}</div>
                <div style={S.sheetSub}>{t.collections(sel.length)}</div>
              </div>
              <button onClick={() => setSelected(null)} aria-label={t.close} style={S.sheetClose}>
                <X size={17} color={C.muted} strokeWidth={2.2} />
              </button>
            </div>

            {sel.map((c) => {
              const cc = catColor(c.service_category)
              return (
                <button
                  key={c.service_type_id}
                  onClick={onGuidelines}
                  style={{ ...S.svcRow, width: '100%', font: 'inherit', textAlign: 'left', minHeight: 40 }}
                >
                  <span style={{ ...S.svcIconTile, background: cc.tint, width: 30, height: 30 }}>
                    <ServiceIcon
                      category={c.service_category}
                      iconName={c.icon_name}
                      size={19}
                      color={cc.solid}
                    />
                  </span>
                  <span style={{ ...S.svcName, flex: 1 }}>
                    {labels[c.service_category] || c.service_type_name}
                  </span>
                  <ChevronRight size={18} color={C.faint} />
                </button>
              )
            })}

            {setoutTime && (
              <div style={{ ...S.setoutRow, marginTop: 10 }}>
                <Clock size={14} strokeWidth={2} />
                {t.setOutBy(setoutTime)}
              </div>
            )}

            {selExc && (
              <div style={S.warnCard}>
                <AlertTriangle size={19} color={C.holidayInk} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span>
                  <span style={{ ...S.warnTitle, display: 'block' }}>
                    {selExc.exception_reason || t.scheduleChange('')}
                  </span>
                  {selExc.original_date !== selExc.pickup_date && (
                    <span style={{ ...S.warnBody, display: 'block' }}>
                      {t.movedFrom(formatDate(selExc.original_date, locale))}
                    </span>
                  )}
                </span>
              </div>
            )}

            <button onClick={() => setSelected(null)} style={S.doneBtn}>{t.done}</button>
          </div>
        </div>
      )}
    </div>
  )
}
